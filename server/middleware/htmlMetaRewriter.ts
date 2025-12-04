import { Request, Response, NextFunction } from 'express';
import { escapeHtml } from './locationMetaMiddleware';
import fs from 'fs';
import path from 'path';

function escapeJsonForScript(json: string): string {
  return json
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/'/g, '\\u0027');
}

interface LocationMeta {
  title: string;
  description: string;
  url: string;
  ogImage: string;
  locationName: string;
  category: string;
  structuredData: string;
  neighborhood: string;
  address: string | null;
  tags: string[];
  fullLocationData: string;
}

/**
 * Injects location-specific meta tags into the HTML
 */
function injectLocationMeta(html: string, meta: LocationMeta): string {
  // Replace title tag
  html = html.replace(
    /<title>.*?<\/title>/,
    `<title>${meta.title}</title>`
  );
  
  // Replace description meta tag
  html = html.replace(
    /<meta name="description" content="[^"]*" \/>/,
    `<meta name="description" content="${meta.description}" data-rh="true" />`
  );
  
  // Replace Open Graph tags
  html = html.replace(
    /<meta property="og:title" content="[^"]*" \/>/,
    `<meta property="og:title" content="${meta.title}" data-rh="true" />`
  );
  html = html.replace(
    /<meta property="og:description" content="[^"]*" \/>/,
    `<meta property="og:description" content="${meta.description}" data-rh="true" />`
  );
  html = html.replace(
    /<meta property="og:url" content="[^"]*" \/>/,
    `<meta property="og:url" content="${meta.url}" data-rh="true" />`
  );
  html = html.replace(
    /<meta property="og:image" content="[^"]*" \/>/,
    `<meta property="og:image" content="${meta.ogImage}" data-rh="true" />`
  );
  html = html.replace(
    /<meta property="og:image:secure_url" content="[^"]*" \/>/,
    `<meta property="og:image:secure_url" content="${meta.ogImage}" data-rh="true" />`
  );
  html = html.replace(
    /<meta property="og:image:alt" content="[^"]*" \/>/,
    `<meta property="og:image:alt" content="${meta.locationName} - ${meta.category} in Western Cape" data-rh="true" />`
  );
  html = html.replace(
    /<meta property="og:type" content="website" \/>/,
    `<meta property="og:type" content="place" data-rh="true" />`
  );
  
  // Replace canonical link tag - CRITICAL for SEO to avoid soft 404
  html = html.replace(
    /<link rel="canonical" href="[^"]*" \/>/,
    `<link rel="canonical" href="${meta.url}" data-rh="true" />`
  );
  
  // Replace Twitter Card tags
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*" \/>/,
    `<meta name="twitter:title" content="${meta.title}" data-rh="true" />`
  );
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*" \/>/,
    `<meta name="twitter:description" content="${meta.description}" data-rh="true" />`
  );
  html = html.replace(
    /<meta name="twitter:image" content="[^"]*" \/>/,
    `<meta name="twitter:image" content="${meta.ogImage}" data-rh="true" />`
  );
  html = html.replace(
    /<meta name="twitter:image:alt" content="[^"]*" \/>/,
    `<meta name="twitter:image:alt" content="${meta.locationName} - ${meta.category} in Western Cape" data-rh="true" />`
  );
  
  // Inject structured data before closing </head> tag
  const structuredDataScript = `<script type="application/ld+json" data-rh="true">\n${meta.structuredData}\n</script>\n</head>`;
  html = html.replace(/<\/head>/, structuredDataScript);
  
  // Inject server-rendered content into #root for SEO (fixes soft 404)
  // This content is visible to crawlers immediately without waiting for JavaScript
  const tagsHtml = meta.tags.length > 0 
    ? `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:16px">${meta.tags.map(tag => `<span style="background:#f1f5f9;padding:4px 12px;border-radius:9999px;font-size:14px">${tag}</span>`).join('')}</div>`
    : '';
  
  const addressHtml = meta.address 
    ? `<p style="color:#64748b;margin-top:12px"><strong>Address:</strong> ${meta.address}</p>`
    : '';
  
  const serverRenderedContent = `
    <div id="ssr-location-content" style="max-width:1200px;margin:0 auto;padding:32px 16px;font-family:system-ui,-apple-system,sans-serif">
      <article>
        <header style="margin-bottom:24px">
          <h1 style="font-size:2.5rem;font-weight:700;margin:0 0 8px 0;color:#1e293b">${meta.locationName}</h1>
          <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
            <span style="background:linear-gradient(to right,#f97316,#ea580c);color:white;padding:6px 16px;border-radius:9999px;font-weight:600">${meta.category}</span>
            <span style="color:#64748b">${meta.neighborhood}, Western Cape</span>
          </div>
        </header>
        <section>
          <p style="font-size:1.125rem;line-height:1.75;color:#475569;margin:0">${meta.description}</p>
          ${addressHtml}
          ${tagsHtml}
        </section>
        <footer style="margin-top:24px;padding-top:16px;border-top:1px solid #e2e8f0">
          <p style="color:#64748b;font-size:14px">Discover more hidden gems at <a href="https://lekkerspots.co.za" style="color:#f97316;text-decoration:none">LekkerSpots</a> - Western Cape's local travel guide.</p>
        </footer>
      </article>
    </div>
    <script>window.__LOCATION_DATA__ = ${escapeJsonForScript(meta.fullLocationData)};</script>
  `;
  
  // Replace empty #root with server-rendered content
  html = html.replace(
    '<div id="root"></div>',
    `<div id="root">${serverRenderedContent}</div>`
  );
  
  return html;
}

