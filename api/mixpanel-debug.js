// Vercel API Route for Mixpanel Debug
const { withTracing, createSpan } = require('./utils/telemetry')

async function mixpanelDebugHandler(req, res) {
  const debugHtml = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🎯 Mixpanel Debug - Tiago Pinto</title>
    <style>
        body { 
            font-family: monospace; 
            background: #0d1117; 
            color: #e6edf3; 
            padding: 20px; 
            line-height: 1.6;
        }
        .card { 
            background: #161b22; 
            border: 1px solid #30363d; 
            border-radius: 8px; 
            padding: 20px; 
            margin: 10px 0; 
        }
        h1, h2 { color: #58a6ff; }
        .success { color: #56d364; }
        .error { color: #f85149; }
        .warning { color: #f0883e; }
        button { 
            background: #238636; 
            color: white; 
            border: none; 
            padding: 8px 16px; 
            border-radius: 4px; 
            cursor: pointer; 
            margin: 5px; 
        }
        button:hover { background: #2ea043; }
        .log { 
            background: #0d1117; 
            border: 1px solid #30363d; 
            padding: 10px; 
            max-height: 300px; 
            overflow-y: auto; 
            white-space: pre-wrap; 
        }
        .info { color: #79c0ff; }
    </style>
</head>
<body>
    <h1>🎯 Mixpanel Debug Tool</h1>
    
    <div class="card">
        <h2>Environment Variables (Server)</h2>
        <div id="env-vars">
            <div>VITE_MIXPANEL_TOKEN: ${process.env.VITE_MIXPANEL_TOKEN ? '✅ Configured' : '❌ Missing'}</div>
            <div>VITE_MIXPANEL_TOKEN_DEV: ${process.env.VITE_MIXPANEL_TOKEN_DEV ? '✅ Configured' : '❌ Missing'}</div>
            <div>VITE_MIXPANEL_TOKEN_PROD: ${process.env.VITE_MIXPANEL_TOKEN_PROD ? '✅ Configured' : '❌ Missing'}</div>
            <div>VITE_ANALYTICS_ENABLED: ${process.env.VITE_ANALYTICS_ENABLED ? '✅ ' + process.env.VITE_ANALYTICS_ENABLED : '❌ Missing'}</div>
            <div>NODE_ENV: ${process.env.NODE_ENV || 'unknown'}</div>
        </div>
    </div>

    <div class="card">
        <h2>Client-Side Configuration</h2>
        <div id="client-config">Checking...</div>
    </div>

    <div class="card">
        <h2>Mixpanel Status</h2>
        <div id="mixpanel-status">Checking...</div>
    </div>

    <div class="card">
        <h2>Tests</h2>
        <button onclick="testMixpanelInit()">Test Mixpanel Init</button>
        <button onclick="testTrackEvent()">Test Track Event</button>
        <button onclick="checkNetworkRequests()">Check Network</button>
        <button onclick="clearLogs()">Clear Logs</button>
    </div>

    <div class="card">
        <h2>Debug Logs</h2>
        <div id="debug-logs" class="log">Initializing debug...\n</div>
    </div>

    <script>
        function log(message, type = 'info') {
            const timestamp = new Date().toLocaleTimeString();
            const logElement = document.getElementById('debug-logs');
            const colorClass = type === 'error' ? 'error' : type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'info';
            logElement.innerHTML += \`<span class="\${colorClass}">[\${timestamp}] \${message}</span>\n\`;
            logElement.scrollTop = logElement.scrollHeight;
            console.log(message);
        }

        function checkClientConfig() {
            try {
                const config = {
                    hasImportMeta: !!import.meta,
                    isDev: import.meta?.env?.DEV,
                    mode: import.meta?.env?.MODE,
                    mixpanelToken: import.meta?.env?.VITE_MIXPANEL_TOKEN?.substring(0, 8) + '...',
                    mixpanelTokenDev: import.meta?.env?.VITE_MIXPANEL_TOKEN_DEV?.substring(0, 8) + '...',
                    mixpanelTokenProd: import.meta?.env?.VITE_MIXPANEL_TOKEN_PROD?.substring(0, 8) + '...',
                    analyticsEnabled: import.meta?.env?.VITE_ANALYTICS_ENABLED,
                    origin: window.location.origin
                };

                document.getElementById('client-config').innerHTML = Object.entries(config)
                    .map(([key, value]) => \`<div>\${key}: \${value || 'undefined'}</div>\`)
                    .join('');

                log('✅ Client configuration loaded');
                return config;
            } catch (error) {
                log('❌ Error checking client config: ' + error.message, 'error');
                document.getElementById('client-config').innerHTML = '<div class="error">Error: ' + error.message + '</div>';
                return null;
            }
        }

        function checkMixpanelStatus() {
            try {
                const hasMixpanel = !!window.mixpanel;
                const mixpanelLoaded = hasMixpanel && typeof window.mixpanel.track === 'function';
                
                let status = '';
                if (hasMixpanel) {
                    status += '<div class="success">✅ Mixpanel library loaded</div>';
                    if (mixpanelLoaded) {
                        status += '<div class="success">✅ Mixpanel initialized</div>';
                        status += \`<div>Mixpanel config: \${JSON.stringify(window.mixpanel.get_config?.() || 'No config available')}</div>\`;
                    } else {
                        status += '<div class="warning">⚠️ Mixpanel loaded but not initialized</div>';
                    }
                } else {
                    status += '<div class="error">❌ Mixpanel library not loaded</div>';
                }

                document.getElementById('mixpanel-status').innerHTML = status;
                log(hasMixpanel ? '✅ Mixpanel detected' : '❌ Mixpanel not found');
                return { hasMixpanel, mixpanelLoaded };
            } catch (error) {
                log('❌ Error checking Mixpanel status: ' + error.message, 'error');
                return { hasMixpanel: false, mixpanelLoaded: false };
            }
        }

        function testMixpanelInit() {
            log('🧪 Testing Mixpanel initialization...');
            
            const config = checkClientConfig();
            if (!config) return;

            // Try to access Mixpanel configuration function
            try {
                if (window.mixpanel) {
                    log('✅ Mixpanel object exists');
                    
                    // Try to get config
                    const mixpanelConfig = window.mixpanel.get_config?.();
                    if (mixpanelConfig) {
                        log('✅ Mixpanel config: ' + JSON.stringify(mixpanelConfig));
                    } else {
                        log('⚠️ No Mixpanel config available', 'warning');
                    }
                } else {
                    log('❌ Mixpanel object not found', 'error');
                }
            } catch (error) {
                log('❌ Error testing Mixpanel: ' + error.message, 'error');
            }
        }

        function testTrackEvent() {
            log('🧪 Testing track event...');
            
            try {
                if (window.mixpanel && typeof window.mixpanel.track === 'function') {
                    window.mixpanel.track('Debug Test Event', {
                        test_timestamp: new Date().toISOString(),
                        test_source: 'debug_tool',
                        page_url: window.location.href
                    });
                    log('✅ Test event sent successfully', 'success');
                } else {
                    log('❌ Mixpanel track function not available', 'error');
                }
            } catch (error) {
                log('❌ Error sending test event: ' + error.message, 'error');
            }
        }

        function checkNetworkRequests() {
            log('🧪 Monitoring network requests...');
            
            // Monitor network requests for Mixpanel
            const originalFetch = window.fetch;
            window.fetch = function(...args) {
                const url = args[0];
                if (typeof url === 'string' && url.includes('mixpanel')) {
                    log('📡 Mixpanel request detected: ' + url);
                }
                return originalFetch.apply(this, args);
            };
            
            log('✅ Network monitoring enabled for 30 seconds');
            setTimeout(() => {
                window.fetch = originalFetch;
                log('⏹️ Network monitoring disabled');
            }, 30000);
        }

        function clearLogs() {
            document.getElementById('debug-logs').innerHTML = 'Logs cleared...\n';
        }

        // Initialize on load
        window.addEventListener('load', () => {
            log('🔧 Mixpanel Debug Tool initialized');
            checkClientConfig();
            checkMixpanelStatus();
            
            // Try to access the app's Mixpanel configuration
            setTimeout(() => {
                try {
                    // Check if there's a global config function
                    if (window.getMixpanelConfig) {
                        const appConfig = window.getMixpanelConfig();
                        log('📱 App Mixpanel config: ' + JSON.stringify(appConfig));
                    }
                } catch (e) {
                    log('ℹ️ No app config function found');
                }
            }, 2000);
        });
    </script>
</body>
</html>
  `;

  // Track Mixpanel debug page access
  const debugSpan = createSpan('mixpanel.debug_access', {
    'debug.type': 'mixpanel',
    'debug.user_agent': req.headers['user-agent'] || 'unknown',
    'debug.referer': req.headers['referer'] || 'direct',
    'debug.environment': process.env.NODE_ENV || 'unknown'
  })

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(debugHtml);
  
  debugSpan.end()
}

// Export with tracing wrapper
export default withTracing('mixpanel_debug_tool', mixpanelDebugHandler)