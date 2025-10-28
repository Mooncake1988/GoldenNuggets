# Design Guidelines: Cape Town Golden Nuggets Travel Guide

## Design Approach Documentation

**Selected Approach**: Reference-Based Design drawing from Airbnb, Google Maps, and modern travel discovery platforms

**Justification**: This is an experience-focused, visual-rich travel discovery application where design differentiation is critical. The target audience expects a polished, trustworthy platform that showcases locations beautifully while providing practical discovery tools.

**Key Design Principles**:
- Visual storytelling through photography-first layouts
- Intuitive location discovery with map-centric navigation
- Trust-building through rich content presentation
- Mobile-first approach for on-the-go tourists
- Clean, spacious layouts that let content breathe

---

## Core Design Elements

### A. Typography

**Primary Font**: Inter or DM Sans (Google Fonts CDN)
- Clean, modern sans-serif optimized for digital reading

**Secondary Font**: Merriweather or Lora (Google Fonts CDN)
- Elegant serif for location descriptions and storytelling content

**Type Scale**:
- Hero Headlines: text-5xl md:text-6xl lg:text-7xl, font-bold
- Section Headings: text-3xl md:text-4xl, font-bold
- Card Titles: text-xl md:text-2xl, font-semibold
- Location Names: text-2xl md:text-3xl, font-bold
- Category Labels: text-sm uppercase tracking-wide font-medium
- Body Text: text-base md:text-lg, leading-relaxed
- Captions/Meta: text-sm, font-normal

---

### B. Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, 8, 12, 16, 20, 24** for consistency
- Micro spacing: gap-2, p-2 (8px)
- Component padding: p-4, p-6 (16px, 24px)
- Section spacing: py-12 md:py-16 lg:py-20 (mobile to desktop)
- Card gaps: gap-6 md:gap-8
- Container margins: px-4 md:px-6 lg:px-8

**Container Strategy**:
- Full-width sections: w-full with max-w-7xl mx-auto px-4 md:px-6 lg:px-8
- Content sections: max-w-6xl mx-auto
- Reading content: max-w-4xl mx-auto
- Narrow forms: max-w-2xl mx-auto

**Grid Systems**:
- Location cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8
- Category filters: grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4
- Image galleries: grid-cols-2 md:grid-cols-3 gap-2 md:gap-4
- Admin dashboard: grid-cols-1 lg:grid-cols-4 gap-6 (sidebar + content)

---

### C. Component Library

#### Navigation Header
- Sticky header with backdrop-blur-md and subtle shadow on scroll
- Logo left, navigation center, "Admin Login" button right
- Navigation items: Home, Categories, Map View, About
- Mobile: Hamburger menu with slide-out drawer
- Height: h-16 md:h-20
- Icons: Heroicons outline style

#### Hero Section (Homepage)
- Height: min-h-[70vh] md:min-h-[80vh]
- Large hero image with overlay gradient
- Centered content with max-w-4xl
- Headline + subheadline + search bar
- Search bar: Large input with integrated category dropdown and search button
- Buttons over image: backdrop-blur-sm with semi-transparent background

#### Location Cards
- Rounded corners: rounded-xl md:rounded-2xl
- Image aspect ratio: aspect-[4/3] with object-cover
- Hover effect: subtle scale transform and shadow increase
- Card structure:
  - Image top (clickable to detail page)
  - Category badge overlay (top-left of image, backdrop-blur)
  - Card body with p-4 md:p-6:
    - Location name (font-bold)
    - Neighborhood/Area (text-sm)
    - Short description (2 lines, text-ellipsis)
    - Tags row (flex flex-wrap gap-2)
- Shadow: shadow-md hover:shadow-xl transition

#### Filter Bar
- Sticky below header: top-16 md:top-20
- Backdrop blur with border-bottom
- Horizontal scroll on mobile with snap points
- Category chips: rounded-full px-4 py-2 font-medium
- Active state: filled background vs outlined
- Icons from Material Icons for categories

#### Map View Component
- Full-width section or split-screen layout
- Map height: h-[60vh] md:h-[70vh]
- Custom map markers using Font Awesome location icons
- Marker clusters for dense areas
- Popup cards on marker click with mini-preview
- Toggle between map view and list view on mobile

