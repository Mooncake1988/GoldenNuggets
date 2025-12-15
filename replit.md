# LekkerSpots - Western Cape Travel Guide

## Overview

LekkerSpots is a travel discovery web application for the Western Cape, South Africa. It curates a database of local spots (coffee shops, restaurants, beaches, hikes, markets, bars) and offers full-text search, dynamic tag filtering, and an interactive map. The platform includes an admin dashboard for content management with multi-image uploads, secure authentication, and Google Cloud Storage integration. 

**Featured Locations System**: The app implements a curated discovery experience where admins can mark locations as "featured" for prominent homepage display. The homepage shows only featured locations (12 at a time with pagination), preventing content overload while guiding users to the best spots. Users can explore the complete catalog via the Categories page or Map page, both of which include optional "Featured Only" filters. This system is designed for future monetization where businesses can pay for featured placement, similar to sponsored listings.

The project aims to become the go-to guide for exploring the Western Cape, featuring a professional UI/UX and strong SEO capabilities for broad market reach.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend

The frontend is a React 18 application built with TypeScript, using Vite for development and Wouter for routing. UI components are developed with Shadcn/ui (New York style) based on Radix UI and styled with Tailwind CSS, emphasizing a mobile-first, responsive design with a custom HSL color system and typography. State management leverages TanStack Query for server state and React hooks for UI state. Key design elements include a photography-first hero section with a Western Cape stock photo, map-centric navigation using Leaflet, a reusable component architecture, and subtle Lottie animations that respect accessibility (`prefers-reduced-motion`). The UI incorporates a vibrant sunset gradient color palette, dynamic gradient borders, and hover effects for enhanced user experience and branding. SEO is optimized with server-side rendered meta tags and dynamic sitemap generation.

**Content Discovery Pages**:
- **Homepage**: Displays only featured locations in a grid layout with pagination (12 items per page, "Load More" button for additional featured content). Includes navigation links to Categories and Map pages for full catalog browsing.
- **Categories Page**: Shows all locations organized by category with optional "Featured Only" checkbox filter. Provides category descriptions and location counts.
- **Map Page**: Interactive Leaflet map displaying all locations geographically with optional "Featured Only" checkbox filter.

The admin dashboard features comprehensive image management with HTML5 drag-and-drop functionality for reordering images, individual delete controls for each image, and visual indicators showing which image serves as the location preview thumbnail (the first image in the array). Admins can mark locations as "featured" using a checkbox in both Add and Edit forms. The dashboard displays featured status with a star badge next to featured locations. The interface provides clear visual feedback during drag operations and hover states, ensuring an intuitive content management experience.

### Backend

The backend is built with Node.js and Express.js, written entirely in TypeScript with shared types across the stack. It provides RESTful API endpoints for location management, search, and content discovery. Authentication is session-based for a single admin user, utilizing Passport.js with a Local Strategy and PostgreSQL for session storage. Drizzle ORM ensures type-safe database interactions and migrations. 

**Key API Endpoints**:
- `/api/locations` - Fetch all locations
- `/api/locations/featured` - Fetch featured locations with pagination (supports `limit` and `offset` query parameters)
- `/api/locations/search` - Full-text search with optional tag filtering
- `/api/locations/by-tag/:tag` - Filter locations by tag
- `/api/locations/:id` - CRUD operations for individual locations (admin only)

The file upload system integrates Uppy on the client with Google Cloud Storage via pre-signed URLs. Search and filtering functionalities are powered by PostgreSQL's `ILIKE` for full-text search and case-insensitive tag matching, with URL-driven filters. The server implements gzip compression for improved performance and SEO, and dynamically generates `sitemap.xml` and `robots.txt`.

**SEO Optimization - Lightweight SSR for Location Pages**:
The application implements a hybrid SSR/SPA approach to satisfy both search engine crawlers and user experience requirements. When location pages (e.g., `/location/cape-town-luxury-car-rentals`) are requested in production mode, two middleware layers work together:

1. `locationMetaMiddleware.ts` - Fetches location data from the database and attaches it to `res.locals.locationMeta` with all necessary fields (name, description, category, coordinates, images, tags, full location object).

2. `htmlMetaRewriter.ts` - Processes the HTML before sending to client:
   - Replaces `__BASE_URL__` placeholders with actual domain
   - Injects correct canonical URL pointing to the specific location page
   - Injects visible server-rendered content into `<div id="root">` including location name (h1), category badge, description, address, and tags
   - Embeds `window.__LOCATION_DATA__` with properly escaped JSON for React hydration

