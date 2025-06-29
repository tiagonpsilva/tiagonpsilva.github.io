# Documentação do Projeto

Este diretório contém toda a documentação técnica e de arquitetura do projeto de portfolio pessoal.

## Estrutura da Documentação

### 📋 Documentação Geral
- [**README.md**](README.md) - Este arquivo, visão geral da documentação
- [**ARQUITETURA.md**](ARQUITETURA.md) - Visão geral da arquitetura do sistema
- [**DEPLOYMENT.md**](DEPLOYMENT.md) - Guia de deploy e configuração
- [**TESTING.md**](TESTING.md) - Estratégia e execução de testes

### 🏗️ Architecture Decision Records (ADRs)
Os ADRs documentam decisões arquiteturais importantes tomadas durante o desenvolvimento:

- [**ADR-001**](adr/ADR-001-sistema-autenticacao-linkedin.md) - Sistema de Autenticação LinkedIn
- [**ADR-002**](adr/ADR-002-tratamento-erros-auth.md) - Tratamento de Erros de Autenticação
- [**ADR-003**](adr/ADR-003-analytics-mixpanel.md) - Integração Analytics com Mixpanel
- [**ADR-004**](adr/ADR-004-testing-cypress.md) - Framework de Testes com Cypress

### 📊 Diagramas Técnicos
- [**C4 Model**](diagramas/c4-context.md) - Arquitetura em 4 níveis (Sistema, Container, Componente, Deploy)
- [**Sequence Diagrams**](diagramas/sequence-auth.md) - Fluxos detalhados de autenticação

### ⚙️ Setup & Configuração
- [**Mixpanel Setup**](setup/MIXPANEL_SETUP.md) - Configuração completa do analytics
- [**LinkedIn OAuth Setup**](setup/LINKEDIN_OAUTH_SETUP.md) - Configuração da autenticação
- [**Vercel Project Setup**](setup/VERCEL_PROJECT_SETUP.md) - Setup do hosting

### 📖 Guias Técnicos
- [**Advanced Tracking Guide**](guides/ADVANCED_TRACKING_GUIDE.md) - Analytics avançados
- [**DNS Migration Guide**](guides/DNS_MIGRATION_GUIDE.md) - Migração de DNS
- [**Vercel Migration Guide**](guides/VERCEL_MIGRATION_GUIDE.md) - Migração para Vercel
- [**Vercel Deploy Check**](guides/VERCEL_DEPLOY_CHECK.md) - Verificação de deploy
- [**Commands Create Issues**](guides/COMMANDS_CREATE_ISSUES.md) - Comandos para GitHub Issues
- [**Cypress Tests Guide**](guides/README_CYPRESS_TESTS.md) - Guia de testes E2E
- [**SEO Roadmap**](guides/SEO_ROADMAP.md) - Estratégia de SEO

### 🔧 Troubleshooting
- [**Mixpanel Troubleshooting**](troubleshooting/MIXPANEL_TROUBLESHOOTING.md) - Problemas com analytics
- [**Production OAuth Troubleshooting**](troubleshooting/TROUBLESHOOTING_PRODUCTION_OAUTH.md) - Problemas de autenticação

### 📋 Issues & Status
- [**LinkedIn Auth Errors**](issues/ISSUE_LINKEDIN_AUTH_ERRORS.md) - Erros de autenticação
- [**Mixpanel Production Issues**](issues/ISSUE_MIXPANEL_PRODUCTION.md) - Problemas em produção  
- [**DNS Issues**](issues/CREATE_ISSUE_DNS.md) - Problemas de DNS
- [**Mixpanel Status**](status/MIXPANEL_STATUS.md) - Status atual do analytics
- [**Test Status**](status/TEST_MIXPANEL_NOW.md) - Status dos testes

## Convenções

### Formato dos ADRs
Seguimos o formato padrão de ADR:
- **Título**: ADR-XXX-titulo-decisao
- **Status**: Proposto | Aceito | Rejeitado | Substituído
- **Contexto**: Situação que motiva a decisão
- **Decisão**: O que foi decidido
- **Consequências**: Impactos positivos e negativos

### Formato dos Diagramas
- **C4 Model**: Para arquitetura de sistema
- **Sequence Diagrams**: Para fluxos de processo
- **Formato**: Mermaid quando possível, PlantUML para casos complexos

## Como Contribuir

1. **Atualizações de ADR**: Crie novo ADR para mudanças arquiteturais significativas
2. **Diagramas**: Mantenha diagramas atualizados com mudanças no código
3. **Documentação**: Atualize guias técnicos conforme necessário

## Ferramentas

- **Diagramas**: [Mermaid](https://mermaid.js.org/), [PlantUML](https://plantuml.com/)
- **ADRs**: Seguindo template [Michael Nygard](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
- **Markdown**: GitHub Flavored Markdown (GFM)