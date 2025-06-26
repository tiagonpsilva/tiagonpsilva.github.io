import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MagicCard } from '../components/ui/magic-card'
import { useTheme } from '../contexts/ThemeContext'
import DoraMetrics from '../components/DoraMetrics'
import { calculateDoraMetrics, DoraMetrics as DoraMetricsType } from '../utils/doraMetrics'
import { 
  getCachedDoraMetrics, 
  setCachedDoraMetrics, 
  shouldFetchDoraMetrics,
  cleanExpiredCache 
} from '../utils/doraCache'
import { 
  ExternalLink, 
  Mail,
  Code,
  Database,
  Brain,
  FileText,
  Building,
  Star,
  GitBranch,
  GitCommit,
  Calendar
} from 'lucide-react'

const LabsPage: React.FC = () => {
  const { restorePreviousTheme } = useTheme()
  const [doraMetrics, setDoraMetrics] = useState<Record<string, DoraMetricsType | null>>({})
  const [loadingMetrics, setLoadingMetrics] = useState<Record<string, boolean>>({})

  useEffect(() => {
    // Restaurar tema anterior quando voltar para a página principal
    restorePreviousTheme()
    // Forçar scroll para o topo da página
    window.scrollTo(0, 0)
  }, [restorePreviousTheme])

  // Limpar cache expirado na inicialização
  useEffect(() => {
    cleanExpiredCache()
  }, [])

  // Função para carregar DORA Metrics com cache
  const loadDoraMetrics = async (projectName: string, repoUrl: string) => {
    // Primeiro, tentar obter do cache
    const cachedMetrics = getCachedDoraMetrics(repoUrl)
    if (cachedMetrics) {
      setDoraMetrics(prev => ({ ...prev, [projectName]: cachedMetrics }))
      return
    }

    // Se não há cache válido, verificar se deve buscar dados frescos
    if (!shouldFetchDoraMetrics(repoUrl)) {
      return
    }

    // Carregar dados da API apenas se necessário
    setLoadingMetrics(prev => ({ ...prev, [projectName]: true }))
    try {
      const metrics = await calculateDoraMetrics(repoUrl)
      if (metrics) {
        setCachedDoraMetrics(repoUrl, metrics)
        setDoraMetrics(prev => ({ ...prev, [projectName]: metrics }))
      } else {
        // Usar dados do cache como fallback mesmo se expirado
        const fallbackMetrics = getCachedDoraMetrics(repoUrl)
        setDoraMetrics(prev => ({ ...prev, [projectName]: fallbackMetrics }))
      }
    } catch (error) {
      console.error(`Erro ao carregar DORA Metrics para ${projectName}:`, error)
      // Usar dados do cache como fallback
      const fallbackMetrics = getCachedDoraMetrics(repoUrl)
      setDoraMetrics(prev => ({ ...prev, [projectName]: fallbackMetrics }))
    } finally {
      setLoadingMetrics(prev => ({ ...prev, [projectName]: false }))
    }
  }

  // Produtos Experimentais
  const experimentalProducts = [
    {
      name: "Kwanza Agent",
      description: "Agente de IA para curadoria e gestão automatizada de notícias tecnológicas",
      tags: ["AI Agent", "News Curation", "TypeScript", "React", "Python"],
      link: "https://github.com/tiagonpsilva/kwanza-agent",
      icon: <Brain className="h-6 w-6" />,
      color: "border-purple-200 hover:border-purple-300",
      stats: { commits: 26, branches: 1, prs: 0, stars: 1, lastUpdate: "1 dia atrás" }
    },
    {
      name: "Utajiri 360",
      description: "Aplicação completa para gestão pessoal de orçamentos e finanças",
      tags: ["Budget Management", "TypeScript", "React", "TailwindCSS"],
      link: "https://github.com/tiagonpsilva/utajiri-360-frontend",
      icon: <Database className="h-6 w-6" />,
      color: "border-green-200 hover:border-green-300",
      stats: { commits: 1, branches: 1, prs: 0, stars: 0, lastUpdate: "1 mês atrás" }
    },
    {
      name: "Divino Cantar",
      description: "Plataforma para gestão de repertório musical católico e organização litúrgica",
      tags: ["Music Management", "TypeScript", "React", "Vite"],
      link: "https://github.com/tiagonpsilva/divino-cantar-frontend",
      icon: <FileText className="h-6 w-6" />,
      color: "border-blue-200 hover:border-blue-300",
      stats: { commits: 21, branches: 3, prs: 0, stars: 0, lastUpdate: "3 semanas atrás" }
    }
  ]

  // IA & GenAI
  const aiProjects = [
    {
      name: "Github MCPilot para Cursor IDE",
      description: "Agente de IA para automação real de operações no Github via Cursor IDE",
      tags: ["Github", "Cursor IDE", "MCP", "Agente IA"],
      link: "https://github.com/tiagonpsilva/github-mcpilot",
      icon: <Brain className="h-6 w-6" />,
      color: "border-purple-200 hover:border-purple-300",
      stats: { commits: 15, branches: 2, prs: 1, stars: 3, lastUpdate: "2 dias atrás" }
    },
    {
      name: "GenAI LangChain Tutorial",
      description: "Guia completo para desenvolvimento de aplicações com LangChain e IA Generativa",
      tags: ["AI", "LangChain", "LLM", "GenAI"],
      link: "https://github.com/tiagonpsilva/genai-langchain-tutorial",
      icon: <Brain className="h-6 w-6" />,
      color: "border-pink-200 hover:border-pink-300",
      stats: { commits: 45, branches: 1, prs: 0, stars: 12, lastUpdate: "1 semana atrás" }
    },
    {
      name: "Architecture Haiku",
      description: "Gerador de poemas haiku sobre conceitos de arquitetura de software usando IA",
      tags: ["AI", "Poetry", "Architecture", "Creative AI"],
      link: "https://github.com/tiagonpsilva/architecture-haiku",
      icon: <Brain className="h-6 w-6" />,
      color: "border-indigo-200 hover:border-indigo-300",
      stats: { commits: 8, branches: 1, prs: 0, stars: 2, lastUpdate: "2 semanas atrás" }
    }
  ]

  // Arquitetura & Engenharia
  const architectureProjects = [
    {
      name: "System Design Concepts",
      description: "Conceitos fundamentais de design de sistemas distribuídos e escaláveis",
      tags: ["System Design", "Architecture", "Scalability"],
      link: "https://github.com/tiagonpsilva/system-design-concepts",
      icon: <Building className="h-6 w-6" />,
      color: "border-blue-200 hover:border-blue-300",
      stats: { commits: 32, branches: 2, prs: 0, stars: 8, lastUpdate: "5 dias atrás" }
    },
    {
      name: "Modern Data Stack Training",
      description: "Curso prático sobre ferramentas modernas de engenharia de dados e pipelines",
      tags: ["Data Engineering", "Airflow", "dbt", "Spark"],
      link: "https://github.com/tiagonpsilva/treinamento-modern-data-stack-01",
      icon: <Database className="h-6 w-6" />,
      color: "border-cyan-200 hover:border-cyan-300",
      stats: { commits: 28, branches: 3, prs: 2, stars: 15, lastUpdate: "1 semana atrás" }
    },
    {
      name: "Architecture Decision Records",
      description: "Coleção de templates e exemplos para documentação de decisões arquiteturais",
      tags: ["ADR", "Documentation", "Architecture"],
      link: "https://github.com/tiagonpsilva/architecture-decision-records",
      icon: <FileText className="h-6 w-6" />,
      color: "border-green-200 hover:border-green-300",
      stats: { commits: 18, branches: 1, prs: 0, stars: 5, lastUpdate: "3 dias atrás" }
    }
  ]


  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <section className="pt-32 lg:pt-24 py-2 bg-background">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 leading-none"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-purple-100 rounded-full text-sm text-purple-700 font-medium">
              <Code className="h-4 w-4" />
              Laboratório de Inovação
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-foreground leading-tight">
              <span className="gradient-text">Labs</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-tight">
              Experimentos, protótipos e projetos open source que exploram novas tecnologias e soluções inovadoras.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Labs Projects Section */}
      <section className="section-padding bg-muted">
        <div className="container mx-auto px-6 space-y-12">

          {/* Produtos Experimentais */}
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-2">
              <Code className="h-6 w-6 text-purple-600" />
              Produtos Experimentais
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {experimentalProducts.map((project, index) => (
                <ProjectCard 
                  key={index} 
                  project={project} 
                  index={index}
                  doraMetrics={doraMetrics[project.name]}
                  isLoadingMetrics={loadingMetrics[project.name] || false}
                  onLoadMetrics={loadDoraMetrics}
                />
              ))}
            </div>
          </div>

          {/* IA & GenAI */}
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-2">
              <Brain className="h-6 w-6 text-pink-600" />
              IA & GenAI
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {aiProjects.map((project, index) => (
                <ProjectCard 
                  key={index} 
                  project={project} 
                  index={index}
                  doraMetrics={doraMetrics[project.name]}
                  isLoadingMetrics={loadingMetrics[project.name] || false}
                  onLoadMetrics={loadDoraMetrics}
                />
              ))}
            </div>
          </div>

          {/* Arquitetura & Engenharia */}
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-2">
              <Building className="h-6 w-6 text-blue-600" />
              Arquitetura & Engenharia
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {architectureProjects.map((project, index) => (
                <ProjectCard 
                  key={index} 
                  project={project} 
                  index={index}
                  doraMetrics={doraMetrics[project.name]}
                  isLoadingMetrics={loadingMetrics[project.name] || false}
                  onLoadMetrics={loadDoraMetrics}
                />
              ))}
            </div>
          </div>

          {/* Contact CTA */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mt-16"
          >
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">
                Gostou dos projetos?
              </h3>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                Vamos conversar sobre como posso contribuir com seus projetos de tecnologia e transformação digital.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:tiagonpsilva@gmail.com"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-card text-blue-600 font-semibold rounded-xl hover:bg-muted transition-colors duration-300"
                >
                  <Mail className="h-5 w-5" />
                  Enviar Email
                </a>
                <a
                  href="https://linkedin.com/in/tiagonpsilva"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-700 text-white font-semibold rounded-xl hover:bg-blue-800 transition-colors duration-300"
                >
                  <ExternalLink className="h-5 w-5" />
                  LinkedIn
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bottom spacing */}
      <div className="pb-20 lg:pb-16"></div>
    </div>
  )
}

