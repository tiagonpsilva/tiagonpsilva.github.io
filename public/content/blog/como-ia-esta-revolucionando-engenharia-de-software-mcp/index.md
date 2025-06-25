---
id: como-ia-esta-revolucionando-engenharia-de-software-mcp
title: Como a IA Está Revolucionando a Engenharia de Software com MCP
excerpt: Dentro das rotinas de times de engenharia de software, boa parte do tempo é gasto entre IDEs, ferramentas de gestão e versionamento. E se fosse possível unir tudo isso em um fluxo inteligente e automatizado?
publishedAt: 2025-05-29
tags: [IA, MCP, Engenharia de Software, Automação, Docker, GitHub]
linkedinUrl: https://www.linkedin.com/pulse/como-ia-está-revolucionando-engenharia-de-software-mcp-pinto-silva-5dypf/
readTime: 18
---

## 📌 Contexto

Dentro das rotinas de times de engenharia de software, boa parte do tempo de execução é gasto dentro das IDEs (VSCode, por exemplo), ferramentas de gestão de projetos (Jira, por exemplo), ferramentas de versionamento de código (Github, por exemplo), issues, pull requests, code reviews, etc. Além disso, com a intensificação do uso de IA, eventualmente códigos podem ser copiados em ferramentas de LLMs, como o ChatGPT, o Claude, o Gemini, para insights ou até mesmo para execução de tarefas. Essa variabilidade de ferramentas e fluxos de trabalho tende a prejudicar a produtividade e a qualidade do trabalho, além de aumentar o risco de erros humanos.

## 💡 Proposta de Solução

A rotina dos times de engenharia é repleta de ferramentas, contextos e integrações. Mas, e se fosse possível unir tudo isso em um fluxo inteligente, automatizado e seguro, sem sair do ambiente de desenvolvimento?

Minha proposta foi criar um ecossistema onde a IA potencializa as ferramentas já utilizadas no dia a dia, tornando o trabalho mais fluido, produtivo e auditável. Para isso, utilizo ferramentas como **Cursor IDE**, que acelera a produtividade com IA integrada, e o **GitHub**, amplamente adotado para versionamento e gestão de issues. Além disso, aproveito o **ChatGPT** para automação de tarefas e análise, tornando o fluxo ainda mais eficiente. As **Issues do GitHub** são essenciais para gerenciar tarefas e garantir rastreabilidade. Para potencializar ainda mais a automação, integro o protocolo **MCP**, que padroniza a comunicação entre agentes de IA e ferramentas, e o **Docker**, que oferece um ambiente seguro e centralizado para execução dessas integrações.

Adicionalmente, usei mais componentes, mais técnicos, mas que são fundamentais para o sucesso da automação:

**MCP (Model Context Protocol)**: O MCP é um protocolo aberto e modular, criado para padronizar a comunicação entre agentes de IA, ferramentas e ambientes de desenvolvimento. Ele permite que diferentes sistemas "conversem" de forma segura, auditável e extensível, tornando possível a automação de fluxos complexos sem depender de integrações proprietárias ou scripts frágeis.

**Docker como Proxy MCP**: O Docker evoluiu para ser mais do que apenas um ambiente de containers: agora, com o Docker MCP Catalog e Docker MCP Toolkit, ele atua como um proxy seguro e centralizado para execução de agentes MCP. Isso significa que você pode rodar servidores MCP e conectar suas ferramentas e agentes de forma isolada, auditável e com gerenciamento de credenciais integrado, tudo com a simplicidade e segurança já conhecidas do Docker.

![Arquitetura da Solução](/content/blog/como-ia-esta-revolucionando-engenharia-de-software-mcp/01.png)

Fechando a explicação da arquitetura, a solução tem um último elemento, ao qual chamei de **Github MCPilot**.

### O que é o Github MCPilot?

O **Github MCPilot** é um prompt que eu montei e apliquei como uma Cursor Rule que tem o papel de se comportar como um agente de IA dentro da IDE.

O objetivo é simples:

**Permitir que você converse com o seu GitHub de forma segura, prática e automatizada, sem sair do seu ambiente de desenvolvimento.**