/**
 * Compute the base URL from request headers with validation
 */
function getBaseUrl(req: Request): string {
  // In production, always use canonical domain to avoid SEO duplicate content issues
  if (process.env.NODE_ENV === 'production') {
    return 'https://lekkerspots.co.za';
  }
  
  // In development, use dynamic resolution for local testing
  // Determine protocol
  let protocol: string;
  const forwardedProto = req.headers['x-forwarded-proto'];
  if (forwardedProto) {
    protocol = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto.split(',')[0].trim();
  } else {
    protocol = req.secure ? 'https' : 'http';
  }
  
  // Enforce only http/https protocols
  if (protocol !== 'http' && protocol !== 'https') {
    protocol = 'https';
  }

  // Determine host
  let host: string;
  const forwardedHost = req.headers['x-forwarded-host'];
  let candidateHost: string;
  
  if (forwardedHost) {
    candidateHost = Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost.split(',')[0].trim();
  } else {
    candidateHost = req.headers.host || req.hostname || 'localhost:5000';
  }

  // Validate host against strict regex
  const hostPattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*(:\d{1,5})?$/;
  
  if (hostPattern.test(candidateHost)) {
    host = candidateHost;
  } else {
    host = req.hostname || 'localhost:5000';
  }

  return `${protocol}://${host}`;
}

/**
 * Process HTML content: replace base URL and inject location meta tags
 */
function processHtml(html: string, baseUrl: string, locationMeta?: LocationMeta): string {
  // Replace __BASE_URL__ placeholder
  html = html.replace(/__BASE_URL__/g, baseUrl);
  
  // Inject location-specific meta tags if available
  if (locationMeta) {
    html = injectLocationMeta(html, locationMeta);
  }
  
  return html;
}

/**
 * Middleware that directly serves processed HTML instead of relying on res.sendFile override
 * This works in production where express.static uses the 'send' module internally
 */
export function htmlMetaRewriter(req: Request, res: Response, next: NextFunction) {
  // Skip processing for static assets
  if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|json|woff|woff2|ttf|eot)$/)) {
    return next();
  }

  // Skip processing for API requests and SEO files
  if (req.path.startsWith('/api/') || 
      req.path.startsWith('/objects/') || 
      req.path === '/sitemap.xml' || 
      req.path === '/robots.txt') {
    return next();
  }

  // For HTML requests, serve processed index.html directly
  const baseUrl = getBaseUrl(req);
  const locationMeta = res.locals.locationMeta;

  // In production, read and process index.html
  if (process.env.NODE_ENV === 'production') {
    const indexPath = path.resolve(import.meta.dirname, 'public', 'index.html');
    
    fs.readFile(indexPath, 'utf-8', (err, htmlContent) => {
      if (err) {
        console.error('[htmlMetaRewriter] Error reading index.html:', err);
        return next();
      }

      try {
        const processedHtml = processHtml(htmlContent, baseUrl, locationMeta);

        res.setHeader('Content-Type', 'text/html; charset=UTF-8');
        res.setHeader('Cache-Control', 'no-cache');
        res.send(processedHtml);
      } catch (processError) {
        console.error('[htmlMetaRewriter] Error processing HTML:', processError);
        next();
      }
    });
  } else {
    // In development, let Vite handle HTML
    next();
  }
}
