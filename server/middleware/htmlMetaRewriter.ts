import { Request, Response, NextFunction } from 'express';

/**
 * Middleware that intercepts HTML responses and replaces the __BASE_URL__ placeholder
 * with the actual request base URL. This ensures OG tags and canonical URLs use the
 * correct domain in both development and production environments.
 */
export function htmlMetaRewriter(req: Request, res: Response, next: NextFunction) {
  const originalSend = res.send;
  const originalEnd = res.end;

  // Determine the base URL from the request headers
  const protocol = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const baseUrl = `${protocol}://${host}`;

  // Override res.send to inject base URL
  res.send = function (data: any): Response {
    if (typeof data === 'string' && res.getHeader('Content-Type')?.toString().includes('text/html')) {
      data = data.replace(/__BASE_URL__/g, baseUrl);
    }
    return originalSend.call(this, data);
  };

  // Override res.end to inject base URL
  res.end = function (chunk?: any, encoding?: any, callback?: any): Response {
    if (typeof chunk === 'string' && res.getHeader('Content-Type')?.toString().includes('text/html')) {
      chunk = chunk.replace(/__BASE_URL__/g, baseUrl);
    }
    return originalEnd.call(this, chunk, encoding, callback);
  };

  next();
}