O Github MCPilot é um agente CLI interativo projetado para oferecer operações realmente funcionais e seguras no Github. Ele inclui um wizard de configuração intuitivo que simplifica o setup inicial, sistema de logging estruturado para auditoria e operação proativa com explicações detalhadas em tempo real. O Github MCPilot atua como um consultor inteligente, sugerindo boas práticas de desenvolvimento, alertando proativamente sobre operações críticas e mantendo fluxo otimizado através do retorno automático ao menu principal.

![Github MCPilot Interface](/content/blog/como-ia-esta-revolucionando-engenharia-de-software-mcp/02.png)

![Github MCPilot Features](/content/blog/como-ia-esta-revolucionando-engenharia-de-software-mcp/03.png)

A seguir, demonstrarei casos de uso desta solução, para evidenciar a sua utilidade prática.

## 📦 Caso de Uso 1: Criação Automatizada de Repositório

A automação da criação de repositórios permite padronizar projetos, acelerar o onboarding e garantir rastreabilidade. O usuário solicita a criação de um novo repositório com README e .gitignore via linguagem natural.

![Caso de Uso 1 - Visão Geral](/content/blog/como-ia-esta-revolucionando-engenharia-de-software-mcp/04.png)

### Prompts Enviados via Cursor IDE

**📝 Prompt enviado (Caso de Uso 1):**

"Quero que vc crie um novo repositório chamado golang_project_template, com uma estrutura básica para desenvolvimento de projetos. Considere: iac, docs, README

Inclua outras pastas ou recomendações para este tipo de projeto"

**🤖 Resposta da IA (Caso de Uso 1):**

"Repositório golang_project_template criado com sucesso!
Estrutura inicial recomendada já está disponível, incluindo:

- cmd/ (binários)
- pkg/ (código reutilizável)
- internal/ (código privado)
- api/ (definições de API)
- configs/ (configurações)
- scripts/ (scripts utilitários)
- build/ (build/CI)
- deployments/ (manifests de deploy)
- iac/ (infraestrutura como código)
- docs/ (documentação)
- tests/ (testes automatizados)
- .gitignore (padrão Go e mercado)
- README.md (explicativo e com recomendações)

Link do repositório: https://github.com/tiagonpsilva/golang_project_template

**Recomendações:**
- Use cmd/ para separar binários.
- Coloque código compartilhado em pkg/ e privado em internal/.
- Documentação sempre em docs/.
- Scripts de infraestrutura em iac/.
- Testes em tests/.
- Configurações versionadas em configs/.

Toda a operação, estrutura e recomendações foram registradas no log estruturado conforme solicitado.

Se quiser adicionar exemplos de código, pipelines, templates de PR/issue ou outra melhoria, é só pedir!"

### Resultado

O repositório foi criado automaticamente pelo agente MCPilot, seguindo as melhores práticas de estruturação para projetos em Go. A estrutura recomendada inclui diretórios para binários, código reutilizável, documentação, infraestrutura como código, testes automatizados e arquivos essenciais como README e .gitignore. Isso acelera o início de novos projetos, padroniza o ambiente de desenvolvimento e facilita o onboarding de novos membros. O link do repositório e a estrutura criada ficam disponíveis para consulta e colaboração imediata.

![Resultado Caso de Uso 1](/content/blog/como-ia-esta-revolucionando-engenharia-de-software-mcp/05.png)

## 🏗️ Caso de Uso 2: Geração de Artefato de Arquitetura a partir do Código

A documentação visual dos fluxos principais de um sistema é fundamental para onboarding, manutenção e comunicação entre times. Utilizando IA, é possível gerar diagramas de sequência automaticamente a partir da análise do código e de prompts em linguagem natural, acelerando a criação de artefatos arquiteturais.

![Caso de Uso 2 - Visão Geral](/content/blog/como-ia-esta-revolucionando-engenharia-de-software-mcp/06.png)

### Prompts Enviados via Chat do Cursor IDE

**📝 Prompt enviado (Caso de Uso 2):**

