# 🚀 Guia de Migração: GitHub Pages → Vercel Completo

Este guia explica como migrar completamente do GitHub Pages para o Vercel, centralizando frontend e backend.

## 🎯 **Por que Migrar?**

### ❌ **Problemas Atuais (Deploy Dividido):**
- GitHub Pages: Frontend apenas
- Vercel: Backend apenas
- CORS issues entre domínios
- Environment variables separadas
- API Functions não funcionam

### ✅ **Vantagens do Vercel Completo:**
- Frontend + Backend no mesmo domínio
- Environment variables unificadas
- API Functions funcionam perfeitamente
- Deploy único e automático
- Preview deploys para cada commit
- HTTPS automático

## 🚀 **Passo a Passo da Migração**

### **1. Importar Projeto no Vercel**

#### **1.1. Acessar Vercel Dashboard**
1. Vá para: https://vercel.com/dashboard
2. Faça login com sua conta GitHub
3. Clique **"Add New"** → **"Project"**

#### **1.2. Importar do GitHub**
1. Encontre `tiagonpsilva/tiagonpsilva.github.io`
2. Clique **"Import"**
3. Configure:
   ```
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```
4. Clique **"Deploy"**

### **2. Configurar Environment Variables**

#### **2.1. Acessar Settings**
1. No projeto Vercel → **"Settings"**
2. Menu lateral → **"Environment Variables"**

#### **2.2. Adicionar Variables**
```bash
# Variável 1
Name: VITE_LINKEDIN_CLIENT_ID
Value: [seu_client_id_do_linkedin_developer]
Environment: Production, Preview, Development

# Variável 2
Name: LINKEDIN_CLIENT_SECRET
Value: [seu_client_secret_do_linkedin_developer]
Environment: Production, Preview, Development

# Variável 3 (se usando Mixpanel)
Name: VITE_MIXPANEL_TOKEN
Value: [seu_mixpanel_token]
Environment: Production, Preview, Development
```

#### **2.3. Redeploy**
1. Após adicionar variables, clique **"Redeploy"**
2. Aguarde deploy completar (1-2 minutos)

### **3. Atualizar LinkedIn Developer Console**

#### **3.1. URLs de Callback**
1. Acesse: https://www.linkedin.com/developers/apps
2. Selecione seu app
3. Aba **"Auth"** → **"OAuth 2.0 settings"**
4. **Authorized redirect URLs:**
   ```
   # Remover URLs antigas:
   https://tiagonpsilva.github.io/auth/linkedin/callback
   
   # Adicionar URL nova:
   https://seu-projeto.vercel.app/auth/linkedin/callback
   ```

#### **3.2. Verificar Produtos**
1. Aba **"Products"**
2. Verificar se **"Sign In with LinkedIn using OpenID Connect"** está aprovado
3. Se não estiver, fazer request e aguardar aprovação

### **4. Testar a Migração**

#### **4.1. URLs de Teste**
```bash
# Site principal
https://seu-projeto.vercel.app

# Debug page (React)
https://seu-projeto.vercel.app/auth/debug

# API Functions
https://seu-projeto.vercel.app/api/debug
https://seu-projeto.vercel.app/api/auth/linkedin/token
```

#### **4.2. Checklist de Testes**
- [ ] Site principal carrega
- [ ] Environment variables configuradas (check no /api/debug)
- [ ] API Functions respondem (não 404)
- [ ] LinkedIn OAuth popup abre
- [ ] Callback URL funciona
- [ ] User data é salvo no localStorage
- [ ] Mixpanel tracking funciona

### **5. Configurar Domínio Custom (Opcional)**

#### **5.1. Adicionar Domínio**
1. Vercel Dashboard → **"Settings"** → **"Domains"**
2. Adicionar: `tiagopinto.dev` ou seu domínio
3. Configurar DNS conforme instruções

#### **5.2. Atualizar LinkedIn URLs**
```bash
# Se usar domínio custom, atualizar no LinkedIn:
https://tiagopinto.dev/auth/linkedin/callback
```

### **6. Desativar GitHub Pages (Opcional)**

#### **6.1. Repository Settings**
1. GitHub Repository → **"Settings"**
2. **"Pages"** → **"Source"** → **"None"**
3. Isso para o deploy no GitHub Pages

#### **6.2. Redirect (Opcional)**
Manter um redirect simples no GitHub Pages:
```html
<!-- index.html simples no gh-pages branch -->
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="refresh" content="0; url=https://seu-projeto.vercel.app">
</head>
<body>Redirecionando...</body>
</html>
```

## 🧪 **Teste Rápido Pós-Migração**

### **Console Test:**
```javascript
// No browser console da nova URL:
console.log('Vercel Check:', {
  origin: window.location.origin,
  hasClientId: !!import.meta?.env?.VITE_LINKEDIN_CLIENT_ID,
  clientId: import.meta?.env?.VITE_LINKEDIN_CLIENT_ID?.substring(0, 8) + '...'
});

// Teste API
fetch('/api/debug').then(r => r.text()).then(console.log);
```

## 🚨 **Troubleshooting**

### **Environment Variables não aparecem:**
- Aguardar 2-3 minutos após configurar
- Fazer redeploy manual
- Verificar spelling exato das variáveis

### **LinkedIn OAuth falha:**
- Verificar URLs de callback no LinkedIn Developer
- Confirmar que produto está aprovado
- Testar em modo incógnito

### **API Functions 404:**
- Verificar se `vercel.json` está correto
- Confirmar estrutura de diretórios `/api/`
- Check Vercel Function logs

## 📊 **Benefícios Esperados**

### **Performance:**
- Deploy único mais rápido
- Sem CORS delays
- Functions edge locations

### **Manutenção:**
- Uma plataforma só
- Environment variables centralizadas  
- Logs unificados

### **Funcionalidades:**
- OAuth funcionando 100%
- Analytics completo
- Preview deploys para testing

---

💡 **Dica:** Após migração, o site estará totalmente funcional no Vercel com OAuth LinkedIn funcionando perfeitamente!