# LekkerSpots - Western Cape Travel Guide

## Overview

LekkerSpots is a travel discovery web application showcasing hidden gems and local favorites across the Western Cape, South Africa. It features a curated database of locations (coffee shops, restaurants, beaches, hikes, markets, bars), full-text search, dynamic tag filtering, and an interactive map. The platform includes an admin dashboard for content management with multi-image uploads, secure authentication, and integration with Google Cloud Storage for media. It is production-ready with full CRUD functionality, search, and image handling.

The application features a vibrant **Miami Vice 80s-inspired aesthetic** with sunset colors:
- **Primary Color**: Sunset pink/magenta (HSL: 340 92% 64%)
- **Accent Color**: Electric cyan (HSL: 185 88% 58%) used prominently for logos, active navigation, search buttons, tags, and interactive elements
- **Background**: Warm peachy-pink pastels for inviting atmosphere
- **Visual Style**: Photography-first layouts, alternating cyan/pink tag colors for visual variety

## User Preferences

Preferred communication style: Simple, everyday language.
Design preferences: Miami Vice 80s aesthetic with sunset colors (pink to magenta), electric cyan accents, warm pastel backgrounds, avoiding dark themes.

## System Architecture

### Frontend

The frontend is built with React 18 and TypeScript, using Vite for development and Wouter for lightweight client-side routing. UI components are developed with Shadcn/ui (New York style) based on Radix UI and styled with Tailwind CSS, utilizing a mobile-first, responsive design with a custom HSL color system (sunset pink primary, electric cyan accent) and typography (Inter and Merriweather). State management is handled by TanStack Query for server state and React hooks for UI state. Key design decisions include photography-first layouts, Miami Vice 80s aesthetic with vibrant colors, map-centric navigation with Leaflet, and a reusable component architecture with accent variants for Badge and Button components.

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
**Newsletter Integration**: Beehiiv API