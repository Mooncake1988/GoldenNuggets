# Production Deployment Fixes

This document tracks critical production issues encountered and their solutions.

---

## Fix #3: Canonical Domain Enforcement for SEO (December 4, 2025)

**Date**: December 4, 2025  
**Status**: ✅ RESOLVED  
**Severity**: Medium (SEO duplicate content causing search ranking dilution)

### Problem Summary

Google Search Console showed duplicate sitemaps and duplicate content issues because the website was accessible via both `www.lekkerspots.co.za` and `lekkerspots.co.za`. While both versions worked, search engines treated them as separate sites with duplicate content, splitting SEO authority between the two domains.

### Root Cause Analysis

#### The Duplicate Content Issue

The application dynamically generated canonical URLs based on the incoming request's host header. This meant:

1. **User accesses** `https://www.lekkerspots.co.za/location/africa-padel-waterfront`
   - Canonical tag: `<link rel="canonical" href="https://www.lekkerspots.co.za/location/africa-padel-waterfront">`
   
2. **User accesses** `https://lekkerspots.co.za/location/africa-padel-waterfront`
   - Canonical tag: `<link rel="canonical" href="https://lekkerspots.co.za/location/africa-padel-waterfront">`

This created two different canonical URLs for identical content, confusing search engines.

#### Where Dynamic URLs Were Generated

1. **Server-side (3 locations)**:
   - `server/index.ts` - Sitemap and robots.txt generation
   - `server/middleware/locationMetaMiddleware.ts` - Server-rendered meta tags
   - `server/middleware/htmlMetaRewriter.ts` - HTML placeholder replacement

2. **Client-side (1 location)**:
   - `client/src/pages/LocationDetail.tsx` - React Helmet canonical and Open Graph tags

All four locations used dynamic host resolution from request headers or `window.location`, mirroring whatever domain the visitor used.

### Symptoms

- ✅ Both www and non-www domains accessible and functional
- ❌ Google Search Console showing duplicate sitemaps
- ❌ Split SEO authority between two domain variations
- ❌ Canonical tags reflecting access method instead of canonical domain
- ❌ Open Graph URLs varying based on how page was accessed

### Solution: Hardcoded Canonical Domain in Production

**Philosophy**: In production, always use the canonical domain. In development, preserve flexibility for local testing.

#### Server-side Changes

**File 1**: `server/index.ts`

```typescript
// Sitemap generation
app.get('/sitemap.xml', async (req, res) => {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://lekkerspots.co.za' 
    : `${req.protocol}://${req.get('host')}`;
  // ... rest of sitemap logic
});

// Robots.txt
app.get('/robots.txt', (req, res) => {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://lekkerspots.co.za' 
    : `${req.protocol}://${req.get('host')}`;
  // ... rest of robots.txt logic
});
```

**File 2**: `server/middleware/locationMetaMiddleware.ts`

```typescript
function resolveBaseUrl(req: Request): string {
  // In production, always use canonical domain
  if (process.env.NODE_ENV === 'production') {
    return 'https://lekkerspots.co.za';
  }
  
  // In development, use dynamic resolution for local testing
  // ... dynamic host resolution logic
}
```

**File 3**: `server/middleware/htmlMetaRewriter.ts`

```typescript
function getBaseUrl(req: Request): string {
  // In production, always use canonical domain
  if (process.env.NODE_ENV === 'production') {
    return 'https://lekkerspots.co.za';
  }
  
  // In development, use dynamic resolution for local testing
  // ... dynamic host resolution logic
}
```

#### Client-side Changes

**File 4**: `client/src/lib/config.ts` (new file)

```typescript
export const CANONICAL_BASE_URL = 
  import.meta.env.MODE === 'production'
    ? 'https://lekkerspots.co.za'
    : window.location.origin;
```

**File 5**: `client/src/pages/LocationDetail.tsx`

```typescript
import { CANONICAL_BASE_URL } from '@/lib/config';

// Before: Used window.location.origin (dynamic)
const pageUrl = `${window.location.origin}/location/${slug}`;

// After: Use canonical constant
const pageUrl = `${CANONICAL_BASE_URL}/location/${slug}`;
```

### Testing & Verification

#### Before Fix
```bash
# Test www version
$ curl -s https://www.lekkerspots.co.za/location/africa-padel-waterfront | grep canonical
<link rel="canonical" href="https://www.lekkerspots.co.za/location/africa-padel-waterfront">

