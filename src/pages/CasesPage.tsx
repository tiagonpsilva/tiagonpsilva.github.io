import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MagicCard } from '../components/ui/magic-card'
import { useTheme } from '../contexts/ThemeContext'
import { 
  Brain, 
  Building, 
  Database, 
  Users, 
  Shield, 
  TrendingUp,
  Calendar,
  ChevronDown,
  ChevronUp,
  Filter,
  X,
  ArrowLeft
} from 'lucide-react'
import { Link } from 'react-router-dom'

const CasesPage: React.FC = () => {
  const [expandedCase, setExpandedCase] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos')
  const [cardsPerRow, setCardsPerRow] = useState(2)
  const { restorePreviousTheme } = useTheme()

  useEffect(() => {
    // Restaurar tema anterior quando voltar para a página principal
    restorePreviousTheme()
  }, [restorePreviousTheme])

  // Update cards per row based on screen size
  useEffect(() => {
    const updateCardsPerRow = () => {
      if (window.innerWidth >= 1024) { // lg screens
        setCardsPerRow(2) // grid lg:grid-cols-2
      } else { // md and below
        setCardsPerRow(1) // single column
      }
    }
    
    updateCardsPerRow()
    window.addEventListener('resize', updateCardsPerRow)
    return () => window.removeEventListener('resize', updateCardsPerRow)
  }, [])
  
  // Calculate which cards are in the same row based on current screen size
  const getCardsInSameRow = (cardIndex: number, totalCards: number) => {
    const rowIndex = Math.floor(cardIndex / cardsPerRow)
    const startIndex = rowIndex * cardsPerRow
    const endIndex = Math.min(startIndex + cardsPerRow - 1, totalCards - 1)
    
    const result = []
    for (let i = startIndex; i <= endIndex; i++) {
      result.push(i)
    }
    return result
  }

  const categories = [
    { name: 'Todos', count: 11, color: 'bg-muted text-foreground hover:bg-muted/80' },
    { name: 'Inteligência Artificial', count: 2, color: 'bg-purple-100 text-purple-800 hover:bg-purple-200' },
    { name: 'Arquitetura', count: 1, color: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200' },
    { name: 'Dados', count: 1, color: 'bg-cyan-100 text-cyan-800 hover:bg-cyan-200' },
    { name: 'Liderança', count: 1, color: 'bg-amber-100 text-amber-800 hover:bg-amber-200' },
    { name: 'Governança', count: 1, color: 'bg-green-100 text-green-800 hover:bg-green-200' },
    { name: 'Produto', count: 3, color: 'bg-rose-100 text-rose-800 hover:bg-rose-200' },
    { name: 'Engajamento', count: 1, color: 'bg-violet-100 text-violet-800 hover:bg-violet-200' },
    { name: 'Cloud Computing', count: 1, color: 'bg-sky-100 text-sky-800 hover:bg-sky-200' }
  ]

  const cases = [
    {
      year: "2025",
      category: "Inteligência Artificial",
      icon: <Brain className="h-6 w-6" />,
      title: "Automação de Validação Documental com IA Generativa",
      context: "Produto de gestão documental exigia validação manual intensa de documentos trabalhistas para acesso a canteiros, com operadores verificando identidade, tipo e validade de cada documento",
      action: "Elaborou arquitetura de referência para LLMs e implementou práticas de IA Generativa",
      results: [
        "+US$30.000 de investimento recebido",
        "Projetos de inovação aprovados",
        "Arquitetura de referência para LLMs"
      ],
      color: "from-purple-500 to-pink-500"
    },
    {
      year: "2024",
      category: "Inteligência Artificial",
      icon: <Brain className="h-6 w-6" />,
      title: "Transformação de Processos de Desenvolvimento com IA Integrada",
      context: "Equipes de desenvolvimento com processos manuais intensivos para documentar sistemas legados, analisar bugs e revisar PRs, além de resistência do time técnico quanto à adoção de ferramentas de IA",
      action: "Liderou implementação escalonada de IA nos times (GitHub Copilot, Amazon Q, pré-aprovação de PRs, diagnóstico de códigos legados, análise de anomalias)",
      results: [
        "Redução do cycle-time de 5 para 2 dias (-60%)",
        "Melhoria da qualidade em code reviews",
        "Redução de riscos em menor tempo",
        "Aumento da satisfação e produtividade dos times",
        "Adoção organizacional de práticas de IA"
      ],
      color: "from-blue-500 to-purple-500"
    },
    {
      year: "2024",
      category: "Arquitetura",
      icon: <Building className="h-6 w-6" />,
      title: "Reconstrução Arquitetural de Sistema Crítico de Gestão de Projetos",
      context: "Sistema crítico de gestão colaborativa de projetos construtivos (2005) enfrentava gargalos severos de performance, experiência obsoleta causando churn de clientes, e arquitetura monolítica impedindo escalabilidade e atualizações tecnológicas",
      action: "Reconstruiu arquitetura baseada em System Design moderno",
      results: [
        "Migração de +600 clientes",
        "+60.000 usuários ativos na nova arquitetura",
        "Arquitetura escalável e moderna"
      ],
      color: "from-indigo-500 to-blue-500"
    },
    {
      year: "2024",
      category: "Dados",
      icon: <Database className="h-6 w-6" />,
      title: "Implementação de Plataforma de Self-Service de Dados",
      context: "Times de negócio dependiam de exportações manuais dos times técnicos para acessar dados transacionais dos produtos, gerando processos morosos e riscos de segurança com acessos diretos aos bancos relacionais",
      action: "Idealizou e implementou Plataforma de Dados (Databricks) com governança e políticas",
      results: [
        "+50% de ganho em eficiência operacional",
        "Redução significativa de custos",
        "Aumento da velocidade de entrega"
      ],
      color: "from-cyan-500 to-teal-500"
    },
    {
      year: "2022",
      category: "Liderança",
      icon: <Users className="h-6 w-6" />,
      title: "Integração Tecnológica e Cultural em Processo de M&A",
      context: "Aquisição estratégica para expansão da maior Construtech da América Latina exigia integração de tecnologias, arquiteturas e culturas distintas, com altos custos de infraestrutura e formação de novas equipes unificadas",
      action: "Liderou due diligence e integração de equipes, sistemas e culturas técnicas",
      results: [
        "+10 pessoas integradas ao time",
        "+5 novas tecnologias no portfólio",
        "Integração cultural bem-sucedida"
      ],
      color: "from-amber-500 to-orange-500"
    },
    {
      year: "2022",
      category: "Governança",
      icon: <Shield className="h-6 w-6" />,
      title: "Condução de Auditoria Tecnológica para Viabilização de M&A",
      context: "Auditoria tecnológica conduzida pela KPMG para viabilizar processo de M&A, avaliando governança de tecnologia em processos de engenharia, qualidade, arquitetura, segurança, infraestrutura e gestão de pessoas",
      action: "Auditoria detalhada dos processos, sistemas, infraestrutura e equipe de tecnologia",
      results: [
        "Mapeamento completo dos ativos e riscos tecnológicos",
        "Geração de documentação estratégica para tomada de decisão",
        "Facilitação do processo de integração pós-M&A"
      ],
      color: "from-green-500 to-emerald-500"
    },
    {
      year: "2018",
      category: "Produto",
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Lançamento de SaaS para Gestão de Mão de Obra",
      context: "Construtoras acumulavam passivos trabalhistas por falta de comprovação documental eficiente sobre presença e documentação adequada de trabalhadores em canteiros, especialmente em casos de acidentes e cobranças de horas extras",
      action: "Desenvolvimento de plataforma SaaS com IoT, reconhecimento facial e automação (PHP, MySQL, Firebase, AWS SQS)",
      results: [
        "16 mil empreiteiros, 300 mil trabalhadores, 18 milhões de documentos",
        "Redução de até 50% no passivo trabalhista (R$ 25 milhões/ano)",
        "Digitalização evitou 3,7 toneladas de papel, 7,3 toneladas de CO₂, 2 milhões de litros de água",
        "Análise documental 10x mais eficiente"
      ],
      color: "from-rose-500 to-pink-500"
    },
    {
      year: "2017",
      category: "Engajamento",
      icon: <Users className="h-6 w-6" />,
      title: "Implementação de Eventos Regulares de Atualização Tecnológica",
      context: "Equipe técnica enfrentava isolamento entre times, baixo engajamento, falta de visibilidade sobre evoluções internas e desatualização sobre tendências tecnológicas do mercado",
      action: "Organização de encontros mensais/bimestrais com 40 pessoas em média",
      results: [
        "Aumento do engajamento e retenção do time",
        "Surgimento de projetos e iniciativas inovadoras",
        "Melhoria do clima organizacional",
        "Passagem de conhecimento relevante entre equipes"
      ],
      color: "from-violet-500 to-purple-500"
    },
    {
      year: "2014",
      category: "Cloud Computing",
      icon: <Building className="h-6 w-6" />,
      title: "Transição de Colocation para Arquitetura Cloud-Native",
      context: "Infraestrutura virtualizada em colocation sem escalabilidade enfrentava crises de performance, altos custos de servidores físicos e manutenção, limitando crescimento do produto principal",
      action: "Migração de ~10 aplicações para AWS (EC2, S3, RDS, Route 53, SES) em janela de 3 dias",
      results: [
        "Redução significativa de custos operacionais",
        "Aumento da disponibilidade dos sistemas",
        "Escalabilidade garantida para o crescimento"
      ],
      color: "from-sky-500 to-blue-500"
    },
    {
      year: "2005",
      category: "Produto",
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Lançamento de SaaS para Gestão e Colaboração de Projetos Construtivos",
      context: "Mercado de construção civil carecia de soluções digitais para gestão colaborativa de projetos, com processos manuais ineficientes entre construtoras, projetistas e compatibilizadores",
      action: "Desenvolvimento de produto para gestão colaborativa de arquivos de projetos",
      results: [
        "Produto pioneiro no segmento",
        "+200 clientes corporativos",
        "Reconhecimento nacional"
      ],
      color: "from-emerald-500 to-green-500"
    },
    {
      year: "2003",
      category: "Produto",
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Lançamento de SaaS para Apoio a Gestão de Qualidade (Pioneiro)",
      context: "Construção civil mantinha processos manuais para certificações ISO-9001 e PBQP-H, com guarda física de documentos, procedimentos e formulários, sem automação para não-conformidades, treinamentos e auditorias",
      action: "Desenvolveu e lançou SaaS pioneiro com módulos integrados para gestão eletrônica de documentos, não-conformidades, treinamentos e auditorias, quebrando paradigma de software instalado localmente",
      results: [
        "Pioneirismo no modelo SaaS para Construção Civil",
        "Eliminação de processos manuais, otimizando processos",
        "Grande contribuição para questões de Sustentabilidade, eliminando papel de forma significativa"
      ],
      color: "from-orange-500 to-red-500"
    }
  ]

  const filteredCases = selectedCategory === 'Todos' 
    ? cases 
    : cases.filter(caseItem => caseItem.category === selectedCategory)

  const toggleExpand = (index: number) => {
    setExpandedCase(expandedCase === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Back to Home */}
      <div className="pt-24 pb-4 px-6">
        <div className="container mx-auto px-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Início
          </Link>
        </div>
      </div>

      {/* Header */}
      <section className="py-2 bg-background">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 leading-none"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-green-100 rounded-full text-sm text-green-700 font-medium">
              <TrendingUp className="h-4 w-4" />
              Cases de Sucesso
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-foreground leading-tight">
              <span className="gradient-text">Banco de Cases</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-tight">
              Projetos reais que demonstram expertise em tecnologia, liderança e transformação digital com resultados mensuráveis.
            </p>
          </motion.div>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-6 text-center max-w-3xl mx-auto"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Filter className="h-4 w-4 text-muted-foreground/60" />
              <span className="text-sm font-normal text-muted-foreground/60">Filtrar por categoria:</span>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category.name
                      ? category.color + ' ring-2 ring-offset-2 ring-blue-500'
                      : category.color + ' opacity-70 hover:opacity-100'
                  }`}
                >
                  {category.name}
                  <span className="bg-white/30 px-2 py-0.5 rounded-full text-xs">
                    {category.count}
                  </span>
                  {selectedCategory === category.name && category.name !== 'Todos' && (
                    <X className="h-3 w-3 ml-1" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Cases Grid */}
      <section className="section-padding bg-muted">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-8">
            <AnimatePresence>
              {filteredCases.map((caseItem, index) => (
                <motion.div
                  key={`${caseItem.title}-${selectedCategory}`}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -50 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <MagicCard className="p-6 h-full transition-all duration-300 hover:shadow-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 bg-gradient-to-r ${caseItem.color} rounded-xl text-white`}>
                          {caseItem.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground font-medium">{caseItem.year}</span>
                          </div>
                          <span className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">
                            {caseItem.category}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleExpand(index)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors duration-200"
                      >
                        {(expandedCase !== null && getCardsInSameRow(expandedCase, filteredCases.length).includes(index)) ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-3 text-foreground">
                      {caseItem.title}
                    </h3>
                    
                    <p className="text-muted-foreground text-base mb-4 leading-relaxed">
                      {caseItem.context}
                    </p>

                    {(expandedCase !== null && getCardsInSameRow(expandedCase, filteredCases.length).includes(index)) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-border pt-4 space-y-4"
                      >
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">Ação Implementada:</h4>
                          <p className="text-muted-foreground text-base leading-relaxed">
                            {caseItem.action}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-foreground mb-3">Resultados Alcançados:</h4>
                          <ul className="space-y-2">
                            {caseItem.results.map((result, idx) => (
                              <li key={idx} className="text-base text-muted-foreground flex items-start">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 flex-shrink-0" />
                                {result}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    )}
                  </MagicCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredCases.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <p className="text-muted-foreground text-lg">
                Nenhum case encontrado para a categoria selecionada.
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Back to Home Footer */}
      <div className="pb-16 px-6">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Início
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CasesPage