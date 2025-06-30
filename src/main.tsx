import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize observability stack before any other imports
import { initializeTelemetry } from './utils/telemetry'
import { initializeDataDog } from './utils/datadogConfig'

// Initialize in order: DataDog first for RUM, then OpenTelemetry for custom traces
initializeDataDog()
initializeTelemetry()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)