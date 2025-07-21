# replit.md

## Overview

This is a TV Remote Control web application that provides both phone-based IR blasting and Bluetooth connectivity to external IR blaster devices. The application features a responsive mobile-first design with a clean interface for controlling TVs from various brands.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state and built-in React hooks for local state
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **UI Components**: Radix UI primitives for accessibility and functionality

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API endpoints for TV brands and user settings
- **Data Layer**: In-memory storage with interface for future database integration
- **Development**: Hot reloading with Vite integration in development mode

### Data Storage Solutions
- **Current**: MemStorage class providing in-memory data persistence
- **Database Ready**: Drizzle ORM configured for PostgreSQL with schema definitions
- **IR Codes**: JSON file containing TV brand IR command mappings
- **Migration Strategy**: Drizzle Kit for database schema management

## Key Components

### Core Features
1. **TV Brand Selection**: Dropdown to choose from supported TV manufacturers
2. **Connection Methods**: Support for both phone IR and Bluetooth IR blasters
3. **Remote Controls**: Full TV remote functionality including power, volume, channels, navigation
4. **Settings Management**: User preferences and device configuration
5. **Help System**: Built-in guidance for setup and usage

### Technical Components
- **Bluetooth Service**: Web Bluetooth API integration for external IR devices
- **IR Code Management**: Centralized system for TV brand command mapping
- **Responsive Design**: Mobile-first approach with touch-friendly controls
- **Error Handling**: Comprehensive error states with user feedback
- **Real-time Feedback**: Visual and haptic feedback for button presses

## Data Flow

1. **Initialization**: App loads TV brands and user settings from API
2. **Brand Selection**: User chooses TV brand, triggering IR code lookup
3. **Connection Setup**: User configures Bluetooth or phone IR transmission
4. **Command Execution**: Button presses trigger IR command transmission
5. **State Persistence**: User preferences saved to backend storage
6. **Feedback Loop**: Visual indicators show connection status and command success

## External Dependencies

### Frontend Dependencies
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Accessible UI component primitives
- **wouter**: Lightweight routing solution
- **class-variance-authority**: Component variant management
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library

### Backend Dependencies
- **express**: Web application framework
- **drizzle-orm**: Type-safe SQL ORM
- **drizzle-zod**: Schema validation integration
- **@neondatabase/serverless**: PostgreSQL database driver
- **zod**: Runtime type validation

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking and compilation
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite compiles React app to static assets in `dist/public`
2. **Backend Build**: esbuild bundles server code to `dist/index.js`
3. **Asset Management**: Static files served from build output directory
4. **Environment Configuration**: DATABASE_URL required for production

### Production Setup
- **Server**: Express serves both API routes and static frontend
- **Database**: PostgreSQL with Drizzle ORM migrations
- **Environment**: NODE_ENV=production enables optimizations
- **Deployment**: Single bundle deployment with combined frontend/backend

### Development Workflow
- **Hot Reloading**: Vite middleware provides instant updates
- **Type Checking**: TypeScript compilation for both client and server
- **Database**: Drizzle Kit handles schema changes and migrations
- **Debugging**: Runtime error overlay and source maps enabled

### Key Architectural Decisions

1. **Monorepo Structure**: Single repository with client/server/shared directories for code reuse
2. **Memory-First Storage**: Implements storage interface allowing easy database migration
3. **Mobile-First Design**: Optimized for touch devices with responsive breakpoints
4. **Progressive Enhancement**: Core functionality works without Bluetooth, enhanced with external devices
5. **Type Safety**: End-to-end TypeScript with shared schemas between client and server