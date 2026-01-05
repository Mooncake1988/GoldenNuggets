import { Request, Response, NextFunction } from 'express';
import type { IStorage } from '../storage';

// Helper function to resolve base URL from request
export function resolveBaseUrl(req: Request): string {
  // In production, always use canonical domain to avoid SEO duplicate content issues
  if (process.env.NODE_ENV === 'production') {
    return 'https://lekkerspots.co.za';
  }
  
  // In development, use dynamic resolution for local testing
  const protocol = req.get('x-forwarded-proto') || 
                  (req.secure ? 'https' : 'http');
  
  // Get host from x-forwarded-host or host header
  let host = req.get('x-forwarded-host') || req.get('host') || '';
  
  // Handle comma-separated values (take first)
  if (host.includes(',')) {
    host = host.split(',')[0].trim();
  }
  
  // Validate host to prevent header injection
  const validHostPattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*(:[\d]{1,5})?$/;
  if (!validHostPattern.test(host)) {
    // Fallback to localhost for development
    return 'http://localhost:5000';
  }
  
  return `${protocol}://${host}`;
}

// Helper function to escape HTML to prevent XSS
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

export function createLocationMetaMiddleware(storage: IStorage) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only process GET requests for HTML to location detail pages
    if (req.method !== 'GET') {
      return next();
    }

    // Check if this is a location detail page request
    const locationMatch = req.path.match(/^\/location\/([^/]+)$/);
    if (!locationMatch) {
      return next();
    }

    // Check Accept header - only process for HTML requests (crawlers send text/html)
    const acceptHeader = req.get('accept') || '';
    if (!acceptHeader.includes('text/html') && !acceptHeader.includes('*/*')) {
      return next();
    }

    try {
      const slug = decodeURIComponent(locationMatch[1]);
      const location = await storage.getLocationBySlug(slug);
      
      if (!location) {
        // Location not found - let it fall through to client-side routing
        return next();
      }

      // Fetch insider tips for this location
      const insiderTips = await storage.getInsiderTipsByLocationId(location.id);

      // Fetch related locations for "Continue Your Adventure" section (SEO enhancement)
      let relatedLocations: any[] = [];
      if (location.relatedLocationIds && location.relatedLocationIds.length > 0) {
        relatedLocations = await storage.getLocationsByIds(location.relatedLocationIds);
      }

      // Prepare meta tag data
      const baseUrl = resolveBaseUrl(req);
      const pageTitle = escapeHtml(`${location.name} - ${location.category} in ${location.neighborhood} | LekkerSpots`);
      const pageDescription = location.description.length > 160 
        ? escapeHtml(`${location.description.slice(0, 157)}...`)
        : escapeHtml(location.description);
      
      const hasImages = location.images && location.images.length > 0;
      const ogImage = hasImages ? location.images[0] : `${baseUrl}/og-image.jpg`;
      const pageUrl = `${baseUrl}/location/${location.slug}`;
      
      // Prepare structured data with FAQPage for insider tips (SEO enhancement)
      // Using @graph to combine LocalBusiness and FAQPage in a single schema
      const graphEntities: any[] = [
        {
          "@type": "LocalBusiness",
          "name": location.name,
          "description": location.description,
          "image": hasImages ? location.images : [`${baseUrl}/og-image.jpg`],
          "address": location.address ? {
            "@type": "PostalAddress",
            "streetAddress": location.address,
            "addressLocality": location.neighborhood,
            "addressRegion": "Western Cape",
            "addressCountry": "ZA"
          } : undefined,
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": location.latitude,
            "longitude": location.longitude
          },
          "url": pageUrl
        }
      ];

      // Add FAQPage to the graph if insider tips exist
      if (insiderTips && insiderTips.length > 0) {
        graphEntities.push({
          "@type": "FAQPage",
          "mainEntity": insiderTips.map(tip => ({
            "@type": "Question",
            "name": tip.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": tip.answer
            }
          }))
        });
      }

      const structuredData = {
        "@context": "https://schema.org",
        "@graph": graphEntities
      };

      // Store in res.locals for htmlMetaRewriter to use
      res.locals.locationMeta = {
        title: pageTitle,
        description: pageDescription,
        url: pageUrl,
        ogImage,
        locationName: escapeHtml(location.name),
        category: escapeHtml(location.category),
        structuredData: JSON.stringify(structuredData),
        neighborhood: escapeHtml(location.neighborhood),
        address: location.address ? escapeHtml(location.address) : null,
        tags: location.tags ? location.tags.map(t => escapeHtml(t)) : [],
        insiderTips: insiderTips || [],
        relatedLocations: relatedLocations || [],
        fullLocationData: JSON.stringify({ ...location, insiderTips: insiderTips || [], relatedLocations: relatedLocations || [] })
      };
    } catch (error) {
      console.error('Error in locationMetaMiddleware:', error);
      // Don't block the request - just skip meta injection
    }

    next();
  };
}
