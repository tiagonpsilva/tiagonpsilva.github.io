# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
npm run dev          # Start development server with HMR on http://localhost:5173
npm run build        # Type-check and build for production
npm run preview      # Preview production build locally
npm run type-check   # Run TypeScript compiler without emitting files
```

### Deployment
```bash
npm run deploy       # Build and deploy to GitHub Pages manually
```

Note: The project also has automatic deployment via GitHub Actions on push to main branch.

## Architecture

### Tech Stack
- **React 18.2** with TypeScript for type-safe component development
- **Vite 4.5** for fast builds and HMR
- **Tailwind CSS 3.3** with extensive customizations for styling
- **Framer Motion 10.16** for animations
- **Magic UI components** in `/src/components/ui/` for special effects

### Project Structure
- `/src/components/` - Feature-based component organization (Hero, Expertise, Cases, etc.)
- `/src/components/ui/` - Reusable Magic UI components with glassmorphism and animation effects
- `/src/lib/` - Utility functions including `cn()` for className merging
- `/src/types/` - TypeScript type definitions
- Path aliases configured: `@/` maps to `/src/`

### Key Patterns
1. **Component Architecture**: Each section is a self-contained component with its own data and styling
2. **Type Safety**: Strict TypeScript configuration with comprehensive type definitions
3. **Styling**: Utility-first CSS with Tailwind, custom CSS variables for theming, and predefined animations
4. **State Management**: Local component state with React hooks, no global state management needed
5. **Deployment**: GitHub Pages deployment with both manual (`gh-pages`) and automated (GitHub Actions) options

### Custom Tailwind Configuration
The project includes extensive Tailwind customizations:
- Custom color scheme using CSS variables (e.g., `--accent`, `--muted`)
- Custom animations: fade-in, slide-in-variants, gradient, meteor-effect
- Typography plugin for prose content
- Glassmorphism effects with backdrop filters

### Performance Considerations
- Vite's optimized build process with code splitting
- Lazy loading potential for heavy components
- Tailwind's purge configuration for minimal CSS bundle
- TypeScript's `noEmit` option for faster type checking during development

## Known Issues & Solutions

### CSS Import Order
- **Issue**: Vite warns about `@import` statements that must precede Tailwind directives
- **Solution**: Place font imports (`@import url(...)`) before `@tailwind` directives in `src/index.css`

### Local Development Setup
1. Run `npm install` to ensure all dependencies are installed
2. Use `npm run dev` to start the development server on http://localhost:5173
3. The server runs continuously - the timeout in terminal is expected behavior
4. If port 5173 is busy, Vite will automatically try the next available port