"quero que vc leia o repositório novamente e gere um diagrama de sequencia com o detalhamento dos principais fluxos"

**🤖 Resposta da IA (Caso de Uso 2):**

"Vou gerar um diagrama de sequência detalhando os principais fluxos do projeto "calculadora-ganho-capital", com base na leitura dos arquivos principais do repositório.

(Diagrama gerado como código no padrão Mermaid)

```mermaid
sequenceDiagram
    participant Usuário
    participant main.py
    participant CalculadoraGanhoCapital
    participant Arquivo_JSON

    Usuário->>main.py: Executa python main.py <arquivo.json>
    main.py->>Arquivo_JSON: Lê operações do arquivo JSON
    main.py->>CalculadoraGanhoCapital: Instancia classe CalculadoraGanhoCapital
    loop Para cada operação
        main.py->>CalculadoraGanhoCapital: processar_operacao(operação)
        CalculadoraGanhoCapital-->>main.py: Retorna imposto calculado
    end
    main.py->>Usuário: Exibe resultado (impostos por operação)

    alt Processamento de arquivo de operações
        main.py->>CalculadoraGanhoCapital: processar_arquivo(<arquivo.json>)
        CalculadoraGanhoCapital->>Arquivo_JSON: Lê lista de operações
        loop Para cada operação
            CalculadoraGanhoCapital->>CalculadoraGanhoCapital: processar_operacao(operação)
        end
        CalculadoraGanhoCapital-->>main.py: Retorna lista de impostos
        main.py->>Usuário: Exibe resultados consolidados
    end
```"

### Resultado

A IA gerou automaticamente um diagrama de sequência detalhando os principais fluxos do projeto, a partir da análise do código-fonte. Esse artefato visual pode ser utilizado em documentações técnicas, apresentações, revisões de arquitetura e onboarding de novos desenvolvedores, promovendo alinhamento e clareza sobre o funcionamento do sistema. O diagrama pode ser facilmente incorporado em wikis ou exportado para apresentações.

![Resultado Caso de Uso 2](/content/blog/como-ia-esta-revolucionando-engenharia-de-software-mcp/07.png)

## 📝 Caso de Uso 3: Criação de Issues de Melhoria via IA

Ao analisar um projeto Python de cálculo de imposto sobre ganho de capital, identificou-se a necessidade de melhorias em segurança, observabilidade, escalabilidade, boas práticas e desempenho. Utilizando o agente Github MCPilot, foi possível gerar issues automaticamente, promovendo governança e rastreabilidade.

![Caso de Uso 3 - Visão Geral](/content/blog/como-ia-esta-revolucionando-engenharia-de-software-mcp/08.png)

### Prompts Enviados via Cursor IDE

**📝 Prompt enviado (Caso de Uso 3):**

"Gere cinco issues no repositório com melhorias de Segurança, Observabilidade, Escalabilidade, Boas Práticas e Desempenho"

**🤖 Resposta da IA (Caso de Uso 3):**

"Cinco issues de melhorias foram criadas no repositório "calculadora-ganho-capital", cada uma focada em um aspecto essencial:"

![Issues Criadas](/content/blog/como-ia-esta-revolucionando-engenharia-de-software-mcp/09.png)

### Resultado

O agente Github MCPilot criou automaticamente cinco issues de melhoria no repositório, cada uma abordando um aspecto fundamental: segurança, observabilidade, escalabilidade, boas práticas e desempenho. Isso garante rastreabilidade das demandas de evolução, facilita o acompanhamento pelo time e promove uma cultura de melhoria contínua. As issues já estão disponíveis para priorização, detalhamento e atribuição no GitHub.

![Resultado Issues](/content/blog/como-ia-esta-revolucionando-engenharia-de-software-mcp/10.png)

![Issues no GitHub](/content/blog/como-ia-esta-revolucionando-engenharia-de-software-mcp/11.png)

## 🔀 Caso de Uso 4: Fluxo Completo de Pull Request com IA

A automação do fluxo de pull request (PR) com IA permite criar, revisar e aprovar mudanças de forma colaborativa e auditável, integrando logs e sugestões de melhoria.

