// LinkedIn OAuth Callback - responde na URL original via proxy
export default function handler(req, res) {
  // Esta função vai capturar /auth/linkedin/callback via vercel.json
  
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>LinkedIn OAuth - Original URL</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            padding: 20px; 
            background: #ffe6e6; 
            text-align: center;
        }
        .container { 
            max-width: 500px; 
            margin: 0 auto; 
            background: white; 
            padding: 30px; 
            border-radius: 8px;
            border: 3px solid #ff4444;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔴 CALLBACK VIA FUNÇÃO PROXY</h1>
        <p><strong>URL:</strong> ${req.url}</p>
        <p>Se você está vendo isso, a função proxy funcionou!</p>
        <div id="params"></div>
    </div>
    <script>
        const params = new URLSearchParams(window.location.search);
        document.getElementById('params').innerHTML = 
            '<p><strong>Code:</strong> ' + (params.get('code') ? 'Presente' : 'Ausente') + '</p>' +
            '<p><strong>State:</strong> ' + (params.get('state') ? 'Presente' : 'Ausente') + '</p>';
        
        console.log('Proxy callback working!', {
            code: !!params.get('code'),
            state: !!params.get('state')
        });
    </script>
</body>
</html>`;

  res.status(200).send(html);
}