import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { htmlMetaRewriter } from "./middleware/htmlMetaRewriter";
import { createLocationMetaMiddleware } from "./middleware/locationMetaMiddleware";
import { storage } from "./storage";
import fs from "fs";
import path from "path";

const app = express();

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

// Enable Gzip compression for all responses
app.use(compression());

// IndexNow: API key verification file endpoint - MUST be before any HTML rewriting middleware
// Search engines verify ownership by requesting /{apiKey}.txt
app.get(/^\/([a-f0-9]+)\.txt$/, (req, res, next) => {
  const indexNowApiKey = process.env.INDEXNOW_API_KEY;
  const requestedKey = req.params[0];
  
  // Only serve the key file if it matches our configured IndexNow API key
  if (indexNowApiKey && requestedKey === indexNowApiKey) {
    res.setHeader('Content-Type', 'text/plain');
    res.send(indexNowApiKey);
    return;
  }
  
  // Not an IndexNow key request, pass to next handler
  next();
});

// Apply location meta middleware FIRST to populate res.locals.locationMeta
app.use(createLocationMetaMiddleware(storage));

// Then apply HTML meta rewriter middleware to inject dynamic base URLs and location meta tags
app.use(htmlMetaRewriter);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // SEO: Sitemap endpoint - must be before Vite middleware
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const locations = await storage.getAllLocations();
      // Use canonical domain to avoid duplicate content issues
      const baseUrl = 'https://lekkerspots.co.za';

      const now = new Date().toISOString();

      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

      // Static pages with high priority
      const staticPages = [
        { url: '/', priority: '1.0', changefreq: 'daily' },
        { url: '/categories', priority: '0.9', changefreq: 'daily' },
        { url: '/map', priority: '0.9', changefreq: 'daily' },
      ];

      for (const page of staticPages) {
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
        xml += `    <lastmod>${now}</lastmod>\n`;
        xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
        xml += `    <priority>${page.priority}</priority>\n`;
        xml += '  </url>\n';
      }

      // Location detail pages
      for (const location of locations) {
        const lastmod = location.updatedAt.toISOString();
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}/location/${encodeURIComponent(location.slug)}</loc>\n`;
        xml += `    <lastmod>${lastmod}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        xml += '  </url>\n';
      }

      xml += '</urlset>';

      res.setHeader('Content-Type', 'application/xml');
      res.send(xml);
    } catch (error) {
      console.error("Error generating sitemap:", error);
      res.status(500).send('Error generating sitemap');
    }
  });

  // SEO: Robots.txt endpoint - must be before Vite middleware
  app.get("/robots.txt", (req, res) => {
    // Use canonical domain to avoid duplicate content issues
    const baseUrl = 'https://lekkerspots.co.za';

    const robotsTxt = `# LekkerSpots - Cape Town Hidden Gems
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml
`;

    res.setHeader('Content-Type', 'text/plain');
    res.send(robotsTxt);
  });

  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error(`[Error Handler] ${status} ${req.method} ${req.path}:`, err);

    if (res.headersSent) {
      return;
    }

    if (req.accepts('html')) {
      res.status(status).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Error - LekkerSpots</title>
            <style>
              body {
                font-family: system-ui, -apple-system, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
              }
              .container {
                text-align: center;
                padding: 2rem;
              }
              h1 {
                font-size: 3rem;
                margin: 0 0 1rem 0;
              }
              p {
                font-size: 1.25rem;
                margin: 0 0 2rem 0;
                opacity: 0.9;
              }
              a {
                display: inline-block;
                padding: 0.75rem 2rem;
                background: rgba(255, 255, 255, 0.2);
                color: white;
                text-decoration: none;
                border-radius: 0.5rem;
                border: 2px solid rgba(255, 255, 255, 0.3);
                transition: all 0.2s;
              }
              a:hover {
                background: rgba(255, 255, 255, 0.3);
                border-color: rgba(255, 255, 255, 0.5);
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>${status}</h1>
              <p>${status === 404 ? 'Page not found' : 'Something went wrong'}</p>
              <a href="/">Go to Homepage</a>
            </div>
          </body>
        </html>
      `);
    } else {
      res.status(status).json({ message });
    }
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    // Serve static assets first (express.static will handle js, css, images, etc.)
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
