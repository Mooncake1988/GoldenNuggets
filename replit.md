# LekkerSpots - Western Cape Travel Guide

## Overview

LekkerSpots is a travel discovery web application for the Western Cape, South Africa. It curates a database of local spots (coffee shops, restaurants, beaches, hikes, markets, bars) and offers full-text search, dynamic tag filtering, and an interactive map. The platform includes an admin dashboard for content management with multi-image uploads, secure authentication, and Google Cloud Storage integration. Its purpose is to showcase hidden gems and local favorites, providing a production-ready solution with full CRUD functionality and robust image handling. The project aims to become the go-to guide for exploring the Western Cape, featuring a professional UI/UX and strong SEO capabilities for broad market reach.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend

The frontend is a React 18 application built with TypeScript, using Vite for development and Wouter for routing. UI components are developed with Shadcn/ui (New York style) based on Radix UI and styled with Tailwind CSS, emphasizing a mobile-first, responsive design with a custom HSL color system and typography. State management leverages TanStack Query for server state and React hooks for UI state. Key design elements include a photography-first hero section with a Western Cape stock photo, map-centric navigation using Leaflet, a reusable component architecture, and subtle Lottie animations that respect accessibility (`prefers-reduced-motion`). The UI incorporates a vibrant sunset gradient color palette, dynamic gradient borders, and hover effects for enhanced user experience and branding. SEO is optimized with server-side rendered meta tags and dynamic sitemap generation.

### Backend

The backend is built with Node.js and Express.js, written entirely in TypeScript with shared types across the stack. It provides RESTful API endpoints. Authentication is session-based for a single admin user, utilizing Passport.js with a Local Strategy and PostgreSQL for session storage. Drizzle ORM ensures type-safe database interactions and migrations. The file upload system integrates Uppy on the client with Google Cloud Storage via pre-signed URLs. Search and filtering functionalities are powered by PostgreSQL's `ILIKE` for full-text search and case-insensitive tag matching, with URL-driven filters. The server implements gzip compression for improved performance and SEO, and dynamically generates `sitemap.xml` and `robots.txt`.

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