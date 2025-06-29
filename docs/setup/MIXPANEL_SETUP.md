# 🎯 Configuração Mixpanel - Coleta em DEV + PROD

## ✅ CONFIGURAÇÃO ATUAL: Analytics Habilitado em AMBOS Ambientes

**Por padrão, o sistema agora coleta dados tanto em desenvolvimento quanto em produção**, permitindo análise completa do comportamento dos usuários em todos os ambientes.

## Estratégias Disponíveis

### 📝 Estratégia 1: Tokens Separados (Recomendado)
Crie dois projetos no Mixpanel - um para desenvolvimento e outro para produção.

```bash
# .env.local
VITE_MIXPANEL_TOKEN_DEV=abc123_dev_token
VITE_MIXPANEL_TOKEN_PROD=xyz789_prod_token
```

**Vantagens:**
- ✅ Dados completamente separados por projeto
- ✅ Configurações específicas por ambiente
- ✅ Análise independente de dev vs prod
- ✅ Debug facilitado com dados reais de desenvolvimento
- ✅ **AMBOS ambientes coletam dados automaticamente**

### 🔄 Estratégia 2: Token Único com Flag
Use um único projeto Mixpanel com controle via flag de ambiente.

```bash
# .env.local
VITE_MIXPANEL_TOKEN=your_single_token
VITE_ANALYTICS_ENABLED=true  # false para dev, true para prod
```

**Vantagens:**
- ✅ Um único projeto para gerenciar
- ✅ Controle granular via flag
- ⚠️ Dados mistos (dev + prod)

### 🤖 Estratégia 3: Auto-detecção
Detecção automática baseada no hostname e modo do Vite.

```bash
# .env.local
VITE_MIXPANEL_TOKEN=your_token
# Sem outras configurações - detecção automática
```

**Comportamento:**
- `localhost/*`: Analytics **HABILITADO** (mudança!)
- `your-domain.com`: Analytics habilitado
- Modo desenvolvimento: Analytics **HABILITADO** (mudança!)
- Modo produção: Analytics habilitado
- **Todos os eventos taggeados com `environment: "development"` ou `"production"`**

## 🚀 Setup Rápido

### 1. Escolha sua estratégia
```bash
# Copie o arquivo de exemplo
cp .env.example .env.local

# Edite com suas configurações
nano .env.local
```

### 2. Configure no Mixpanel
1. Acesse [Mixpanel Settings](https://mixpanel.com/settings/project)
2. Crie projetos separados (se usando Estratégia 1):
   - `MeuSite - Development`
   - `MeuSite - Production`
3. Copie os tokens para `.env.local`

### 3. Teste a configuração
```bash
# Desenvolvimento (analytics HABILITADO)
npm run dev
# Verá: "🎯 Mixpanel: Using development token - Analytics ENABLED"

# Produção (analytics habilitado)
npm run build && npm run preview
# Verá: "🎯 Mixpanel: Using production token - Analytics ENABLED"
```

## 🔍 Verificação

### Console Logs
O sistema exibe logs diferentes para cada ambiente:

```bash
# Desenvolvimento (AGORA HABILITADO!)
🔧 Mixpanel Configuration: {
  environment: 'development',
  enabled: true,
  hasToken: true,
  debug: true
}
🎯 Mixpanel initialized successfully (development)
📊 Tracked event: Page Viewed { environment: "development", ... }

# Produção
🎯 Mixpanel initialized successfully (production)
📊 Tracked event: Page Viewed { environment: "production", ... }
```

### Dashboard Mixpanel
- **Development**: Eventos com `environment: "development"`
- **Production**: Eventos com `environment: "production"`
- Super Properties automáticas: `app_version`, `environment`

## 🛠️ Configurações Avançadas

### Persistência por Ambiente
```typescript
// Desenvolvimento: dados em memória (não persistem)
persistence: 'memory'

// Produção: dados no localStorage
persistence: 'localStorage'
```

### Debug Mode
```typescript
// Desenvolvimento: logs detalhados
debug: true

// Produção: logs mínimos
debug: false
```

### Privacy Settings
```typescript
// Desenvolvimento: tracking completo para debug
property_blacklist: []

// Produção: privacidade otimizada
property_blacklist: ['$current_url', '$initial_referrer', '$referrer']
```

## 📊 Eventos Automáticos

Todos os eventos incluem automaticamente:

```typescript
{
  environment: 'development' | 'production',
  app_version: '1.0.0',
  timestamp: '2025-01-26T...',
  page_url: 'https://...',
  page_title: 'Page Title',
  user_agent: 'Mozilla/5.0...'
}
```

## 🚨 Troubleshooting

### Analytics não funcionando?
1. ✅ Verifique se `.env.local` existe
2. ✅ Confirme se o token está correto
3. ✅ Verifique a estratégia escolhida
4. ✅ Abra o console para ver logs de debug

### Dados aparecendo em ambiente errado?
1. ✅ Confirme a configuração da estratégia
2. ✅ Verifique se está usando tokens separados
3. ✅ Limpe o localStorage: `localStorage.clear()`

### Performance Impact?
- ✅ Bundle size: ~50KB (Mixpanel SDK)
- ✅ Runtime: Tracking assíncrono, sem bloqueio
- ✅ Development: Analytics desabilitado = zero impact

## 📝 Exemplo Completo

```bash
# .env.local - Estratégia 1 (Recomendada)
VITE_MIXPANEL_TOKEN_DEV=abc123dev
VITE_MIXPANEL_TOKEN_PROD=xyz789prod

# .env.local - Estratégia 2 (Alternativa)
VITE_MIXPANEL_TOKEN=single_token
VITE_ANALYTICS_ENABLED=true

# .env.local - Estratégia 3 (Auto)
VITE_MIXPANEL_TOKEN=auto_token
# Sem outras configurações
```