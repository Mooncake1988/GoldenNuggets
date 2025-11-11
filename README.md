# LekkerSpots - Western Cape Hidden Gems

A vibrant travel discovery web application showcasing hidden gems and local favorites in the Western Cape, South Africa. Discover the best coffee shops, restaurants, beaches, hikes, markets, and bars with an interactive map and beautiful visual design.

![LekkerSpots](./attached_assets/LekkerSpots%20logo_1762342226104.png)

## ✨ Features

- **Interactive Map**: Explore locations on an interactive Leaflet map with custom markers
- **Smart Search**: Full-text search across location names, descriptions, neighborhoods, and tags
- **Category Filtering**: Browse locations by type with colorful gradient category badges
- **Dynamic Tags**: Filter by multiple tags with vibrant, color-coded badges
- **Responsive Design**: Beautiful mobile-first design that works on all devices
- **Admin Dashboard**: Secure admin panel for content management
- **Multi-Image Upload**: Upload multiple images per location with Google Cloud Storage integration
- **Newsletter Integration**: Beehiiv newsletter signup with celebratory confetti animation
- **Dark Mode**: Full dark mode support with accessible color contrast
- **Accessibility**: Respects `prefers-reduced-motion` and maintains WCAG-compliant contrast ratios

## 🎨 Design Philosophy

LekkerSpots features a vibrant sunset color palette inspired by the Western Cape's natural beauty:
- **Turquoise Primary**: Reflects the Atlantic Ocean and Table Bay
- **Hot Pink Accent**: Captures the energy of stunning sunsets
- **Coral/Orange Secondary**: Echoes golden hour along the beaches
- **Gradient Category Badges**: Each category has its own colorful gradient (orange for coffee shops, pink for restaurants, teal for beaches, etc.)
- **Photography-First**: Hero section features professional Western Cape imagery with elegant Lottie animations

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Wouter** for lightweight client-side routing
- **Shadcn/ui** component library (Radix UI primitives)
- **Tailwind CSS** for styling
- **TanStack Query** for server state management
- **Leaflet.js** for interactive maps
- **Lottie React** for smooth animations
- **Uppy** for file uploads

### Backend
- **Node.js** with Express.js
- **TypeScript** throughout the stack
- **Drizzle ORM** for type-safe database queries
- **Passport.js** for authentication (Local Strategy)
- **PostgreSQL** (Neon serverless) for data persistence
- **Google Cloud Storage** for image hosting

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd lekker-spots
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (see Environment Variables section below)

4. Set up the database:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL=your_postgresql_connection_string

# Admin Authentication
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD_HASH=your_bcrypt_hashed_password

# Session Secret
SESSION_SECRET=your_random_session_secret

# Google Cloud Storage
GCS_BUCKET_NAME=your_gcs_bucket_name
GCS_PROJECT_ID=your_gcs_project_id
GOOGLE_APPLICATION_CREDENTIALS=path_to_service_account_json

# Newsletter (Optional)
BEEHIIV_API_KEY=your_beehiiv_api_key
BEEHIIV_PUBLICATION_ID=your_publication_id
```

### Generating Admin Password Hash

```bash
node -e "console.log(require('bcrypt').hashSync('your_password', 10))"
```

## 🗺️ Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities and helpers
│   │   └── hooks/         # Custom React hooks
├── server/                # Backend Express application
│   ├── routes.ts          # API route definitions
│   ├── storage.ts         # Database interface
│   └── index.ts           # Server entry point
├── shared/                # Shared types and schemas
│   └── schema.ts          # Database schema and Zod types
└── attached_assets/       # Static assets (images, animations)
```

## 🎯 Key Features Explained

### Search & Filtering
- Full-text search using PostgreSQL `ILIKE` for fuzzy matching
- Multi-tag filtering with URL-driven state
- Category-based browsing with gradient badges
- Real-time results with no page refresh

### Image Management
- Multi-image upload with drag-and-drop support
- Automatic cloud storage via Google Cloud Storage
- Pre-signed URLs for secure uploads
- Image gallery with thumbnail navigation