![Caso de Uso 4 - Visão Geral](/content/blog/como-ia-esta-revolucionando-engenharia-de-software-mcp/12.png)

### Prompts Enviados via Cursor IDE

**📝 Prompt enviado (Caso de Uso 4):**

"Agora quero que vc abra uma PR para implementação de melhorias de observabilidade"

**🤖 Resposta da IA (Caso de Uso 4):**

"Branch feature/observabilidade-logging criada com sucesso a partir da main, pronta para implementação das melhorias de observabilidade."

**📝 Prompt enviado (Caso de Uso 4):**

"Consulte as PRs abertas para este repositório"

**🤖 Resposta da IA (Caso de Uso 4):**

"Atualmente há uma Pull Request aberta para melhorias de observabilidade no repositório "calculadora-ganho-capital":

**Título:** feat(observabilidade): logging estruturado, métricas de execução e configuração dinâmica do nível de log

**Descrição:** Implementa logging estruturado (JSON) em todos os pontos-chave do fluxo, métricas de execução (tempo, quantidade de operações, erros) e configuração dinâmica do nível de log via argumento de linha de comando (--log-level).

**Autor:** tiagonpsilva

**Status:** Aberta

**Link:** Ver PR no GitHub"

**📝 Prompt enviado (Caso de Uso 4):**

"Faça um code review das mudanças propostas nesta PR"

**🤖 Resposta da IA (Caso de Uso 4):**

"Code review realizado e comentário publicado na PR #6.

O log estruturado desta operação foi gravado com sucesso, incluindo:
- Pontos positivos da implementação
- Sugestões de melhoria

Link direto para o comentário do review: https://github.com/tiagonpsilva/calculadora-ganho-capital/pull/6#pullrequestreview-2873180056

Se quiser visualizar o conteúdo do log, revisar outro PR ou realizar mais alguma ação, é só pedir!"

**📝 Prompt enviado (Caso de Uso 4):**

"Liste o comentário feito no code review"

**🤖 Resposta da IA (Caso de Uso 4):**

"Aqui estão os principais comentários feitos no code review da PR #6:

- **processar_compra:** Atualize a docstring para incluir o parâmetro logger.
- **processar_venda:** Atualize a docstring para incluir o parâmetro logger.
- **processar_operacao:** Atualize a docstring para incluir o parâmetro logger.
- **calcular_impostos:** Atualize a docstring para incluir o parâmetro logger.
- **processar_arquivo:** Atualize a docstring para incluir o parâmetro logger.
- **test_quantidade_para_venda:** Troque assertRaises(Exception) por assertRaises(ValueError) para maior precisão.

O log estruturado desta operação foi gravado com sucesso, incluindo todos os comentários listados.

Se quiser visualizar o conteúdo do log, revisar outro PR ou realizar mais alguma ação, é só pedir!"

### Resultado

O fluxo completo de Pull Request foi automatizado: desde a criação do branch, abertura da PR, consulta das PRs abertas, até a realização de code review com comentários detalhados. O resultado é um processo auditável, colaborativo e transparente, com logs estruturados de cada etapa. O time pode acompanhar o histórico de revisões, sugestões e aprovações diretamente no GitHub, acelerando o ciclo de feedback e a qualidade do código entregue.

![Resultado Pull Request](/content/blog/como-ia-esta-revolucionando-engenharia-de-software-mcp/13.png)

## 📊 Caso de Uso 5: Observabilidade — Logging Estruturado e Métricas

Para garantir rastreabilidade e facilitar auditoria, o agente MCPilot implementa logging estruturado (JSON) em todas as operações, incluindo métricas de execução, erros e sucesso. Isso permite análises detalhadas e exportação para ferramentas de análise.

![Caso de Uso 5 - Visão Geral](/content/blog/como-ia-esta-revolucionando-engenharia-de-software-mcp/14.png)

### Exemplos de Registras de Logs

**Listagem de repositórios**

