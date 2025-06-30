import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Activity, AlertTriangle, CheckCircle, TrendingUp, Clock, Shield } from 'lucide-react'
import { intelligentMonitoring, AlertEvent, PerformanceBaseline } from '../utils/intelligentMonitoring'
import { useMetrics } from '../contexts/MetricsContext'

interface MonitoringDashboardProps {
  isVisible: boolean
  onClose: () => void
}

const MonitoringDashboard: React.FC<MonitoringDashboardProps> = ({ isVisible, onClose }) => {
  const [status, setStatus] = useState<any>(null)
  const [alerts, setAlerts] = useState<AlertEvent[]>([])
  const [baselines, setBaselines] = useState<PerformanceBaseline[]>([])
  const { exportMetrics } = useMetrics()

  useEffect(() => {
    if (isVisible) {
      updateDashboard()
      const interval = setInterval(updateDashboard, 5000) // Update every 5 seconds
      return () => clearInterval(interval)
    }
  }, [isVisible])

  const updateDashboard = () => {
    setStatus(intelligentMonitoring.getMonitoringStatus())
    setAlerts(intelligentMonitoring.getRecentAlerts(20))
    setBaselines(intelligentMonitoring.getPerformanceBaselines())
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-50 border-red-200'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'info': return 'text-blue-500 bg-blue-50 border-blue-200'
      default: return 'text-gray-500 bg-gray-50 border-gray-200'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />
      case 'warning': return <Clock className="h-4 w-4" />
      case 'info': return <Activity className="h-4 w-4" />
      default: return <CheckCircle className="h-4 w-4" />
    }
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const formatValue = (value: number) => {
    if (value > 1000) {
      return `${(value / 1000).toFixed(1)}k`
    }
    return value.toFixed(2)
  }

  const handleExportData = () => {
    const monitoringData = intelligentMonitoring.exportMonitoringData()
    const metricsData = exportMetrics()
    
    const exportData = {
      timestamp: new Date().toISOString(),
      monitoring: monitoringData,
      metrics: metricsData
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `monitoring-report-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8" />
              <div>
                <h2 className="text-2xl font-bold">Monitoring Dashboard</h2>
                <p className="text-blue-100">Real-time system monitoring and alerts</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleExportData}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors"
              >
                Export Data
              </button>
              <button
                onClick={onClose}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Status Overview */}
          {status && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">Status</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {status.enabled ? 'Active' : 'Disabled'}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Active Rules</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                      {status.activeRules}/{status.totalRules}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Recent Alerts</p>
                    <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                      {status.recentAlerts}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-500" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Baselines</p>
                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                      {status.performanceBaselines}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Alerts */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
                Recent Alerts
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {alerts.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No recent alerts
                  </p>
                ) : (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-2">
                          {getSeverityIcon(alert.severity)}
                          <div className="flex-1">
                            <p className="font-medium text-sm">{alert.ruleName}</p>
                            <p className="text-xs opacity-75 mt-1">{alert.message}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs opacity-60">
                              <span>Value: {formatValue(alert.value)}</span>
                              <span>Threshold: {formatValue(alert.threshold)}</span>
                              <span>{formatTimestamp(alert.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Performance Baselines */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-purple-500" />
                Performance Baselines
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {baselines.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No baselines established yet
                  </p>
                ) : (
                  baselines.map((baseline) => (
                    <div
                      key={baseline.metric}
                      className="p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
                            {baseline.metric}
                          </p>
                          <div className="grid grid-cols-3 gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                            <div>
                              <span className="block font-medium">Avg</span>
                              <span>{formatValue(baseline.average)}</span>
                            </div>
                            <div>
                              <span className="block font-medium">Min/Max</span>
                              <span>{formatValue(baseline.min)} / {formatValue(baseline.max)}</span>
                            </div>
                            <div>
                              <span className="block font-medium">Samples</span>
                              <span>{baseline.sampleCount}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* System Health Metrics */}
          <div className="mt-6 bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-green-500" />
              System Health
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {Math.round((performance as any).memory?.usedJSHeapSize / 1024 / 1024) || 0} MB
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Memory Usage</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {(navigator as any).connection?.downlink?.toFixed(1) || 'N/A'} Mbps
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Connection Speed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {alerts.filter(a => a.timestamp > Date.now() - 3600000).length}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Alerts (1h)</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default MonitoringDashboard