// Component para renderizar cada card de projeto
interface ProjectStats {
  commits: number;
  branches: number;
  prs: number;
  stars: number;
  lastUpdate: string;
}

interface Project {
  name: string;
  description: string;
  tags: string[];
  link: string;
  icon: React.ReactNode;
  color: string;
  stats: ProjectStats;
}

const ProjectCard: React.FC<{ 
  project: Project; 
  index: number;
  doraMetrics: DoraMetricsType | null;
  isLoadingMetrics: boolean;
  onLoadMetrics: (name: string, url: string) => void;
}> = ({ project, index, doraMetrics, isLoadingMetrics, onLoadMetrics }) => {
  
  // Carregar DORA Metrics quando o card é montado (com debounce)
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      onLoadMetrics(project.name, project.link)
    }, index * 100) // Escalonar carregamento para evitar sobrecarga
    
    return () => clearTimeout(timeoutId)
  }, [project.name, project.link, onLoadMetrics, index])
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <MagicCard className={`p-4 h-full ${project.color} group`}>
        {/* Header com icon e link */}
        <div className="flex items-start justify-between mb-3">
          <div className="p-2 bg-muted rounded-lg group-hover:bg-muted/80 transition-colors duration-300">
            {project.icon}
          </div>
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 hover:bg-muted rounded-lg transition-colors duration-200"
          >
            <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-blue-600" />
          </a>
        </div>

        {/* Título e descrição */}
        <h4 className="text-base font-bold text-card-foreground mb-2">
          {project.name}
        </h4>

        <p className="text-muted-foreground text-sm mb-3 leading-relaxed">
          {project.description}
        </p>

        {/* Stats compactas */}
        <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <GitCommit className="h-3 w-3" />
            <span>{project.stats.commits}</span>
          </div>
          <div className="flex items-center gap-1">
            <GitBranch className="h-3 w-3" />
            <span>{project.stats.branches}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3" />
            <span>{project.stats.stars}</span>
          </div>
          <div className="flex items-center gap-1 ml-auto">
            <Calendar className="h-3 w-3" />
            <span>{project.stats.lastUpdate}</span>
          </div>
        </div>

        {/* Tags compactas */}
        <div className="flex flex-wrap gap-1 mb-3">
          {project.tags.slice(0, 3).map((tag: string, idx: number) => (
            <span key={idx} className="px-1.5 py-0.5 bg-muted text-muted-foreground text-xs rounded mono-font">
              {tag}
            </span>
          ))}
          {project.tags.length > 3 && (
            <span className="px-1.5 py-0.5 bg-muted text-muted-foreground text-xs rounded">
              +{project.tags.length - 3}
            </span>
          )}
        </div>

        {/* DORA Metrics compactas */}
        <DoraMetrics 
          metrics={doraMetrics} 
          isLoading={isLoadingMetrics}
        />
      </MagicCard>
    </motion.div>
  )
}

export default LabsPage