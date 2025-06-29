# Arquitetura do Sistema

## Visão Geral

Este documento descreve a arquitetura completa do portfolio pessoal, uma **Single Page Application (SPA)** construída com React 18 e TypeScript, hospedada na Vercel com serverless functions para integração OAuth.

## Stack Tecnológica

### Frontend
- **React 18.2** - Library para construção da interface
- **TypeScript 4.9** - Superset tipado do JavaScript
- **Vite 4.5** - Build tool e dev server com HMR
- **Tailwind CSS 3.3** - Framework CSS utility-first
- **Framer Motion 10.16** - Biblioteca de animações
- **React Router DOM** - Roteamento client-side

### Backend/Infrastructure  
- **Vercel** - Hosting e serverless functions
- **Node.js** - Runtime para API endpoints
- **Edge Functions** - Processamento próximo ao usuário

### Integrations
- **LinkedIn OAuth 2.0** - Autenticação de usuários
- **Mixpanel** - Analytics e user behavior tracking
- **GitHub Actions** - CI/CD pipeline

## Arquitetura de Alto Nível

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Browser  │    │  Vercel Edge    │    │ External APIs   │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ React SPA   │ │◄──►│ │Static Assets│ │    │ │ LinkedIn    │ │
│ │             │ │    │ │             │ │    │ │ API         │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Mixpanel    │ │◄──►│ │ Serverless  │ │◄──►│ │ Mixpanel    │ │
│ │ SDK         │ │    │ │ Functions   │ │    │ │ API         │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Estrutura de Diretórios

```
src/
├── components/          # Componentes React organizados por feature
│   ├── Hero/           # Seção principal do portfolio
│   ├── Expertise/      # Skills e tecnologias
│   ├── Cases/          # Portfolio de projetos
│   ├── Blog/           # Sistema de artigos
│   ├── Contact/        # Formulário e links de contato
│   └── ui/             # Componentes reutilizáveis (Magic UI)
├── contexts/           # React Contexts para estado global
│   ├── AuthContext.tsx # Gerenciamento de autenticação
│   ├── MixpanelContext.tsx # Analytics e tracking
│   └── ThemeContext.tsx # Tema escuro/claro
├── hooks/              # Custom React hooks
│   ├── useAuth.ts      # Hook de autenticação
│   ├── useAuthError.ts # Tratamento de erros auth
│   ├── useArticleAnalytics.ts # Analytics de artigos
│   └── useRouteTracking.ts # Tracking de navegação
├── utils/              # Utilitários e helpers
│   ├── AuthErrorHandler.ts # Sistema de tratamento de erros
│   ├── AuthRetryManager.ts # Gerenciamento de retries
│   ├── storage.ts      # Abstração de localStorage
│   └── mixpanelConfig.ts # Configuração analytics
├── lib/                # Bibliotecas e dados
│   ├── articles.ts     # Dados dos artigos do blog
│   └── utils.ts        # Utilitários gerais
└── types/              # Definições TypeScript
    ├── auth.ts         # Types de autenticação
    ├── analytics.ts    # Types de analytics
    └── blog.ts         # Types do sistema de blog

api/                    # Serverless functions (Vercel)
├── auth/
│   └── linkedin/
│       ├── token.js    # Token exchange OAuth
│       └── profile.js  # Fetch user profile
└── middleware/         # Middleware para APIs

public/
├── content/
│   └── blog/           # Artigos em markdown
│       └── [slug]/
│           ├── index.md
│           └── images/
└── assets/             # Assets estáticos

docs/                   # Documentação técnica
├── adr/                # Architecture Decision Records
├── diagramas/          # Diagramas C4 e sequence
└── *.md                # Documentação geral
```

## Fluxo de Dados

### 1. State Management
```typescript
// Contexts principais para estado global
AuthContext    → Gerencia usuário logado e fluxo OAuth
MixpanelContext → Centraliza tracking de events
ThemeContext   → Controla tema escuro/claro

// Local state com hooks personalizados
useAuthError   → Estado de erros de autenticação
useArticleAnalytics → Tracking de leitura de artigos
useRouteTracking → Analytics de navegação
```

### 2. Authentication Flow
```typescript
1. User clica "Conectar LinkedIn"
2. AuthContext detecta device (mobile/desktop)
3. Estratégia adaptativa: popup (desktop) ou redirect (mobile)
4. OAuth flow com LinkedIn API
5. Callback processa code → access_token → user_profile
6. Dados sanitizados e salvos no localStorage
7. Context atualizado e UI re-renderizada
```

### 3. Analytics Pipeline
```typescript
1. User interage com página
2. Custom hooks capturam events
3. MixpanelContext processa e envia para API
4. Environment separation (dev/prod projects)
5. Real-time dashboards no Mixpanel
```

## Padrões Arquiteturais

### 1. Context + Hooks Pattern
```typescript
// Centralização de estado com contextos
const AuthContext = createContext<AuthContextType>()

// Hooks personalizados para lógica específica
const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
```

### 2. Error Boundary Pattern
```typescript
// Tratamento de erros com classification system
enum AuthErrorType {
  POPUP_BLOCKED = 'popup_blocked',
  NETWORK_ERROR = 'network_error',
  // ... outros tipos
}

// Error handlers especializados por tipo
class AuthErrorHandler {
  static handleError(error: any): AuthError
  static logError(error: AuthError): void
}
```

