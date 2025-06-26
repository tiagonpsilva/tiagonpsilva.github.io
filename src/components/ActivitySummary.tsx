import React from 'react'
import { motion } from 'framer-motion'
import { 
  GitCommit, 
  Calendar, 
  TrendingUp,
  Clock,
  Code,
  Flame
} from 'lucide-react'

interface DayActivity {
  date: string
  dayName: string
  repos: {
    name: string
    hours: number
    color: string
  }[]
  totalHours: number
}

interface ActivitySummaryProps {
  className?: string
}

const ActivitySummary: React.FC<ActivitySummaryProps> = ({ className = '' }) => {
  // Mock data dos últimos 7 dias de atividade em horas
  const activityData: DayActivity[] = [
    {
      date: '2024-06-26',
      dayName: 'Hoje',
      repos: [
        { name: 'tiagonpsilva.github.io', hours: 4.5, color: 'bg-blue-500' },
        { name: 'kwanza-agent', hours: 2.0, color: 'bg-purple-500' }
      ],
      totalHours: 6.5
    },
    {
      date: '2024-06-25',
      dayName: 'Ontem',
      repos: [
        { name: 'tiagonpsilva.github.io', hours: 3.5, color: 'bg-blue-500' },
        { name: 'genai-langchain-tutorial', hours: 2.5, color: 'bg-pink-500' }
      ],
      totalHours: 6.0
    },
    {
      date: '2024-06-24',
      dayName: 'Seg',
      repos: [
        { name: 'divino-cantar-frontend', hours: 3.0, color: 'bg-green-500' },
        { name: 'system-design-concepts', hours: 1.5, color: 'bg-cyan-500' }
      ],
      totalHours: 4.5
    },
    {
      date: '2024-06-23',
      dayName: 'Dom',
      repos: [
        { name: 'github-mcpilot', hours: 2.5, color: 'bg-indigo-500' }
      ],
      totalHours: 2.5
    },
    {
      date: '2024-06-22',
      dayName: 'Sáb',
      repos: [
        { name: 'tiagonpsilva.github.io', hours: 4.0, color: 'bg-blue-500' },
        { name: 'architecture-decision-records', hours: 1.0, color: 'bg-yellow-500' }
      ],
      totalHours: 5.0
    },
    {
      date: '2024-06-21',
      dayName: 'Sex',
      repos: [
        { name: 'modern-data-stack-training', hours: 3.5, color: 'bg-red-500' },
        { name: 'kwanza-agent', hours: 1.5, color: 'bg-purple-500' }
      ],
      totalHours: 5.0
    },
    {
      date: '2024-06-20',
      dayName: 'Qui',
      repos: [
        { name: 'tiagonpsilva.github.io', hours: 5.5, color: 'bg-blue-500' }
      ],
      totalHours: 5.5
    }
  ]

  const totalWeekHours = activityData.reduce((sum, day) => sum + day.totalHours, 0)
  const maxDayHours = Math.max(...activityData.map(day => day.totalHours))
  
  // Calcular streak de dias consecutivos com desenvolvimento
  let currentStreak = 0
  for (const day of activityData) {
    if (day.totalHours > 0) {
      currentStreak++
    } else {
      break
    }
  }

  const getIntensityClass = (hours: number) => {
    if (hours === 0) return 'bg-muted'
    if (hours <= 1) return 'bg-blue-200 dark:bg-blue-900'
    if (hours <= 3) return 'bg-blue-400 dark:bg-blue-700'
    if (hours <= 5) return 'bg-blue-600 dark:bg-blue-500'
    return 'bg-blue-800 dark:bg-blue-300'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className={`bg-card border border-border rounded-xl p-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Flame className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-base lg:text-lg font-bold text-foreground">Atividade dos Últimos 7 Dias</h3>
            <p className="text-xs lg:text-sm text-muted-foreground">Onde tenho trabalhado recentemente</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-xl lg:text-2xl font-bold text-blue-600 dark:text-blue-400">
            {currentStreak} dias
          </div>
          <div className="text-xs text-muted-foreground">consecutivos</div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <Clock className="h-4 w-4 text-primary mr-1" />
            <span className="text-base lg:text-lg font-bold text-foreground">{totalWeekHours.toFixed(1)}h</span>
          </div>
          <div className="text-xs text-muted-foreground">Total horas</div>
        </div>
        
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <TrendingUp className="h-4 w-4 text-blue-600 mr-1" />
            <span className="text-base lg:text-lg font-bold text-foreground">{maxDayHours}h</span>
          </div>
          <div className="text-xs text-muted-foreground">Dia mais ativo</div>
        </div>
        
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <Code className="h-4 w-4 text-blue-600 mr-1" />
            <span className="text-base lg:text-lg font-bold text-foreground">
              {new Set(activityData.flatMap(day => day.repos.map(repo => repo.name))).size}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">Repositórios</div>
        </div>
        
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <GitCommit className="h-4 w-4 text-purple-600 mr-1" />
            <span className="text-base lg:text-lg font-bold text-foreground">
              {(totalWeekHours / 7).toFixed(1)}h
            </span>
          </div>
          <div className="text-xs text-muted-foreground">Média diária</div>
        </div>
      </div>

      {/* Heatmap Style Activity Grid */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs lg:text-sm font-medium text-foreground">Heatmap de Atividade</span>
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {activityData.reverse().map((day, index) => (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="group relative"
            >
              <div
                className={`
                  aspect-square rounded-lg flex items-center justify-center
                  ${getIntensityClass(day.totalHours)}
                  hover:ring-2 hover:ring-primary/30 transition-all duration-200
                  cursor-pointer
                `}
              >
                <span className={`text-xs font-bold ${day.totalHours > 3 ? 'text-white' : 'text-foreground/70'}`}>
                  {day.totalHours ? `${day.totalHours}h` : ''}
                </span>
              </div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                <div className="font-semibold">{day.dayName}</div>
                <div>{day.totalHours}h de desenvolvimento</div>
              </div>
              
              <div className="text-center mt-1">
                <div className="text-xs font-medium text-foreground">{day.dayName}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Repositórios mais ativos */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Code className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs lg:text-sm font-medium text-foreground">Repositórios Mais Ativos</span>
        </div>
        
        <div className="space-y-2">
          {/* Calcular horas por repositório */}
          {(() => {
            const repoStats: Record<string, { hours: number; color: string }> = {}
            activityData.forEach(day => {
              day.repos.forEach(repo => {
                if (!repoStats[repo.name]) {
                  repoStats[repo.name] = { hours: 0, color: repo.color }
                }
                repoStats[repo.name].hours += repo.hours
              })
            })
            
            return Object.entries(repoStats)
              .sort(([,a], [,b]) => b.hours - a.hours)
              .map(([repoName, stats]) => {
                const percentage = (stats.hours / totalWeekHours) * 100
                
                return (
                  <motion.div
                    key={repoName}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <div className={`w-3 h-3 rounded-full ${stats.color}`}></div>
                      <span className="text-xs lg:text-sm text-foreground truncate">{repoName.length > 20 ? repoName.substring(0, 20) + '...' : repoName}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-muted rounded-full h-2 overflow-hidden">
                        <motion.div
                          className={`h-full ${stats.color}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                        />
                      </div>
                      <span className="text-xs lg:text-sm font-medium text-foreground w-10 lg:w-12 text-right">
                        {stats.hours.toFixed(1)}h
                      </span>
                    </div>
                  </motion.div>
                )
              })
          })()}
        </div>
      </div>
    </motion.div>
  )
}

export default ActivitySummary