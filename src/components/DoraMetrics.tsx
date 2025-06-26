import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  Wrench,
  Award,
  Info,
  HelpCircle,
  X
} from 'lucide-react'
import { DoraMetrics as DoraMetricsType, getDoraScoreBadge } from '../utils/doraMetrics'

interface DoraMetricsProps {
  metrics: DoraMetricsType | null
  isLoading?: boolean
  lastUpdated?: Date
}

const CompactMetricItem: React.FC<{
  icon: React.ReactNode
  label: string
  value: string
  score: 'elite' | 'high' | 'medium' | 'low'
}> = ({ icon, label, value, score }) => {
  const getScoreColor = (score: string) => {
    switch (score) {
      case 'elite': return 'text-green-600'
      case 'high': return 'text-blue-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`${getScoreColor(score)}`}>
          {icon}
        </div>
        <span className="text-xs font-medium text-foreground">{label}</span>
      </div>
      <div className="text-right">
        <div className={`text-xs font-bold ${getScoreColor(score)}`}>{value}</div>
      </div>
    </div>
  )
}

const DoraMetrics: React.FC<DoraMetricsProps> = ({ metrics, isLoading = false, lastUpdated }) => {
  const [showInfo, setShowInfo] = useState(false)
  if (isLoading) {
    return (
      <div className="border-t border-muted pt-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 bg-muted rounded animate-pulse"></div>
          <div className="w-16 h-3 bg-muted rounded animate-pulse"></div>
        </div>
        <div className="space-y-1.5">
          {[1, 2].map(i => (
            <div key={i} className="w-full h-6 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="border-t border-muted pt-3">
        <div className="flex items-center gap-2 mb-2 text-muted-foreground">
          <Info className="h-3 w-3" />
          <span className="text-xs font-medium">DORA Metrics</span>
        </div>
        <div className="text-xs text-muted-foreground bg-muted/30 rounded p-2">
          Carregando...
        </div>
      </div>
    )
  }

  const badge = getDoraScoreBadge(metrics.overallScore)

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="border-t border-muted pt-3"
    >
      {/* Header compacto com badge e info */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs font-semibold text-foreground">DORA</span>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="p-0.5 hover:bg-muted rounded transition-colors duration-200"
            aria-label="Informações sobre DORA Metrics"
          >
            <HelpCircle className="h-3 w-3 text-muted-foreground hover:text-foreground" />
          </button>
        </div>
        <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${badge.bgColor} ${badge.color}`}>
          <Award className="h-2.5 w-2.5" />
          {badge.label.split(' ')[0]}
        </div>
      </div>

      {/* Painel informativo colapsível */}
      {showInfo && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="mb-3 p-2 bg-muted/50 rounded text-xs text-muted-foreground"
        >
          <div className="flex items-start justify-between mb-2">
            <span className="font-semibold text-foreground">DORA Metrics</span>
            <button
              onClick={() => setShowInfo(false)}
              className="p-0.5 hover:bg-muted rounded"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-1.5">
            <div>
              <span className="font-medium text-green-600">• Deploy Freq:</span> Quantos deploys por semana
            </div>
            <div>
              <span className="font-medium text-blue-600">• Lead Time:</span> Tempo do PR ao deploy
            </div>
            <div>
              <span className="font-medium text-yellow-600">• Failure Rate:</span> % de deploys com falhas
            </div>
            <div>
              <span className="font-medium text-red-600">• Recovery:</span> Tempo para corrigir falhas
            </div>
            <div className="pt-1 border-t border-muted">
              <a 
                href="https://cloud.google.com/blog/products/devops-sre/using-the-four-keys-to-measure-your-devops-performance" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Saiba mais sobre DORA →
              </a>
            </div>
          </div>
        </motion.div>
      )}

      {/* Métricas compactas em grid 2x2 */}
      <div className="grid grid-cols-1 gap-1.5 text-xs mb-2">
        <CompactMetricItem
          icon={<TrendingUp className="h-3 w-3" />}
          label="Deploy Freq"
          value={metrics.deploymentFrequency.display}
          score={metrics.deploymentFrequency.score}
        />
        
        <CompactMetricItem
          icon={<Clock className="h-3 w-3" />}
          label="Lead Time"
          value={metrics.leadTimeForChanges.display}
          score={metrics.leadTimeForChanges.score}
        />
        
        <CompactMetricItem
          icon={<AlertTriangle className="h-3 w-3" />}
          label="Failure Rate"
          value={metrics.changeFailureRate.display}
          score={metrics.changeFailureRate.score}
        />
        
        <CompactMetricItem
          icon={<Wrench className="h-3 w-3" />}
          label="Recovery"
          value={metrics.meanTimeToRecovery.display}
          score={metrics.meanTimeToRecovery.score}
        />
      </div>

      {/* Timestamp da última atualização */}
      <div className="text-center">
        <span className="text-xs text-muted-foreground/60">
          {lastUpdated ? 
            `Atualizado em ${lastUpdated.toLocaleDateString('pt-BR')} às ${lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : 
            'Dados atualizados a cada 24h'
          }
        </span>
      </div>
    </motion.div>
  )
}

export default DoraMetrics