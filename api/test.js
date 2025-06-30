const { withTracing, createSpan } = require('./utils/telemetry')

async function testHandler(req, res) {
  // Track API test access
  const testSpan = createSpan('api.test_access', {
    'test.method': req.method,
    'test.url': req.url,
    'test.user_agent': req.headers['user-agent'] || 'unknown'
  })

  const response = {
    message: 'API funcionando!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    environment: process.env.NODE_ENV || 'unknown'
  }

  res.status(200).json(response);
  testSpan.end()
}

// Export with tracing wrapper
export default withTracing('api_health_test', testHandler)