# Test non-www version
$ curl -s https://lekkerspots.co.za/location/africa-padel-waterfront | grep canonical
<link rel="canonical" href="https://lekkerspots.co.za/location/africa-padel-waterfront">
# Different canonical URLs! ❌
```

#### After Fix
```bash
# Test www version
$ curl -s https://www.lekkerspots.co.za/location/africa-padel-waterfront | grep canonical
<link rel="canonical" href="https://lekkerspots.co.za/location/africa-padel-waterfront">

# Test non-www version
$ curl -s https://lekkerspots.co.za/location/africa-padel-waterfront | grep canonical
<link rel="canonical" href="https://lekkerspots.co.za/location/africa-padel-waterfront">
# Same canonical URL regardless of access method! ✅
```

#### Google Search Console Verification

Using GSC's URL Inspection tool on `https://www.lekkerspots.co.za/location/step-brothers-restaurant-and-bar`:

- **User-declared canonical**: `https://lekkerspots.co.za/location/step-brothers-restaurant-and-bar` ✅
- **Google-selected canonical**: "Only determined after indexing" (will eventually match user-declared)

### Impact & Expected Results

#### Immediate Effects
- All canonical tags point to non-www domain regardless of access method
- Sitemap only references canonical URLs (non-www)
- Open Graph tags consistently use canonical domain for social sharing
- Structured data uses canonical URLs

#### Long-term SEO Benefits (3-6 weeks)
- Google consolidates www and non-www URLs into canonical versions
- SEO authority concentrates on single domain variation
- Search rankings improve due to consolidated signals
- Duplicate content warnings disappear from GSC
- "Google-selected canonical" will match "User-declared canonical"

### Prevention Strategies

#### For Future SEO Projects

1. **Choose Canonical Domain Early**
   - Decide on www vs non-www preference before launch
   - Document the choice in project README
   - Enforce it consistently across all URL generation

2. **Hardcode Canonical Domain in Production**
   - Never use dynamic host resolution for canonical URLs in production
   - Development can be flexible for local testing
   - Use environment-based conditionals

3. **Comprehensive Canonical Enforcement**
   - Server-side: sitemap, robots.txt, meta tags
   - Client-side: React Helmet, Open Graph, structured data
   - Test both access methods (www and non-www)

4. **Google Search Console Monitoring**
   - Use URL Inspection tool to verify canonical tags
   - Submit only canonical sitemap version
   - Monitor "Coverage" report for duplicate detection
   - Watch for "Google chose different canonical than user" notices

5. **Testing Checklist**
   ```bash
   # Test canonical tags on both versions
   curl -s https://www.example.com/page | grep canonical
   curl -s https://example.com/page | grep canonical
   
   # Test sitemap URLs
   curl -s https://example.com/sitemap.xml | grep '<loc>'
   
   # Verify all use same canonical domain
   ```

### Related Files Modified

- `server/index.ts` - Sitemap and robots.txt canonical domain enforcement
- `server/middleware/locationMetaMiddleware.ts` - Server meta tag canonical URL
- `server/middleware/htmlMetaRewriter.ts` - HTML rewriter canonical URL
- `client/src/lib/config.ts` - New canonical domain constant (created)
- `client/src/pages/LocationDetail.tsx` - React Helmet canonical and OG tags
- `replit.md` - Updated SEO documentation section
- `README.md` - Added canonical domain fix to recent updates
- `PRODUCTION_DEPLOYMENT_FIX.md` - This documentation

### Deployment Checklist

When deploying canonical domain fixes:

- [x] Update all server-side URL generation to use canonical domain in production
- [x] Update client-side meta tags to use canonical domain
- [x] Test both www and non-www access methods
- [x] Verify canonical tags in HTML source
- [x] Submit canonical sitemap to Google Search Console
- [x] Remove alternate domain sitemap from GSC
- [x] Monitor GSC for duplicate content warnings
- [x] Document canonical domain choice in project README

### Additional Notes

#### Why This Was Important

1. **SEO Authority**: Split between two domains instead of concentrated
2. **Search Ranking**: Duplicate content can trigger ranking penalties
3. **Analytics**: Traffic and metrics split across two domain variations
4. **Link Equity**: Inbound links to www vs non-www don't consolidate
5. **User Confusion**: Inconsistent URLs in search results

#### Design Decision: Non-WWW Preference

