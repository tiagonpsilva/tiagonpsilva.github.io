// LinkedIn OAuth Callback Handler - Vercel Serverless Function
export default function handler(req, res) {
  // Set proper headers for HTML
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // HTML response with full debugging
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LinkedIn OAuth - Serverless Function</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            padding: 20px; 
            background: #e8f5e8; 
            margin: 0;
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white; 
            padding: 30px; 
            border-radius: 8px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border: 3px solid #28a745;
        }
        .status { 
            padding: 15px; 
            border-radius: 4px; 
            margin: 10px 0; 
            font-weight: bold;
        }
        .info { background: #d1ecf1; color: #0c5460; }
        .success { background: #d4edda; color: #155724; }
        .error { background: #f8d7da; color: #721c24; }
        .debug { 
            background: #f8f9fa; 
            border: 1px solid #e9ecef; 
            padding: 15px; 
            margin: 15px 0; 
            font-family: monospace; 
            font-size: 12px; 
            max-height: 200px; 
            overflow-y: auto;
        }
        .params { 
            background: #fff3cd; 
            padding: 15px; 
            border-radius: 4px; 
            margin: 15px 0; 
        }
        .success-indicator {
            background: #28a745;
            color: white;
            text-align: center;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 20px;
            font-size: 18px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="success-indicator">
            ✅ FUNÇÃO SERVERLESS FUNCIONANDO!
        </div>
        
        <h2>🔍 LinkedIn OAuth - Debug Serverless</h2>
        
        <div id="status" class="status info">
            ⏳ Processando autenticação via função serverless...
        </div>
        
        <div class="params">
            <h3>📋 URL Atual:</h3>
            <div id="url-display"></div>
        </div>
        
        <div class="params">
            <h3>🔗 Parâmetros OAuth:</h3>
            <div id="params-display"></div>
        </div>
        
        <div class="debug" id="debug-log">
            <div>🚀 Função serverless carregada...</div>
        </div>
    </div>

    <script>
        // Enhanced debugging for serverless function
        const debugLog = document.getElementById('debug-log');
        const statusDiv = document.getElementById('status');
        const urlDiv = document.getElementById('url-display');
        const paramsDiv = document.getElementById('params-display');

        function log(message, type = 'info') {
            console.log(\`[SERVERLESS] \${message}\`);
            const timestamp = new Date().toLocaleTimeString();
            debugLog.innerHTML += \`<div>[\${timestamp}] \${message}</div>\`;
            debugLog.scrollTop = debugLog.scrollHeight;
        }

        function setStatus(message, type = 'info') {
            statusDiv.className = \`status \${type}\`;
            statusDiv.innerHTML = message;
        }

        // Display current URL
        urlDiv.innerHTML = \`<code>\${window.location.href}</code>\`;

        // Parse URL parameters
        log('🔍 Parsing URL parameters from serverless function...');
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');

        // Display parameters
        paramsDiv.innerHTML = \`
            <ul>
                <li><strong>code:</strong> \${code ? '✅ Present (' + code.slice(0, 15) + '...)' : '❌ Missing'}</li>
                <li><strong>state:</strong> \${state ? '✅ Present (' + state + ')' : '❌ Missing'}</li>
                <li><strong>error:</strong> \${error || '✅ None'}</li>
                <li><strong>error_description:</strong> \${errorDescription || '✅ None'}</li>
                <li><strong>window.opener:</strong> \${window.opener ? '✅ Present' : '❌ Missing'}</li>
                <li><strong>opener.closed:</strong> \${window.opener ? (window.opener.closed ? '❌ Closed' : '✅ Open') : 'N/A'}</li>
                <li><strong>Function Type:</strong> ✅ Vercel Serverless</li>
            </ul>
        \`;

        log(\`📋 Parameters from serverless: code=\${!!code}, state=\${!!state}, error=\${error || 'none'}\`);

        // Check for errors first
        if (error) {
            log(\`❌ OAuth error: \${error} - \${errorDescription}\`);
            setStatus(\`❌ Erro OAuth: \${errorDescription || error}\`, 'error');
            
            if (window.opener && !window.opener.closed) {
                log('📤 Sending error to parent window');
                try {
                    window.opener.postMessage({
                        type: 'LINKEDIN_AUTH_ERROR',
                        error: error,
                        errorDescription: errorDescription
                    }, window.location.origin);
                    log('✅ Error message sent');
                } catch (e) {
                    log(\`❌ Failed to send error: \${e.message}\`);
                }
                
                setTimeout(() => {
                    log('🔒 Closing popup...');
                    window.close();
                }, 3000);
            } else {
                log('⚠️ No parent window for error reporting');
            }
            return;
        }

        // Check for missing parameters
        if (!code) {
            log('❌ Authorization code missing');
            setStatus('❌ Código de autorização ausente', 'error');
            setTimeout(() => window.close(), 2000);
            return;
        }

        if (!state) {
            log('❌ State parameter missing');
            setStatus('❌ Parâmetro state ausente', 'error');
            setTimeout(() => window.close(), 2000);
            return;
        }

        // Success case
        log('✅ All parameters present - processing via serverless function');
        setStatus('✅ Parâmetros OK - enviando para janela pai via serverless...', 'success');

        if (window.opener && !window.opener.closed) {
            log('📤 Sending success message to parent window');
            
            try {
                window.opener.postMessage({
                    type: 'LINKEDIN_AUTH_CODE',
                    code: code,
                    state: state
                }, window.location.origin);
                
                log('✅ Success message sent from serverless function!');
                setStatus('✅ Dados enviados via serverless! Fechando popup...', 'success');
                
                setTimeout(() => {
                    log('🔒 Closing popup...');
                    window.close();
                }, 2000);
                
            } catch (e) {
                log(\`❌ Error sending message: \${e.message}\`);
                setStatus(\`❌ Erro ao enviar: \${e.message}\`, 'error');
            }
            
        } else {
            log('⚠️ No parent window found');
            setStatus('⚠️ Janela pai não encontrada', 'error');
            
            // Fallback for mobile/redirect flow
            try {
                sessionStorage.setItem('linkedin_oauth_result', JSON.stringify({
                    code: code,
                    state: state
                }));
                log('💾 Data stored in sessionStorage for redirect flow');
                setStatus('💾 Dados salvos - redirecionando...', 'info');
                
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
                
            } catch (e) {
                log(\`❌ Storage error: \${e.message}\`);
                setStatus(\`❌ Erro de armazenamento: \${e.message}\`, 'error');
            }
        }
    </script>
</body>
</html>`;

  res.status(200).send(html);
}