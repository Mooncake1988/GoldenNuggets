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

### Database

The project uses a PostgreSQL database (Neon serverless) with a `Locations` table (storing name, category, description, coordinates, images, tags, featured status) and a `Sessions` table for authentication. Drizzle ORM manages type-safe queries and schema migrations, configured for serverless compatibility with connection pooling.

## External Dependencies

**Authentication**: Passport.js
**Cloud Services**: Google Cloud Storage, Neon Database
**Maps & Geolocation**: Leaflet.js, OpenStreetMap
**File Upload**: Uppy
**UI Components**: Radix UI, Lucide React
**Form Management**: React Hook Form, Zod
**Animations**: Lottie React
**Newsletter Integration**: Beehiiv API