### Admin Panel
- Secure session-based authentication
- Full CRUD operations for locations
- Rich form validation with Zod schemas
- Image upload management

### Map Integration
- Interactive Leaflet map with OpenStreetMap tiles
- Custom markers for different categories
- Click markers to view location details
- Responsive map controls

## 🎨 Recent Updates (November 2025)

### Sitemap Route Fix (November 11, 2025)
- **Issue**: Sitemap.xml endpoint was being intercepted by Vite's catch-all route, returning HTML instead of XML
- **Root Cause**: SEO routes (sitemap.xml, robots.txt) were registered before Vite middleware setup, causing route precedence issues
- **Solution**: 
  - Moved sitemap and robots.txt route handlers to execute after registerRoutes() but before Vite middleware
  - Added explicit skip logic in htmlMetaRewriter middleware to bypass /sitemap.xml and /robots.txt
  - Routes now serve proper XML/text content in both development and production
- **Impact**: Sitemap now works correctly for all SEO crawlers (Ahrefs, Google, Bing) while preserving social preview functionality
- **Verification**: Tested in production with working XML sitemap at https://lekkerspots.co.za/sitemap.xml

### Production Deployment Fixes
- **Critical Fix**: Resolved social media preview issue where `__BASE_URL__` placeholders weren't being replaced in production
- **Root Cause**: `express.static` middleware uses internal `send` module, bypassing `res.sendFile` overrides
- **Solution**: Rewrote middleware to directly intercept and serve processed HTML before express.static
- **Impact**: Social media previews now work perfectly on all platforms (Slack, Facebook, Twitter, LinkedIn, Discord)
- **Verified**: Both main domain (lekkerspots.co.za) and www subdomain working reliably
- See `PRODUCTION_DEPLOYMENT_FIX.md` for detailed technical analysis

### Social Media & SEO Optimization
- **Server-Side Meta Tag Injection**: Location pages now inject location-specific meta tags server-side for social crawlers
- **Dynamic Meta Tags**: Each location page serves unique title, Open Graph tags, Twitter Card tags, and JSON-LD structured data
- **Social Media Preview**: Tested and working on Facebook, Twitter, LinkedIn, Slack, Discord, and WhatsApp
- **Custom OG Image**: Professional 1200×630px image featuring Western Cape beach with LekkerSpots logo
- **Favicon System**: Complete multi-size favicon implementation
  - Browser icons: 16x16, 32x32, favicon.ico
  - iOS: 180x180 apple-touch-icon
  - Android: 192x192 and 512x512 icons with web manifest
- **Security**: HTML escaping for user-generated content prevents XSS attacks in meta tags
- **Dynamic Base URL**: Works seamlessly across development and production environments

### SEO & Domain Optimization
- Fixed sitemap to use production domain (lekkerspots.co.za) for optimal SEO
- Dynamic sitemap generation with automatic updates from database
- Proper robots.txt configuration for search engine crawling
- All sitemap URLs now correctly reflect the production domain

### Color Scheme Refresh
- Vibrant sunset gradient palette (turquoise, hot pink, coral, yellow)
- Gradient category badges for visual distinction
- Colorful tag system using theme colors
- Full dark mode support with accessible contrast
- Gradient logo text in header

### Hero Section Redesign
- Professional Western Cape stock photo background
- Area-map Lottie animation as accent icon
- Gradient overlay for optimal text readability
- Clean visual hierarchy

### Animation Integration
- Reusable `LottieAnimation` component
- Three custom animations: area-map (hero), confetti (newsletter), empty-state (search)
- Accessibility support with `prefers-reduced-motion`
- Confetti celebration on newsletter signup

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Stock photos from professional photography sources
- Lottie animations for smooth UI interactions
- Shadcn/ui for beautiful, accessible components
- OpenStreetMap for map tiles
- The Western Cape community for inspiration

---

Built with ❤️ for Western Cape explorers