On the client side, `LocationDetail.tsx`:
- Checks for `window.__LOCATION_DATA__` and validates it matches the current slug
- Uses server data as `initialData` for TanStack Query, avoiding loading states
- Removes SSR content stub and clears `window.__LOCATION_DATA__` after React hydration
- Subsequent navigation triggers normal client-side fetches

This approach provides Google's crawler with immediate, visible HTML content (eliminating soft 404 errors) while maintaining the smooth SPA experience for users. The solution is production-only; development mode uses Vite's standard SPA serving.

**Canonical Domain Enforcement (December 2025)**:
To prevent SEO duplicate content issues, all URL generation is hardcoded to the canonical domain (`https://lekkerspots.co.za` without www) in production mode:

- **Server-side**: `server/index.ts` (sitemap/robots.txt), `locationMetaMiddleware.ts`, and `htmlMetaRewriter.ts` all force the canonical domain when `NODE_ENV=production`
- **Client-side**: `LocationDetail.tsx` uses `CANONICAL_BASE_URL` constant from `client/src/lib/config.ts` for all canonical tags, Open Graph URLs, and structured data
- **Development mode**: Dynamic host resolution preserved for local testing flexibility

This ensures that whether users or crawlers access the site via `www.lekkerspots.co.za` or `lekkerspots.co.za`, all canonical URLs, sitemaps, and meta tags consistently point to the non-www canonical domain, consolidating SEO authority and preventing duplicate content penalties.

### Database

The project uses a PostgreSQL database (Neon serverless) with a `Locations` table (storing name, category, description, coordinates, images, tags, featured status) and a `Sessions` table for authentication. Drizzle ORM manages type-safe queries and schema migrations, configured for serverless compatibility with connection pooling.

**IndexNow Integration (December 2025)**:
The application implements IndexNow protocol to instantly notify search engines (Bing, Yandex, Seznam, Naver, Yep) when location content changes. This complements the existing sitemap-based discovery by providing real-time indexing notifications.

**Implementation Details**:
- **Service Module**: `server/indexnow.ts` handles all IndexNow API communication
- **API Key Verification**: Dynamic endpoint at `/{INDEXNOW_API_KEY}.txt` serves the key file for search engine verification. **Critical**: This route is registered at the TOP of `server/index.ts`, BEFORE the `htmlMetaRewriter` middleware, to prevent HTML processing from intercepting the plain-text response.
- **Automatic Notifications**: Location create/update/delete operations in `server/routes.ts` trigger asynchronous IndexNow submissions
- **Fire-and-Forget**: IndexNow calls are non-blocking and errors are logged but don't affect core functionality
- **Environment Variable**: `INDEXNOW_API_KEY` secret stores the API key

**Supported Search Engines**: Bing, Yandex, Seznam, Naver, Yep (Google is not supported)

**Note**: IndexNow notifies search engines of URL changes but does not guarantee indexing. Search engines apply their own selection criteria.

**News Ticker Feature (December 2025)**:
The homepage displays an animated horizontal scrolling ticker for announcements, promotions, and updates. Admins can manage ticker items through a dedicated admin page.

**Implementation Details**:
- **Database Table**: `tickerItems` stores announcements with title, category, linkUrl, priority, endDate, and isActive fields
- **Categories**: Seven color-coded categories (New Spots, Featured, Events, Tips, Offers, Updates, Seasonal)
- **Priority System**: Items sorted by priority (0-100, higher = first in ticker)
- **Expiration**: Optional endDate for time-limited announcements
- **Admin Page**: `/admin/ticker` provides full CRUD for managing announcements with live preview

**API Endpoints**:
- `GET /api/ticker` - Public endpoint returning only active, non-expired items
- `GET /api/admin/ticker` - Authenticated endpoint returning all items
- `POST/PUT/DELETE /api/admin/ticker/:id` - CRUD operations (authenticated)

**Frontend Components**:
- `NewsTicker.tsx` - Animated marquee with pause-on-hover, colored category badges, clickable links
- `AdminTicker.tsx` - Management page with create/edit dialog, status toggles, and live preview

## External Dependencies

**Authentication**: Passport.js
**Cloud Services**: Google Cloud Storage, Neon Database
**Maps & Geolocation**: Leaflet.js, OpenStreetMap
**File Upload**: Uppy
**UI Components**: Radix UI, Lucide React
**Form Management**: React Hook Form, Zod
**Animations**: Lottie React
**Newsletter Integration**: Beehiiv API
**SEO**: IndexNow Protocol