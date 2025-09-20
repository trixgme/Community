# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Facebook-style community platform built with Next.js 15, TypeScript, Tailwind CSS v4, and React 19. The application features a social media interface with posts, comments, likes, and user interactions.

## Development Commands

### Core Commands
- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build the application for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint to check code quality

### Notes
- The project uses Next.js 15 with the App Router
- TypeScript is configured with strict mode
- ESLint is set up with Next.js and TypeScript configurations

## Architecture & Structure

### Application Architecture
- **Framework**: Next.js 15 with App Router (`app/` directory)
- **Styling**: Tailwind CSS v4 with PostCSS
- **Type System**: TypeScript with strict configuration
- **Icons**: Lucide React for consistent iconography
- **Fonts**: Google Fonts (Geist Sans & Geist Mono)

### Component Organization
```
app/
├── components/           # Shared UI components
│   ├── Header.tsx       # Navigation bar with search and icons
│   ├── Footer.tsx       # Site footer
│   ├── Feed.tsx         # Main feed container with mock data
│   ├── FeedPost.tsx     # Individual post component
│   └── PostComposer.tsx # Post creation interface
├── globals.css          # Global styles and Tailwind directives
├── layout.tsx           # Root layout with fonts and metadata
└── page.tsx             # Home page composition
```

### Data Structure
The application currently uses mock data with Korean content. Posts include:
- Author information (name, avatar)
- Timestamps and content
- Engagement metrics (likes, comments, shares)
- Optional images with Unsplash URLs

### UI Patterns
- **Layout**: Sticky header, centered content (max-w-2xl), responsive design
- **Colors**: Blue primary theme (#blue-600), gray backgrounds and borders
- **Interactions**: Hover states with gray-100 backgrounds and smooth transitions
- **Icons**: Lucide React icons (Search, Home, Users, Bell, MessageCircle)

## Development Guidelines

### Component Patterns
- All components use TypeScript with proper typing
- Components are functional with modern React patterns
- Responsive design with Tailwind's mobile-first approach
- Consistent spacing and color schemes throughout

### Styling Approach
- Tailwind CSS v4 with utility-first methodology
- Custom CSS variables for fonts (--font-geist-sans, --font-geist-mono)
- Focus states and accessibility considerations built-in
- Consistent hover and transition effects

### File Conventions
- TypeScript files use `.tsx` extension for components
- Components are default exports with descriptive names
- Mock data is inline within components (suitable for prototyping)
- Image assets use Unsplash with specific dimensions and crop parameters