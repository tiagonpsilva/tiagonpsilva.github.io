# Guia de Deploy e Configuração

## Visão Geral

Este documento descreve todo o processo de deploy e configuração do portfolio, incluindo setup de ambientes, configuração de serviços externos e procedures de deployment.

## Arquitetura de Deploy

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Developer       │    │ GitHub          │    │ Vercel          │
│                 │    │                 │    │                 │
│ git push main   │───►│ Actions Runner  │───►│ Build & Deploy  │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │ Cypress Tests   │    │ Production Site │
                       │ Cross-browser   │    │ Global CDN      │
                       └─────────────────┘    └─────────────────┘
```

## Pré-requisitos

### 1. Accounts Necessárias
- **GitHub**: Para repositório e CI/CD
- **Vercel**: Para hosting e serverless functions
- **LinkedIn Developer**: Para OAuth app
- **Mixpanel**: Para analytics (plano free)

### 2. Environment Variables
```bash
# LinkedIn OAuth
VITE_LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

# Mixpanel Analytics
VITE_MIXPANEL_TOKEN_DEV=your_dev_project_token
VITE_MIXPANEL_TOKEN_PROD=your_prod_project_token

# Optional: Service Account para Mixpanel API
MIXPANEL_USERNAME=ServiceAccount.xxxxx
MIXPANEL_SECRET=your_service_account_secret

# Environment Control
VITE_ANALYTICS_ENABLED=true
```

## Setup Inicial

### 1. Configuração LinkedIn OAuth

#### Criar LinkedIn App
1. Acesse [LinkedIn Developer Portal](https://developer.linkedin.com/)
2. Crie nova app com as seguintes configurações:
   - **App name**: Portfolio Tiago Pinto
   - **Company**: Sua empresa ou pessoal
   - **Privacy policy URL**: Sua URL de privacidade
   - **App logo**: Logo profissional

#### Configurar OAuth
```javascript
// Redirect URLs para adicionar na app LinkedIn
https://your-domain.vercel.app/auth/linkedin/callback
http://localhost:5173/auth/linkedin/callback (para dev)

// Scopes necessários
openid
profile
email
```

#### Testar OAuth Localmente
```bash
# 1. Clone o repositório
git clone https://github.com/tiagonpsilva/tiagonpsilva.github.io.git
cd tiagonpsilva.github.io

# 2. Instale dependências
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Edite .env.local com suas credenciais

# 4. Inicie servidor de desenvolvimento
npm run dev

# 5. Teste fluxo OAuth
# Visite http://localhost:5173
# Clique em "Conectar LinkedIn"
# Verifique se OAuth completa com sucesso
```

### 2. Configuração Mixpanel

#### Criar Projetos
```bash
# Criar dois projetos separados
1. "Portfolio Dev" - para desenvolvimento
2. "Portfolio Prod" - para produção

# Copiar tokens dos projetos
Project Token Dev:  abcd1234...
Project Token Prod: efgh5678...
```

#### Service Account (Opcional)
```bash
# Para access à Export API (apenas planos pagos)
# Se você tem plano Growth+, crie service account:

1. Acesse Project Settings > Service Accounts
2. Crie novo service account
3. Copie username e secret
4. Configure MIXPANEL_USERNAME e MIXPANEL_SECRET
```

#### Testar Analytics
```bash
# Verify analytics em development
npm run dev

# Abra Developer Tools > Console
# Verifique logs: "📊 Mixpanel Event: Page View"
# Acesse Mixpanel project e confirme events
```

### 3. Configuração Vercel

#### Deploy Inicial
```bash
# Instalar Vercel CLI
npm install -g vercel

# Login na Vercel
vercel login

# Deploy inicial
vercel --prod

# Configurar domínio customizado (opcional)
vercel domains add your-domain.com
```

#### Environment Variables na Vercel
```bash
# Via Vercel Dashboard
1. Acesse Project Settings > Environment Variables
2. Adicione todas as variáveis do .env.local
3. Configure para Production e Preview environments

