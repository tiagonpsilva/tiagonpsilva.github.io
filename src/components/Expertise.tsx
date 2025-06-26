import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MagicCard } from './ui/magic-card'
import { 
  Crown, 
  BarChart3, 
  Users, 
  Brain, 
  Building, 
  Database, 
  Code, 
  Cloud,
  Target,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

const Expertise: React.FC = () => {
  const [expandedCard, setExpandedCard] = useState<number | null>(null)
  const [cardsPerRow, setCardsPerRow] = useState(3)
  
  // Update cards per row based on screen size
  useEffect(() => {
    const updateCardsPerRow = () => {
      if (window.innerWidth >= 1024) { // lg screens
        setCardsPerRow(3)
      } else if (window.innerWidth >= 768) { // md screens
        setCardsPerRow(2)
      } else { // sm screens
        setCardsPerRow(1)
      }
    }
    
    updateCardsPerRow()
    window.addEventListener('resize', updateCardsPerRow)
    return () => window.removeEventListener('resize', updateCardsPerRow)
  }, [])
  
  // Calculate which cards are in the same row based on current screen size
  const getCardsInSameRow = (cardIndex: number) => {
    const rowIndex = Math.floor(cardIndex / cardsPerRow)
    const startIndex = rowIndex * cardsPerRow
    const endIndex = Math.min(startIndex + cardsPerRow - 1, expertiseAreas.length - 1)
    
    const result = []
    for (let i = startIndex; i <= endIndex; i++) {
      result.push(i)
    }
    return result
  }

  const expertiseAreas = [
    {
      icon: <Crown className="h-8 w-8 text-amber-500" />,
      title: "Liderança Executiva",
      shortDesc: "Roadmap tecnológico, guidance e parcerias estratégicas",
      details: [
        "Roadmap de Tecnologia e Inovação",
        "Guidance Tecnológico",
        "Benchmarks do Setor",
        "Parcerias Estratégicas",
        "Apoio à Gestão Financeira",
        "Gestão de Recursos de Projetos",
        "Segurança e Privacidade"
      ],
      color: "border-amber-200 hover:border-amber-300"
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-green-500" />,
      title: "KPIs Estratégicos",
      shortDesc: "Métricas de engenharia, cloud, negócio e pessoas",
      details: [
        "Engenharia: Deployment Frequency, Lead Time, Change Failure Rate",
        "Cloud: Availability/Uptime, Cost Optimization, Performance",
        "Negócio: Time to Market, NPS, CSAT, ROI",
        "Pessoas: eNPS, Turnover Rate",
        "Financeiras: Budget Previsto vs Realizado"
      ],
      color: "border-green-200 hover:border-green-300"
    },
    {
      icon: <Users className="h-8 w-8 text-blue-500" />,
      title: "Gestão de Talentos",
      shortDesc: "Formação, desenvolvimento e liderança de equipes",
      details: [
        "Formação e desenvolvimento de pessoas",
        "Gestão de equipes multidisciplinares",
        "Mentoria e liderança técnica",
        "People Management",
        "Processos Seletivos",
        "Avaliação de Desempenho"
      ],
      color: "border-blue-200 hover:border-blue-300"
    },
    {
      icon: <Brain className="h-8 w-8 text-purple-500" />,
      title: "IA Generativa",
      shortDesc: "Produtividade, arquiteturas e IA responsável",
      details: [
        "Aumento de Produtividade de Times",
        "IA Aplicada a Produtos",
        "Arquiteturas de Referência com IA",
        "IA Responsável (Responsible AI)",
        "Automações Inteligentes",
        "Integração de LLMs em Sistemas",
        "Frameworks e Ferramentas de IA Generativa"
      ],
      color: "border-purple-200 hover:border-purple-300"
    },
    {
      icon: <Building className="h-8 w-8 text-indigo-500" />,
      title: "Arquitetura de Sistemas",
      shortDesc: "System Design, ADRs e modernização de sistemas",
      details: [
        "System Design",
        "Arquitetura As-Is, Roadmap e To-Be",
        "Documentação de Decisões Arquiteturais (ADR)",
        "Padrões Arquiteturais",
        "Governança de Arquitetura e Compliance",
        "Observabilidade e Resiliência",
        "Modernização e Integração de Sistemas Legados"
      ],
      color: "border-indigo-200 hover:border-indigo-300"
    },
    {
      icon: <Database className="h-8 w-8 text-cyan-500" />,
      title: "Modern Data Stack",
      shortDesc: "Data lakes, ETL/ELT, analytics e governança",
      details: [
        "Orquestração de Dados (Airflow, Prefect)",
        "Data Lakes e Data Warehouses",
        "ETL/ELT Moderno",
        "Modelagem e Transformação de Dados (dbt)",
        "Analytics Avançado e BI",
        "Governança, Qualidade e Segurança de Dados",
        "Processamento em Larga Escala (Spark, BigQuery, Redshift)"
      ],
      color: "border-cyan-200 hover:border-cyan-300"
    },
    {
      icon: <Code className="h-8 w-8 text-orange-500" />,
      title: "Engenharia de Software",
      shortDesc: "Full Stack, microserviços, clean code e CI/CD",
      details: [
        "Desenvolvimento Full Stack",
        "Microserviços e Arquitetura Modular",
        "APIs REST",
        "Testes Automatizados e Qualidade de Código",
        "Clean Code e Boas Práticas",
        "Integração Contínua e Entrega Contínua (CI/CD)",
        "Gestão e Modernização de Sistemas Legados"
      ],
      color: "border-orange-200 hover:border-orange-300"
    },
    {
      icon: <Cloud className="h-8 w-8 text-sky-500" />,
      title: "Cloud Computing",
      shortDesc: "Cloud-native, IaC, DevOps e FinOps",
      details: [
        "Arquitetura Cloud-native",
        "Migração e Modernização para Nuvem",
        "Infraestrutura como Código (IaC)",
        "Estratégias Multi-cloud e Híbridas",
        "DevOps e CI/CD em Cloud",
        "FinOps e Otimização de Custos",
        "Segurança, Compliance e Governança em Cloud"
      ],
      color: "border-sky-200 hover:border-sky-300"
    },
    {
      icon: <Target className="h-8 w-8 text-red-500" />,
      title: "Gestão Ágil",
      shortDesc: "Metodologias ágeis, Kanban e métricas de performance",
      details: [
        "Topologia e reorganização de times",
        "Arquitetura de work-items (Iniciativas > Épicos > Histórias)",
        "Gestão de fluxo com Método Kanban",
        "Aplicação de metodologias ágeis (Scrum, Kanban, Lean)",
        "Métricas de performance e previsibilidade de entregas",
        "Configuração e uso de ferramentas: Jira, Confluence"
      ],
      color: "border-red-200 hover:border-red-300"
    }
  ]

  const toggleExpand = (index: number) => {
    setExpandedCard(expandedCard === index ? null : index)
  }

  return (
    <section id="expertise" className="section-padding bg-muted">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-blue-100 rounded-full text-sm text-blue-700 font-medium">
            <Crown className="h-4 w-4" />
            Áreas de Expertise
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-foreground">
            <span className="gradient-text">Especializações Técnicas</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Expertise consolidada em tecnologia, liderança e inovação para transformação digital de empresas.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {expertiseAreas.map((area, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <MagicCard className={`p-6 h-full transition-all duration-300 ${area.color}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-muted rounded-xl">
                    {area.icon}
                  </div>
                  <button
                    onClick={() => toggleExpand(index)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors duration-200"
                  >
                    {(expandedCard !== null && getCardsInSameRow(expandedCard).includes(index)) ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                </div>
                
                <h3 className="text-xl font-bold mb-3 text-foreground">
                  {area.title}
                </h3>
                
                <p className="text-muted-foreground text-base mb-4">
                  {area.shortDesc}
                </p>

                {(expandedCard !== null && getCardsInSameRow(expandedCard).includes(index)) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-border pt-4"
                  >
                    <ul className="space-y-2">
                      {area.details.map((detail, idx) => (
                        <li key={idx} className="text-base text-muted-foreground flex items-start">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </MagicCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Expertise