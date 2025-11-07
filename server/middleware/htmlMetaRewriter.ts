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
 * Simplified middleware that only intercepts index.html serving
 * This avoids complex response overriding and only processes what's necessary
 */
export function htmlMetaRewriter(req: Request, res: Response, next: NextFunction) {
  // Skip processing for non-HTML requests
  if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|json|woff|woff2|ttf|eot)$/)) {
    return next();
  }

  // Skip processing for API requests
  if (req.path.startsWith('/api/') || req.path.startsWith('/objects/')) {
    return next();
  }

  const baseUrl = getBaseUrl(req);
  const locationMeta = res.locals.locationMeta;

  // Intercept sendFile to process HTML files
  const originalSendFile = res.sendFile.bind(res);
  
  res.sendFile = function (filePath: string, options?: any, callback?: any) {
    // Handle callback in different parameter positions
    if (typeof options === 'function') {
      callback = options;
      options = undefined;
    }

    // Only process index.html files
    if (filePath.includes('index.html')) {
      console.log('[htmlMetaRewriter] Processing index.html, baseUrl:', baseUrl);
      try {
        fs.readFile(filePath, 'utf-8', (err, htmlContent) => {
          if (err) {
            console.error('[htmlMetaRewriter] Error reading HTML file:', err);
            return originalSendFile(filePath, options, callback);
          }

          try {
            console.log('[htmlMetaRewriter] Read HTML file, length:', htmlContent.length);
            console.log('[htmlMetaRewriter] Contains __BASE_URL__:', htmlContent.includes('__BASE_URL__'));
            
            // Process the HTML
            const processedHtml = processHtml(htmlContent, baseUrl, locationMeta);
            
            console.log('[htmlMetaRewriter] Processed HTML, __BASE_URL__ replaced:', !processedHtml.includes('__BASE_URL__'));
            console.log('[htmlMetaRewriter] Sample og:image tag:', processedHtml.match(/<meta property="og:image" content="[^"]*"/)?.[0]);

            // Send the processed HTML
            res.setHeader('Content-Type', 'text/html; charset=UTF-8');
            res.setHeader('Content-Length', Buffer.byteLength(processedHtml, 'utf-8'));
            res.send(processedHtml);
            
            if (callback) callback();
          } catch (processError) {
            console.error('[htmlMetaRewriter] Error processing HTML:', processError);
            originalSendFile(filePath, options, callback);
          }
        });
      } catch (err) {
        console.error('[htmlMetaRewriter] Error in sendFile override:', err);
        originalSendFile(filePath, options, callback);
      }
    } else {
      // For non-HTML files, use original sendFile
      originalSendFile(filePath, options, callback);
    }
  } as any;

  next();
}