```json
{
  "timestamp": "2025-05-28T00:30:25.3NZ",
  "level": "INFO",
  "request_id": "8ce8f08f-d8c1-4664-a134-51139c3a4c36",
  "llm": "gpt-4",
  "tokens": 2000,
  "command": "listar_repositorios",
  "user": "tiagonpsilva",
  "result": "success",
  "duration_ms": 1200,
  "details": {
    "repositorios": ["genai-mcp-client-claude-github","treinamento-modern-data-stack-01","go-lang-samples","software-architecture-foundations","genai-langchain-tutorial","tiagonpsilva","databricks-certified-data-engineer-associate","genai-claude-code-best-practices","knowledge-base","system-design-interview"]
  }
}
```

**Consulta de informações de repositório**

```json
{
  "timestamp": "2025-05-28T00:32:46.3NZ",
  "level": "INFO",
  "request_id": "aa5ea466-9732-4b37-ab2d-7305791f3569",
  "llm": "gpt-4",
  "tokens": 1200,
  "command": "consultar_info_repositorio",
  "user": "tiagonpsilva",
  "result": "success",
  "duration_ms": 800,
  "details": {
    "repositorio": {
      "nome": "calculadora-ganho-capital",
      "url": "https://github.com/tiagonpsilva/calculadora-ganho-capital",
      "linguagem": "Python",
      "privado": false,
      "forks": 0,
      "issues_abertas": 6,
      "estrelas": 0,
      "tamanho_kb": 191,
      "criado_em": "2025-03-16T20:33:16Z",
      "atualizado_em": "2025-05-27T22:10:04Z",
      "permissoes": {"admin": true, "push": true, "pull": true}
    }
  }
}
```

**Criação de branch para observabilidade**

```json
{
  "timestamp": "2025-05-28T00:46:26.3NZ",
  "level": "INFO",
  "request_id": "a58ac7e1-6dcd-4834-9db2-2a703add6223",
  "llm": "gpt-4",
  "tokens": 500,
  "command": "criar_branch_observabilidade",
  "user": "tiagonpsilva",
  "result": "success",
  "duration_ms": 1200,
  "details": {
    "branch": "feature/observabilidade-logging",
    "base": "main",
    "url": "https://github.com/tiagonpsilva/calculadora-ganho-capital/tree/feature/observabilidade-logging"
  }
}
```

**Consulta de PRs abertas**

```json
{
  "timestamp": "2025-05-28T00:48:55.3NZ",
  "level": "INFO",
  "request_id": "d2eb8d2c-440a-4dd3-bb54-d610406f6ada",
  "llm": "gpt-4",
  "tokens": 400,
  "command": "consultar_prs_abertas",
  "user": "tiagonpsilva",
  "result": "success",
  "duration_ms": 900,
  "details": {
    "prs": [
      {"numero": 6, "titulo": "feat(observabilidade): logging estruturado, métricas de execução e configuração dinâmica do nível de log", "autor": "tiagonpsilva", "url": "https://github.com/tiagonpsilva/calculadora-ganho-capital/pull/6"}
    ]
  }
}
```

**Code review realizado**

```json
{
  "timestamp": "2025-05-28T00:50:04.3NZ",
  "level": "INFO",
  "request_id": "ea549e91-9120-4536-91dd-eedf75f59fc0",
  "llm": "gpt-4",
  "tokens": 1200,
  "command": "code_review_pr_6",
  "user": "tiagonpsilva",
  "result": "success",
  "duration_ms": 27000,
  "details": {
    "pr": 6,
    "comentario_url": "https://github.com/tiagonpsilva/calculadora-ganho-capital/pull/6#pullrequestreview-2873180056",
    "pontos_positivos": [
      "Logging estruturado em JSON",
      "Métricas de execução",
      "Configuração dinâmica do nível de log",
      "Logger propagado para métodos principais",
      "Teste para venda maior que disponível"
    ],
    "sugestoes": [
      "Logs de auditoria para exceções",
      "Logs de warning para operações incomuns",
      "Exemplo do parâmetro --log-level no README",
      "Padronizar mensagens de log"
    ]
  }
}
```

**Listagem de comentários do code review**

