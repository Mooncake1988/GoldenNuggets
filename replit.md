# LekkerSpots - Western Cape Travel Guide

## Overview

LekkerSpots is a travel discovery web application showcasing hidden gems and local favorites in the Western Cape, South Africa. It features a curated database of locations (coffee shops, restaurants, beaches, hikes, markets, bars), full-text search, dynamic tag filtering, and an interactive map. The platform includes an admin dashboard for content management with multi-image uploads, secure authentication, and integration with Google Cloud Storage for media. It is production-ready with full CRUD functionality, search, and image handling.

## Recent Updates (November 2025)

**Critical Production Deployment Fix (Latest)** ⚠️
- **HTML Truncation Issue Resolved**: Fixed critical bug where production site served truncated HTML causing blank page
  - Root cause: `express.static` set `Content-Length` header based on original file, but `htmlMetaRewriter` middleware modified HTML making it longer
  - Browsers stopped reading at original Content-Length, cutting off HTML mid-tag
  - Missing critical elements: `</head>`, `<body>`, `<div id="root">`, `</html>`
- **Solution**: Modified `htmlMetaRewriter` middleware to remove stale Content-Length header and recalculate based on processed HTML
- **Database Connection Stability**: Added `poolQueryViaFetch: true` configuration for Neon database in production environments
- **WebSocket Handling**: Production deployments now use HTTP fetch instead of WebSockets for database queries (serverless compatible)
- **TypeScript Compilation**: Fixed all TypeScript errors preventing production builds (LocationCard slug prop, htmlMetaRewriter function signatures)
- **Documentation**: Created comprehensive fix documentation in `PRODUCTION_DEPLOYMENT_FIX.md` with root cause analysis, solutions, and prevention strategies
- **Production Build**: Verified successful compilation and complete HTML delivery in deployed environments

**Social Media & SEO Optimization**
- **Server-Side Meta Tag Injection**: Location pages now inject location-specific meta tags server-side for social crawlers
- **Two-Tier Middleware System**:
  - `locationMetaMiddleware`: Intercepts `/location/:slug` requests, fetches location data from database, populates `res.locals.locationMeta`
  - `htmlMetaRewriter`: Replaces `__BASE_URL__` placeholders AND injects location-specific meta tags from `res.locals`
- **Dynamic Meta Tags**: Each location page serves unique `<title>`, OG tags (title, description, image, url, type=place), Twitter Card tags, and JSON-LD structured data
- **Works for All Crawlers**: Social media bots (Facebook, Twitter, LinkedIn) receive proper meta tags even without JavaScript execution
- **Favicon System**: Multi-size favicon implementation for all platforms
  - Browser icons: 16x16, 32x32, favicon.ico
  - iOS: 180x180 apple-touch-icon
  - Android: 192x192 and 512x512 icons with web manifest
  - All sizes feature larger LekkerSpots logo with sunset gradient for better visibility
- Custom OG image (1200×630px, 193KB) featuring Western Cape beach with LekkerSpots logo
- Dynamic base URL system works seamlessly across dev (Replit domain) and production (lekkerspots.co.za)
- Strict host header validation with regex to prevent spoofing attacks
- HTML escaping for user-generated content prevents XSS attacks in meta tags
- Complete SEO meta tags: keywords, canonical URLs, theme-color, author
- Full Western Cape rebranding across entire application

**Sitemap Domain Fix**
- Fixed sitemap URL generation to use custom domain (lekkerspots.co.za) in production
- Sitemap and robots.txt now dynamically use request host header for proper domain detection
- Ensures all sitemap URLs use the correct production domain for optimal SEO
- Works seamlessly across development and production environments

