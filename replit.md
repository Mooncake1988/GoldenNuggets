# Cape Town Golden Nuggets Travel Guide

## Overview

Cape Town Golden Nuggets is a fully functional travel discovery web application that showcases hidden gems and local favorites in Cape Town, South Africa. The platform features:

- **Curated Location Database**: Coffee shops, restaurants, beaches, hikes, markets, and bars
- **Full-Text Search**: PostgreSQL-powered search across locations, categories, tags, and descriptions
- **Dynamic Tag Filtering**: Real-time tag-based discovery with case-insensitive matching
- **Combined Search & Filters**: Search and tag filters work together for precise location discovery
- **Admin Dashboard**: Secure admin interface for managing locations with multi-image uploads
- **Interactive Map**: Leaflet-based map view with location markers and navigation
- **Location Details**: Full detail pages with image galleries, descriptions, and directions
- **Authentication**: Secure username/password authentication for admin-only access
- **Object Storage**: Google Cloud Storage integration for location images

**Status**: Production-ready with complete CRUD functionality, authentication, search, and image upload capabilities.

**Last Updated**: October 29, 2025

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript using Vite as the build tool and development server.

**Routing**: Wouter for lightweight client-side routing without the overhead of React Router.

**UI Component Library**: Shadcn/ui (New York style variant) built on top of Radix UI primitives, providing accessible, unstyled components that are customized with Tailwind CSS.

**State Management**: 
- TanStack Query (React Query) v5 for server state management, data fetching, and caching
- Local component state with React hooks for UI state

**Styling**:
- Tailwind CSS with custom design system based on HSL color variables
- Custom typography using Inter (primary) and Merriweather (secondary) from Google Fonts
- Mobile-first responsive design approach
- Custom CSS variables for theming with light/dark mode support

**Key Design Decisions**:
- Photography-first layouts inspired by Airbnb and travel discovery platforms
- Map-centric navigation using Leaflet for interactive location exploration
- Reusable component architecture with shadcn/ui for consistency
- Visual storytelling through hero sections and location cards

### Backend Architecture

**Runtime**: Node.js with Express.js server framework

**Language**: TypeScript throughout the entire stack (shared types between client and server)

**API Design**: RESTful API endpoints with JSON responses

**Authentication**: 
- Simple username/password authentication for single admin access
- Passport.js with Local Strategy for authentication flow
- Admin credentials stored securely in environment variables (ADMIN_USERNAME, ADMIN_PASSWORD)
- Session-based authentication with secure HTTP-only cookies
- Session storage in PostgreSQL using connect-pg-simple

**Database ORM**: Drizzle ORM for type-safe database operations

**File Upload System**: 
- Uppy file uploader on the client side
- Custom object storage service using Google Cloud Storage
- Pre-signed URL generation for direct client-to-storage uploads
- Custom ACL (Access Control List) policy system for object permissions

**Search & Filtering Implementation**:
- **Search Endpoint**: `GET /api/locations/search?q=query&tag=tagname`
  - PostgreSQL ILIKE pattern matching across: name, description, category, neighborhood, address, and tags
  - Supports combined search + tag filtering
  - Case-insensitive tag matching using SQL LOWER() functions
- **Tag Endpoints**:
  - `GET /api/tags` - Returns popular tags with usage counts
  - `GET /api/locations/by-tag/:tag` - Filters locations by specific tag (case-insensitive)
- **Frontend State Management**:
  - URL-driven filtering with query parameters (`/?search=query&tag=tagname`)
  - Custom 'urlchange' event system for real-time state synchronization
  - Components listen for both 'popstate' (browser navigation) and 'urlchange' (programmatic navigation)
  - TagFilter component with dynamic badge rendering from database tags
  - Search and tag filters preserve each other when updated

**Key Architectural Decisions**:
- Monorepo structure with shared schema definitions between client and server
- Separate `/api` routes for backend endpoints
- Middleware for request logging and JSON body parsing
- Custom error handling for unauthorized access
- Client-side auth guards redirect to login when sessions expire
- Search uses server-side PostgreSQL filtering for scalability

### Database Architecture

**Database**: PostgreSQL (via Neon serverless)

**Schema Design**:

1. **Locations Table**: Core content model
   - Name, category, neighborhood, description, address
   - Latitude/longitude for map positioning
   - Array fields for images and tags
   - Featured flag for highlighting premium content
   - Timestamps for creation and updates

2. **Sessions Table**: Manages admin authentication sessions
   - Session ID, session data (JSONB), expiration timestamp
   - Indexed on expiration for efficient cleanup

**Database Access Pattern**: 
- Connection pooling with Neon serverless PostgreSQL
- WebSocket-based connections for serverless compatibility
- Drizzle ORM for type-safe queries and migrations

### External Dependencies

**Authentication**:
- Passport.js with Local Strategy for username/password authentication
- Environment variables for secure credential storage

