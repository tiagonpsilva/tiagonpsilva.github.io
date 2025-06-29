# Diagramas de Sequência - Autenticação LinkedIn

## Fluxo OAuth Completo - Desktop (Popup Strategy)

```mermaid
sequenceDiagram
    participant U as Usuário
    participant SPA as React SPA
    participant P as Popup Window
    participant API as Vercel API
    participant L as LinkedIn API
    participant M as Mixpanel

    Note over U,M: Fluxo Desktop - Estratégia Popup

    U->>SPA: Clica "Conectar LinkedIn"
    SPA->>M: Track "LinkedIn OAuth Initiated"
    
    SPA->>SPA: Gera state parameter (CSRF)
    SPA->>SPA: Salva state no sessionStorage
    
    SPA->>P: window.open(authUrl + state)
    Note over P: Popup: linkedin.com/oauth/v2/authorization
    
    alt Popup Bloqueado
        P-->>SPA: null (popup blocked)
        SPA->>M: Track "LinkedIn OAuth Popup Blocked"
        SPA->>SPA: Salva return URL
        SPA->>U: Redirect para LinkedIn
        Note over SPA: Fallback para estratégia redirect
    else Popup Permitido
        P->>L: GET /oauth/v2/authorization
        L->>P: Exibe tela de autorização
        U->>P: Autoriza aplicação
        P->>API: Redirect para /auth/linkedin/callback?code=X&state=Y
        
        API->>API: Valida state parameter
        alt State Inválido
            API->>P: Erro CSRF - state mismatch
            P->>SPA: postMessage(error)
            SPA->>M: Track "Authentication Error"
        else State Válido
            API->>L: POST /oauth/v2/accessToken (code exchange)
            L->>API: access_token + expires_in
            
            API->>L: GET /v2/userinfo (Bearer token)
            L->>API: User profile data
            
            API->>API: Sanitiza e valida dados
            API->>P: Success page com postMessage
            P->>SPA: postMessage(userData)
            
            SPA->>SPA: Valida userData recebida
            SPA->>SPA: Salva no localStorage
            SPA->>M: Identify user + Track "User Authenticated"
            P->>P: window.close()
            SPA->>U: Atualiza UI - usuário logado
        end
    end
```

## Fluxo OAuth Mobile (Redirect Strategy)

```mermaid
sequenceDiagram
    participant U as Usuário Mobile
    participant SPA as React SPA
    participant CB as Callback Page
    participant API as Vercel API
    participant L as LinkedIn API
    participant M as Mixpanel

    Note over U,M: Fluxo Mobile - Estratégia Redirect

    U->>SPA: Clica "Conectar LinkedIn"
    SPA->>SPA: Detecta dispositivo mobile
    SPA->>M: Track "LinkedIn OAuth Initiated" (mobile)
    
    SPA->>SPA: Gera state parameter
    SPA->>SPA: Salva state + return_url no sessionStorage
    
    SPA->>L: window.location.href = authUrl
    Note over SPA,L: Redirect completo para LinkedIn
    
    L->>U: Exibe tela de autorização mobile
    U->>L: Autoriza aplicação
    
    L->>CB: Redirect para /auth/linkedin/callback?code=X&state=Y
    
    CB->>CB: Recupera state do sessionStorage
    CB->>CB: Valida state parameter
    
    alt State Inválido
        CB->>CB: Limpa sessionStorage
        CB->>SPA: Redirect para / (erro)
        SPA->>M: Track "Authentication Error" (CSRF)
    else State Válido
        CB->>API: POST /api/auth/linkedin/token
        Note over CB,API: { code, state, redirect_uri }
        
        API->>L: POST /oauth/v2/accessToken
        L->>API: access_token
        
        CB->>API: GET /api/auth/linkedin/profile
        Note over CB,API: Bearer: access_token
        
        API->>L: GET /v2/userinfo
        L->>API: User profile data
        API->>CB: Sanitized user data
        
        CB->>CB: Valida e salva userData no localStorage
        CB->>CB: Recupera return_url do sessionStorage
        CB->>SPA: Redirect para return_url
        
        SPA->>SPA: Detecta userData no localStorage
        SPA->>M: Identify user + Track "User Authenticated"
        SPA->>U: Atualiza UI - usuário logado
    end
```

