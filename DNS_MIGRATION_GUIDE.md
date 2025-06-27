# 🌐 Guia de Migração DNS: GitHub Pages → Vercel

Este guia explica como migrar o DNS do domínio `tiagopinto.io` do GitHub Pages para o Vercel.

## 🎯 **Objetivo**

Migrar `tiagopinto.io` para apontar para o Vercel, onde o OAuth LinkedIn funciona completamente.

## 📋 **Situação Atual vs Desejada**

### **Atual:**
```
tiagopinto.io (DNS) → GitHub Pages
                   → tiagonpsilva.github.io
                   → Frontend apenas (sem OAuth)

tiagopintoio.vercel.app → Vercel
                       → Frontend + Backend + OAuth ✅
```

### **Desejada:**
```
tiagopinto.io (DNS) → Vercel
                   → Frontend + Backend + OAuth ✅
```

## 🚀 **Passo a Passo da Migração**

### **1. Configurar Domínio Custom no Vercel**

#### **1.1. Acessar Vercel Dashboard**
1. Vá para: https://vercel.com/dashboard
2. Selecione seu projeto (`tiagonpsilva-github-io` ou similar)
3. **"Settings"** → **"Domains"**

#### **1.2. Adicionar Domínio**
1. Clique **"Add"**
2. Digite: `tiagopinto.io`
3. Clique **"Add"**
4. Vercel vai mostrar os DNS records necessários

#### **1.3. Configurar Subdomain (Opcional)**
1. Adicionar também: `www.tiagopinto.io`
2. Isso garante que ambos funcionem

### **2. Obter DNS Records do Vercel**

O Vercel vai fornecer algo como:
```bash
# A Record (para root domain)
Type: A
Name: @
Value: 76.76.19.61

# CNAME (para www)
Type: CNAME  
Name: www
Value: cname.vercel-dns.com
```

**⚠️ IMPORTANTE:** Use os valores exatos que o Vercel fornece, não os exemplos acima!

### **3. Atualizar DNS**

#### **3.1. Identificar Provedor DNS**
Onde você comprou/gerencia `tiagopinto.io`:
- Registro.br
- GoDaddy
- Cloudflare
- Route53
- Outros

#### **3.2. Acessar Painel DNS**
1. Login no provedor do domínio
2. Procure por: **"DNS Management"**, **"DNS Zone"**, ou **"Nameservers"**

#### **3.3. Atualizar Records**
```bash
# Remover records antigos do GitHub Pages:
CNAME: tiagopinto.io → tiagonpsilva.github.io ❌

# Adicionar novos records do Vercel:
A:     tiagopinto.io     → [IP do Vercel] ✅
CNAME: www.tiagopinto.io → [CNAME do Vercel] ✅
```

### **4. Aguardar Propagação DNS**

#### **4.1. Tempo de Propagação**
- **Mínimo:** 15-30 minutos
- **Típico:** 2-6 horas  
- **Máximo:** 24-48 horas

#### **4.2. Verificar Propagação**
```bash
# Online tools:
https://www.whatsmydns.net/
https://dnschecker.org/

# Command line:
nslookup tiagopinto.io
dig tiagopinto.io
```

### **5. Atualizar Configurações**

#### **5.1. LinkedIn Developer Console**
1. Acesse: https://www.linkedin.com/developers/apps
2. Selecione seu app
3. **"Auth"** → **"OAuth 2.0 settings"**
4. **Authorized redirect URLs:**
   ```bash
   # Remover:
   https://tiagopintoio.vercel.app/auth/linkedin/callback
   
   # Adicionar:
   https://tiagopinto.io/auth/linkedin/callback
   ```

#### **5.2. Environment Variables (se necessário)**
Se houver hardcoded URLs no código, verificar:
- Callbacks URLs
- API endpoints
- Redirect URIs

### **6. Desativar GitHub Pages (Opcional)**

#### **6.1. Repository Settings**
1. GitHub: `tiagonpsilva/tiagonpsilva.github.io`
2. **"Settings"** → **"Pages"**
3. **"Source"** → **"None"**

#### **6.2. Manter Redirect (Opcional)**
Criar redirect simples no GitHub Pages:
```html
<!-- index.html mínimo -->
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="refresh" content="0; url=https://tiagopinto.io">
    <title>Redirecionando...</title>
</head>
<body>
    <p>Site movido para <a href="https://tiagopinto.io">tiagopinto.io</a></p>
</body>
</html>
```

## 🧪 **Teste da Migração**

### **Após propagação DNS:**

#### **6.1. Verificar Site**
```bash
# Deve carregar o site do Vercel:
https://tiagopinto.io
https://www.tiagopinto.io
```

#### **6.2. Testar OAuth**
1. Acesse: `https://tiagopinto.io`
2. Aguarde modal de LinkedIn aparecer (30s ou 3 pageviews)
3. Teste autenticação
4. Verificar se callback funciona

#### **6.3. Testar APIs**
```bash
# Devem funcionar (não 404):
https://tiagopinto.io/api/debug
https://tiagopinto.io/api/auth/linkedin/token
```

## 🚨 **Troubleshooting**

### **DNS não propaga:**
- Aguardar mais tempo (até 48h)
- Limpar cache DNS: `ipconfig /flushdns` (Windows) ou `sudo dscacheutil -flushcache` (Mac)
- Testar em modo incógnito

### **Site não carrega:**
- Verificar se A record está correto
- Confirmar se Vercel domain está ativo
- Check Vercel logs

### **OAuth ainda falha:**
- Confirmar LinkedIn URLs atualizadas
- Verificar environment variables no Vercel
- Testar com URL Vercel original primeiro

## 📊 **Checklist Final**

### **Antes da migração:**
- [ ] Vercel project funcionando em `tiagopintoio.vercel.app`
- [ ] Environment variables configuradas no Vercel
- [ ] OAuth testado na URL Vercel

### **Durante migração:**
- [ ] Domínio adicionado no Vercel
- [ ] DNS records atualizados no provedor
- [ ] LinkedIn URLs atualizadas

### **Após migração:**
- [ ] Site carrega em `tiagopinto.io`
- [ ] OAuth funciona completamente
- [ ] APIs respondem (não 404)
- [ ] GitHub Pages desativado

---

💡 **Dica:** Teste sempre primeiro na URL Vercel (`tiagopintoio.vercel.app`) antes de migrar o DNS principal!