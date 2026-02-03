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
- **Homepage**: Displays 12 featured locations with pagination, followed by a Stories section showcasing the latest newsletter posts (powered by Beehiiv, accessible at https://newsletter.lekkerspots.co.za).
- **Categories Page**: Shows all locations by category with optional "Featured Only" filter.
- **Map Page**: Interactive Leaflet map of all locations with optional "Featured Only" filter.
- **About Us Page**: Static content with SEO meta tags.
- **Stories Section**: Embedded on the homepage below Featured Locations, fetches and displays the 3 most recent newsletter stories from Beehiiv API with thumbnails, titles, excerpts, publish dates, and **content tags** (displayed as badges). Links to full stories on the custom newsletter subdomain (https://newsletter.lekkerspots.co.za). Tags assigned in Beehiiv (e.g., "soul searching", "trail running", "farm stay") are automatically pulled via the API and displayed on story cards.

The admin dashboard provides comprehensive image management with drag-and-drop reordering, individual delete controls, and visual indicators for preview thumbnails. Admins can mark locations as "featured" and manage "Insider Tips" and "News Ticker" items.

### Backend

The backend is built with Node.js and Express.js in TypeScript, providing RESTful API endpoints for location management, search, and content discovery. Authentication is session-based for a single admin user, using Passport.js and PostgreSQL for session storage. Drizzle ORM ensures type-safe database interactions. File uploads integrate Uppy with Google Cloud Storage via pre-signed URLs. Search and filtering use PostgreSQL's `ILIKE`. The server implements gzip compression and dynamically generates `sitemap.xml` and `robots.txt`.

**SEO Optimization**: A hybrid SSR/SPA approach uses middleware (`locationMetaMiddleware.ts`, `htmlMetaRewriter.ts`) to pre-render essential location content for crawlers, ensuring visible HTML while maintaining a smooth SPA experience for users. Canonical domain enforcement (`https://lekkerspots.co.za`) is implemented server-side and client-side to prevent duplicate content issues.

**Features**:
- **IndexNow Integration**: Notifies search engines (Bing, Yandex, etc.) of content changes via `server/indexnow.ts` and an API key verification endpoint.
- **News Ticker**: An animated horizontal scrolling ticker on the homepage for announcements, managed via `/admin/ticker` with category, priority, and expiration settings.
- **Insider Brief**: Location pages include "Insider Tips" (FAQ-style information like WiFi, parking, pet policies) managed within the location edit page. These tips are fully crawlable via SSR, hidden DOM content for crawlers (`sr-only` div), and JSON-LD structured data (FAQPage schema) for rich results.
- **Continue Your Adventure**: A manual curation system for linking 2-3 related nearby spots on each location detail page. Admins select related locations via multi-select in the edit form, and visitors see these recommendations displayed below Insider Tips. This reduces bounce rate and improves SEO through internal linking. The section is fully server-side rendered for crawlers (like Insider Tips), ensuring Google indexes the internal links without needing JavaScript. API endpoint: `GET /api/locations/:id/related`.
- **Trending Lekker Spots**: Instagram-based social trending feature that tracks hashtag post counts using the Apify API. Locations with an assigned Instagram hashtag are monitored for post count growth, and a trending score (percentage growth) is calculated. The homepage displays the top 5 trending locations with fire badges and growth percentages (CoinMarketCap-style). LocationCards also show a "Trending" badge when the trending score exceeds 5%. API endpoints: `GET /api/locations/trending` (public) and `POST /api/admin/social-trends/update` (admin, triggers manual data refresh).

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
**Social Trends**: Apify Instagram Hashtag Stats API (tracks hashtag post counts for trending feature)

## Apify Instagram Trending Integration

### How It Works

The "Trending Lekker Spots" feature uses the Apify `instagram-hashtag-stats` actor to track Instagram hashtag popularity and calculate trending scores based on percentage growth.

**API Endpoint Used:**
```
POST https://api.apify.com/v2/acts/apify~instagram-hashtag-stats/run-sync-get-dataset-items?token={APIFY_API_KEY}
```

**Request Format:**
```json
{
  "hashtags": ["dekleineschur"]
}
```

**Response Format:**
```json
[
  {
    "id": "17841563825106882",
    "name": "dekleineschur",
    "postsCount": 1278000,
    "topPosts": [...],
    "relatedHashtags": [...]
  }
]
```

**Key Field:** `postsCount` - Total number of Instagram posts using this hashtag.

### Data Flow

1. Admin assigns an Instagram hashtag to a location (e.g., `dekleineschur`) via the Edit Location form
2. Admin clicks "Update Social Trends" button in the admin dashboard
3. System makes **one API call per hashtag** to Apify (e.g., 5 locations with hashtags = 5 API calls)
4. For each hashtag, the system:
   - Fetches current `postsCount` from Apify
   - Compares to previous `postsCount` stored in database
   - Calculates trending score as percentage growth: `((new - old) / old) * 100`
   - Updates the location record with new counts and trending score
5. Locations with positive growth appear in the "Trending Lekker Spots" homepage section

### API Cost Considerations

- **1 API call per hashtag** when "Update Social Trends" is clicked
- Apify uses a "pay per event" model for this actor
- To minimize costs: only assign hashtags to locations you actively want to track
- The system processes hashtags sequentially (not in parallel) to avoid rate limits

### Data Synchronization

**Current Method: Manual Updates Only**
- Admin must click "Update Social Trends" button in the admin dashboard
- Located at: `/admin` → "Social Trends" card → "Update Social Trends" button
- API endpoint: `POST /api/admin/social-trends/update`
- The button shows a loading spinner during the update process

**Future Enhancement:** Could add scheduled/cron updates for automatic daily syncing.

### Homepage Display Behavior

- **No trending data:** The entire "Trending Lekker Spots" section is hidden
- **1-5 trending locations:** Shows all trending locations, no "View all" link
- **6+ trending locations:** Shows top 5 with "View all trending" link to map

### Hashtag Best Practices

When assigning hashtags in the admin dashboard, follow this priority:

| Priority | Type | Example | Recommended? |
|----------|------|---------|--------------|
| **1 (Best)** | Specific Brand | `#dekleineschur` | ✅ YES - Most accurate |
| **2** | Unique Nickname | `#wolfbergarch` | ✅ YES - If no brand tag exists |
| **3 (Risky)** | Niche Category | `#cederbergfarmstay` | ⚠️ NO - Too much noise |
| **4 (Avoid)** | Generic | `#travel`, `#padstal` | ❌ NEVER - Data becomes useless |

**Key Principle:** The trending score shows **percentage growth**, not raw post counts. A small location with 10% growth will rank higher than a famous spot with 0.01% growth. This surfaces "hidden gems" rather than always showing popular locations.

### Troubleshooting

**Trending section not appearing?**
1. Ensure at least one location has an Instagram hashtag assigned
2. Click "Update Social Trends" in admin dashboard
3. The hashtag must have posts on Instagram (0-post hashtags won't trend)

**Apify API not working?**
1. Verify `APIFY_API_KEY` secret is set correctly
2. Check Apify dashboard for actor run status
3. Ensure you're using `apify~instagram-hashtag-stats` actor (not the scraper)

## Beehiiv API Integration Notes

### Stories/Posts Endpoint

The Stories section on the homepage fetches the 3 most recent newsletter posts from Beehiiv using:
```
GET /v2/publications/{publicationId}/posts?status=confirmed&limit=3&expand=free_web_content&order_by=publish_date&direction=desc
```

**Critical Parameters:**
- `status=confirmed` - Only fetch published posts (not drafts)
- `order_by=publish_date&direction=desc` - **Required!** Ensures newest posts are returned first

### Known Issue & Fix (January 2026)

**Problem:** New posts weren't appearing in the Stories section despite being published on Beehiiv.

**Root Cause:** The Beehiiv API defaults to sorting by `created` date in `ascending` order (oldest first). When requesting only 3 posts without explicit sorting, the API returned the 3 oldest posts instead of the 3 newest.

**Solution:** Added `order_by=publish_date&direction=desc` query parameters to the API call in `server/routes.ts` to ensure posts are sorted by publish date (newest first).

**If stories aren't updating after publishing:**
1. Wait 5-10 minutes - Beehiiv may have a slight delay before the API reflects new posts
2. Ensure the post status is "confirmed" (published, not draft or scheduled)
3. Hard refresh the browser (Ctrl+Shift+R / Cmd+Shift+R) to clear any cached data
4. Check server logs for any Beehiiv API errors