### 3. Defensive Programming
```typescript
// Validação e sanitização de dados
const validateUserData = (userData: any): LinkedInUser | null => {
  // Validação robusta com fallbacks seguros
}

// Storage abstraction para compatibilidade
class StorageManager {
  // Fallback para quando localStorage não está disponível
}
```

### 4. Progressive Enhancement
```typescript
// Analytics funcionam mesmo se Mixpanel falhar
const track = (event: string, properties?: any) => {
  try {
    if (mixpanel) mixpanel.track(event, properties)
  } catch (error) {
    console.warn('Analytics not available:', error)
  }
}
```

## Segurança

### 1. OAuth Security
- **CSRF Protection**: State parameter validation
- **Origin Validation**: postMessage origins verificadas
- **Token Handling**: Access tokens não expostos no client
- **HTTPS Only**: Todas as comunicações criptografadas

### 2. Data Sanitization
```typescript
// Sanitização de dados de usuário
const sanitizeString = (value: any): string | undefined => {
  return value
    ?.trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .substring(0, 500)
}
```

### 3. Content Security Policy
```html
<!-- Meta tags de segurança -->
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';">
```

## Performance

### 1. Build Optimization
- **Code Splitting**: Componentes carregados sob demanda
- **Tree Shaking**: Remoção de código não utilizado
- **Asset Optimization**: Imagens otimizadas e compressão
- **Bundle Analysis**: Monitoramento do tamanho dos bundles

### 2. Runtime Performance
- **React Optimization**: useMemo, useCallback para expensive operations
- **Lazy Loading**: Componentes e routes carregados conforme necessário
- **Virtualization**: Para listas longas (se necessário)
- **Caching**: Aggressive caching de assets estáticos

### 3. Network Optimization
- **CDN**: Assets servidos via Vercel Edge Network
- **HTTP/2**: Multiplexing de requests
- **Preloading**: Critical resources preloaded
- **Compression**: Gzip/Brotli compression automática

## Observabilidade

### 1. Analytics
- **User Behavior**: Scroll depth, time on page, click tracking
- **Performance**: Core Web Vitals monitoring
- **Errors**: Error tracking com context
- **Conversion**: Funnel analysis para objectives

### 2. Logging
```typescript
// Structured logging por environment
if (process.env.NODE_ENV === 'development') {
  console.group('🚨 Authentication Error')
  console.error('Type:', error.type)
  console.error('Context:', error.context)
  console.groupEnd()
}
```

### 3. Monitoring
- **Uptime**: Vercel automatic monitoring
- **Performance**: Real User Monitoring (RUM)
- **Errors**: Automatic error boundary reporting
- **Analytics**: Mixpanel real-time dashboards

## Deployment

### 1. CI/CD Pipeline
```yaml
# GitHub Actions workflow
1. Code push to main branch
2. Run tests (unit + E2E)
3. Build production bundle
4. Deploy to Vercel
5. Run smoke tests
6. Update deployment status
```

### 2. Environment Strategy
```typescript
// Multi-environment configuration
development: {
  mixpanel_token: DEV_TOKEN,
  debug: true,
  api_base: 'http://localhost:3000'
}

production: {
  mixpanel_token: PROD_TOKEN,
  debug: false,
  api_base: 'https://tiagonpsilva.vercel.app'
}
```

### 3. Feature Flags
```typescript
// Environment-based feature control
const features = {
  authModal: import.meta.env.VITE_ENABLE_AUTH_MODAL === 'true',
  analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  experiments: import.meta.env.MODE === 'development'
}
```

## Escalabilidade

### 1. Horizontal Scaling
- **Serverless Functions**: Auto-scaling baseado em demand
- **CDN**: Global distribution automática
- **Database**: Stateless design, sem database próprio

### 2. Vertical Scaling
- **Bundle Optimization**: Code splitting agressivo
- **Caching**: Multi-layer caching strategy
- **Asset Optimization**: WebP, lazy loading, compression

### 3. Future Considerations
- **Database**: Adicionar Postgres/Supabase se necessário
- **Cache Layer**: Redis para session management
- **API Gateway**: Rate limiting e throttling
- **Microservices**: Separação de concerns se crescer

## Manutenibilidade

### 1. Code Organization
- **Feature-based**: Componentes organizados por funcionalidade
- **Separation of Concerns**: Clear separation entre UI, business logic, data
- **TypeScript**: Type safety em todo o codebase

### 2. Testing Strategy
- **Unit Tests**: Jest + React Testing Library
- **E2E Tests**: Cypress com cross-browser testing
- **Integration Tests**: API endpoints e OAuth flows

### 3. Documentation
- **ADRs**: Architecture Decision Records para decisões importantes
- **API Docs**: Documentação de endpoints
- **Component Docs**: Storybook para componentes (futuro)

---

Para detalhes específicos sobre decisões arquiteturais, consulte os [Architecture Decision Records](adr/) na pasta `docs/adr/`.

Para diagramas visuais da arquitetura, veja os [diagramas C4](diagramas/) na pasta `docs/diagramas/`.