#### Location Detail Page
- Hero image gallery: h-[50vh] md:h-[60vh] with thumbnail strip
- Gallery controls: arrow navigation + dot indicators
- Content layout: 2-column on desktop (8/4 split)
  - Main column: Description, highlights, tips, user notes
  - Sidebar: Quick info card (address, hours, price range), embedded map, tags, share buttons
- Image gallery: lightbox modal on click
- Breadcrumb navigation at top

#### Category Browse Pages
- Banner section with category-specific image: h-48 md:h-64
- Grid of location cards below
- Sidebar filters (desktop) or slide-out (mobile)
- Filter categories: Neighborhood, Price Range, Tags, Currently Open

#### Admin Dashboard
- Sidebar navigation: w-64 with fixed positioning
- Main content area: flex-1 with overflow-y-auto
- Dashboard sections:
  - Stats cards: grid-cols-2 md:grid-cols-4 (total locations, pending reviews, views, favorites)
  - Recent activity feed
  - Quick actions

#### Admin Add/Edit Location Form
- Multi-step form with progress indicator
- Step 1: Basic Info (name, category, description)
- Step 2: Location & Contact (address with map picker, hours, website)
- Step 3: Images (drag-drop upload zone, preview grid, reorder functionality)
- Step 4: Tags & Classification (searchable tag input with autocomplete)
- Image upload zone: min-h-64 with dashed border, drag-drop active state
- Image preview: grid with delete/reorder controls

#### Footer
- Multi-column layout: grid-cols-1 md:grid-cols-4 gap-8
- Column 1: Logo + tagline
- Column 2: Quick Links (About, Contact, Categories)
- Column 3: Social Media (Instagram, Facebook icons with links)
- Column 4: Newsletter signup (email input + subscribe button)
- Bottom bar: Copyright, terms, privacy policy
- Padding: py-12 md:py-16

#### Search Component
- Large search bar with icon prefix
- Autocomplete dropdown with recent searches and suggestions
- Category filter integrated as dropdown or chips
- Clear button when input has value
- Mobile: Full-width with backdrop when active

#### Tag System
- Small rounded pills: rounded-full px-3 py-1 text-xs font-medium
- Clickable to filter by tag
- Icon prefix for visual tags (coffee cup, fork-knife, etc.)

#### Loading States
- Skeleton screens for cards: animate-pulse with gradient
- Spinner for map loading
- Progressive image loading with blur-up effect

---

### D. Animations

Use sparingly and purposefully:
- Card hover: transform scale-105 transition-transform duration-300
- Image loading: Blur-up effect using placeholder
- Page transitions: Subtle fade-in on route change
- Filter chips: Smooth background transition on active state
- Modal open/close: Fade + slight scale animation
- NO scroll-triggered animations
- NO complex parallax effects

---

## Images

### Hero Section
**Primary Hero Image**: Wide landscape shot of Cape Town featuring Table Mountain with city/ocean view
- Placement: Full-width background of hero section
- Treatment: Slight darkening overlay for text readability
- Dimensions: Minimum 1920x1080, optimized for web

### Location Cards
**Card Thumbnail Images**: High-quality photos of each location
- Show the essence of the place (interior for cafes, food for restaurants, scenery for experiences)
- Aspect ratio: 4:3 consistently across all cards
- Each location should have 4-8 images in their gallery

### Category Banners
**Category Header Images**: Specific to each category
- Coffee shops: Latte art or cozy coffee shop interior
- Restaurants: Beautifully plated local cuisine
- Experiences: Adventure/scenic activities
- Each banner: h-48 md:h-64

### About Page
**Storytelling Images**: Personal photos from exploring Cape Town
- Mix of location shots and lifestyle photography
- Use in split-screen layouts with text

### Admin Interface
**Image Upload Previews**: Show thumbnails of uploaded images in organized grid
- Drag-drop zone with icon placeholder when empty

### General Image Strategy
- Prioritize authentic, high-quality photography over stock imagery
- Maintain consistent color grading for cohesive brand feel
- Compress for web performance while preserving quality
- Use lazy loading for below-fold images
- Implement responsive images with srcset for different viewports