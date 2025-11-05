# LekkerSpots - Cape Town Hidden Gems

A vibrant travel discovery web application showcasing hidden gems and local favorites in Cape Town, South Africa. Discover the best coffee shops, restaurants, beaches, hikes, markets, and bars with an interactive map and beautiful visual design.

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

LekkerSpots features a vibrant sunset color palette inspired by Cape Town's natural beauty:
- **Turquoise Primary**: Reflects the Atlantic Ocean and Table Bay
- **Hot Pink Accent**: Captures the energy of the city's sunsets
- **Coral/Orange Secondary**: Echoes golden hour along the beaches
- **Gradient Category Badges**: Each category has its own colorful gradient (orange for coffee shops, pink for restaurants, teal for beaches, etc.)
- **Photography-First**: Hero section features professional Cape Town imagery with elegant Lottie animations

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

### Color Scheme Refresh
- Vibrant sunset gradient palette (turquoise, hot pink, coral, yellow)
- Gradient category badges for visual distinction
- Colorful tag system using theme colors
- Full dark mode support with accessible contrast
- Gradient logo text in header

### Hero Section Redesign
- Professional Cape Town stock photo background
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
- The Cape Town community for inspiration

---

Built with ❤️ for Cape Town explorers