Chose `https://lekkerspots.co.za` (without www) as canonical domain because:
- Shorter, cleaner URLs
- Modern web convention trending away from www
- Easier to type and remember
- Consistent with major platforms (google.com, facebook.com, twitter.com)

#### Google's Canonicalization Process

1. **Discovery**: Google finds both www and non-www versions
2. **Signal Detection**: Sees user-declared canonical tags pointing to non-www
3. **Evaluation**: Determines which version to show in search results
4. **Consolidation**: Over 2-6 weeks, consolidates signals to canonical version
5. **Final State**: "Google-selected canonical" matches user-declared canonical

---

## Fix #2: Social Media Preview & Base URL Replacement (November 7, 2025)

**Date**: November 7, 2025  
**Status**: ✅ RESOLVED  
**Severity**: High (Social media sharing completely broken)

### Problem Summary

After deploying social media preview features to production at `lekkerspots.co.za`, social media platforms (Facebook, Twitter, LinkedIn, Slack) showed broken previews with placeholder text instead of actual content. The OpenGraph meta tags contained `__BASE_URL__/og-image.jpg` instead of `https://lekkerspots.co.za/og-image.jpg`.

### Root Cause Analysis

#### The Express.static + Middleware Conflict

The `htmlMetaRewriter` middleware was designed to replace `__BASE_URL__` placeholders with the actual domain, but it never executed in production for the most important route: the homepage (`/`).

**What was happening:**

1. **Middleware Registration Order**:
   ```typescript
   app.use(htmlMetaRewriter);              // Middleware registered first
   app.use(express.static(distPath));       // express.static registered second
   app.use("*", (req, res) => {            // Catch-all fallback
     res.sendFile(path.resolve(distPath, "index.html"));
   });
   ```

2. **Original (Broken) Approach - res.sendFile Override**:
   - Middleware tried to override `res.sendFile` method
   - Expected the fallback handler to call `res.sendFile()`
   - Override would intercept, process HTML, replace placeholders
   
3. **Why It Failed**:
   - `express.static` uses the internal `send` module from the `serve-static` package
   - It NEVER calls `res.sendFile()` - it handles file serving internally
   - When users request `/`, express.static finds `index.html` and serves it directly via `send`
   - The `res.sendFile` override never executes
   - Social media crawlers always hit `/`, so previews never worked

4. **Why Location Pages Worked Temporarily**:
   - Requests like `/location/some-slug` don't match any static file
   - They fall through express.static to the catch-all handler
   - Catch-all calls `res.sendFile()`, triggering the override
   - But this was unreliable and didn't help homepage previews

### Symptoms

- ✅ Development environment: Works perfectly (Vite handles HTML transformation)
- ❌ Production homepage (`/`): HTML served with `__BASE_URL__` placeholders intact
- ❌ Social media previews: Show broken images and placeholder URLs
- ✅ Location pages (`/location/*`): Sometimes worked, sometimes didn't
- ✅ API endpoints: Work correctly
- ✅ Static assets (JS, CSS, images): Serve correctly
- ❌ No `[htmlMetaRewriter]` logs appearing in production (middleware not executing)

### Solution: Direct HTML Interception

**File**: `server/middleware/htmlMetaRewriter.ts`

Completely rewrote the middleware to **directly serve processed HTML** instead of trying to override response methods:

```typescript
export function htmlMetaRewriter(req: Request, res: Response, next: NextFunction) {
  // Skip static assets and API requests
  if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|json|woff|woff2|ttf|eot)$/)) {
    return next();
  }
  if (req.path.startsWith('/api/') || req.path.startsWith('/objects/')) {
    return next();
  }

  const baseUrl = getBaseUrl(req);
  const locationMeta = res.locals.locationMeta;

  // In production, read and process index.html DIRECTLY
  if (process.env.NODE_ENV === 'production') {
    const indexPath = path.resolve(import.meta.dirname, 'public', 'index.html');
    
    fs.readFile(indexPath, 'utf-8', (err, htmlContent) => {
      if (err) {
        console.error('[htmlMetaRewriter] Error reading index.html:', err);
        return next();  // Fallback to express.static
      }

      try {
        // Process HTML: replace __BASE_URL__ and inject location meta
        const processedHtml = processHtml(htmlContent, baseUrl, locationMeta);

        // Send processed HTML directly
        res.setHeader('Content-Type', 'text/html; charset=UTF-8');
        res.setHeader('Cache-Control', 'no-cache');
        res.send(processedHtml);
      } catch (processError) {
        console.error('[htmlMetaRewriter] Error processing HTML:', processError);
        next();  // Fallback on error
      }
    });
  } else {
    // In development, let Vite handle HTML transformation
    next();
  }
}
```