# Via CLI
vercel env add VITE_LINKEDIN_CLIENT_ID
vercel env add LINKEDIN_CLIENT_SECRET
vercel env add VITE_MIXPANEL_TOKEN_PROD
```

#### Configurar GitHub Integration
```bash
# Conectar repositório GitHub
1. Vercel Dashboard > Import Project
2. Selecione repositório GitHub
3. Configure build settings:
   - Framework Preset: Vite
   - Root Directory: ./
   - Build Command: npm run build
   - Output Directory: dist
```

## CI/CD Pipeline

### 1. GitHub Actions Workflow

#### Main Workflow (.github/workflows/deploy.yml)
```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run type check
        run: npm run type-check
      
      - name: Run build
        run: npm run build
        env:
          VITE_LINKEDIN_CLIENT_ID: ${{ secrets.VITE_LINKEDIN_CLIENT_ID }}
          VITE_MIXPANEL_TOKEN_PROD: ${{ secrets.VITE_MIXPANEL_TOKEN_PROD }}

  cypress:
    runs-on: ubuntu-latest
    needs: test
    strategy:
      matrix:
        browser: [chrome, firefox]
    steps:
      - uses: actions/checkout@v3
      
      - name: Cypress E2E Tests
        uses: cypress-io/github-action@v5
        with:
          browser: ${{ matrix.browser }}
          start: npm run dev
          wait-on: 'http://localhost:5173'
        env:
          CYPRESS_RECORD_KEY: ${{ secrets.CYPRESS_RECORD_KEY }}

  deploy:
    runs-on: ubuntu-latest
    needs: [test, cypress]
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

#### Quality Gates
```yaml
# Regras obrigatórias para merge
1. ✅ Type check deve passar
2. ✅ Build deve ser bem-sucedido  
3. ✅ E2E tests devem passar em Chrome e Firefox
4. ✅ Bundle size deve ser < 1MB
5. ✅ No console errors durante build
```

### 2. Secrets Configuration

#### GitHub Repository Secrets
```bash
# Acesse Repository Settings > Secrets and Variables > Actions

# Vercel Integration
VERCEL_TOKEN=your_vercel_token
ORG_ID=your_vercel_org_id
PROJECT_ID=your_vercel_project_id

# Application Secrets
VITE_LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_secret
VITE_MIXPANEL_TOKEN_PROD=your_mixpanel_prod_token

# Optional: Testing
CYPRESS_RECORD_KEY=your_cypress_record_key
```

## Deployment Strategies

### 1. Automatic Deployment (Recomendado)
```bash
# Fluxo automático via GitHub Actions
1. Developer faz push para main branch
2. GitHub Actions roda tests
3. Se tests passam, deploy para Vercel
4. Vercel faz build e deploy automaticamente
5. Site fica disponível em produção

# Zero downtime deployment
- Vercel faz atomic deployments
- Rollback instantâneo se necessário
- Preview deployments para PRs
```

### 2. Manual Deployment
```bash
# Para deployments de emergência ou patches
vercel --prod

# Deploy específico de um branch
vercel --prod --branch feature-branch

# Rollback para deployment anterior
vercel rollback [deployment-url]
```

### 3. Preview Deployments
```bash
# Automatic preview URLs para cada PR
- GitHub Actions cria preview deployment
- URL: portfolio-git-branch-name-username.vercel.app
- Permite testar changes antes de merge
- Analytics separadas (dev environment)
```

## Monitoramento de Deploy

### 1. Health Checks

#### Automated Checks
```typescript
// Post-deployment verification
const healthChecks = [
  'Homepage loads successfully',
  'LinkedIn OAuth flow works',
  'Mixpanel events are sent',
  'All routes are accessible',
  'No console errors',
  'Performance metrics < thresholds'
]
```

#### Manual Verification
```bash
# Checklist pós-deploy
1. ✅ Visite homepage e verifique carregamento
2. ✅ Teste LinkedIn login flow completo
3. ✅ Verifique analytics no Mixpanel
4. ✅ Teste navegação entre seções
5. ✅ Confirme mobile responsiveness
6. ✅ Verifique performance no Lighthouse (>90)
```

