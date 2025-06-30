# 🧪 Guia de Testes - Sistema de Observabilidade

Este guia te ajudará a testar completamente o sistema de observabilidade implementado.

## 📋 **Pré-requisitos**

### 1. Configuração de Ambiente
```bash
# 1. Copie o arquivo de exemplo
cp .env.example .env.local

# 2. Edite o .env.local com seus tokens
nano .env.local
```

### 2. Tokens Necessários

#### 🎯 **Para Testes Básicos (Obrigatório)**
- **Mixpanel Token**: Vá em [Mixpanel Settings](https://mixpanel.com/settings/project)
  ```
  VITE_MIXPANEL_TOKEN_DEV=seu_token_dev_aqui
  VITE_ANALYTICS_ENABLED=true
  ```

#### 🚀 **Para Testes Avançados (Opcional)**
- **DataDog**: Vá em [DataDog API Keys](https://app.datadoghq.com/organization-settings/api-keys)
  ```
  VITE_DATADOG_APPLICATION_ID=seu_app_id_aqui
  VITE_DATADOG_CLIENT_TOKEN=seu_client_token_aqui
  ```

## 🏃 **Iniciando os Testes**

### 1. Iniciar o Ambiente de Desenvolvimento
```bash
npm run dev
```

### 2. Acessar a Aplicação
Abra: http://localhost:5173

## 🔍 **Roteiro de Testes Completo**

### **Fase 1: Verificação Básica** ✅

1. **Console do Browser**
   - Abra as DevTools (F12)
   - Vá na aba Console
   - Procure por mensagens: `📊 Analytics ENABLED` e `🎯 OpenTelemetry initialized`

2. **Network Tab**
   - Abra a aba Network
   - Recarregue a página
   - Procure por requests para `api.mixpanel.com`

### **Fase 2: Dashboard de Monitoring** 🎛️

1. **Abrir Dashboard**
   - Pressione `Ctrl+M` (ou `Cmd+M` no Mac)
   - OU clique no ícone 🔄 no header (só aparece em desenvolvimento)

2. **Verificar Componentes**
   - Status: Deve mostrar "Active"
   - Active Rules: Deve mostrar várias regras configuradas
   - Recent Alerts: Inicialmente vazio
   - Performance Baselines: Será populado conforme uso

### **Fase 3: Testes de Interação** 👆

1. **Navegação**
   - Clique em diferentes seções do menu
   - Navegue para /blog, /cases, /contact
   - Volte para home

2. **Social Links**
   - Clique nos ícones sociais (GitHub, LinkedIn, Email, WhatsApp)
   - Cada clique deve gerar métricas

3. **Tema Toggle**
   - Alterne entre modo claro/escuro
   - Observe as métricas de interação

### **Fase 4: Métricas Avançadas** 📊

1. **Scroll Tracking**
   - Role a página lentamente
   - Marcos em 25%, 50%, 75%, 100% são trackados

2. **Tempo na Página**
   - Fique em uma página por ~30 segundos
   - Navegue para outra seção
   - Métricas de engagement são calculadas

3. **Performance Monitoring**
   - Recarregue a página várias vezes
   - Performance baselines são estabelecidas automaticamente

### **Fase 5: Sistema de Alertas** 🚨

1. **Simular Erros**
   ```javascript
   // No console do browser, execute:
   throw new Error("Teste de erro para observabilidade")
   ```

2. **Simular Métricas Altas**
   ```javascript
   // No console do browser:
   window.dispatchEvent(new CustomEvent('test-metric', { 
     detail: { metric: 'page.load_time', value: 6000 } 
   }))
   ```

## 📱 **Testes Mobile**

1. **Responsive**
   - Teste em diferentes tamanhos de tela
   - Use as DevTools para simular mobile

2. **Touch Events**
   - Em dispositivos móveis, todas as interações são trackadas

## 🔧 **Debug e Troubleshooting**

### **Problemas Comuns**

1. **Analytics não funciona**
   ```bash
   # Verifique se as variáveis estão carregadas
   echo $VITE_MIXPANEL_TOKEN_DEV
   
   # Reinicie o servidor
   npm run dev
   ```

2. **Dashboard não abre**
   - Certifique-se que está em modo development
   - Tente atualizar a página e pressionar Ctrl+M novamente

3. **Sem métricas no dashboard**
   - Interaja mais com a aplicação
   - Métricas levam alguns segundos para aparecer

### **Logs Úteis**

Abra o Console e procure por:
- `📊 Analytics ENABLED` - Mixpanel funcionando
- `🎯 OpenTelemetry initialized` - Telemetria ativa
- `🔭 Telemetry enabled` - Monitoring ativo
- `📈 Business Metric:` - Métricas de negócio
- `🚨 Alert:` - Alertas do sistema

## 📈 **Verificando Dados**

### **Mixpanel**
1. Vá em [Mixpanel](https://mixpanel.com)
2. Acesse seu projeto
3. Em "Events" você verá todos os eventos trackados

### **Console Logs** (Desenvolvimento)
```javascript
// Para ver todas as métricas coletadas:
window.exportMetrics = () => {
  console.log(metricsCollector.exportMetrics())
}

// Para ver status do monitoring:
window.monitoringStatus = () => {
  console.log(intelligentMonitoring.getMonitoringStatus())
}
```

## 🎯 **Checklist de Testes**

- [ ] ✅ Servidor rodando em http://localhost:5173
- [ ] ✅ Console mostra analytics habilitado
- [ ] ✅ Dashboard abre com Ctrl+M
- [ ] ✅ Métricas aparecem no Network tab
- [ ] ✅ Navegação trackada corretamente
- [ ] ✅ Interações sociais funcionam
- [ ] ✅ Scroll tracking ativo
- [ ] ✅ Alertas configurados
- [ ] ✅ Performance baselines sendo criadas
- [ ] ✅ Mobile responsivo

## 🚀 **Próximos Passos**

Após os testes locais, você pode:
1. Fazer deploy para staging/produção
2. Configurar alertas reais no DataDog
3. Criar dashboards personalizados
4. Integrar com ferramentas de CI/CD

## 💡 **Dicas Extras**

- Use `localStorage.clear()` para resetar dados de sessão
- Teste em janela anônima para simular novo usuário
- Use diferentes navegadores para testes cross-browser
- O sistema funciona offline (métricas são enfileiradas)

Happy Testing! 🎉