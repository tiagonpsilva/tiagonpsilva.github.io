import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  Users, 
  Eye, 
  Clock, 
  TrendingUp, 
  FileText,
  Download,
  Target,
  ExternalLink
} from 'lucide-react'
import { generateBlogReport, generateTextReport, generateInsights } from '@/utils/mixpanelReports'
import type { BlogAnalytics } from '@/utils/mixpanelReports'

interface AnalyticsDashboardProps {
  className?: string
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ className = '' }) => {
  const [report, setReport] = useState<BlogAnalytics | null>(null)
  const [insights, setInsights] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState(30)
  const [textReport, setTextReport] = useState<string>('')

  useEffect(() => {
    loadReport()
  }, [selectedPeriod])

  const loadReport = async () => {
    setLoading(true)
    try {
      const [reportData, insightsData, textReportData] = await Promise.all([
        generateBlogReport(selectedPeriod),
        generateInsights(selectedPeriod),
        generateTextReport(selectedPeriod)
      ])
      
      setReport(reportData)
      setInsights(insightsData)
      setTextReport(textReportData)
    } catch (error) {
      console.error('Erro ao carregar relatório:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadReport = () => {
    const blob = new Blob([textReport], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `relatorio-analytics-${selectedPeriod}dias-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className={`glass-effect rounded-xl p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className={`glass-effect rounded-xl p-6 ${className}`}>
        <p className="text-muted-foreground">Erro ao carregar dados de analytics</p>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            Analytics Dashboard
          </h2>
          <p className="text-muted-foreground">Insights detalhados do seu blog</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(Number(e.target.value))}
            className="px-3 py-2 bg-background border border-border rounded-lg text-sm"
          >
            <option value={7}>Últimos 7 dias</option>
            <option value={30}>Últimos 30 dias</option>
            <option value={90}>Últimos 90 dias</option>
          </select>
          
          <button
            onClick={downloadReport}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>

      {/* Insights Cards */}
      {insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-green-500" />
            Insights Principais
          </h3>
          <div className="space-y-2">
            {insights.map((insight, index) => (
              <motion.p
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3"
              >
                {insight}
              </motion.p>
            ))}
          </div>
        </motion.div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={<Users className="w-5 h-5" />}
          title="Total de Usuários"
          value={(report.userSegmentation.new_users + report.userSegmentation.returning_users).toLocaleString()}
          subtitle={`${report.userSegmentation.returning_users} recorrentes`}
          color="bg-blue-500"
        />
        
        <MetricCard
          icon={<Eye className="w-5 h-5" />}
          title="Visualizações"
          value={report.topArticles.reduce((sum, article) => sum + article.views, 0).toLocaleString()}
          subtitle="Total de views"
          color="bg-green-500"
        />
        
        <MetricCard
          icon={<Clock className="w-5 h-5" />}
          title="Tempo Médio"
          value={`${report.readingBehavior.avg_time_on_page}min`}
          subtitle="Por página"
          color="bg-purple-500"
        />
        
        <MetricCard
          icon={<TrendingUp className="w-5 h-5" />}
          title="Taxa de Conclusão"
          value={`${report.readingBehavior.completion_rate}%`}
          subtitle="Leem até o final"
          color="bg-orange-500"
        />
      </div>

      {/* Top Articles */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Artigos Mais Acessados
        </h3>
        
        <div className="space-y-4">
          {report.topArticles.slice(0, 5).map((article, index) => (
            <motion.div
              key={article.article_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg border border-border/50"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-semibold text-sm">
                {index + 1}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground text-sm leading-tight mb-2">
                  {article.article_title}
                </h4>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{article.views} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{article.unique_visitors} únicos</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{article.avg_reading_time}min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>{article.completion_rate}% conclusão</span>
                  </div>
                </div>
                
                {/* Engagement Score Bar */}
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Engajamento</span>
                    <span className="text-foreground font-medium">{article.engagement_score}/100</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div 
                      className="bg-primary rounded-full h-1.5 transition-all duration-500"
                      style={{ width: `${article.engagement_score}%` }}
                    />
                  </div>
                </div>
              </div>
              
              <a
                href={`/blog/${article.article_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 p-2 text-muted-foreground hover:text-primary transition-colors"
                title="Ver artigo"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Channels & Site Popularity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Acquisition Channels */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Canais de Aquisição</h3>
          <div className="space-y-3">
            {report.acquisitionChannels.map((channel) => (
              <div key={channel.channel} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm font-medium">{channel.channel}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{channel.users}</div>
                  <div className="text-xs text-muted-foreground">{channel.conversion_rate}% conv.</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Site Popularity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Seções Populares</h3>
          <div className="space-y-3">
            {report.sitePopularity.map((page) => (
              <div key={page.page_name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">{page.page_name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{page.views}</div>
                  <div className="text-xs text-muted-foreground">{page.avg_time}min méd.</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

interface MetricCardProps {
  icon: React.ReactNode
  title: string
  value: string
  subtitle: string
  color: string
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, title, value, subtitle, color }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="glass-effect rounded-xl p-4 border border-border/50"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <div className={`p-2 rounded-lg ${color} text-white`}>
          {icon}
        </div>
      </div>
    </motion.div>
  )
}

export default AnalyticsDashboard