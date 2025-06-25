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
- `/src/pages/` - Page components including BlogPage and ArticlePage
- `/src/lib/` - Utility functions including `cn()` for className merging and articles data
- `/src/types/` - TypeScript type definitions
- `/public/content/blog/` - Static blog images and assets
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

## Blog System

### Overview
The blog section ("Bantu Digital") uses React Router for client-side routing and ReactMarkdown for content rendering. It features a landing page with branding and individual article pages.

### Blog Structure
- **Main Blog Page**: `/blog` - Displays Bantu Digital branding with topic cards and article list
- **Individual Articles**: `/blog/:slug` - Shows full article content with markdown rendering
- **Static Content**: Articles are stored in `/src/lib/articles.ts` with complete content and metadata

### Blog Routes
- `/blog` - BlogPage component with hero section and article cards
- `/blog/:slug` - ArticlePage component for individual article display

### Content Management
- **Articles Data**: Each article is stored as a separate markdown file with frontmatter
- **Article Files**: Located at `/public/content/blog/:article-slug/index.md`
- **Images**: Placed in `/public/content/blog/:article-slug/` directory
- **Image Display**: Articles images use 90% width and are centered
- **Markdown Rendering**: Uses ReactMarkdown with custom image components
- **Dynamic Loading**: Articles are fetched from markdown files at runtime using fetch API

### Article Structure
Each article markdown file requires frontmatter with:
- `id`: Unique identifier
- `title`: Article title
- `excerpt`: Brief description for article cards
- `publishedAt`: Publication date (YYYY-MM-DD format)
- `tags`: Array of topic tags (format: [tag1, tag2, tag3])
- `linkedinUrl`: Optional LinkedIn post URL
- `readTime`: Estimated reading time in minutes

### Adding New Articles
1. Create directory at `/public/content/blog/:article-slug/`
2. Create `index.md` file with proper frontmatter and markdown content
3. Add the article slug to `articleSlugs` array in `/src/lib/articles.ts`
4. Add cover image as `capa.png` and content images as `01.png`, `02.png`, etc.
5. Reference images in markdown as `/content/blog/:article-slug/01.png`

### Image Guidelines
- Images should be placed in `/public/content/blog/:article-slug/` directories
- **Standard naming convention**: `capa.png` for cover image, `01.png`, `02.png`, `03.png`, etc. for content images
- Reference images in markdown using full public path: `/content/blog/:article-slug/01.png`
- Cover images are displayed full-width at the top of article pages
- Content images are automatically styled at 90% width and centered
- Supported formats: PNG, JPG, WebP with rounded borders and shadows