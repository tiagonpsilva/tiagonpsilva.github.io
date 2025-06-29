# 🧪 Teste Imediato do Mixpanel

## 1. Aguardar Deploy (2-5 minutos)

O Vercel precisa redeployar para aplicar as environment variables.

## 2. Teste no Browser Console

### Passo A: Abrir Console
1. Acesse: https://tiagopintoio.vercel.app
2. Abra Developer Tools (F12)
3. Vá para Console tab
4. Recarregue a página (Ctrl+F5)

### Passo B: Verificar Logs de Inicialização

**Procure por estes logs:**

✅ **FUNCIONANDO:**
```
🔧 Mixpanel Configuration: {
  environment: "production",
  enabled: true,
  hasToken: true,
  tokenPreview: "abc12345..."
}
🎯 Mixpanel: Using production token - Analytics ENABLED
🎯 Mixpanel initialized successfully (production)
👤 User identified: user_123... (anonymous)
```

❌ **AINDA COM PROBLEMA:**
```
🔧 Mixpanel Configuration: {
  enabled: false,
  hasToken: false,
  tokenPreview: "none"
}
⚠️ No Mixpanel token found! Check environment variables
⚠️ Mixpanel analytics disabled for this environment
```

### Passo C: Teste Manual

No console, execute:
```javascript
// Verificar se Mixpanel carregou
console.log('Mixpanel Status:', {
  loaded: !!window.mixpanel,
  canTrack: !!window.mixpanel?.track,
  config: window.mixpanel?.get_config?.()
});

// Testar evento manual
if (window.mixpanel?.track) {
  window.mixpanel.track('Manual Test Event', {
    test_source: 'console',
    timestamp: new Date().toISOString()
  });
  console.log('✅ Test event sent!');
} else {
  console.log('❌ Mixpanel not available');
}
```

### Passo D: Verificar Network Requests

1. Vá para Network tab no Developer Tools
2. Filtre por "mixpanel"
3. Navegue pelo site (clique em links, projetos, etc.)
4. Deve ver requests para api.mixpanel.com

## 3. Teste de Navegação

1. Navegue entre páginas (Home → Labs → Contact → Blog)
2. Clique em projetos no Labs
3. Clique em links de contato
4. Aguarde modal de LinkedIn aparecer (30s)

Cada ação deve gerar eventos no Mixpanel.

## 4. Verificar Dashboard Mixpanel

1. Acesse seu dashboard Mixpanel
2. Vá para Live View → Events  
3. Deve ver eventos chegando do site

## 5. Se Ainda Não Funcionar

### Verificar Environment Variables:
```javascript
// No console:
console.log('Environment Check:', {
  token: import.meta?.env?.VITE_MIXPANEL_TOKEN?.substring(0, 8) + '...',
  tokenProd: import.meta?.env?.VITE_MIXPANEL_TOKEN_PROD?.substring(0, 8) + '...',
  enabled: import.meta?.env?.VITE_ANALYTICS_ENABLED,
  mode: import.meta?.env?.MODE,
  dev: import.meta?.env?.DEV
});
```

### Forçar Redeploy:
1. Vercel Dashboard → Deployments
2. "..." → Redeploy
3. Aguardar completar

## 6. Resultados Esperados

**✅ SUCESSO se ver:**
- Logs de inicialização no console
- window.mixpanel disponível
- Network requests para api.mixpanel.com
- Eventos no dashboard Mixpanel

**❌ PROBLEMA se ver:**
- "analytics disabled" ou "token not found"
- window.mixpanel undefined
- Nenhum network request
- Nenhum evento no dashboard

---

## Próximo Passo

**Reporte o resultado aqui:**
- [ ] ✅ Funcionando: Logs aparecem, eventos enviados
- [ ] ❌ Problema: Ainda mostra token missing  
- [ ] ⏳ Aguardando: Deploy ainda em andamento

**Copie e cole os logs do console para análise!**