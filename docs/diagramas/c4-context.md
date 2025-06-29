# Diagrama de Contexto - C4 Model

## Portfolio Pessoal - Sistema Level Context

```mermaid
C4Context
    title Sistema Portfolio Pessoal - Contexto

    Person(visitor, "Visitante", "Pessoa interessada em conhecer o trabalho profissional")
    Person(recruiter, "Recrutador", "Profissional de RH buscando candidatos qualificados")
    Person(colleague, "Colega", "Desenvolvedor ou profissional da área tech")
    
    System(portfolio, "Portfolio Website", "Single Page Application apresentando experiência profissional, projetos e artigos técnicos")
    
    System_Ext(linkedin, "LinkedIn API", "Plataforma profissional para autenticação OAuth e dados de perfil")
    System_Ext(mixpanel, "Mixpanel", "Plataforma de analytics para tracking de comportamento e engagement")
    System_Ext(vercel, "Vercel", "Plataforma de hosting e deployment com edge functions")
    System_Ext(github, "GitHub", "Repositório de código e GitHub Actions para CI/CD")
    
    Rel(visitor, portfolio, "Visita", "HTTPS")
    Rel(recruiter, portfolio, "Analisa perfil", "HTTPS")
    Rel(colleague, portfolio, "Lê artigos técnicos", "HTTPS")
    
    Rel(portfolio, linkedin, "Autentica usuários", "OAuth 2.0 / HTTPS")
    Rel(portfolio, mixpanel, "Envia eventos analytics", "HTTPS API")
    Rel(portfolio, vercel, "Hospedado em", "Edge Network")
    Rel(portfolio, github, "Deploy automático", "GitHub Actions")
    
    UpdateLayoutConfig($c4ShapeInRow="2", $c4BoundaryInRow="1")
```

## Sistema Portfolio - Container Level

```mermaid
C4Container
    title Portfolio Pessoal - Container Diagram

    Person(user, "Usuário", "Visitante do portfolio")

    Container_Boundary(c1, "Portfolio Website") {
        Container(spa, "React SPA", "TypeScript, React 18, Vite", "Interface principal do portfolio com navegação entre seções")
        Container(api, "Serverless API", "Node.js, Vercel Functions", "Endpoints para autenticação OAuth e integração LinkedIn")
    }
    
    Container_Boundary(c2, "Static Assets") {
        ContainerDb(content, "Blog Content", "Markdown Files", "Artigos técnicos e imagens do blog")
        ContainerDb(media, "Media Assets", "Images, Icons", "Recursos visuais do portfolio")
    }

    System_Ext(linkedin, "LinkedIn API", "OAuth provider e dados de perfil")
    System_Ext(mixpanel, "Mixpanel", "Analytics e user behavior tracking")
    System_Ext(cdn, "Vercel Edge Network", "CDN global para delivery de assets")

    Rel(user, spa, "Interage com", "HTTPS")
    Rel(spa, api, "Faz requests", "HTTPS/JSON")
    Rel(spa, content, "Carrega artigos", "HTTP/Markdown")
    Rel(spa, media, "Carrega imagens", "HTTP")
    
    Rel(api, linkedin, "OAuth flow", "HTTPS/OAuth 2.0")
    Rel(spa, mixpanel, "Track events", "HTTPS/JSON")
    
    Rel(cdn, spa, "Serve SPA", "HTTPS")
    Rel(cdn, content, "Serve content", "HTTPS")
    Rel(cdn, media, "Serve media", "HTTPS")

    UpdateLayoutConfig($c4ShapeInRow="2", $c4BoundaryInRow="1")
```

## React SPA - Component Level

