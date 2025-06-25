---
title: "Do Zero ao Sistema Real: Primeira Sprint de um Desenvolvimento Orientado por IA"
excerpt: "Um experimento real explorando agentes de IA, desenvolvimento acelerado e entrega ponta-a-ponta com apoio de inteligência artificial."
publishedAt: "2024-06-24"
tags: ["IA", "Desenvolvimento", "Agentes", "Sprint", "Kwanza"]
linkedinUrl: "https://www.linkedin.com/pulse/do-zero-ao-sistema-real-primeira-sprint-de-um-por-ia-pinto-silva-cus0f/"
---

Após escrever uma sequência de artigos sobre IA (Engenharia de Prompt, Agentes de IA, Modelos de Raciocínio, etc), comecei a compilar alguns conhecimentos em um projeto real, com o objetivo de testar a hipótese de que é possível acelerar o desenvolvimento de software usando IA como parceiro principal, mantendo um padrão de qualidade enterprise, seguindo boas práticas de engenharia de software, pensamento em escalabilidade, segurança, visão arquitetural e uma boa experiência para o usuário final.

Neste artigo detalharei como foi a experiência nesta primeira fase do projeto (Sprint #1), compartilhando os resultados, entregáveis, métricas, aprendizados e insights.

## ✊🏿Kwanza Agent

### 🎯 Escopo para Guiar o Projeto

Montar um portal que compartilhe as notícias mais recentes sobre Tecnologia, com um design moderno, gerando uma boa experiência para o usuário final. O projeto deve conter pelo menos uma interface conversacional conectada a um Agente de IA especializado neste tipo de conteúdo. O nome do projeto é Kwanza Agent.

### 🚀 Objetivos / Validações de Hipóteses

- Reduzir o time-to-Market de projetos de tecnologia, pensando da ideação à produção
- AI-Driven Development" como método de desenvolvimento mais moderno e promissor
- Acelerar o aprendizado de técnicas, processos e ferramentas que ainda não conheço, mas que são essenciais para o projeto em questão
- Potencializar os conhecimentos que já possuo, aprofundando certos aspectos com o apoio da IA
- Outputs de aprendizados, para uso em outros projetos e compartilhamento com outras pessoas

### 💻 Recursos para Desenvolvimento com IA

- IDE: Cursor IDE
- AI Agent: Claude Code (pair programming com IA)
- MCP 1: Github para interação com o código-fonte
- MCP 2: Linear para gestão de tarefas (alternativa ao Jira)
- LLM: Claude Opus (Modelo de Raciocínio) + Claude Sonnet 4.0 (Modelo de Geração de Texto)
- Engenharia de Prompt: Aplicação de técnicas de engenharia de Prompt para otimização dos resultados

### 📚 Metodologia de Trabalho

Uma vez definidos os recursos para desenvolvimento, antes de sair gerando código, dediquei um tempo importante documentando algumas premissas para evolução da implementação, tanto sob o ponto de vista técnico, quanto sob o ponto de vista de gestão de projeto. Deste modo, gerei um documento abordando os seguintes tópicos:

- Escrita clara e objetiva do escopo do projeto
- Descrição em alto nível das principais funcionalidades
- Descrição básica de padrões de UX/UI
- Determinação dos artefatos de arquiteturais utilizados (ADR, C4 Model, etc)
- Boas práticas de engenharia de software, segurança, qualidade, versionamento, etc
- Coleta de métricas de fluxo de trabalho (Lead-Time, Cycle-Time, etc) e indicadores de qualidade (test coverage, code quality, etc)

Depois eu gerei um artefato para representar o Roadmap. Nele há uma visão mais detalhada sobre o que pretendo desenvolver. Depois disso, eu comecei a quebrar o roadmap em Fases (Sprints), desdobrando cada fase em User Stories e Enabler Stories, com templates para cada tipo de artefato. Essas tasks, por sua vez, serão integradas a ferramenta de gestão Linear. Adotei essa estratégia para ter condições de validar cada artefato gerado, certificando-me que está dentro dos padrões de qualidade que pretendo manter. Esse modelo de trabalho também foi documentado no artefato principal do projeto.

Caso queira ver mais detalhes deste artefato "master", que guia o desenvolvimento da solução de forma geral e totalmente personalizada, acesse CLAUDE.md.

## Sprint #1: Estruturação Inicial + Design System + Componentes Base

A primeira etapa do projeto (Sprint #1) teve como objetivo estabelecer uma base sólida de design system e componentes reutilizáveis para todo o projeto. Os seguintes blocos de trabalho foram feitos:

### 1.1 Configuração Inicial

- Repositório Git configurado
- Integração Linear + GitHub
- Documentação inicial (CLAUDE.md)
- Estrutura de diretórios do projeto
- Configuração React.js + TailwindCSS
- Configuração Shadcn/UI
- Setup de temas (claro/escuro)

### 1.2 Design System & Prototipagem

- Design System completo (cores, tipografia, componentes)
- Wireframes de todas as telas principais

### 1.3 Componentes Base

- Sistema de componentes reutilizáveis
- Layout responsivo (Mobile First)
- Navegação e roteamento
- Estados de loading e erro
- Configuração Cypress para testes E2E
- Storybook para documentação de componentes

## 🎯 Resultados: Entregáveis em 3 dias de Trabalho

- **App demo funcionando**: kwanza-agent.tiagopinto.io
- **Documentação de Frontend**: Storybook com 35+ componentes
- **Código**: Repositório (kwanza-agent) com 160+ arquivos (sem dívidas técnicas)

### Entregáveis Técnicos

- Design System completo com Atomic Design (35+ componentes)
- React 19 + TypeScript foundation com build otimizado
- Storybook para documentação interativa de componentes
- Cypress E2E infrastructure com casos de teste estruturados
- Responsive design mobile-first com tema cultural Kwanza
- CI/CD pipeline com GitHub Actions e deploy automatizado

### Stack Implementado

- **Frontend**: React 19, TypeScript, Tailwind CSS, Shadcn UI
- **Qualidade**: Cypress, Storybook, ESLint, Prettier
- **DevOps**: GitHub Actions, GitHub Pages deployment
- **Gestão**: Linear tasks + MCP GitHub integration

### Componentes Desenvolvidos

- **Atoms**: Typography, Icons, Buttons, Inputs, Loading Spinners
- **Molecules**: Form Fields, Navigation Items, News Cards, Breadcrumbs
- **Organisms**: Header, Footer, Login Forms
- **Templates**: Landing Page, Dashboard, Chat Interface, Settings

### Templates Arquiteturais e de Gestão Gerados

Total: 4 templates

![Templates arquiteturais](./imagem-1.png)

## 📊 Métricas de Performance

Com o objetivo de validar eventuais ganhos de performance no ciclo de desenvolvimento, realizei a parametrização de algumas métricas que serão usadas para acompanhar o progresso do projeto.

### Critérios para Story Points

Optei por usar o modelo de Story Points que neste caso, basicamente, é uma estimativa de esforço com base em critérios de complexidade, tempo estimado e incerteza.

![Critérios para Story Points](./imagem-2.png)

![Continuação dos critérios](./imagem-3.png)

A partir destes critérios, foi possível gerar uma tabela de Story Points para cada task, com base no esforço estimado e na complexidade do trabalho.

![Tabela de Story Points](./imagem-4.png)

### ⚡ Velocidade de Desenvolvimento:

- **Período**: 19-21 Junho 2025
- **Total de Tasks**: 9 completadas
- **Total Story Points**: 52 SP
- **Total Lead Time**: 52.2 horas
- **Total Cycle Time**: 38.1 horas

### 🔧 Qualidade Técnica:

- 100% TypeScript coverage
- Build limpo sem erros ou warnings
- WCAG 2.1 AA compliance

## 💡 Meus Aprendizados e Insights (#Sprint1)

- AI-Driven Development se mostrou uma metodologia de desenvolvimento mais rápida e eficiente, com menos retrabalho e mais produtividade
- CLAUDE.md como prompt master com as premissas gerais do projeto, é muito útil para manter a organização e o contexto do projeto
- Integrações MCP como GitHub e Linear, são essenciais para maior fluidez do desenvolvimento, sem troca de contexto
- Atomic Design System e como ele pode ser usado para criar um Design System consistente e reutilizável
- Storybook como ferramenta de documentação de componentes de UI
- Cypress: como estruturar um projeto de testes End-to-End
- Esteira de CI/CD com Github Actions para publicar o projeto de front-end no Github Pages
- Projeto de front-end do zero com React 19, TypeScript, Tailwind CSS, Shadcn UI, etc
- Code quality com TypeScript, ESLint, Prettier, etc
- Vite como ferramenta de build e deploy de front-end
- Linear é uma boa alternativa ao Jira, para gestão de tarefas

## 🔍 O que vem a seguir?

![Roadmap das próximas sprints](./imagem-5.png)

## ✅ Conclusão

A Sprint #1 do projeto Kwanza Agent mostrou que é possível combinar velocidade com organização e qualidade quando se adota uma abordagem AI-Driven Development bem estruturada. Em apenas três dias, foi possível construir uma fundação sólida de design system, arquitetura front-end e esteira de desenvolvimento, com entregáveis alinhados aos padrões de engenharia de software que estabeleci.

Mais do que entregar telas ou componentes, essa sprint entregou método, processo e validação de hipóteses. Ao transformar o agente de IA em um verdadeiro co-piloto de desenvolvimento, não só escrevendo código, mas também estruturando decisões, organizando tarefas e guiando aprendizados.

Com uma boa orquestração entre ferramentas, práticas modernas e o uso adequado da IA, podemos encurtar o caminho entre a ideia e a entrega, mantendo a excelência técnica e criando experiências que realmente importam para o usuário final.

Agora, seguirei com as demais sprints, compartilhando os resultados e aprendizados.

Obrigado pela leitura!

#AI #Desenvolvimento #Productivity #AIEngineering #LLM #Claude #React #TypeScript #DevOps #AIasCopilot #EngineeringExcellence #Sprint1 #KwanzaAgent