**Cloud Services**:
- Google Cloud Storage for image/object storage
- Replit Sidecar for secure credential management
- Neon Database for serverless PostgreSQL hosting

**Maps & Geolocation**:
- Leaflet.js for interactive map rendering
- OpenStreetMap tile layer for base map data

**File Upload**:
- Uppy Core for file upload orchestration
- Uppy Dashboard for upload UI
- Uppy AWS S3 plugin (adapted for Google Cloud Storage)

**UI Component Libraries**:
- Radix UI primitives for accessible component foundation
- Lucide React for icon system

**Development Tools**:
- Vite for fast development and optimized production builds
- Replit-specific plugins for development banner and error overlay
- TypeScript for type safety across the stack

**Form Management**:
- React Hook Form for form state and validation
- Zod for runtime schema validation
- @hookform/resolvers for integration between the two

**Utility Libraries**:
- class-variance-authority for component variant management
- clsx and tailwind-merge for conditional class name composition
- nanoid for unique ID generation

## Environment Variables Required

**Object Storage** (managed by Replit Object Storage integration):
- `PUBLIC_OBJECT_SEARCH_PATHS`: Search paths for public assets
- `PRIVATE_OBJECT_DIR`: Directory for private objects
- `DEFAULT_OBJECT_STORAGE_BUCKET_ID`: Bucket ID for object storage

**Database** (managed by Replit PostgreSQL integration):
- `DATABASE_URL`: PostgreSQL connection string
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`: Individual connection params

**Authentication**:
- `SESSION_SECRET`: Secret for session cookie signing
- `ADMIN_USERNAME`: Admin username for login (set in Replit Secrets)
- `ADMIN_PASSWORD`: Admin password for login (set in Replit Secrets)
  - Can be stored as plain text or bcrypt hash
  - For better security, use a bcrypt hash (starting with $2a$, $2b$, or $2y$ and 60 chars long)
  - System auto-detects and handles both formats

## Key Features Implemented

### Public Features
1. **Home Page** (`/`): Hero section with search box, dynamic tag filters, and featured locations grid
2. **Search Functionality**: Full-text search with URL-based filtering (`/?search=query`)
   - PostgreSQL ILIKE search across name, description, category, neighborhood, address, and tags
   - Real-time URL sync with search state
   - Clear search by submitting empty query
   - Proper error handling and empty states
3. **Tag Filtering**: Dynamic tag badges for location discovery (`/?tag=tagname`)
   - Tags fetched from actual location data (not hardcoded)
   - Case-insensitive filtering (e.g., "Fruit Farm" matches "fruit farm")
   - Click tags to filter locations by specific attributes
   - Visual indication of selected tag with badge styling
4. **Combined Filtering**: Search and tag filters work together (`/?search=coffee&tag=brunch`)
   - Both filters can be active simultaneously
   - URL parameters are preserved when switching filters
   - Results show locations matching both search query AND selected tag
5. **Map View** (`/map`): Interactive Leaflet map with all location markers
6. **Location Detail** (`/location/:id`): Full details with image gallery, tags, directions

### Admin Features (Authentication Required)
1. **Admin Login** (`/admin/login`): Replit Auth integration
2. **Admin Dashboard** (`/admin`): View/manage/delete all locations
3. **Add Location** (`/admin/add`): Multi-image upload with form validation

### Technical Highlights
- **Search System**: PostgreSQL full-text search with ILIKE pattern matching and array field support
- **Tag Filtering**: Dynamic tag system with case-insensitive matching using SQL LOWER() functions
- **Combined Filters**: Search + tag filtering with proper URL parameter preservation
- **Image Upload Flow**: Presigned URLs → Direct client upload → ACL policy → DB storage
- **Auth Guards**: Client-side redirects with session expiration handling
- **URL State Sync**: Custom 'urlchange' event system for real-time state synchronization across components
- **Error States**: Proper loading, empty, and error state handling throughout
- **Responsive Design**: Mobile-first with Cape Town-inspired color palette

### Recent Updates (October 29, 2025)

**Dynamic Tag Filtering System**:
- Replaced hardcoded category filters with dynamic tag-based filtering
- Tags are automatically extracted from location data in the database
- Implemented case-insensitive tag matching to handle variations in tag capitalization
- Added custom event system ('urlchange') for seamless state synchronization
- Search and tag filters now work together without losing each other
- Browser back/forward navigation properly restores filter state

**Key Files Modified**:
- `server/routes.ts` - Added `/api/tags` and `/api/locations/by-tag/:tag` endpoints
- `server/storage.ts` - Implemented `getPopularTags()` and case-insensitive `getLocationsByTag()`
- `client/src/components/TagFilter.tsx` - New component for dynamic tag badge rendering
- `client/src/components/HeroSection.tsx` - Enhanced to preserve tag filters during search
- `client/src/pages/Home.tsx` - Updated to handle combined search + tag filtering with custom events