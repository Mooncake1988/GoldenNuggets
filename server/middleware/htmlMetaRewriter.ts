import { Request, Response, NextFunction } from 'express';
import { escapeHtml } from './locationMetaMiddleware';
import fs from 'fs';

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
 * Middleware that intercepts HTML responses and:
 * 1. Replaces __BASE_URL__ placeholder with actual request domain
 * 2. Injects location-specific meta tags when res.locals.locationMeta is present
 * 
 * Handles streaming HTML from express.static by buffering chunks for text/html responses.
 */
export function htmlMetaRewriter(req: Request, res: Response, next: NextFunction) {
  try {
    const originalSend = res.send;
    const originalWrite = res.write;
    const originalEnd = res.end;
    const originalSendFile = res.sendFile;

    // Buffer for accumulating HTML chunks
    const htmlChunks: Buffer[] = [];
    let isHtml = false;
    let isBuffering = false;

    // Safely determine the base URL from request headers with strict validation
    let protocol: string;
    const forwardedProto = req.headers['x-forwarded-proto'];
    if (forwardedProto) {
      // Take first value if comma-separated
      protocol = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto.split(',')[0].trim();
    } else {
      protocol = req.secure ? 'https' : 'http';
    }
    
    // Enforce only http/https protocols
    if (protocol !== 'http' && protocol !== 'https') {
      protocol = 'https';
    }

    // Validate and sanitize host header
    let host: string;
    const forwardedHost = req.headers['x-forwarded-host'];
    let candidateHost: string;
    
    if (forwardedHost) {
      // Take first value if comma-separated
      candidateHost = Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost.split(',')[0].trim();
    } else {
      candidateHost = req.headers.host || req.hostname || 'localhost:5000';
    }

    // Validate host against strict regex: allow domain names with optional port
    // Reject anything that doesn't match expected hostname:port format
    const hostPattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*(:\d{1,5})?$/;
    
    if (hostPattern.test(candidateHost)) {
      host = candidateHost;
    } else {
      // Fallback to req.hostname if validation fails
      host = req.hostname || 'localhost:5000';
    }

    const baseUrl = `${protocol}://${host}`;

  // Override res.write to buffer HTML chunks
  res.write = function (chunk: any, encoding?: any, callback?: any): boolean {
    try {
      // Detect if this is HTML content
      if (!isBuffering) {
        const contentType = res.getHeader('Content-Type')?.toString();
        if (contentType?.includes('text/html')) {
          isHtml = true;
          isBuffering = true;
        }
      }

      // If this is HTML, buffer the chunks
      if (isHtml && isBuffering) {
        const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding as BufferEncoding || 'utf-8');
        htmlChunks.push(buffer);
        
        // Call callback if provided
        if (typeof encoding === 'function') {
          encoding();
        } else if (typeof callback === 'function') {
          callback();
        }
        return true;
      }

      // For non-HTML, pass through unchanged
      return originalWrite.apply(this, arguments as any);
    } catch (err) {
      console.error('Error in res.write override:', err);
      return originalWrite.apply(this, arguments as any);
    }
  };

  // Override res.send to inject base URL (handles both strings and Buffers)
  res.send = function (data: any): Response {
    try {
      const contentType = res.getHeader('Content-Type')?.toString();
      if (contentType?.includes('text/html')) {
        // Convert Buffer to string if necessary
        let htmlContent = typeof data === 'string' ? data : 
                         Buffer.isBuffer(data) ? data.toString('utf-8') : data;
        
        if (typeof htmlContent === 'string') {
          htmlContent = htmlContent.replace(/__BASE_URL__/g, baseUrl);
          // Convert back to Buffer if original was Buffer
          data = Buffer.isBuffer(data) ? Buffer.from(htmlContent, 'utf-8') : htmlContent;
        }
      }
      return originalSend.call(this, data);
    } catch (err) {
      console.error('Error in res.send override:', err);
      return originalSend.call(this, data);
    }
  };

  // Override res.end to process buffered HTML or inject directly
  res.end = function (chunk?: any, encoding?: any, callback?: any): Response {
    try {
      // Handle callback in different parameter positions
      if (typeof encoding === 'function') {
        callback = encoding;
        encoding = undefined;
      }

      // If we buffered HTML chunks, process them now
      if (isHtml && isBuffering && htmlChunks.length > 0) {
        // Add the final chunk if provided
        if (chunk) {
          const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding as BufferEncoding || 'utf-8');
          htmlChunks.push(buffer);
        }

        // Combine all chunks into one buffer
        const combinedBuffer = Buffer.concat(htmlChunks);
        
        // Convert to string, replace placeholder
        let htmlContent = combinedBuffer.toString('utf-8');
        htmlContent = htmlContent.replace(/__BASE_URL__/g, baseUrl);
        
        // Inject location-specific meta tags if available
        if (res.locals.locationMeta) {
          htmlContent = injectLocationMeta(htmlContent, res.locals.locationMeta);
        }
        
        const processedBuffer = Buffer.from(htmlContent, 'utf-8');

        // CRITICAL: Remove stale Content-Length header set by express.static
        // The original header is based on unmodified file size, but we've modified the HTML
        // If we don't remove it, clients will stop reading at the old length, truncating the response
        res.removeHeader('Content-Length');
        
        // Optionally set correct Content-Length for the processed content
        res.setHeader('Content-Length', processedBuffer.length);

        // Send the complete processed buffer directly via end()
        return (originalEnd as any).call(this, processedBuffer, encoding, callback);
      }

      // For non-buffered HTML responses (e.g., from Vite), process inline
      const contentType = res.getHeader('Content-Type')?.toString();
      if (chunk && contentType?.includes('text/html') && !isBuffering) {
        // Convert Buffer to string if necessary
        let htmlContent = typeof chunk === 'string' ? chunk : 
                         Buffer.isBuffer(chunk) ? chunk.toString('utf-8') : chunk;
        
        if (typeof htmlContent === 'string') {
          htmlContent = htmlContent.replace(/__BASE_URL__/g, baseUrl);
          
          // Inject location-specific meta tags if available
          if (res.locals.locationMeta) {
            htmlContent = injectLocationMeta(htmlContent, res.locals.locationMeta);
          }
          
          // Convert back to Buffer if original was Buffer, preserving encoding
          chunk = Buffer.isBuffer(chunk) ? Buffer.from(htmlContent, 'utf-8') : htmlContent;
          
          // CRITICAL: Recalculate Content-Length after modifying HTML
          res.removeHeader('Content-Length');
          res.setHeader('Content-Length', Buffer.byteLength(htmlContent, 'utf-8'));
        }
      }
      
      return originalEnd.call(this, chunk, encoding, callback);
    } catch (err) {
      console.error('Error in res.end override:', err);
      return originalEnd.call(this, chunk, encoding, callback);
    }
  };

  // Override res.sendFile to process HTML files in production
  res.sendFile = function (filePath: string, options?: any, callback?: any) {
    // Handle callback in different parameter positions
    if (typeof options === 'function') {
      callback = options;
      options = undefined;
    }

    // Check if this is an HTML file
    if (filePath.endsWith('.html') || filePath.endsWith('index.html')) {
      // Read the file and process it
      fs.readFile(filePath, 'utf-8', (err, htmlContent) => {
        if (err) {
          if (callback) {
            callback(err);
          } else {
            res.status(500).send('Error reading file');
          }
          return;
        }

        // Process the HTML content
        htmlContent = htmlContent.replace(/__BASE_URL__/g, baseUrl);
        
        // Inject location-specific meta tags if available
        if (res.locals.locationMeta) {
          htmlContent = injectLocationMeta(htmlContent, res.locals.locationMeta);
        }

        // Set proper headers
        res.setHeader('Content-Type', 'text/html; charset=UTF-8');
        res.setHeader('Content-Length', Buffer.byteLength(htmlContent, 'utf-8'));
        
        // Send the processed HTML
        res.send(htmlContent);
        
        if (callback) {
          callback();
        }
      });
    } else {
      // For non-HTML files, use original sendFile
      return (originalSendFile as any).call(res, filePath, options, callback);
    }
  } as any;

    next();
  } catch (error) {
    console.error('Error in htmlMetaRewriter middleware:', error);
    // Pass the error to Express error handler
    next(error);
  }
}