### 2. Error Monitoring

#### Vercel Functions Logs
```bash
# Acessar logs das serverless functions
vercel logs --follow

# Filtrar por função específica
vercel logs --follow --filter="api/auth/linkedin/token"

# Debug errors em production
vercel logs --filter="ERROR" --since=1h
```

#### Analytics Monitoring
```javascript
// Mixpanel dashboard alerts
1. Monitor error events > 5% rate
2. Alert if auth success rate < 90%
3. Track Core Web Vitals degradation
4. Monitor API response times
```

### 3. Performance Monitoring

#### Core Web Vitals
```bash
# Targets de performance
LCP (Largest Contentful Paint): < 2.5s
FID (First Input Delay): < 100ms
CLS (Cumulative Layout Shift): < 0.1

# Monitoramento contínuo
- Vercel Analytics (automático)
- Lighthouse CI em cada deploy
- Real User Monitoring via Mixpanel
```

## Troubleshooting

### 1. Build Failures

#### Common Issues
```bash
# TypeScript errors
Problem: Type errors blocking build
Solution: Run `npm run type-check` localmente

# Environment variables missing
Problem: Build fails due to missing env vars
Solution: Verify all VITE_ vars are set in Vercel

# Bundle size too large
Problem: Bundle exceeds Vercel limits
Solution: Analyze with `npm run build -- --analyze`
```

#### Debug Build Issues
```bash
# Local build debugging
npm run build -- --debug

# Vercel build debugging
vercel build --debug

# Check bundle size
npm run build
npx bundlephobia analyze dist/assets/*.js
```

### 2. OAuth Issues

#### LinkedIn OAuth Problems
```bash
# Invalid redirect URI
Problem: OAuth callback fails with invalid redirect
Solution: Verify redirect URLs in LinkedIn app match exactly

# CORS errors
Problem: OAuth requests blocked by CORS
Solution: Check Vercel function configuration

# State parameter mismatch
Problem: CSRF error on OAuth callback
Solution: Verify sessionStorage is working correctly
```

#### Debug OAuth Flow
```bash
# Enable OAuth debugging
1. Set localStorage.setItem('debug_oauth', 'true')
2. Check browser console for detailed logs
3. Verify network requests in DevTools
4. Confirm Vercel function logs
```

### 3. Analytics Issues

#### Mixpanel Not Receiving Events
```bash
# Common problems and solutions

Problem: Events not appearing in Mixpanel
Solutions:
1. Verify token is correct for environment
2. Check network requests in DevTools
3. Confirm CORS settings
4. Validate event properties format

Problem: Development events in production project
Solution: Verify environment detection logic
```

#### Debug Analytics
```bash
# Enable debug mode
localStorage.setItem('mixpanel_debug', 'true')

# Check event queue
mixpanel.get_config('batch_requests')

# Manual event test
mixpanel.track('Test Event', { debug: true })
```

## Backup e Recovery

### 1. Configuration Backup
```bash
# Backup de configurações críticas
1. Export environment variables
2. Backup LinkedIn app settings
3. Export Mixpanel project configuration
4. Save Vercel project settings
```

### 2. Disaster Recovery
```bash
# Em caso de falha total do projeto

# 1. Restore from GitHub
git clone https://github.com/tiagonpsilva/tiagonpsilva.github.io.git

# 2. Recreate Vercel project
vercel link
vercel env pull .env.local

# 3. Redeploy
vercel --prod

# 4. Verify all integrations
npm run test:e2e
```

### 3. Rollback Procedures
```bash
# Rollback deployment
vercel rollback [previous-deployment-url]

# Rollback code changes
git revert [commit-hash]
git push origin main

# Emergency hotfix
git checkout -b hotfix/issue-name
# Fix issue
git push origin hotfix/issue-name
# Create emergency PR and merge
```

---

Para mais detalhes sobre arquitetura, consulte [ARQUITETURA.md](ARQUITETURA.md).

Para troubleshooting específico, consulte [TROUBLESHOOTING.md](TROUBLESHOOTING.md).