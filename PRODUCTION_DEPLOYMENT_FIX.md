# Production Deployment Fix - HTML Truncation Issue

**Date**: November 7, 2025  
**Status**: ✅ RESOLVED  
**Severity**: Critical (Site completely blank in production)

## Problem Summary

After deploying to production at `lekkerspots.co.za`, the website displayed a completely blank page despite working perfectly in development. The server was running without errors, API endpoints were functioning, but the browser received an incomplete HTML document.

## Root Cause Analysis

### Primary Issue: Content-Length Header Mismatch

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

### Secondary Issue: Database Connection in Production

The Neon serverless PostgreSQL database was attempting to use WebSockets in production deployments, which is not supported in serverless environments. This caused server crash loops.

## Symptoms

- ✅ Development environment: Site works perfectly
- ❌ Production environment: Completely blank page
- ❌ HTML response ends abruptly: `<link rel="stylesheet" crossorigin href="/assets/index-Cp1k2vVh.css`
- ❌ Missing closing quote, missing body, missing React mount point
- ✅ JavaScript bundles load successfully (HTTP 200)
- ✅ API endpoints respond correctly (HTTP 200)
- ✅ Server stays running without crashes

## Solution

### Fix 1: Content-Length Header Recalculation

**File**: `server/middleware/htmlMetaRewriter.ts`

Added proper Content-Length header management when processing HTML responses:

```typescript
// After processing HTML content
const processedBuffer = Buffer.from(htmlContent, 'utf-8');

// CRITICAL: Remove stale Content-Length header set by express.static
// The original header is based on unmodified file size, but we've modified the HTML
// If we don't remove it, clients will stop reading at the old length, truncating the response
res.removeHeader('Content-Length');

// Set correct Content-Length for the processed content
res.setHeader('Content-Length', processedBuffer.length);

// Send the complete processed buffer
return originalEnd.call(this, processedBuffer, encoding, callback);
```

**Key changes:**
- Remove stale `Content-Length` header before sending modified HTML
- Recalculate and set correct `Content-Length` based on processed content
- Applied to both buffered responses (production) and inline responses (development)

### Fix 2: Database Connection Configuration

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

### Fix 3: TypeScript Compilation Errors

**Files**: 
- `client/src/components/examples/LocationCard.tsx`
- `server/middleware/htmlMetaRewriter.ts`

Resolved TypeScript errors that prevented production builds:
- Added missing `slug` prop to LocationCard component
- Fixed function signature type annotations in middleware

## Testing & Verification

### Before Fix
```bash
$ curl -s https://lekkerspots.co.za | wc -l
45  # Only 45 lines (truncated)

$ curl -s https://lekkerspots.co.za | tail -3
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script type="module" crossorigin src="/assets/index-B4pMJGWQ.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index-Cp1k2vVh.css
    # Missing closing quote and all body content!
```

### After Fix
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

## Prevention Strategies

### For Future Middleware Development

1. **Always manage Content-Length when modifying response bodies**
   - If middleware modifies HTML/JSON/any response body, remove or recalculate Content-Length
   - Never assume Content-Length will auto-update

2. **Test production builds locally**
   ```bash
   npm run build
   NODE_ENV=production node dist/index.js
   ```

3. **Verify complete HTML delivery**
   ```bash
   curl -s https://your-domain.com | tail -10
   # Should show </html> closing tag
   ```

### For Database Connections

1. **Always configure serverless-compatible database options in production**
   - Neon: Use `poolQueryViaFetch: true`
   - Check database provider documentation for serverless best practices

2. **Test with environment-specific configurations**
   - Development can use WebSockets
   - Production should use HTTP/fetch for serverless compatibility

## Related Files Modified

- `server/middleware/htmlMetaRewriter.ts` - Content-Length fix + sendFile override
- `server/db.ts` - Production database configuration
- `server/index.ts` - Import cleanup
- `client/src/components/examples/LocationCard.tsx` - TypeScript fix
- `replit.md` - Updated documentation with production fix details

## Deployment Checklist

When deploying to production, ensure:

- [ ] `npm run build` completes without TypeScript errors
- [ ] `dist/index.js` contains Content-Length header management code
- [ ] Database connection uses `poolQueryViaFetch: true` in production
- [ ] HTML response is complete (verify with curl/browser DevTools)
- [ ] No server crash loops in production logs
- [ ] React app mounts successfully (check for `<div id="root">` in HTML)

## Additional Notes

### Why This Issue Was Hard to Debug

1. **Same byte count**: Both truncated and complete HTML were 3335 bytes (confusing!)
2. **Silent failure**: No error messages, server appeared healthy
3. **Browser-specific**: Different browsers might cache differently
4. **Middleware order**: Issue only appears in production with static file serving
5. **Content-Length is invisible**: Header truncation happens at HTTP layer, not in code

### Lessons Learned

- HTTP headers matter! Content-Length must match actual payload size
- Serverless environments have different requirements than traditional hosting
- Always test production builds locally before deploying
- Middleware that modifies responses must handle HTTP headers correctly
- Response streaming/buffering requires careful header management

## References

- Express.js static file serving: https://expressjs.com/en/starter/static-files.html
- HTTP Content-Length header: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Length
- Neon serverless configuration: https://neon.tech/docs/serverless/serverless-driver
- Node.js response streaming: https://nodejs.org/api/http.html#responseenddata-encoding-callback
