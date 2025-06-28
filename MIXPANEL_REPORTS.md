# 📊 Sistema de Reports Mixpanel

Sistema para gerar relatórios diretamente do Mixpanel via API, conforme solicitado.

## 🔧 Configuração

### 1. Credenciais do Mixpanel

Você precisa configurar as credenciais da API do Mixpanel:

```bash
# No arquivo .env.local
MIXPANEL_PROJECT_ID=seu_project_id_aqui
MIXPANEL_USERNAME=seu_username_ou_service_account
MIXPANEL_SECRET=sua_secret_key_aqui
```

### 2. Como obter as credenciais:

1. **Acesse** o Mixpanel → Settings → Project Settings
2. **Project ID**: Encontre na seção "Project Details"  
3. **Service Account**: Vá em Organization Settings → Service Accounts
4. **Create Service Account** com permissões de leitura
5. **Copy** o username e secret gerados

## 🚀 Como Gerar Reports

### Opção 1: Via Script CLI

```bash
# Instalar dependência (primeira vez)
npm install node-fetch

# Gerar relatório dos últimos 30 dias
node scripts/generate-mixpanel-reports.js 30

# Gerar relatório dos últimos 7 dias  
node scripts/generate-mixpanel-reports.js 7

# Gerar relatório dos últimos 90 dias
node scripts/generate-mixpanel-reports.js 90
```

### Opção 2: Via Código JavaScript

```javascript
import { 
  generateMixpanelReport, 
  createMixpanelConfig,
  testMixpanelConnection 
} from './src/utils/mixpanelQueries'

// Configurar credenciais
const config = createMixpanelConfig(
  'seu_project_id',
  'seu_username', 
  'sua_secret'
)

// Testar conexão
const connected = await testMixpanelConnection(config)
if (!connected) {
  console.error('Erro de conexão com Mixpanel')
  return
}

// Gerar relatório
const report = await generateMixpanelReport(config, 30)
console.log('Relatório gerado:', report)
```

## 📈 Dados Coletados

O sistema coleta exatamente os dados que você pediu:

### 🏆 **Artigos de Blog Mais Acessados**
- Eventos: `Article Started`, `Page Viewed` 
- Dados: Views por artigo, usuários únicos por artigo
- Ordenação: Por volume de visualizações

### 📚 **Comportamento de Leitura**
- Eventos: `Article Scroll Milestone`, `Article Completed`
- Métricas: Scroll depth médio, tempo de leitura, taxa de conclusão
- Análise: Se usuários leem até o final

### 👥 **Usuários Novos vs Recorrentes**
- Eventos: `Page Viewed` com property `user_type`
- Segmentação: new vs returning users
- Contagem: Usuários únicos por categoria

### 🔗 **Como Chegaram na Página**
- Property: `utm_source` nos eventos `Page Viewed`
- Canais: LinkedIn, Google, Direct, etc.
- Dados: Volume de sessões por canal

### 🏠 **Partes do Site Mais Acessadas**
- Property: `page_name` nos eventos `Page Viewed`
- Seções: Home, Blog, Cases, Labs, Contact
- Dados: Total de visualizações por seção

## 📁 Saída dos Reports

Os relatórios são salvos em:
```
/reports/mixpanel-report-{dias}d-{data}.json
```

Exemplo de estrutura:
```json
{
  "generated_at": "2025-06-28T20:00:00.000Z",
  "period_days": 30,
  "project_id": "your_project_id",
  "data": {
    "top_articles": [
      {
        "date": "2025-06-28", 
        "article_views": 150,
        "event": "Article Started"
      }
    ],
    "user_segmentation": {
      "total_unique_users": 1500,
      "period_days": 30
    },
    "acquisition_channels": [
      {
        "source": "linkedin",
        "total_sessions": 800
      }
    ],
    "site_popularity": [
      {
        "page_name": "Blog",
        "total_views": 2500
      }
    ]
  }
}
```

## 🤖 Automação

### Relatório Semanal Automático

```bash
# Adicionar ao cron para executar toda segunda às 9h
0 9 * * 1 cd /path/to/projeto && node scripts/generate-mixpanel-reports.js 7
```

### Relatório Mensal Automático

```bash
# Primeiro dia do mês às 10h
0 10 1 * * cd /path/to/projeto && node scripts/generate-mixpanel-reports.js 30
```

## 🔍 Troubleshooting

### Erro de Credenciais
```
❌ Erro: Variáveis de ambiente do Mixpanel não configuradas
```
**Solução**: Configurar as variáveis MIXPANEL_PROJECT_ID, MIXPANEL_USERNAME, MIXPANEL_SECRET

### Erro de API 401
```
❌ Mixpanel API error: 401 Unauthorized  
```
**Solução**: Verificar se username/secret estão corretos e se o service account tem permissões

### Erro de API 403
```
❌ Mixpanel API error: 403 Forbidden
```
**Solução**: Service account precisa de permissões de leitura no projeto

### Sem Dados Retornados
```
✅ Encontrados 0 registros de artigos
```
**Possíveis causas**:
- Analytics ainda coletando dados (aguardar 24h)
- Nomes dos eventos não batem (verificar no Mixpanel)
- Período muito restrito (tentar 30+ dias)

## 📞 Suporte

Se precisar de ajuda:
1. Verificar se o tracking está ativo no site
2. Validar dados no dashboard do Mixpanel primeiro  
3. Testar conexão com `testMixpanelConnection()`
4. Verificar logs detalhados no console