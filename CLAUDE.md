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
npm run deploy       # Build and deploy manually (deprecated - use Vercel)
```

Note: The project uses **Vercel** for automatic deployment on push to main branch.

#### Scripts de Automação
```bash
# Scripts disponíveis em /scripts/
chmod +x scripts/deploy_mixpanel.sh && scripts/deploy_mixpanel.sh  # Deploy completo do Mixpanel
chmod +x scripts/create_issues.sh && scripts/create_issues.sh      # Criar GitHub issues
```

#### Deployment Verification Protocol
**IMPORTANT**: After every push to main, ALWAYS verify deployment status:

1. **Check Vercel Build Status**:
   - Visit Vercel Dashboard or use Vercel CLI
   - Verify build completed successfully
   - Check for any build errors or warnings
   - Confirm deployment is live

2. **Test Production Site**:
   ```bash
   # Check if new bundle is deployed
   curl -s https://tiagopinto.io/ | grep -o "index-[a-f0-9]*\.js"
   
   # Verify site is accessible
   curl -s -I https://tiagopinto.io/ | head -5
   ```

3. **Bundle Verification**:
   - New commits should generate new bundle hash
   - Compare with previous bundle to confirm updates
   - If bundle hash unchanged, deployment may have failed

4. **Rollback Process**:
   - If deployment fails, immediately check Vercel logs
   - Fix issues and redeploy, or rollback via Vercel dashboard
   - Never leave broken deployments in production

**Deploy Checklist**:
- [ ] Local build passes: `npm run build`
- [ ] Push to main completed
- [ ] Vercel build status: ✅ Success
- [ ] New bundle hash generated
- [ ] Production site accessible
- [ ] Key functionality tested

## Architecture

### Tech Stack
- **React 18.2** with TypeScript for type-safe component development
- **Vite 4.5** for fast builds and HMR
- **Tailwind CSS 3.3** with extensive customizations for styling
- **Framer Motion 10.16** for animations
- **Magic UI components** in `/src/components/ui/` for special effects
- **Mixpanel** for analytics and user behavior tracking with environment separation

### Project Structure
- `/src/components/` - Feature-based component organization (Hero, Expertise, Cases, etc.)
- `/src/components/ui/` - Reusable Magic UI components with glassmorphism and animation effects
- `/src/pages/` - Page components including BlogPage and ArticlePage
- `/src/contexts/` - React contexts including ThemeContext and MixpanelContext
- `/src/hooks/` - Custom React hooks including useRouteTracking for analytics
- `/src/utils/` - Utility functions including mixpanelConfig for environment separation
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

## Analytics System

### Overview
Comprehensive Mixpanel integration with environment separation for tracking user behavior, page views, and interactions across the entire site.

### Environment Configuration
The analytics system supports three configuration strategies:

#### Strategy 1: Separate Tokens (Recommended)
```bash
# .env.local
VITE_MIXPANEL_TOKEN_DEV=dev_project_token
VITE_MIXPANEL_TOKEN_PROD=prod_project_token
```

#### Strategy 2: Single Token with Flag
```bash
# .env.local
VITE_MIXPANEL_TOKEN=single_project_token
VITE_ANALYTICS_ENABLED=true  # false for dev, true for prod
```

#### Strategy 3: Auto-detection
```bash
# .env.local
VITE_MIXPANEL_TOKEN=auto_token
# Automatic detection based on hostname and Vite mode
```

### Features Tracked
- **Automatic Page Views**: All route changes with referrer data
- **Navigation Tracking**: Header links, mobile navigation, theme toggles
- **Project Interactions**: External GitHub links, project card clicks
- **Contact Tracking**: Email links, social media, WhatsApp, contact forms
- **External Links**: All outbound links with destination tracking

### Implementation Details
- **Context Pattern**: Centralized MixpanelContext for state management
- **Custom Hooks**: `useMixpanel`, `usePageTracking`, `useInteractionTracking`
- **Environment Properties**: Automatic environment tagging for all events
- **Type Safety**: Full TypeScript integration with proper interfaces
- **Privacy Controls**: Configurable property blacklisting per environment

### Development vs Production
- **Development**: Analytics **ENABLED** with detailed console logging and debug mode
- **Production**: Analytics enabled with minimal logging and localStorage persistence
- **Debug Mode**: Comprehensive event logging in development environment
- **Data Separation**: Complete separation between dev and prod data streams when using separate tokens
- **Environment Tagging**: All events automatically tagged with `environment: "development"` or `"production"`

### Setup Instructions
1. See `/MIXPANEL_SETUP.md` for detailed configuration guide
2. Copy `.env.example` to `.env.local` and configure tokens
3. Choose your preferred environment separation strategy
4. Test with `npm run dev` (should show **ENABLED** analytics with development environment)
5. Verify production build with `npm run build && npm run preview`

### Dashboard Creation System
- **Automated Dashboard Creation**: `/scripts/create-mixpanel-dashboards.js` for creating 3 specialized dashboards
- **Dashboard Types**: Blog Analytics Overview, User Journey & Acquisition, Content Performance
- **API Integration**: Direct Mixpanel Dashboard API with widget management
- **Configuration**: Uses same environment variables as analytics tracking
- **Output**: Creates dashboards in Mixpanel + saves creation report to `/reports/`

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

## SEO Strategy

### Overview
Comprehensive SEO implementation across the entire site to maximize organic visibility and search engine rankings. The strategy covers technical SEO, content optimization, and performance enhancements.

### SEO Implementation Guidelines

#### Meta Tags Structure
Each page requires optimized meta tags:
- **Title**: 50-60 characters, keyword-focused
- **Description**: 150-160 characters, compelling and descriptive
- **Keywords**: Relevant terms for the page content
- **Open Graph**: For social media sharing
- **Twitter Cards**: For Twitter sharing optimization

#### Schema Markup Requirements
Implement JSON-LD structured data:
- **Homepage**: Person + Organization schema
- **Blog**: Blog + BlogPosting schema for articles
- **Cases**: CreativeWork schema for portfolio projects
- **Articles**: Article schema with author, publish date, and reading time

#### Technical SEO Checklist
- [ ] React Helmet Async for dynamic meta tags
- [ ] Sitemap.xml generation (dynamic based on content)
- [ ] Robots.txt optimization
- [ ] Canonical URLs for all pages
- [ ] Core Web Vitals optimization (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- [ ] Image optimization (WebP, lazy loading, proper alt texts)
- [ ] Internal linking strategy implementation

#### Content Optimization
- **Heading Structure**: Proper H1→H2→H3 hierarchy
- **Alt Texts**: Descriptive alt attributes for all images
- **Internal Links**: Strategic cross-linking between related content
- **Keyword Density**: Natural keyword distribution throughout content
- **Reading Time**: Calculate and display estimated reading time for articles

#### Performance Requirements
- **Core Web Vitals**: Target >90 Lighthouse score
- **Image Optimization**: WebP format with fallbacks
- **Lazy Loading**: Implement for all images below the fold
- **Bundle Optimization**: Code splitting and tree shaking
- **Caching Strategy**: Leverage browser caching for static assets

#### Analytics and Monitoring
- **Google Analytics 4**: Custom events for user engagement tracking
- **Google Search Console**: Monitor search performance and indexing
- **Core Web Vitals**: Real user metrics monitoring
- **Custom Events**: Track blog engagement, portfolio views, contact form interactions

#### Target Keywords by Section
- **Homepage**: "engenheiro software", "especialista IA", "desenvolvedor full stack"
- **Expertise**: "React", "Python", "IA", "arquitetura software"
- **Cases**: "portfólio projetos", "cases sucesso", "desenvolvimento web"
- **Blog**: "blog IA", "tecnologia diversidade", "Bantu Digital"

#### Link Building Strategy
- **Internal Links**: Hub and spoke model with homepage as central hub
- **Content Clusters**: Group related content around main topics
- **Cross-linking**: Strategic links between blog posts and portfolio sections
- **External Links**: Quality outbound links to authoritative sources

### SEO Roadmap Reference
Detailed implementation timeline and tasks are documented in `/management/SEO_ROADMAP.md`

### Monitoring and Maintenance
- **Weekly**: Core Web Vitals and Search Console checks
- **Monthly**: Keyword rankings and traffic analysis
- **Quarterly**: Content gap analysis and strategy updates

## File Organization Guidelines

### Documentation Structure
**IMPORTANT**: All documentation files must be organized in the `docs/` directory with the following structure:

```
docs/
├── adr/                    # Architecture Decision Records
├── diagramas/              # C4 Model e sequence diagrams
├── setup/                  # Configuration guides  
├── guides/                 # Technical guides
├── troubleshooting/        # Problem resolution guides
├── issues/                 # GitHub issue documentation
└── status/                 # Implementation status files
```

### Scripts Organization
All shell scripts (`.sh`) and automation scripts must be placed in the `scripts/` directory:

```
scripts/
├── *.sh                   # Shell scripts for automation
├── *.js                   # Node.js utility scripts
└── README.md              # Scripts documentation
```

### Root Directory Policy
The root directory should only contain:
- **README.md** - Main project documentation
- **CLAUDE.md** - This file with guidelines for Claude Code
- **Configuration files** (package.json, vite.config.ts, etc.)
- **Source directories** (src/, public/, etc.)

### File Naming Conventions
- **Documentation**: Use descriptive names with context (e.g., `TROUBLESHOOTING_AUTH_ERRORS.md`)
- **Scripts**: Use action-based names (e.g., `deploy_mixpanel.sh`, `create_issues.sh`)
- **ADRs**: Follow pattern `ADR-XXX-descriptive-name.md`

### Moving Files
When organizing files, always:
1. Move documentation to appropriate `docs/` subdirectory
2. Move scripts to `scripts/` directory
3. Update any references in other files
4. Remove duplicate files from root
5. Update README.md links if necessary

### Cleanup Commands
```bash
# Organize all files according to guidelines
chmod +x cleanup_root.sh && ./cleanup_root.sh
```

## Issue Management Protocol

### GitHub Issues Integration
All problems, bugs, and improvements encountered during development must be documented as GitHub Issues to maintain project transparency and facilitate collaboration.

#### Issue Creation Requirements
When encountering any problem or improvement opportunity:

1. **Create GitHub Issue** using the `gh` CLI tool or GitHub web interface
2. **Title Format**: Use prefixes for epic-related issues: `[EPIC-NAME] Issue Title`
   - **Epic Issues**: `[EPIC-NAME] ÉPICO: Description`
   - **Feature Issues**: `[EPIC-NAME] Fase X.Y: Feature Description`
   - **Standalone Issues**: Regular title without prefix
   - **Examples**:
     - `[OBSERVABILITY] ÉPICO: Implementar Observabilidade com OpenTelemetry + DataDog`
     - `[OBSERVABILITY] Fase 1.1: Setup OpenTelemetry Infrastructure Base`
     - `[CYPRESS-OPTIMIZATION] Fase 2: Implementar Execução Condicional Inteligente`
     - `Bug: LinkedIn auth fails on mobile Safari` (standalone)
3. **Epic Prefixes Standards**:
   - `[OBSERVABILITY]` - OpenTelemetry, DataDog, monitoring, alerting
   - `[CYPRESS-OPTIMIZATION]` - E2E testing optimization, CI/CD improvements
   - `[SEO]` - Search engine optimization initiatives
   - `[PERFORMANCE]` - Performance optimization projects
   - `[SECURITY]` - Security enhancements and fixes
   - `[ACCESSIBILITY]` - Accessibility improvements
4. **Labels**: Apply appropriate labels (bug, enhancement, documentation, etc.)
5. **Description Template**:
   ```markdown
   ## Problem Description
   [Detailed description of the issue]
   
   ## Steps to Reproduce
   1. [Step one]
   2. [Step two]
   3. [Result observed]
   
   ## Expected Behavior
   [What should happen instead]
   
   ## Environment
   - OS: [Operating system]
   - Browser: [If applicable]
   - Node.js: [Version]
   - Platform: [Development/Production]
   
   ## Investigation
   [Analysis performed, logs, error messages]
   
   ## Solution Implemented
   [Detailed steps taken to resolve]
   
   ## Verification
   [How the fix was tested and verified]
   
   ## Related Files/Components
   [List of modified files and components]
   ```

#### Issue Lifecycle
1. **Open**: Problem identified and documented
2. **In Progress**: Investigation and resolution in progress
3. **Resolved**: Solution implemented and tested
4. **Closed**: Verified working and documented

#### Implementation Guidelines
- **Always create issues** before starting problem resolution
- **Link commits** to issues using keywords: "fixes #123", "closes #123"
- **Update issues** with progress, findings, and solutions
- **Close issues** only after verification of the fix
- **Cross-reference** related issues when applicable

#### Automation Scripts
For consistent issue management, use the provided automation scripts:

```bash
# Create new issue following the template
./scripts/create-issue.sh "Issue Title" [bug|enhancement|documentation|infrastructure]

