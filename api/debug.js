// Vercel API Route for LinkedIn OAuth Debug
export default async function handler(req, res) {
  const debugHtml = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🔧 LinkedIn OAuth Debug - Tiago Pinto</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0f0f23;
            color: #e5e5e5;
            margin: 0;
            padding: 20px;
            line-height: 1.6;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .card {
            background: #1a1a2e;
            border: 1px solid #333;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        .mono {
            font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
            font-size: 14px;
        }
        .status {
            display: flex;
            align-items: center;
            margin: 8px 0;
        }
        .status-icon {
            margin-right: 8px;
            font-size: 16px;
        }
        button {
            background: #0066cc;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            margin: 5px;
            font-size: 14px;
            font-weight: 500;
        }
        button:hover { background: #0052a3; }
        button.green { background: #28a745; }
        button.green:hover { background: #1e7e34; }
        button.orange { background: #fd7e14; }
        button.orange:hover { background: #e8690b; }
        .success { color: #28a745; }
        .error { color: #dc3545; }
        .warning { color: #ffc107; }
        pre {
            background: #0d1117;
            padding: 16px;
            border-radius: 6px;
            overflow-x: auto;
            border: 1px solid #30363d;
        }
        .log {
            background: #0d1117;
            border: 1px solid #30363d;
            border-radius: 6px;
            padding: 12px;
            height: 200px;
            overflow-y: auto;
            font-family: monospace;
            font-size: 12px;
            white-space: pre-wrap;
        }
        h1 {
            text-align: center;
            margin-bottom: 30px;
            color: #58a6ff;
        }
        h2 {
            color: #58a6ff;
            border-bottom: 1px solid #333;
            padding-bottom: 8px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 LinkedIn OAuth Debug Tool</h1>
        
        <!-- Environment Info from Server -->
        <div class="card">
            <h2>🌐 Server Environment</h2>
            <div class="mono">
                <div class="status">
                    <span class="status-icon">🔑</span>
                    <span>VITE_LINKEDIN_CLIENT_ID: ${process.env.VITE_LINKEDIN_CLIENT_ID ? '✅ Configured' : '❌ Missing'}</span>
                </div>
                <div class="status">
                    <span class="status-icon">🔑</span>
                    <span>LINKEDIN_CLIENT_ID: ${process.env.LINKEDIN_CLIENT_ID ? '✅ Configured' : '❌ Missing'}</span>
                </div>
                <div class="status">
                    <span class="status-icon">🔒</span>
                    <span>LINKEDIN_CLIENT_SECRET: ${process.env.LINKEDIN_CLIENT_SECRET ? '✅ Configured' : '❌ Missing'}</span>
                </div>
                <div class="status">
                    <span class="status-icon">🌍</span>
                    <span>Environment: ${process.env.NODE_ENV || 'unknown'}</span>
                </div>
            </div>
        </div>
        
        <div class="grid">
            <!-- Status Atual -->
            <div class="card">
                <h2>📊 Status Atual</h2>
                <div class="mono">
                    <div class="status">
                        <span class="status-icon">🔐</span>
                        <span>Authenticated: <span id="auth-status">Checking...</span></span>
                    </div>
                    <div class="status">
                        <span class="status-icon">👤</span>
                        <span>User: <span id="user-name">None</span></span>
                    </div>
                    <div class="status">
                        <span class="status-icon">📧</span>
                        <span>Email: <span id="user-email">None</span></span>
                    </div>
                </div>
            </div>

            <!-- Client Environment -->
            <div class="card">
                <h2>🌍 Client Environment</h2>
                <div class="mono">
                    <div class="status">
                        <span class="status-icon">🌐</span>
                        <span>Origin: <span id="origin"></span></span>
                    </div>
                    <div class="status">
                        <span class="status-icon">📍</span>
                        <span>Redirect: <span id="redirect-uri"></span></span>
                    </div>
                    <div class="status">
                        <span class="status-icon">🕒</span>
                        <span>Timestamp: <span id="timestamp"></span></span>
                    </div>
                </div>
            </div>

            <!-- Testes -->
            <div class="card">
                <h2>🧪 Testes</h2>
                <div>
                    <button onclick="testPopup()">Test Popup</button>
                    <button class="green" onclick="testBackend()">Test Backend</button>
                    <button class="orange" onclick="testLinkedInOAuth()">LinkedIn OAuth</button>
                    <button onclick="clearStorage()">Clear Storage</button>
                </div>
            </div>

            <!-- Browser Info -->
            <div class="card">
                <h2>🌐 Browser</h2>
                <div class="mono">
                    <div class="status">
                        <span class="status-icon">🍪</span>
                        <span>Cookies: <span id="cookies-enabled"></span></span>
                    </div>
                    <div class="status">
                        <span class="status-icon">💾</span>
                        <span>LocalStorage: <span id="localstorage-enabled"></span></span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Logs -->
        <div class="card">
            <h2>📋 Debug Logs</h2>
            <div id="debug-log" class="log">Iniciando debug...\n</div>
            <button onclick="clearLogs()">Clear Logs</button>
        </div>

        <!-- Quick Actions -->
        <div class="card">
            <h2>⚡ Quick Actions</h2>
            <p>Para testar OAuth completo na aplicação principal:</p>
            <div>
                <a href="/" style="text-decoration: none;">
                    <button>← Voltar ao Site</button>
                </a>
                <a href="/?/auth/debug" style="text-decoration: none;">
                    <button class="green">Tentar React Debug</button>
                </a>
            </div>
        </div>
    </div>

    <script>
        // Debug logging
        function log(message) {
            const timestamp = new Date().toLocaleTimeString();
            const logElement = document.getElementById('debug-log');
            logElement.textContent += \`[\${timestamp}] \${message}\\n\`;
            logElement.scrollTop = logElement.scrollHeight;
            console.log(message);
        }

        // Initialize debug info
        function initDebug() {
            log('🔧 Iniciando LinkedIn OAuth Debug...');
            
            // Environment info
            const origin = window.location.origin;
            const redirectUri = \`\${origin}/auth/linkedin/callback\`;
            
            document.getElementById('origin').textContent = origin;
            document.getElementById('redirect-uri').textContent = redirectUri;
            document.getElementById('timestamp').textContent = new Date().toLocaleString();
            
            // Test browser capabilities
            document.getElementById('cookies-enabled').textContent = navigator.cookieEnabled ? '✅ Enabled' : '❌ Disabled';
            
            try {
                localStorage.setItem('test', 'test');
                localStorage.removeItem('test');
                document.getElementById('localstorage-enabled').textContent = '✅ Enabled';
            } catch (e) {
                document.getElementById('localstorage-enabled').textContent = '❌ Disabled';
                log('❌ LocalStorage não disponível: ' + e.message);
            }
            
            // Check existing auth
            checkExistingAuth();
            log('✅ Debug inicializado com sucesso');
        }

        function checkExistingAuth() {
            try {
                const userData = localStorage.getItem('linkedin_user');
                if (userData) {
                    const user = JSON.parse(userData);
                    document.getElementById('auth-status').textContent = '✅ Yes';
                    document.getElementById('auth-status').className = 'success';
                    document.getElementById('user-name').textContent = user.name || 'Unknown';
                    document.getElementById('user-email').textContent = user.email || 'Unknown';
                    log('✅ Usuário autenticado encontrado: ' + user.name);
                } else {
                    document.getElementById('auth-status').textContent = '❌ No';
                    document.getElementById('auth-status').className = 'error';
                    log('ℹ️ Nenhum usuário autenticado encontrado');
                }
            } catch (e) {
                log('❌ Erro ao verificar autenticação: ' + e.message);
            }
        }

        function testPopup() {
            log('🧪 Testando popup...');
            try {
                const popup = window.open('about:blank', 'test-popup', 'width=100,height=100');
                if (popup) {
                    popup.close();
                    log('✅ Popup funcionando!');
                    alert('✅ Popup funcionando!');
                } else {
                    log('❌ Popup bloqueado!');
                    alert('❌ Popup bloqueado pelo browser!');
                }
            } catch (e) {
                log('❌ Erro no teste de popup: ' + e.message);
                alert('❌ Erro no teste de popup: ' + e.message);
            }
        }

        async function testBackend() {
            log('🧪 Testando backend /api/auth/linkedin/token...');
            try {
                const response = await fetch('/api/auth/linkedin/token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code: 'test_code_for_debug' })
                });
                
                const data = await response.text();
                log(\`🌐 Backend response: \${response.status}\`);
                log(\`📄 Response data: \${data}\`);
                
                if (response.status === 400 && data.includes('Authorization code required')) {
                    log('✅ Backend está funcionando! (Erro esperado com código de teste)');
                    alert('✅ Backend funcionando!\\n\\nRecebeu erro esperado: "Authorization code required"\\n\\nIsso significa que as environment variables estão configuradas.');
                } else {
                    alert(\`Backend Response:\\nStatus: \${response.status}\\nBody: \${data}\`);
                }
            } catch (error) {
                log('❌ Erro no backend: ' + error.message);
                alert('❌ Backend Error: ' + error.message);
            }
        }

        function testLinkedInOAuth() {
            log('🧪 Redirecionando para teste OAuth na aplicação principal...');
            window.location.href = '/';
        }

        function clearStorage() {
            log('🧹 Limpando storage...');
            try {
                localStorage.removeItem('linkedin_user');
                localStorage.removeItem('user_engagement');
                sessionStorage.removeItem('linkedin_oauth_state');
                log('✅ Storage limpo');
                checkExistingAuth();
            } catch (e) {
                log('❌ Erro ao limpar storage: ' + e.message);
            }
        }

        function clearLogs() {
            document.getElementById('debug-log').textContent = 'Logs limpos...\\n';
        }

        // Initialize when page loads
        window.addEventListener('load', initDebug);
    </script>
</body>
</html>
  `;

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(debugHtml);
}