**SEO Optimization - Dynamic Sitemap**
- Implemented `/sitemap.xml` endpoint that generates SEO-optimized XML sitemap dynamically from database
- Automatic synchronization: every location create/update/delete is instantly reflected in the sitemap
- Proper SEO metadata: lastmod timestamps from database, priority levels, and changefreq values
- Includes all static pages (home, categories, map) and dynamic location detail pages
- Added `/robots.txt` endpoint with proper crawling rules (allows all, blocks /admin and /api)
- Zero maintenance required - sitemap stays current automatically

**Color Scheme Refresh**
- Vibrant sunset gradient palette using LekkerSpots logo colors (turquoise, hot pink, coral, yellow)
- Gradient category badges: orange for coffee shops, pink for restaurants, teal for beaches, green for hikes, purple for markets, fuchsia for bars
- Colorful tag system using theme colors (primary, accent, secondary, pink, teal) with proper dark mode support
- Gradient logo text in header using primary → accent → secondary gradient
- All colors maintain WCAG-compliant contrast ratios in both light and dark modes

**Hero Section Redesign**
- Replaced Lottie background with professional Western Cape stock photo
- Repositioned area-map animation as elegant accent icon above headline
- Implemented subtle gradient overlay (black/30-50%) for optimal text readability
- White text on photo creates premium, high-impact first impression
- Clean visual hierarchy: Animation → Headline → Subtitle → Search

**Lottie Animation Integration**
- Created reusable `LottieAnimation` component with accessibility support
- Integrated 3 custom animations: area-map (hero accent), confetti (newsletter), empty-state (search results)
- All animations respect `prefers-reduced-motion` for accessibility
- Confetti: Full-screen overlay (1920x1080 aspect ratio) with 3s auto-dismiss on newsletter subscription

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend

The frontend is built with React 18 and TypeScript, using Vite for development and Wouter for lightweight client-side routing. UI components are developed with Shadcn/ui (New York style) based on Radix UI and styled with Tailwind CSS, utilizing a mobile-first, responsive design with a custom HSL color system and typography (Inter and Merriweather). State management is handled by TanStack Query for server state and React hooks for UI state. Key design decisions include photography-first hero layouts, map-centric navigation with Leaflet, a reusable component architecture, and subtle Lottie animations that respect accessibility preferences (prefers-reduced-motion). The hero section features a Western Cape stock photo background with the area-map Lottie as a decorative accent icon, creating a professional, high-impact design.

### Backend

The backend uses Node.js with Express.js, written entirely in TypeScript with shared types across the stack. It exposes RESTful API endpoints. Authentication is session-based for a single admin user, leveraging Passport.js with a Local Strategy, storing credentials securely in environment variables and sessions in PostgreSQL via `connect-pg-simple`. Drizzle ORM ensures type-safe database interactions. The file upload system uses Uppy on the client, integrating with Google Cloud Storage via pre-signed URLs and a custom ACL policy. Search and filtering are powered by PostgreSQL's `ILIKE` for full-text search across various fields and case-insensitive tag matching. Filters are URL-driven, with a custom `urlchange` event system for state synchronization.

### Database

The database is PostgreSQL (Neon serverless) with a schema including a `Locations` table (name, category, description, coordinates, images, tags, featured flag) and a `Sessions` table for authentication. Drizzle ORM manages type-safe queries and migrations, with connection pooling for serverless compatibility.

## External Dependencies

**Authentication**: Passport.js (Local Strategy)
**Cloud Services**: Google Cloud Storage, Neon Database, Replit Sidecar (for secrets)
**Maps & Geolocation**: Leaflet.js, OpenStreetMap
**File Upload**: Uppy (Core, Dashboard, adapted S3 plugin)
**UI Components**: Radix UI, Lucide React (icons)
**Development Tools**: Vite, Replit-specific plugins, TypeScript
**Form Management**: React Hook Form, Zod, @hookform/resolvers
**Utility Libraries**: `class-variance-authority`, `clsx`, `tailwind-merge`, `nanoid`
**Animations**: Lottie React (custom animations for hero, confetti, empty states)
**Newsletter Integration**: Beehiiv API