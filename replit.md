# LekkerSpots - Western Cape Travel Guide

## Overview

LekkerSpots is a travel discovery web application for the Western Cape, South Africa. It curates a database of local spots (coffee shops, restaurants, beaches, hikes, markets, bars) and offers full-text search, dynamic tag filtering, and an interactive map. The platform includes an admin dashboard for content management with multi-image uploads, secure authentication, and Google Cloud Storage integration. A "Featured Locations System" allows admins to highlight specific spots for prominent homepage display, designed for future monetization through sponsored listings. The project aims to be the leading guide for exploring the Western Cape, featuring a professional UI/UX and strong SEO.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend

The frontend is a React 18 application with TypeScript, Vite, and Wouter for routing. UI components use Shadcn/ui (New York style) based on Radix UI, styled with Tailwind CSS for a mobile-first, responsive design. It incorporates a custom HSL color system, photography-first hero sections, Leaflet for maps, and subtle Lottie animations. State management is handled by TanStack Query for server state and React hooks for UI state. Key design elements include a vibrant sunset gradient color palette and dynamic gradient borders. SEO is optimized with server-side rendered meta tags and dynamic sitemap generation.

**Header & Footer Branding**:
- **Header**: Features the official LekkerSpots circular logo (palm tree with sunset colors) alongside gradient-styled brand text and tagline "Western Cape Hidden Gems".
- **Footer**: Dark-themed design (slate-900 background) with a colorful sunset gradient bar at the top. Social media icons use brand-appropriate colors (Instagram pink, email cyan) for visual impact. Newsletter subscription form with dark-styled inputs.

**Content Discovery Pages**:
- **Homepage**: Displays 12 featured locations with pagination, followed by a Stories section showcasing the latest Beehiiv newsletter posts.
- **Categories Page**: Shows all locations by category with optional "Featured Only" filter.
- **Map Page**: Interactive Leaflet map of all locations with optional "Featured Only" filter.
- **About Us Page**: Static content with SEO meta tags.
- **Stories Section**: Embedded on the homepage below Featured Locations, fetches and displays the 3 most recent newsletter stories from Beehiiv API with thumbnails, titles, excerpts, and publish dates. Links to full stories on Beehiiv platform.

The admin dashboard provides comprehensive image management with drag-and-drop reordering, individual delete controls, and visual indicators for preview thumbnails. Admins can mark locations as "featured" and manage "Insider Tips" and "News Ticker" items.

### Backend

The backend is built with Node.js and Express.js in TypeScript, providing RESTful API endpoints for location management, search, and content discovery. Authentication is session-based for a single admin user, using Passport.js and PostgreSQL for session storage. Drizzle ORM ensures type-safe database interactions. File uploads integrate Uppy with Google Cloud Storage via pre-signed URLs. Search and filtering use PostgreSQL's `ILIKE`. The server implements gzip compression and dynamically generates `sitemap.xml` and `robots.txt`.

**SEO Optimization**: A hybrid SSR/SPA approach uses middleware (`locationMetaMiddleware.ts`, `htmlMetaRewriter.ts`) to pre-render essential location content for crawlers, ensuring visible HTML while maintaining a smooth SPA experience for users. Canonical domain enforcement (`https://lekkerspots.co.za`) is implemented server-side and client-side to prevent duplicate content issues.

**Features**:
- **IndexNow Integration**: Notifies search engines (Bing, Yandex, etc.) of content changes via `server/indexnow.ts` and an API key verification endpoint.
- **News Ticker**: An animated horizontal scrolling ticker on the homepage for announcements, managed via `/admin/ticker` with category, priority, and expiration settings.
- **Insider Brief**: Location pages include "Insider Tips" (FAQ-style information like WiFi, parking, pet policies) managed within the location edit page. These tips are fully crawlable via SSR, hidden DOM content for crawlers (`sr-only` div), and JSON-LD structured data (FAQPage schema) for rich results.
- **Continue Your Adventure**: A manual curation system for linking 2-3 related nearby spots on each location detail page. Admins select related locations via multi-select in the edit form, and visitors see these recommendations displayed below Insider Tips. This reduces bounce rate and improves SEO through internal linking. The section is fully server-side rendered for crawlers (like Insider Tips), ensuring Google indexes the internal links without needing JavaScript. API endpoint: `GET /api/locations/:id/related`.

### Database

The project uses a PostgreSQL database (Neon serverless) with `Locations` (name, category, description, coordinates, images, tags, featured status), `Sessions`, `tickerItems`, and `insider_tips` tables. Drizzle ORM manages type-safe queries and schema migrations for serverless compatibility.

## External Dependencies

**Authentication**: Passport.js
**Cloud Services**: Google Cloud Storage, Neon Database
**Maps & Geolocation**: Leaflet.js, OpenStreetMap
**File Upload**: Uppy
**UI Components**: Radix UI, Lucide React
**Form Management**: React Hook Form, Zod
**Animations**: Lottie React
**Newsletter Integration**: Beehiiv API (subscription and posts/stories endpoints)
**SEO**: IndexNow Protocol