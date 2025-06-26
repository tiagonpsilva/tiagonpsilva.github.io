# LinkedIn OAuth Setup Guide

Este guia explica como configurar a autenticação LinkedIn OAuth para o seu portfolio.

## 🔧 **Configuração LinkedIn Developer**

### 1. Criar App LinkedIn
1. Acesse: https://www.linkedin.com/developers/apps
2. Clique em "Create app"
3. Preencha as informações:
   - **App name**: Tiago Portfolio
   - **LinkedIn Page**: (opcional, pode pular)
   - **Privacy Policy URL**: `https://seu-dominio.com/privacy`
   - **App logo**: Upload da sua logo (opcional)

### 2. Configurar OAuth
1. Na aba **Auth**, adicione as URLs de callback:
   ```
   http://localhost:5173/auth/linkedin/callback   # Desenvolvimento
   https://seu-dominio.com/auth/linkedin/callback # Produção
   ```

2. Em **OAuth 2.0 scopes**, adicione:
   - `profile` (informações básicas do perfil)
   - `email` (endereço de email)

### 3. Obter Credenciais
1. Na aba **Auth**, copie:
   - **Client ID**
   - **Client Secret**

---

## ⚙️ **Configuração do Projeto**

### 1. Variáveis de Ambiente

#### Desenvolvimento (`.env.local`):
```bash
# LinkedIn OAuth
VITE_LINKEDIN_CLIENT_ID=sua_client_id_aqui

# Para Cloudflare Pages Functions (se usando)
LINKEDIN_CLIENT_SECRET=sua_client_secret_aqui
```

#### Produção (Cloudflare Pages):
```bash
# Environment Variables no Dashboard Cloudflare:
LINKEDIN_CLIENT_ID=sua_client_id_aqui
LINKEDIN_CLIENT_SECRET=sua_client_secret_aqui
```

### 2. Deploy Functions (Opcional)
Se estiver usando Cloudflare Pages, as functions em `public/_functions/` serão automaticamente deployadas.

---

## 🎯 **Como Funciona**

### Fluxo de Autenticação:
1. **Trigger**: Modal aparece após 3 page views ou 30 segundos
2. **Click**: Usuário clica "Conectar com LinkedIn"
3. **Redirect**: Popup abre com LinkedIn OAuth
4. **Autorização**: Usuário autoriza no LinkedIn
5. **Callback**: LinkedIn redireciona para `/auth/linkedin/callback`
6. **Token Exchange**: Backend troca código por access token
7. **Profile**: Backend busca dados do perfil
8. **Storage**: Dados salvos no localStorage
9. **Identification**: Mixpanel identifica usuário com dados reais

### Dados Coletados:
```json
{
  "id": "linkedin-user-id",
  "name": "João Silva",
  "email": "joao@empresa.com",
  "headline": "Senior Software Engineer",
  "location": "Brazil",
  "industry": "Technology",
  "publicProfileUrl": "https://linkedin.com/in/joao",
  "picture": "https://media.licdn.com/..."
}
```

---

## 📊 **Analytics Melhorados**

### Antes (Usuário Anônimo):
```json
{
  "user_id": "user_1234567890_abc123",
  "session_id": "session_1234567890_xyz",
  "user_type": "anonymous"
}
```

### Depois (Usuário Autenticado):
```json
{
  "user_id": "linkedin-user-id",
  "name": "João Silva",
  "email": "joao@empresa.com", 
  "linkedin_headline": "Senior Software Engineer",
  "linkedin_location": "Brazil",
  "linkedin_industry": "Technology",
  "authenticated_user": true,
  "auth_provider": "linkedin",
  "user_type": "authenticated"
}
```

---

## 🧪 **Testing**

### Desenvolvimento:
1. `npm run dev`
2. Abra http://localhost:5173
3. Navegue por 3+ páginas ou espere 30s
4. Modal aparecerá automaticamente
5. Teste o fluxo completo

### Produção:
1. Deploy no Cloudflare Pages
2. Configure variáveis de ambiente
3. Teste com domínio real

---

## 🔒 **Segurança**

### Implementado:
- **State Parameter**: Proteção CSRF
- **HTTPS Only**: Produção obrigatório
- **Token Scope**: Apenas profile + email
- **Session Storage**: State temporário
- **Local Storage**: Dados persistentes

### Boas Práticas:
- Client Secret nunca exposto no frontend
- Tokens não armazenados permanentemente
- Validação de state parameter
- Error handling robusto

---

## 🚀 **Próximos Passos**

1. **Configurar LinkedIn App** seguindo Seção 1
2. **Adicionar variáveis** conforme Seção 2
3. **Testar localmente** com dev server
4. **Deploy para produção** com environment vars
5. **Monitorar analytics** no Mixpanel

---

## ❓ **Troubleshooting**

### Modal não aparece:
- Verifique se VITE_LINKEDIN_CLIENT_ID está configurado
- Limpe localStorage: `localStorage.clear()`
- Recarregue a página

### OAuth falha:
- Verifique URLs de callback no LinkedIn App
- Confirme Client ID correto
- Verifique console do browser para erros

### Profile não carrega:
- Verifique scopes do LinkedIn App
- Confirme Client Secret no backend
- Teste endpoints das functions

---

## 📞 **Suporte**

Para dúvidas sobre implementação, consulte:
- LinkedIn Developer Docs: https://docs.microsoft.com/en-us/linkedin/
- Cloudflare Pages Functions: https://developers.cloudflare.com/pages/platform/functions/