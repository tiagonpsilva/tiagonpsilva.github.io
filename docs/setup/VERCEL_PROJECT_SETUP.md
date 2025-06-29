# 🚀 Setup Completo do Projeto no Vercel

## 🚨 **Problema Identificado**

As Vercel Functions retornam 404, indicando problema na configuração do projeto.

## ✅ **Solução: Recriar/Verificar Projeto Vercel**

### **1. Verificar Projeto Atual**

#### **1.1. Acessar Dashboard**
1. Vá para: https://vercel.com/dashboard
2. Procure por: `tiagonpsilva-github-io` ou similar

#### **1.2. Verificar Configurações**
Se projeto existe:
1. **"Settings"** → **"General"**
2. Verificar:
   ```
   Framework Preset: Vite (ou Other)
   Build Command: npm run build (ou deixar vazio)
   Output Directory: dist (ou deixar vazio)  
   Install Command: npm install (ou deixar vazio)
   ```

### **2. Recriar Projeto (Se Necessário)**

#### **2.1. Deletar Projeto Atual**
1. **"Settings"** → **"Advanced"** → **"Delete Project"**
2. Confirmar exclusão

#### **2.2. Criar Novo Projeto**
1. Dashboard → **"Add New"** → **"Project"**
2. **"Import Git Repository"**
3. Escolher: `tiagonpsilva/tiagonpsilva.github.io`

#### **2.3. Configurar Projeto**
```
Project Name: tiagonpsilva-github-io
Framework Preset: Vite
Root Directory: ./
Build Command: [deixar vazio ou npm run build]
Output Directory: [deixar vazio ou dist]
Install Command: [deixar vazio]
```

#### **2.4. Environment Variables**
Após criação, adicionar:
```
VITE_LINKEDIN_CLIENT_ID=seu_client_id_aqui
LINKEDIN_CLIENT_SECRET=seu_client_secret_aqui
VITE_MIXPANEL_TOKEN=seu_mixpanel_token_aqui
```

### **3. Configurar Domínio Custom**

#### **3.1. Adicionar Domínio**
1. **"Settings"** → **"Domains"**
2. Adicionar: `tiagopinto.io`
3. Seguir instruções DNS

### **4. Testar Deploy**

#### **4.1. URLs de Teste**
```bash
# Site principal
https://[projeto].vercel.app

# Function teste
https://[projeto].vercel.app/api/test

# Debug page  
https://[projeto].vercel.app/api/debug
```

#### **4.2. Console Test**
```javascript
// No console do browser:
fetch('/api/test').then(r => r.json()).then(console.log);
```

## 🔧 **Troubleshooting Específico**

### **Se Functions ainda não funcionam:**

#### **Opção 1: Estrutura de Arquivos**
Verificar se `/api/` está na raiz:
```
projeto/
├── api/
│   ├── test.js
│   ├── debug.js
│   └── auth/
│       └── linkedin/
│           ├── token.js
│           └── profile.js
├── src/
├── package.json
└── vercel.json
```

#### **Opção 2: Sintaxe das Functions**
Verificar se todas usam:
```javascript
export default function handler(req, res) {
  // código
}
```

#### **Opção 3: Vercel CLI**
```bash
# Install
npm i -g vercel

# Login
vercel login

# Link projeto
vercel link

# Deploy local
vercel dev

# Deploy produção
vercel --prod
```

## 📊 **Método Alternativo: Deploy Manual**

Se nada funcionar:

### **1. Via Vercel CLI**
```bash
cd /path/to/projeto
npm install -g vercel
vercel login
vercel

# Seguir prompts:
# ? Set up and deploy? Yes
# ? Which scope? [seu-username]
# ? Link to existing project? No
# ? What's your project's name? tiagonpsilva-portfolio
# ? In which directory is your code located? ./
```

### **2. Configurar após deploy CLI**
1. Dashboard → Projeto → **"Settings"**
2. Adicionar environment variables
3. Configurar domínio custom

## 🎯 **Resultado Esperado**

Após setup correto:
- ✅ `https://projeto.vercel.app` carrega
- ✅ `https://projeto.vercel.app/api/test` retorna JSON
- ✅ `https://projeto.vercel.app/api/debug` retorna HTML
- ✅ OAuth LinkedIn funciona

## 📞 **Próximos Passos**

1. **Verificar projeto atual** no dashboard
2. **Recriar se necessário** com configuração correta
3. **Testar URLs** após deploy
4. **Configurar environment variables**
5. **Configurar domínio custom**

---

💡 **Dica:** Às vezes é mais rápido recriar o projeto do zero do que debugar configuração problemática.