## Error Handling Flow

```mermaid
sequenceDiagram
    participant U as Usuário
    participant SPA as React SPA
    participant EH as Error Handler
    participant RM as Retry Manager
    participant M as Mixpanel

    Note over U,M: Sistema de Tratamento de Erros

    U->>SPA: Ação que causa erro
    SPA->>SPA: Operação falha (ex: network error)
    
    SPA->>EH: AuthErrorHandler.handleError(error)
    EH->>EH: Classifica tipo de erro
    EH->>EH: Gera mensagem user-friendly
    EH->>EH: Determina se é retryable
    
    EH->>M: Track "Authentication Error"
    EH->>SPA: Retorna AuthError object
    
    SPA->>U: Exibe error message + ações
    
    alt Erro Retryable
        U->>SPA: Clica "Tentar Novamente"
        SPA->>RM: Verifica se pode retry
        
        alt Tem Retries Restantes
            RM->>RM: Calcula delay (exponential backoff)
            RM->>U: Mostra countdown timer
            RM->>SPA: Executa retry após delay
            SPA->>SPA: Tenta operação novamente
            
            alt Retry Sucesso
                SPA->>EH: Limpa error state
                SPA->>M: Track "Authentication Retry Success"
                SPA->>U: Operação completa
            else Retry Falha
                SPA->>EH: Novo error (com context de retry)
                EH->>RM: Incrementa retry count
                Note over RM: Loop até max retries
            end
        else Max Retries Atingido
            RM->>SPA: Erro final (não retryable)
            SPA->>U: Mostra erro final + contato suporte
            SPA->>M: Track "Authentication Max Retries Reached"
        end
    else Erro Não-Retryable
        SPA->>U: Mostra erro + instruções específicas
        SPA->>U: Botão "Método Alternativo" se aplicável
    end
```

## Data Validation & Sanitization

```mermaid
sequenceDiagram
    participant API as LinkedIn API
    participant CB as Callback/SPA
    participant V as Validator
    participant S as Storage
    participant SPA as React App

    Note over API,SPA: Validação e Sanitização de Dados

    API->>CB: Raw user data from OAuth
    Note over API,CB: Pode conter dados maliciosos/corrompidos
    
    CB->>V: validateUserData(rawData)
    
    V->>V: Verifica se é objeto válido
    alt Dados Inválidos/Null
        V->>CB: Retorna null
        CB->>SPA: Falha silenciosa, mantém usuário anônimo
    else Dados Válidos
        V->>V: Sanitiza string fields (remove HTML/JS)
        V->>V: Valida email format
        V->>V: Valida URLs (picture, profile)
        V->>V: Limita tamanho de strings (500 chars)
        
        alt Campo Name Faltando
            V->>V: Usa email prefix como fallback
            alt Email Também Inválido
                V->>V: Usa "Usuário LinkedIn"
            end
        end
        
        V->>V: Cria objeto sanitizado
        V->>CB: Retorna LinkedInUser válido
        
        CB->>S: Salva dados sanitizados
        
        alt localStorage Indisponível (iOS Safari)
            S->>S: Usa memory fallback
            Note over S: Dados persistem apenas na sessão
        else localStorage Disponível
            S->>S: Persiste no localStorage
        end
        
        CB->>SPA: Usuário autenticado com dados limpos
    end
```

## Concurrency Control & State Management