**Key Changes:**

1. **Direct Serving**: Middleware reads index.html from disk and sends it directly
2. **Bypasses express.static**: Request never reaches express.static for HTML
3. **No Response Overrides**: No fragile `res.sendFile`, `res.send`, or `res.end` overrides
4. **Uniform Processing**: All HTML requests (homepage and location pages) processed identically
5. **Graceful Fallback**: On any error, falls through to express.static
6. **Environment Aware**: Only runs in production; lets Vite handle dev environment

### Testing & Verification

#### Before Fix
```bash
$ curl -s https://lekkerspots.co.za/ | grep og:image
<meta property="og:image" content="__BASE_URL__/og-image.jpg" />
# Placeholder not replaced! ❌
```

#### After Fix
```bash
$ curl -s https://lekkerspots.co.za/ | grep og:image
<meta property="og:image" content="https://lekkerspots.co.za/og-image.jpg" />
# Correctly replaced with actual domain! ✅

$ curl -s https://www.lekkerspots.co.za/ | grep og:image
<meta property="og:image" content="https://www.lekkerspots.co.za/og-image.jpg" />
# Works on www subdomain too! ✅
```

#### Social Media Preview Testing

Verified working on:
- ✅ **Slack**: Shows correct title, description, and image
- ✅ **Facebook**: Proper Open Graph preview with image
- ✅ **Twitter**: Twitter Card displays correctly
- ✅ **LinkedIn**: Professional preview with image and description
- ✅ **Discord**: Embedded preview with image
- ✅ **OpenGraph.xyz Validator**: All platforms pass validation

### Prevention Strategies

#### For Future Middleware Development

1. **Avoid Response Method Overrides**
   - Overriding `res.send`, `res.sendFile`, etc. is fragile and error-prone
   - Third-party middleware may bypass your overrides
   - Direct request interception is more reliable

2. **Understand Middleware Execution Order**
   - `express.static` has special behavior - it doesn't use standard response methods
   - Intercept requests BEFORE they reach express.static if you need to process them
   - Test with actual `curl` requests to verify execution

3. **Test Production Behavior Locally**
   ```bash
   npm run build
   NODE_ENV=production node dist/index.js
   curl -s http://localhost:5000/ | grep __BASE_URL__
   # Should find NO matches
   ```

4. **Add Comprehensive Logging During Development**
   - Log at the start of middleware to confirm execution
   - Log before and after processing
   - Remove logs once stable

