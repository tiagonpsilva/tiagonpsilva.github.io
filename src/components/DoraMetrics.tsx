import React from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  Wrench,
  Award,
  Info
} from 'lucide-react'
import { DoraMetrics as DoraMetricsType, getDoraScoreBadge } from '../utils/doraMetrics'

interface DoraMetricsProps {
  metrics: DoraMetricsType | null
  isLoading?: boolean
}

const MetricItem: React.FC<{
  icon: React.ReactNode
  label: string
  value: string
  score: 'elite' | 'high' | 'medium' | 'low'
  description: string
}> = ({ icon, label, value, score, description }) => {
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
    <div className="group relative">
      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors duration-200">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${getScoreColor(score)} bg-current/10`}>
            {icon}
          </div>
          <div>
            <div className="text-sm font-medium text-foreground">{label}</div>
            <div className="text-xs text-muted-foreground">{description}</div>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-sm font-bold ${getScoreColor(score)}`}>{value}</div>
          <div className={`text-xs font-medium capitalize ${getScoreColor(score)}`}>
            {score}
          </div>
        </div>
      </div>
      
      {/* Tooltip com informações detalhadas */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 w-64">
        <div className="font-semibold mb-1">{label}</div>
        <div className="text-gray-300">{description}</div>
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/90"></div>
      </div>
    </div>
  )
}

const DoraMetrics: React.FC<DoraMetricsProps> = ({ metrics, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="border-t border-muted pt-4 mt-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-4 h-4 bg-muted rounded animate-pulse"></div>
          <div className="w-24 h-4 bg-muted rounded animate-pulse"></div>
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="w-full h-12 bg-muted rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="border-t border-muted pt-4 mt-4">
        <div className="flex items-center gap-2 mb-3 text-muted-foreground">
          <Info className="h-4 w-4" />
          <span className="text-sm font-medium">DORA Metrics</span>
        </div>
        <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
          Carregando métricas do cache...
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
      className="border-t border-muted pt-4 mt-4"
    >
      {/* Header com badge de performance */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">DORA Metrics</span>
        </div>
        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.bgColor} ${badge.color}`}>
          <Award className="h-3 w-3" />
          {badge.label}
        </div>
      </div>

      {/* Métricas individuais */}
      <div className="space-y-2">
        <MetricItem
          icon={<TrendingUp className="h-4 w-4" />}
          label="Deployment Frequency"
          value={metrics.deploymentFrequency.display}
          score={metrics.deploymentFrequency.score}
          description="Frequência de deploys em produção"
        />
        
        <MetricItem
          icon={<Clock className="h-4 w-4" />}
          label="Lead Time for Changes"
          value={metrics.leadTimeForChanges.display}
          score={metrics.leadTimeForChanges.score}
          description="Tempo do commit ao deploy"
        />
        
        <MetricItem
          icon={<AlertTriangle className="h-4 w-4" />}
          label="Change Failure Rate"
          value={metrics.changeFailureRate.display}
          score={metrics.changeFailureRate.score}
          description="Taxa de falhas em produção"
        />
        
        <MetricItem
          icon={<Wrench className="h-4 w-4" />}
          label="Mean Time to Recovery"
          value={metrics.meanTimeToRecovery.display}
          score={metrics.meanTimeToRecovery.score}
          description="Tempo médio de recuperação"
        />
      </div>

      {/* Footer informativo */}
      <div className="mt-3 pt-2 border-t border-muted/50">
        <div className="text-xs text-muted-foreground text-center">
          Baseado nos últimos 3 meses de atividade • {' '}
          <a 
            href="https://cloud.google.com/blog/products/devops-sre/using-the-four-keys-to-measure-your-devops-performance" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Saiba mais sobre DORA
          </a>
        </div>
      </div>
    </motion.div>
  )
}

export default DoraMetrics