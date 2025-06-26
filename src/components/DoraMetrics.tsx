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

const CompactMetricItem: React.FC<{
  icon: React.ReactNode
  label: string
  value: string
  score: 'elite' | 'high' | 'medium' | 'low'
  description: string
  calculation: string
}> = ({ icon, label, value, score, description, calculation }) => {
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
      {/* Label com tooltip de descrição */}
      <div className="flex items-center gap-2 group relative">
        <div className={`${getScoreColor(score)}`}>
          {icon}
        </div>
        <span className="text-xs font-medium text-foreground cursor-help">{label}</span>
        
        {/* Tooltip da descrição */}
        <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-black/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 w-48">
          <div className="font-semibold mb-1">{label}</div>
          <div className="text-gray-300">{description}</div>
          <div className="absolute top-full left-4 border-4 border-transparent border-t-black/90"></div>
        </div>
      </div>
      
      {/* Valor com tooltip de cálculo */}
      <div className="text-right group relative">
        <div className={`text-xs font-bold ${getScoreColor(score)} cursor-help`}>{value}</div>
        
        {/* Tooltip do cálculo */}
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-black/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 w-56">
          <div className="font-semibold mb-1">Cálculo:</div>
          <div className="text-gray-300">{calculation}</div>
          <div className="absolute top-full right-4 border-4 border-transparent border-t-black/90"></div>
        </div>
      </div>
    </div>
  )
}

const DoraMetrics: React.FC<DoraMetricsProps> = ({ metrics, isLoading = false }) => {
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
      {/* Header compacto com badge */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs font-semibold text-foreground">DORA</span>
        </div>
        <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${badge.bgColor} ${badge.color}`}>
          <Award className="h-2.5 w-2.5" />
          {badge.label.split(' ')[0]}
        </div>
      </div>

      {/* Métricas compactas em grid 2x2 */}
      <div className="grid grid-cols-1 gap-1.5 text-xs">
        <CompactMetricItem
          icon={<TrendingUp className="h-3 w-3" />}
          label="Deploy Freq"
          value={metrics.deploymentFrequency.display}
          score={metrics.deploymentFrequency.score}
          description="Frequência de deploys em produção. Mede quão rapidamente a equipe consegue entregar código para usuários finais."
          calculation="Baseado no número de releases públicas + commits na branch main nos últimos 3 meses. Se não há releases, usa commits como proxy."
        />
        
        <CompactMetricItem
          icon={<Clock className="h-3 w-3" />}
          label="Lead Time"
          value={metrics.leadTimeForChanges.display}
          score={metrics.leadTimeForChanges.score}
          description="Tempo entre commit e deploy em produção. Mede a velocidade do pipeline de desenvolvimento."
          calculation="Média do tempo entre criação e merge dos Pull Requests. Calcula (data merge - data criação) para todos os PRs."
        />
        
        <CompactMetricItem
          icon={<AlertTriangle className="h-3 w-3" />}
          label="Failure Rate"
          value={metrics.changeFailureRate.display}
          score={metrics.changeFailureRate.score}
          description="Percentual de deploys que resultam em falhas ou precisam de hotfix. Mede a qualidade das releases."
          calculation="Percentual de commits com palavras-chave de correção (fix, hotfix, bug, error, issue, patch) em relação ao total."
        />
        
        <CompactMetricItem
          icon={<Wrench className="h-3 w-3" />}
          label="Recovery"
          value={metrics.meanTimeToRecovery.display}
          score={metrics.meanTimeToRecovery.score}
          description="Tempo médio para restaurar o serviço após uma falha em produção. Mede a capacidade de resposta a incidentes."
          calculation="Média do tempo entre commits de correção consecutivos. Analisa intervalos entre fixes para estimar velocidade de recuperação."
        />
      </div>
    </motion.div>
  )
}

export default DoraMetrics