5. **Verify Social Media Previews**
   - Use [OpenGraph.xyz](https://www.opengraph.xyz/) to test
   - Test actual sharing on Slack, LinkedIn, Facebook
   - Check both main domain and www subdomain

### Related Files Modified

- `server/middleware/htmlMetaRewriter.ts` - Complete rewrite to use direct HTML serving
- `server/index.ts` - Removed debug logging after verification
- `replit.md` - Updated with production fix details
- `PRODUCTION_DEPLOYMENT_FIX.md` - This document

### Deployment Checklist

When deploying middleware changes to production:

- [ ] Test middleware execution with logging in production
- [ ] Verify `__BASE_URL__` replacement with `curl`
- [ ] Check both main domain and www subdomain
- [ ] Test social media previews on multiple platforms
- [ ] Verify no performance degradation (check response times)
- [ ] Ensure graceful error handling (middleware shouldn't crash app)
- [ ] Check production logs for errors after deployment

### Additional Notes

#### Why This Issue Was Challenging

1. **Silent Failure**: No error messages, middleware simply didn't run
2. **Environment-Specific**: Worked in development (Vite), failed in production (express.static)
3. **Middleware Order Confusion**: Both middlewares registered correctly, but execution didn't match expectations
4. **Internal Implementation Details**: Required understanding how express.static uses the `send` module
5. **Response Override Fragility**: Overrides work sometimes but not always

#### Lessons Learned

- Direct request interception is more reliable than response method overrides
- Always test production builds locally before deploying
- Express.static has special internal behavior that bypasses standard response methods
- Middleware execution order matters, but understanding HOW each middleware works matters more
- Social media preview testing requires actual deployment (can't fully test locally)

### References

- Express.js middleware documentation: https://expressjs.com/en/guide/using-middleware.html
- Express.static internals: https://github.com/expressjs/serve-static
- Open Graph Protocol: https://ogp.me/
- Twitter Cards: https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards

---

## Fix #1: HTML Truncation Issue (November 7, 2025)

**Date**: November 7, 2025  
**Status**: ✅ RESOLVED  
**Severity**: Critical (Site completely blank in production)

### Problem Summary

After deploying to production at `lekkerspots.co.za`, the website displayed a completely blank page despite working perfectly in development. The server was running without errors, API endpoints were functioning, but the browser received an incomplete HTML document.

### Root Cause Analysis

#### Primary Issue: Content-Length Header Mismatch

The HTML was being served truncated at exactly 3335 bytes, cutting off mid-tag and missing all closing tags including `</head>`, `<body>`, `<div id="root">`, and `</html>`.

**What was happening:**

1. `express.static()` middleware reads the original `index.html` file (3335 bytes)
2. Sets HTTP header: `Content-Length: 3335` based on the original file size
3. `htmlMetaRewriter` middleware intercepts the response and modifies the HTML:
   - Replaces `__BASE_URL__` placeholders with actual domain
   - Injects location-specific meta tags (when applicable)
   - **This makes the HTML longer than the original 3335 bytes**
4. The stale `Content-Length: 3335` header remains unchanged
5. Browser/proxy reads exactly 3335 bytes and stops reading
6. Result: HTML truncated mid-tag, missing critical elements like `<div id="root">`

#### Secondary Issue: Database Connection in Production

The Neon serverless PostgreSQL database was attempting to use WebSockets in production deployments, which is not supported in serverless environments. This caused server crash loops.

### Symptoms

- ✅ Development environment: Site works perfectly
- ❌ Production environment: Completely blank page
- ❌ HTML response ends abruptly: `<link rel="stylesheet" crossorigin href="/assets/index-Cp1k2vVh.css`
- ❌ Missing closing quote, missing body, missing React mount point
- ✅ JavaScript bundles load successfully (HTTP 200)
- ✅ API endpoints respond correctly (HTTP 200)
- ✅ Server stays running without crashes

### Solution

#### Fix 1: Content-Length Header Recalculation

**File**: `server/middleware/htmlMetaRewriter.ts` (older implementation)

Added proper Content-Length header management when processing HTML responses:

```typescript
// After processing HTML content
const processedBuffer = Buffer.from(htmlContent, 'utf-8');

// CRITICAL: Remove stale Content-Length header set by express.static
res.removeHeader('Content-Length');

// Set correct Content-Length for the processed content
res.setHeader('Content-Length', processedBuffer.length);

// Send the complete processed buffer
return originalEnd.call(this, processedBuffer, encoding, callback);
```

**Note**: This fix was later superseded by the direct HTML serving approach in Fix #2, which doesn't require Content-Length manipulation.

#### Fix 2: Database Connection Configuration

**File**: `server/db.ts`

Added production-specific database configuration for Neon serverless compatibility:

```typescript
const connectionConfig = 
  process.env.NODE_ENV === 'production'
    ? {
        // Use HTTP fetch instead of WebSockets for production (serverless compatible)
        poolQueryViaFetch: true,
      }
    : {};

export const db = drizzle(pool, {
  schema,
  ...connectionConfig,
});
```

**Key changes:**
- Use `poolQueryViaFetch: true` in production environments
- This forces Neon to use HTTP fetch instead of WebSockets
- Prevents server crashes in serverless deployments

### Testing & Verification

#### Before Fix
```bash
$ curl -s https://lekkerspots.co.za | wc -l
45  # Only 45 lines (truncated)

$ curl -s https://lekkerspots.co.za | tail -3
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script type="module" crossorigin src="/assets/index-B4pMJGWQ.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index-Cp1k2vVh.css
    # Missing closing quote and all body content!
```

#### After Fix
```bash
$ curl -s https://lekkerspots.co.za | wc -l
50  # Complete HTML

$ curl -s https://lekkerspots.co.za | tail -5
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
# All closing tags present! ✅
```

### Related Files Modified

- `server/middleware/htmlMetaRewriter.ts` - Content-Length fix, later replaced with direct serving
- `server/db.ts` - Production database configuration
- `server/index.ts` - Import cleanup
- `client/src/components/examples/LocationCard.tsx` - TypeScript fix
- `replit.md` - Updated documentation