```json
{
  "timestamp": "2025-05-28T00:52:52.3NZ",
  "level": "INFO",
  "request_id": "8589e71e-0bb4-49c7-a83f-c129acdac991",
  "llm": "gpt-4",
  "tokens": 800,
  "command": "listar_comentarios_code_review_pr_6",
  "user": "tiagonpsilva",
  "result": "success",
  "duration_ms": 2500,
  "details": {
    "comentarios": [
      {"autor": "gemini-code-assist[bot]", "trecho": "processar_compra", "comentario": "Atualize a docstring para incluir o parâmetro logger."},
      {"autor": "gemini-code-assist[bot]", "trecho": "processar_venda", "comentario": "Atualize a docstring para incluir o parâmetro logger."},
      {"autor": "gemini-code-assist[bot]", "trecho": "processar_operacao", "comentario": "Atualize a docstring para incluir o parâmetro logger."},
      {"autor": "gemini-code-assist[bot]", "trecho": "calcular_impostos", "comentario": "Atualize a docstring para incluir o parâmetro logger."},
      {"autor": "gemini-code-assist[bot]", "trecho": "processar_arquivo", "comentario": "Atualize a docstring para incluir o parâmetro logger."},
      {"autor": "gemini-code-assist[bot]", "trecho": "test_quantidade_para_venda", "comentario": "Troque assertRaises(Exception) por assertRaises(ValueError) para maior precisão."}
    ]
  }
}
```

### Prompts Enviados via Cursor IDE

**📝 Prompt enviado (Caso de Uso 5):**

"quero que vc leia a estrutura de logs e gere alguns insights, com base nas informações existentes. Gere Métricas e KPIs"

**🤖 Resposta da IA (Caso de Uso 5):**

"Aqui estão algumas métricas e KPIs extraídos dos últimos 100 registros do log estruturado:"

![Métricas e KPIs](/content/blog/como-ia-esta-revolucionando-engenharia-de-software-mcp/15.png)

### Resultado

A análise dos logs estruturados permitiu extrair métricas, KPIs e insights sobre o uso do agente MCPilot e a automação dos fluxos de engenharia. O time pode utilizar esses dados para monitorar produtividade, identificar gargalos, auditar operações e alimentar dashboards de BI. O padrão de logging adotado facilita a integração com ferramentas de observabilidade e a geração de relatórios personalizados.

## 🎯 Conclusão

A integração de IA com ferramentas já consolidadas no ecossistema de desenvolvimento, como IDEs, GitHub e automação via agentes, não é apenas possível, mas altamente recomendada para times que buscam produtividade, rastreabilidade e governança.

O **Github MCPilot**, ao unir o poder do protocolo MCP, a segurança e portabilidade do Docker e a flexibilidade das Cursor Rules, representa um novo patamar de automação para times de tecnologia. Ele transforma tarefas repetitivas em fluxos inteligentes, auditáveis e seguros, permitindo que desenvolvedores foquem no que realmente importa: entregar valor.

### Principais aprendizados:

- **A automação inteligente** reduz erros, acelera entregas e facilita o onboarding de novos membros.
- **O uso de protocolos abertos** e ferramentas padronizadas (como MCP e Docker) garante portabilidade e segurança.
- **O registro estruturado** de logs e métricas permite auditoria, melhoria contínua e integrações.
- **A experiência do desenvolvedor** é central: interfaces amigáveis, feedbacks claros e proatividade fazem toda a diferença.

Se você quiser testar essa abordagem, basta seguir os passos do Github MCPilot no meu Github. Fique à vontade para ajustá-lo para o seu caso e usar como base para outros projetos.

Obrigado pela leitura!

### 📚 Referências

- [Anthropic - Model Context Protocol](https://www.anthropic.com/news/model-context-protocol)
- [Cursor - Getting Started](https://docs.cursor.com/get-started/introduction)
- [Cursor - Rules Documentation](https://docs.cursor.com/context/rules)
- [Docker - MCP Catalog and Toolkit](https://www.docker.com/blog/introducing-docker-mcp-catalog-and-toolkit/)

#IA #MCP #EngenhariaDeSoftware #Automação #Docker #GitHub #Produtividade #DevOps #CursorIDE #AIStrategy