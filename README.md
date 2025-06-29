# Portfolio Tiago Pinto

Portfolio profissional moderno desenvolvido com React 18, TypeScript e arquitetura robusta incluindo autenticação LinkedIn, analytics avançados e sistema de testes abrangente.

## 🚀 Stack Tecnológica

### Frontend
- **React 18.2** - Biblioteca para interfaces com hooks modernos
- **TypeScript 4.9** - Tipagem estática e type safety
- **Tailwind CSS 3.3** - Framework CSS utility-first
- **Framer Motion 10.16** - Animações fluidas e interativas
- **Vite 4.5** - Build tool com HMR otimizado
- **Magic UI** - Componentes com efeitos especiais

### Backend & Infrastructure
- **Vercel** - Hosting com edge functions e CDN global
- **Node.js** - Runtime para serverless functions
- **LinkedIn OAuth 2.0** - Autenticação profissional
- **Mixpanel** - Analytics avançados e user behavior tracking

### Testing & Quality
- **Cypress** - E2E testing com 67+ cenários
- **Jest** - Unit testing framework
- **GitHub Actions** - CI/CD automatizado
- **TypeScript strict mode** - Type safety completa

## 📁 Estrutura do Projeto

```
├── src/
│   ├── components/          # Componentes React por feature
│   │   ├── ui/             # Magic UI components reutilizáveis
│   │   ├── Hero.tsx        # Seção principal
│   │   ├── Expertise.tsx   # Skills e tecnologias
│   │   ├── Cases.tsx       # Portfolio de projetos
│   │   ├── Blog.tsx        # Sistema de artigos
│   │   └── Contact.tsx     # Formulário e contatos
│   ├── contexts/           # React Contexts (Auth, Analytics, Theme)
│   ├── hooks/              # Custom hooks especializados
│   ├── utils/              # Utilitários (ErrorHandler, Storage, etc)
│   ├── pages/              # Componentes de página
│   ├── lib/                # Bibliotecas e dados
│   └── types/              # Definições TypeScript
├── api/                    # Serverless functions (Vercel)
├── cypress/                # E2E tests e fixtures
├── docs/                   # 📚 Documentação técnica completa
│   ├── adr/               # Architecture Decision Records
│   ├── diagramas/         # C4 Model e sequence diagrams
│   ├── setup/             # Guias de configuração
│   ├── guides/            # Guias técnicos
│   ├── troubleshooting/   # Resolução de problemas
│   └── issues/            # Documentação de issues
└── public/content/blog/    # Artigos em markdown
```

## 📚 Documentação

> **⚠️ Importante**: Toda a documentação técnica detalhada está organizada na pasta [`docs/`](docs/)

### Quick Links
- **[📖 Documentação Principal](docs/README.md)** - Índice geral
- **[🏗️ Arquitetura](docs/ARQUITETURA.md)** - Visão técnica completa
- **[🚀 Deploy](docs/DEPLOYMENT.md)** - Guia de deploy e configuração
- **[🧪 Testes](docs/TESTING.md)** - Estratégia de testes (67+ cenários)

### Architecture Decision Records (ADRs)
- **[ADR-001](docs/adr/ADR-001-sistema-autenticacao-linkedin.md)** - Sistema de Autenticação LinkedIn
- **[ADR-002](docs/adr/ADR-002-tratamento-erros-auth.md)** - Tratamento de Erros de Autenticação  
- **[ADR-003](docs/adr/ADR-003-analytics-mixpanel.md)** - Integração Analytics com Mixpanel
- **[ADR-004](docs/adr/ADR-004-testing-cypress.md)** - Framework de Testes com Cypress

### Diagramas Técnicos
- **[C4 Model](docs/diagramas/c4-context.md)** - Arquitetura em 4 níveis
- **[Sequence Diagrams](docs/diagramas/sequence-auth.md)** - Fluxos de autenticação

## 🛠️ Desenvolvimento

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Verificar tipos
npm run type-check
```

## 📦 Deploy no GitHub Pages

### Opção 1: GitHub Actions (Automático)

1. Fazer push do código para o repositório
2. Ir em Settings > Pages
3. Source: GitHub Actions
4. O deploy acontece automaticamente a cada push na branch main

### Opção 2: Manual

```bash
# Build e deploy manual
npm run deploy
```

## 🌐 Seções do Portfolio

- **Hero** - Apresentação principal com foto e highlights
- **Expertise** - 9 áreas de especialização técnica
- **Cases** - 11 projetos profissionais com filtros
- **Formação** - Cursos, especializações e certificações
- **Projetos** - Repositórios GitHub e Newsletter Bantu Digital
- **Contato** - Formas de contato e serviços oferecidos

## 📝 Conteúdo

Todo o conteúdo é baseado na experiência profissional real de Tiago Pinto:
- 20+ anos de experiência em tecnologia
- Head de Tecnologia
- Expertise em IA, Arquitetura, Dados e Liderança
- Cases de transformação digital com resultados mensuráveis

## 🎨 Design

- Design clean e profissional
- Tema claro com tons slate/gray
- Cards com efeitos glassmorphism
- Animações suaves e responsivas
- Magic Cards com hover effects
- Filtros elegantes nos cases

---

**Desenvolvido por Tiago Pinto**