import { Request, Response, NextFunction } from 'express';

/**
 * Middleware that intercepts HTML responses and replaces the __BASE_URL__ placeholder
 * with the actual request base URL. This ensures OG tags and canonical URLs use the
 * correct domain in both development and production environments.
 * 
 * Handles streaming HTML from express.static by buffering chunks for text/html responses.
 */
export function htmlMetaRewriter(req: Request, res: Response, next: NextFunction) {
  const originalSend = res.send;
  const originalWrite = res.write;
  const originalEnd = res.end;

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
  };

  // Override res.send to inject base URL (handles both strings and Buffers)
  res.send = function (data: any): Response {
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
  };

  // Override res.end to process buffered HTML or inject directly
  res.end = function (chunk?: any, encoding?: any, callback?: any): Response {
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
      
      // Convert to string, replace placeholder, convert back to buffer
      let htmlContent = combinedBuffer.toString('utf-8');
      htmlContent = htmlContent.replace(/__BASE_URL__/g, baseUrl);
      const processedBuffer = Buffer.from(htmlContent, 'utf-8');

      // Write the processed content using original methods
      originalWrite.call(this, processedBuffer);
      // Call originalEnd with just the callback (no chunk since we already wrote it)
      if (callback) {
        return originalEnd.call(this, callback);
      } else {
        return originalEnd.call(this);
      }
    }

    // For non-buffered HTML responses (e.g., from Vite), process inline
    const contentType = res.getHeader('Content-Type')?.toString();
    if (chunk && contentType?.includes('text/html') && !isBuffering) {
      // Convert Buffer to string if necessary
      let htmlContent = typeof chunk === 'string' ? chunk : 
                       Buffer.isBuffer(chunk) ? chunk.toString('utf-8') : chunk;
      
      if (typeof htmlContent === 'string') {
        htmlContent = htmlContent.replace(/__BASE_URL__/g, baseUrl);
        // Convert back to Buffer if original was Buffer, preserving encoding
        chunk = Buffer.isBuffer(chunk) ? Buffer.from(htmlContent, 'utf-8') : htmlContent;
      }
    }
    
    return originalEnd.call(this, chunk, encoding, callback);
  };

  next();
}
