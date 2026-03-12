# Music Industry Connect Platform

## Overview

This is a full-stack web application called "Music Industry Connect" that serves as a social networking platform for music industry professionals. The platform allows artists, producers, engineers, and other music industry professionals to connect, share updates, discover opportunities, and build their professional networks.

## Recent Changes
- **January 28, 2026**: Added sophisticated comment system with expand/collapse UI on Core page
- **January 28, 2026**: Added likes functionality with visual feedback (filled heart for liked posts)
- **January 28, 2026**: Hidden share button from posts, keeping only like and comment buttons
- **January 28, 2026**: Added comments table to database schema for persistent comment storage
- **January 28, 2026**: Implemented secure login authentication with password validation (POST /api/auth/login)
- **January 28, 2026**: Login now redirects to user's specific profile page (/profile/:userId)
- **January 28, 2026**: Platinum members' posts from profile page now go to Core page (community feed)
- **January 28, 2026**: Fixed handlePortfolioImageUpload function restoration
- **January 19, 2026**: Integrated comprehensive profession taxonomy (24 professions) across join, directory, and account settings
- **January 19, 2026**: Integrated comprehensive genre taxonomy (14 genres) across all relevant pages
- **January 19, 2026**: Updated badge mappings in badges.ts for all new profession/genre values
- **January 19, 2026**: Updated sample data in storage.ts to use canonical Title Case values
- **January 19, 2026**: Ensured case-insensitive filtering for directory search
- **December 8, 2025**: Implemented DatabaseStorage class with full Drizzle ORM support for PostgreSQL
- **December 8, 2025**: Updated database driver from neon-serverless to node-postgres for better compatibility
- **December 8, 2025**: Database schema defined but currently using MemStorage due to Neon authentication issues
- **December 8, 2025**: App is fully functional with in-memory storage - ready to switch to database when auth is resolved
- **January 23, 2025**: Completed comprehensive purple color scheme transformation across entire platform
- **January 23, 2025**: Replaced all gray colors (bg-gray-900, text-gray-300, border-gray-700) with purple shades throughout app
- **January 23, 2025**: Updated mobile login button styling with gray background as requested
- **January 23, 2025**: Applied global CSS rules to ensure consistent purple theming across all components
- **January 19, 2025**: Enhanced mobile responsiveness across all pages with optimized layouts for phones
- **January 19, 2025**: Improved directory page with better mobile-friendly search controls and card layouts
- **January 19, 2025**: Updated navigation with mobile login button and responsive header sizing
- **January 19, 2025**: Implemented complete nighttime theme with black backgrounds throughout platform
- **January 19, 2025**: Created new directory page matching wireframe design with mock user data and filters
- **January 19, 2025**: Updated MIC logo to new design with purple microphone and "MIC" text
- **January 19, 2025**: Fixed all button readability issues with proper contrast and font weights
- **January 19, 2025**: Applied consistent purple accent colors (#B084C9) across the platform
- **January 19, 2025**: Added comprehensive landing page with login/signup options
- **January 19, 2025**: Created dedicated login page with form validation
- **January 19, 2025**: Updated routing to use landing page as root path

## Profession & Genre Taxonomy

### Professions (24 total)
Artist, Administration, Audio, Consultant, Dancer, DJ, Educator, Fashion, Glam, Legal, Management, Marketing, Music Executive, Musician, Photographer/Videographer, Producer, Publishing, Radio/Podcast, Record Label, Recording Studio, Songwriter, Synch, Touring, Venue

### Genres (14 total)
Pop, Hip-Hop, R&B, Rock, Country, Electronic, Dance, Reggae, Latin, Afrobeats, Classical, Jazz, Blues, Gospel

### Canonical Format
All profession and genre values use Title Case (e.g., "Producer", "Hip-Hop") as the canonical format. The search/filter functions use case-insensitive matching, and badge lookups handle multiple variants.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React SPA**: Built with React 18 and TypeScript for a modern, type-safe frontend experience
- **Routing**: Uses Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: shadcn/ui components built on Radix UI primitives with Tailwind CSS
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS with custom CSS variables for theming

### Backend Architecture
- **Node.js/Express**: RESTful API server built with Express.js
- **TypeScript**: Full type safety across the entire stack
- **Database ORM**: Drizzle ORM for type-safe database operations (DatabaseStorage class fully implemented)
- **Database**: PostgreSQL (Replit built-in) - schema defined, currently using MemStorage due to auth issues
- **Session Management**: Express sessions with in-memory store (ready for PostgreSQL session store upgrade)

### Database Status
- ✅ DatabaseStorage class fully implemented with all CRUD operations
- ✅ Database schema defined in shared/schema.ts with users, posts, connections, favorites tables
- ✅ Supabase-compatible architecture using standard PostgreSQL + Drizzle ORM
- ℹ️ Currently using MemStorage - full feature parity, non-persistent

### How to Enable Permanent Database Storage

**Option 1: Use Replit Database (Recommended for development)**
1. Go to the Database tab in Replit sidebar
2. Click to provision a new database
3. Run `npm run db:push` to create tables
4. In `server/storage.ts`, change `export const storage = new MemStorage();` to `export const storage = new DatabaseStorage();`
5. Restart the app

**Option 2: Switch to Supabase (Recommended for production)**
1. Create a Supabase project at supabase.com
2. Go to Project Settings > Database > Connection string
3. Copy the "URI" connection string
4. Update the DATABASE_URL secret in Replit Secrets tab
5. Run `npm run db:push` to create tables
6. In `server/storage.ts`, change to `export const storage = new DatabaseStorage();`
7. Restart the app

**Note**: The Drizzle ORM code works identically with Replit PostgreSQL, Supabase, or any PostgreSQL provider. Only DATABASE_URL needs to change.

### Development Setup
- **Monorepo Structure**: Client, server, and shared code in a single repository
- **Hot Reloading**: Vite HMR for frontend, tsx for backend development
- **Build Process**: Separate build processes for client (Vite) and server (esbuild)

## Key Components

### Database Schema (`shared/schema.ts`)
- **Users Table**: Stores user profiles with professional information (name, profession, genre, skills, location, bio)
- **Posts Table**: Social media-style posts with different types (post, opportunity, tip, milestone)
- **Connections Table**: Manages professional connections between users with status tracking
- **Favorites Table**: Allows users to favorite other professionals

### API Routes (`server/routes.ts`)
- **User Management**: CRUD operations for user profiles, search functionality
- **Posts**: Create and retrieve posts with author information
- **Connections**: Manage professional connections between users
- **Favorites**: Add/remove favorite professionals

### Frontend Pages
- **Home Page**: Landing page with community stats and recent activity
- **Directory Page**: Search and browse music industry professionals with filtering
- **Core Page**: Social feed for sharing and viewing posts
- **Join Page**: User registration with profession-specific onboarding

### UI Components
- **Profile Cards**: Display professional information in card format
- **Post Cards**: Social media-style post display with engagement features
- **Navigation**: Responsive header with mobile menu support
- **Modals**: Profile detail views and forms

## Data Flow

1. **User Registration**: New users complete a detailed profile including profession, genre, skills, and availability
2. **Profile Discovery**: Users can search and filter the directory to find relevant professionals
3. **Social Interaction**: Users can post updates, like content, and engage with the community
4. **Professional Networking**: Connection requests and favorites system for building networks
5. **Real-time Updates**: TanStack Query provides automatic data synchronization and caching

## External Dependencies

### Frontend Dependencies
- **UI Framework**: Radix UI primitives for accessible components
- **Form Handling**: React Hook Form with Zod validation
- **Date Utilities**: date-fns for date formatting and manipulation
- **Icons**: Lucide React for consistent iconography
- **Animations**: CSS-based animations with Tailwind

### Backend Dependencies
- **Database**: Neon serverless PostgreSQL
- **Session Store**: connect-pg-simple for PostgreSQL session storage
- **Validation**: Zod schemas shared between client and server
- **Development**: tsx for TypeScript execution, esbuild for production builds

### Development Tools
- **Type Checking**: TypeScript with strict mode enabled
- **Code Formatting**: Tailwind CSS IntelliSense and PostCSS
- **Build Tools**: Vite with React plugin, esbuild for server bundling

## Deployment Strategy

### Production Build
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Database**: Drizzle migrations applied via `db:push` command

### Environment Configuration
- **Database URL**: Required environment variable for PostgreSQL connection
- **Session Management**: PostgreSQL-backed sessions for scalability
- **Static Serving**: Express serves built frontend assets in production

### Development Workflow
- **Local Development**: Concurrent frontend (Vite) and backend (tsx) servers
- **Hot Reloading**: Full-stack hot reloading with error overlay
- **Type Safety**: Shared TypeScript types between client and server

The application follows a modern full-stack architecture with emphasis on type safety, developer experience, and professional networking features specifically tailored for the music industry.