```mermaid
C4Component
    title React SPA - Component Diagram

    Person(user, "Usuário")

    Container_Boundary(c1, "React Single Page Application") {
        Component(router, "React Router", "React Router DOM", "Gerencia navegação entre páginas")
        Component(auth, "Authentication System", "AuthContext + hooks", "Gerencia estado de autenticação LinkedIn")
        Component(analytics, "Analytics System", "MixpanelContext + hooks", "Tracking de eventos e user behavior")
        
        Component(hero, "Hero Section", "React Component", "Apresentação principal e CTA")
        Component(expertise, "Expertise Section", "React Component", "Skills técnicas e tecnologias")
        Component(cases, "Cases Section", "React Component", "Portfolio de projetos")
        Component(blog, "Blog System", "React Components", "Sistema de artigos e markdown")
        Component(contact, "Contact Section", "React Component", "Formulário e links de contato")
        
        Component(ui, "UI Components", "Magic UI + Tailwind", "Componentes reutilizáveis com animações")
        Component(hooks, "Custom Hooks", "React Hooks", "Lógica compartilhada e state management")
    }

    Container_Ext(api, "Serverless API", "Vercel Functions")
    Container_Ext(mixpanel, "Mixpanel", "Analytics Platform")

    Rel(user, router, "Navega", "Click/URL")
    Rel(router, hero, "Renderiza", "Route /")
    Rel(router, blog, "Renderiza", "Route /blog")
    
    Rel(hero, auth, "Usa", "useAuth hook")
    Rel(blog, analytics, "Usa", "useArticleAnalytics")
    Rel(contact, analytics, "Usa", "useMixpanel")
    
    Rel(auth, api, "OAuth requests", "HTTPS")
    Rel(analytics, mixpanel, "Track events", "HTTPS")
    
    Rel(hero, ui, "Usa componentes", "Import")
    Rel(expertise, ui, "Usa componentes", "Import")
    Rel(cases, ui, "Usa componentes", "Import")
    
    Rel(auth, hooks, "Usa", "useAuthError, useStorage")
    Rel(blog, hooks, "Usa", "useRouteTracking")

    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

## Deployment Architecture

```mermaid
C4Deployment
    title Portfolio - Deployment Diagram

    Deployment_Node(browser, "User Browser", "Chrome, Firefox, Safari, Edge") {
        Container(spa_browser, "React SPA", "TypeScript, bundled with Vite")
    }

    Deployment_Node(vercel_edge, "Vercel Edge Network", "Global CDN") {
        Deployment_Node(edge_location, "Edge Location", "Distributed globally") {
            Container(static_assets, "Static Assets", "HTML, CSS, JS, Images")
            Container(spa_cache, "SPA Cache", "Cached React build")
        }
    }

    Deployment_Node(vercel_serverless, "Vercel Serverless", "AWS Lambda behind scenes") {
        Deployment_Node(lambda_us_east, "US East Functions", "Primary region") {
            Container(auth_token, "/api/auth/linkedin/token", "Token exchange endpoint")
            Container(auth_profile, "/api/auth/linkedin/profile", "Profile fetch endpoint")
        }
    }

    Deployment_Node(github_infra, "GitHub Infrastructure", "Source control & CI/CD") {
        Container(repo, "Source Repository", "Git repository with code")
        Container(actions, "GitHub Actions", "CI/CD pipeline")
    }

    System_Ext(linkedin_api, "LinkedIn API", "oauth.linkedin.com")
    System_Ext(mixpanel_api, "Mixpanel API", "api.mixpanel.com")

    Rel(spa_browser, spa_cache, "Loads app", "HTTPS")
    Rel(spa_browser, static_assets, "Loads assets", "HTTPS")
    Rel(spa_browser, auth_token, "OAuth requests", "HTTPS/JSON")
    Rel(spa_browser, auth_profile, "Profile requests", "HTTPS/JSON")
    Rel(spa_browser, mixpanel_api, "Analytics events", "HTTPS/JSON")

    Rel(auth_token, linkedin_api, "Token exchange", "HTTPS/OAuth")
    Rel(auth_profile, linkedin_api, "Profile fetch", "HTTPS/Bearer")

    Rel(actions, vercel_edge, "Deploys to", "Vercel API")
    Rel(repo, actions, "Triggers", "Git push")

    UpdateLayoutConfig($c4ShapeInRow="2", $c4BoundaryInRow="1")
```

## Observações

### Decisões de Design C4

1. **Sistema Level**: Foco nas interações entre usuários e sistemas externos
2. **Container Level**: Separação clara entre SPA, API e assets estáticos  
3. **Component Level**: Arquitetura React com contextos e hooks personalizados
4. **Deployment Level**: Estratégia edge-first com serverless functions

### Ferramentas Utilizadas

- **Mermaid C4**: Para diagramas integrados ao documentation
- **GitHub rendering**: Suporte nativo para visualização
- **Versionamento**: Diagramas como código junto ao projeto

### Manutenção

- **Atualização**: Revisar diagramas a cada mudança arquitetural significativa
- **Validação**: Confirmar que código está alinhado com diagramas
- **Evolução**: Adicionar novos diagramas conforme sistema cresce