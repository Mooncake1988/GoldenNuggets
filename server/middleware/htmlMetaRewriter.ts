import { Request, Response, NextFunction } from 'express';
import { escapeHtml } from './locationMetaMiddleware';
import fs from 'fs';
import path from 'path';

interface LocationMeta {
  title: string;
  description: string;
  url: string;
  ogImage: string;
  locationName: string;
  category: string;
  structuredData: string;
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
    `<meta name="description" content="${meta.description}" />`
  );
  
  // Replace Open Graph tags
  html = html.replace(
    /<meta property="og:title" content="[^"]*" \/>/,
    `<meta property="og:title" content="${meta.title}" />`
  );
  html = html.replace(
    /<meta property="og:description" content="[^"]*" \/>/,
    `<meta property="og:description" content="${meta.description}" />`
  );
  html = html.replace(
    /<meta property="og:url" content="[^"]*" \/>/,
    `<meta property="og:url" content="${meta.url}" />`
  );
  html = html.replace(
    /<meta property="og:image" content="[^"]*" \/>/,
    `<meta property="og:image" content="${meta.ogImage}" />`
  );
  html = html.replace(
    /<meta property="og:image:secure_url" content="[^"]*" \/>/,
    `<meta property="og:image:secure_url" content="${meta.ogImage}" />`
  );
  html = html.replace(
    /<meta property="og:image:alt" content="[^"]*" \/>/,
    `<meta property="og:image:alt" content="${meta.locationName} - ${meta.category} in Western Cape" />`
  );
  html = html.replace(
    /<meta property="og:type" content="website" \/>/,
    `<meta property="og:type" content="place" />`
  );
  
  // Replace Twitter Card tags
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*" \/>/,
    `<meta name="twitter:title" content="${meta.title}" />`
  );
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*" \/>/,
    `<meta name="twitter:description" content="${meta.description}" />`
  );
  html = html.replace(
    /<meta name="twitter:image" content="[^"]*" \/>/,
    `<meta name="twitter:image" content="${meta.ogImage}" />`
  );
  html = html.replace(
    /<meta name="twitter:image:alt" content="[^"]*" \/>/,
    `<meta name="twitter:image:alt" content="${meta.locationName} - ${meta.category} in Western Cape" />`
  );
  
  // Inject structured data before closing </head> tag
  const structuredDataScript = `<script type="application/ld+json">\n${meta.structuredData}\n</script>\n</head>`;
  html = html.replace(/<\/head>/, structuredDataScript);
  
  return html;
}

/**
 * Compute the base URL from request headers with validation
 */
function getBaseUrl(req: Request): string {
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