```mermaid
sequenceDiagram
    participant U1 as Tab 1
    participant U2 as Tab 2
    participant CC as Concurrency Control
    participant S as Shared Storage
    participant M as Mixpanel

    Note over U1,M: Controle de Concorrência Multi-Tab

    U1->>CC: attemptAuth() - inicia processo
    CC->>S: Seta flag "auth_in_progress"
    CC->>U1: Permite prosseguir
    
    par Processo Tab 1
        U1->>U1: Executando OAuth flow...
    and Tab 2 Simultânea
        U2->>CC: attemptAuth() - segunda tentativa
        CC->>S: Verifica flag "auth_in_progress"
        CC->>U2: Bloqueia - auth já em progresso
        CC->>M: Track "Concurrent Auth Blocked"
    end
    
    alt OAuth Sucesso Tab 1
        U1->>S: Salva user data
        U1->>CC: clearAuthProgress()
        CC->>S: Remove flag "auth_in_progress"
        
        Note over U1,U2: Storage event propagation
        S->>U2: storage event - user data changed
        U2->>U2: Atualiza state com novo user
        U2->>M: Track "Auth State Sync"
        
    else OAuth Falha Tab 1
        U1->>CC: clearAuthProgress()
        CC->>S: Remove flag "auth_in_progress"
        U2->>U2: Pode tentar auth novamente
    
    else Timeout (10 min)
        CC->>CC: Auto-clear em timeout
        CC->>S: Remove flag "auth_in_progress"
        CC->>M: Track "Auth Timeout Cleanup"
    end
```

## Analytics Event Flow

```mermaid
sequenceDiagram
    participant U as Usuário
    participant SPA as React SPA
    participant AC as Analytics Context
    participant M as Mixpanel API
    participant D as Dashboard

    Note over U,D: Fluxo de Events Analytics

    U->>SPA: Inicia sessão no site
    SPA->>AC: Inicializa Mixpanel
    AC->>AC: Detecta environment (dev/prod)
    AC->>M: Inicializa com token apropriado
    
    SPA->>AC: Track "Page View"
    AC->>M: Envia event com properties
    Note over AC,M: user_agent, referrer, utm_params
    
    U->>SPA: Clica "Conectar LinkedIn"
    SPA->>AC: Track "LinkedIn OAuth Initiated"
    AC->>M: Envia com device/popup info
    
    alt Auth Sucesso
        SPA->>AC: identify(user.id) + setUserProperties
        AC->>M: Associa events ao user ID
        SPA->>AC: Track "User Authenticated"
        
        U->>SPA: Navega para artigo
        SPA->>AC: Track "Article Started"
        
        U->>SPA: Scroll no artigo
        SPA->>AC: Track "Article Milestone" (25%, 50%, 75%)
        
        U->>SPA: Completa leitura
        SPA->>AC: Track "Article Completed"
        
    else Auth Falha
        SPA->>AC: Track "Authentication Error"
        AC->>M: Envia com error details
    end
    
    Note over M,D: Processamento Analytics
    M->>D: Agrega events em dashboards
    D->>D: Calcula métricas (conversion, engagement)
    
    Note over SPA,M: Environment Separation
    alt Development
        AC->>M: Envia para DEV project
        AC->>AC: Console logging detalhado
    else Production  
        AC->>M: Envia para PROD project
        AC->>AC: Logging mínimo
    end
```

## Observações Técnicas

### Timing Considerations
- **Token expiration**: LinkedIn tokens expiram em 60 dias
- **State validation**: State parameters têm TTL de 10 minutos
- **Popup timeout**: Auto-close após 10 minutos para memory cleanup
- **Retry backoff**: 1s, 2s, 4s, 8s (exponential)

### Security Measures
- **CSRF protection**: State parameter validation obrigatória
- **Origin validation**: postMessage origins verificadas
- **Data sanitization**: Todos os dados de user sanitizados
- **XSS prevention**: HTML/JavaScript removidos de inputs

### Error Recovery
- **Automatic fallbacks**: Popup → Redirect quando necessário
- **Storage fallbacks**: localStorage → sessionStorage → memory
- **Network resilience**: Retry com backoff para network errors
- **State recovery**: Restoration de auth state após refresh

### Performance Optimization
- **Lazy loading**: Mixpanel SDK carregado sob demanda
- **Event batching**: Multiple events enviados em batch
- **Asset optimization**: Código minificado e tree-shaken
- **CDN delivery**: Assets servidos via Vercel Edge Network