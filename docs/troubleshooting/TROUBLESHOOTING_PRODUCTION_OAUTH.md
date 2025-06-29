# 🔧 Troubleshooting: LinkedIn OAuth em Produção

Este guia ajuda a diagnosticar e corrigir problemas de autenticação LinkedIn OAuth no ambiente de produção.

## 🚨 **Problemas Comuns e Soluções**

### 1. **Environment Variables Não Configuradas**

#### ❌ **Problema:**
```
❌ VITE_LINKEDIN_CLIENT_ID not found!
❌ Token exchange error: undefined client_id
```

#### ✅ **Solução:**
1. **Vercel Dashboard:**
   - Vá para Settings → Environment Variables
   - Adicione:
   ```bash
   VITE_LINKEDIN_CLIENT_ID=seu_client_id_aqui
   LINKEDIN_CLIENT_SECRET=seu_client_secret_aqui
   ```

2. **Redeploy:**
   ```bash
   # Trigger redeploy para aplicar env vars
   git commit --allow-empty -m "trigger redeploy"
   git push
   ```

### 2. **URLs de Callback Não Configuradas**

#### ❌ **Problema:**
```
❌ LinkedIn OAuth error: redirect_uri_mismatch
```

#### ✅ **Solução:**
1. **LinkedIn Developer Console:**
   - Acesse: https://www.linkedin.com/developers/apps
   - Selecione seu app
   - Aba **Auth** → **OAuth 2.0 settings**
   - Adicione URLs:
   ```
   https://seu-dominio.vercel.app/auth/linkedin/callback
   https://tiagonpsilva.github.io/auth/linkedin/callback
   ```

### 3. **LinkedIn App Sem Produtos Aprovados**

#### ❌ **Problema:**
```
❌ LinkedIn API error: insufficient_scope
❌ Profile fetch failed: 403
```

#### ✅ **Solução:**
1. **LinkedIn Developer Console:**
   - Aba **Products**
   - Request: **"Sign In with LinkedIn using OpenID Connect"**
   - Aguardar aprovação (pode levar 24-48h)

### 4. **Popup Bloqueado pelo Browser**

#### ❌ **Problema:**
```
❌ Popup blocked!
⚠️ No opener window found
```

#### ✅ **Solução:**
1. **User Action:** Usuário deve clicar diretamente no botão
2. **Fallback:** Implementar redirect flow como alternativa
3. **Browser Settings:** Verificar se popups estão habilitados

### 5. **Problemas de CORS/Domínio**

#### ❌ **Problema:**
```
❌ Origin https://seu-dominio.com not allowed
❌ CORS policy blocked
```

#### ✅ **Solução:**
1. **LinkedIn Developer Console:**
   - Verificar **App domains** configurados
   - Adicionar domínio de produção

## 🧪 **Ferramentas de Debug**

### 1. **Página de Debug**
Acesse: `https://seu-dominio.com/auth/debug`

**Funcionalidades:**
- ✅ Verificar environment variables
- ✅ Testar popup functionality
- ✅ Testar backend endpoints
- ✅ Executar OAuth flow completo

### 2. **Console Logs**
```javascript
// No browser console, procure por:
🔐 Starting LinkedIn OAuth...
✅ Popup opened
🔄 Exchanging code for token via backend...
✅ Real LinkedIn data received
```

### 3. **Network Tab**
Verificar requests:
- `/api/auth/linkedin/token` → Should return `access_token`
- `/api/auth/linkedin/profile` → Should return user data

## 📋 **Checklist de Diagnóstico**

### **Pré-requisitos LinkedIn:**
- [ ] App criado no LinkedIn Developer
- [ ] Client ID e Client Secret obtidos
- [ ] URLs de callback configuradas
- [ ] Produto "Sign In with LinkedIn" aprovado
- [ ] Scopes `openid profile email` configurados

### **Environment Variables:**
- [ ] `VITE_LINKEDIN_CLIENT_ID` configurado no Vercel
- [ ] `LINKEDIN_CLIENT_SECRET` configurado no Vercel
- [ ] Deploy executado após configurar env vars

### **Funcionalidades Browser:**
- [ ] Popups habilitados
- [ ] JavaScript habilitado
- [ ] Cookies/localStorage funcionando
- [ ] HTTPS em produção

### **Backend Functions:**
- [ ] `/api/auth/linkedin/token` respondendo
- [ ] `/api/auth/linkedin/profile` respondendo
- [ ] Logs visíveis no Vercel Functions

## 🔍 **Debug Step-by-Step**

### **Passo 1: Verificar Environment**
```bash
# Na página /auth/debug, verificar:
- Has Client ID: Yes
- Origin: https://seu-dominio.com
- Redirect: https://seu-dominio.com/auth/linkedin/callback
```

### **Passo 2: Testar Popup**
```bash
# Clicar "Test Popup"
✅ Popup funcionando! = OK
❌ Popup bloqueado! = Problema de browser
```

### **Passo 3: Testar Backend**
```bash
# Clicar "Test Backend"
200 OK = Backend funcionando
4xx/5xx = Problema de configuração
```

### **Passo 4: OAuth Flow Completo**
```bash
# Clicar "Test LinkedIn OAuth"
# Seguir logs no console do browser
```

## 🚀 **Deploy das Correções**

Após implementar correções, execute:

```bash
# 1. Commit alterações
git add .
git commit -m "fix: corrigir OAuth LinkedIn em produção"

# 2. Push para main
git push origin main

# 3. Verificar deploy no Vercel
# 4. Testar em https://seu-dominio.com/auth/debug
```

## 📞 **Suporte Adicional**

### **LinkedIn Developer Support:**
- https://docs.microsoft.com/en-us/linkedin/
- https://www.linkedin.com/developers/apps (console)

### **Vercel Functions:**
- https://vercel.com/docs/functions
- https://vercel.com/docs/concepts/environment-variables

### **Debug URLs:**
- Produção: `https://seu-dominio.com/auth/debug`
- Local: `http://localhost:5173/auth/debug`

---

💡 **Dica:** Sempre teste primeiro em desenvolvimento local antes de debugar produção. Use `npm run dev` e acesse `http://localhost:5173/auth/debug`.