# Close issue with detailed resolution
./scripts/close-issue.sh <issue_number>
```

**Script Features:**
- Automated template population following CLAUDE.md protocol
- Environment detection and metadata collection
- Guided resolution documentation
- Consistent formatting and tracking

#### Examples of Issues to Track
- **Bugs**: OAuth failures, build errors, deployment issues
- **Enhancements**: New features, performance improvements
- **Documentation**: Missing guides, unclear instructions
- **Infrastructure**: DNS configuration, deployment problems
- **Dependencies**: Package updates, compatibility issues

This protocol ensures all development work is properly documented, searchable, and maintains a clear audit trail for future reference and collaboration.

### Current Open Issues

Following the identification of problems through Cypress testing, the following GitHub Issues have been created to track and resolve LinkedIn authentication problems:

#### Bugs Críticos (Ação Imediata Necessária)
- **Issue #6**: 🐛 AuthButton quebra quando user.name é undefined ✅ **RESOLVIDO**
  - Componente quebrava com dados incompletos do usuário do localStorage
  - Afetava estabilidade da produção quando usuários tinham dados de auth corrompidos
  
- **Issue #7**: 🔒 Validação do parâmetro OAuth state não está funcionando ✅ **RESOLVIDO**
  - Vulnerabilidade de segurança permitindo potenciais ataques CSRF
  - Usuários ficavam presos na página de callback com estados OAuth inválidos

- **Issue #15**: 🐛 Falha na autenticação LinkedIn com erro TTY ✅ **RESOLVIDO**
  - Erro "Opening /dev/tty failed (6): Device not configured" em ambiente serverless
  - Bloqueava completamente a autenticação de usuários

#### Problemas de Integridade de Dados  
- **Issue #8**: 🗃️ Dados corrompidos do localStorage não são tratados graciosamente
  - App quebra quando localStorage contém dados malformados do usuário
  - Sem validação ou limpeza de dados de autenticação corrompidos

- **Issue #9**: 📱 Restrições do modo privado do iOS Safari com localStorage
  - Autenticação falha completamente na navegação privada do iOS Safari
  - Sem mecanismo de fallback de armazenamento para ambientes restritos

#### Problemas de Experiência do Usuário
- **Issue #10**: 🔒 Overlay do modal de autenticação impede interação com a página
  - Modal às vezes trava, impedindo interação do usuário
  - Gerenciamento ruim de foco e navegação por teclado

- **Issue #11**: 📱 Limitações de popup móvel e problemas de UX
  - Browsers móveis bloqueiam popups causando falhas de auth
  - Experiência ruim do usuário móvel para fluxo de autenticação

- **Issue #12**: ⚡ Conflitos de estado de autenticação durante navegação da página
  - Estado de auth torna-se inconsistente quando usuários navegam durante OAuth
  - Tentativas concorrentes de autenticação causam conflitos

#### Oportunidades de Melhoria
- **Issue #13**: 🔄 Implementar tratamento abrangente de erros de autenticação
  - Melhorar feedback do usuário para vários cenários de falha
  - Adicionar lógica de retry e métodos alternativos de autenticação

These issues directly address the problems some users are experiencing with LinkedIn authentication and provide a clear roadmap for improving the authentication system's robustness and user experience.