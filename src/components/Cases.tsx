import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MagicCard } from './ui/magic-card'
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
  X
} from 'lucide-react'

const Cases: React.FC = () => {
  const [expandedCase, setExpandedCase] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos')

  const categories = [
    { name: 'Todos', count: 11, color: 'bg-gray-100 text-gray-800 hover:bg-gray-200' },
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
      title: "Soluções Integradas com GenAI",
      context: "Mercado demandando soluções inteligentes e inovação tecnológica",
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
      title: "Implantação de IA em Processos de Tecnologia",
      context: "Resistência organizacional, falta de conhecimento em IA e processos manuais impactando produtividade",
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
      title: "Modernização de Sistema Legado Crítico",
      context: "Produto monolítico legado com arquitetura obsoleta limitando escalabilidade",
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
      title: "Democratização de Dados",
      context: "Dificuldade de acesso à informação para áreas técnicas e negócios",
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
      title: "Processo de M&A e Integração Tecnológica",
      context: "Necessidade de integração tecnológica pós-aquisição",
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
      title: "Due Diligence de Tecnologia",
      context: "Garantir transparência, conformidade e valor tecnológico em operações de M&A",
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
      title: "Solução para Gestão de Mão-de-Obra em Canteiros",
      context: "Construtoras enfrentavam altos passivos trabalhistas por falta de comprovação documental",
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
      title: "Tech Day",
      context: "Necessidade de manter o time atualizado, engajado e conectado às tendências",
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
      title: "Migração Lift and Shift para Cloud Computing",
      context: "Necessidade de escalabilidade e confiabilidade para suportar crescimento",
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
      title: "2º Produto SaaS",
      context: "Mercado demandando digitalização e automação de processos críticos",
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
      title: "1º Produto SaaS",
      context: "Produto desktop com limitações de distribuição e atualização",
      action: "Redesenho da arquitetura, migração para web, implantação de modelo SaaS",
      results: [
        "Expansão nacional do produto",
        "Redução de churn",
        "Melhoria da experiência do cliente"
      ],
      color: "from-orange-500 to-red-500"
    }
  ]

  const categoryColors: { [key: string]: string } = {
    "Inteligência Artificial": "bg-purple-100 text-purple-800",
    "Arquitetura": "bg-indigo-100 text-indigo-800",
    "Dados": "bg-cyan-100 text-cyan-800",
    "Liderança": "bg-amber-100 text-amber-800",
    "Governança": "bg-green-100 text-green-800",
    "Produto": "bg-rose-100 text-rose-800",
    "Engajamento": "bg-violet-100 text-violet-800",
    "Cloud Computing": "bg-sky-100 text-sky-800"
  }

  const filteredCases = selectedCategory === 'Todos' 
    ? cases 
    : cases.filter(caseItem => caseItem.category === selectedCategory)

  const toggleExpand = (index: number) => {
    setExpandedCase(expandedCase === index ? null : index)
  }

  return (
    <section id="cases" className="section-padding bg-white">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-blue-100 rounded-full text-sm text-blue-700 font-medium">
            <TrendingUp className="h-4 w-4" />
            Cases Profissionais
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-gray-900">
            <span className="gradient-text">Projetos de Impacto</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Cases reais de transformação digital, liderança técnica e inovação que geraram resultados mensuráveis.
          </p>
        </motion.div>

        {/* Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <Filter className="h-5 w-5 text-gray-500" />
            <span className="text-base font-medium text-gray-700">Filtrar por categoria:</span>
            {selectedCategory !== 'Todos' && (
              <button
                onClick={() => setSelectedCategory('Todos')}
                className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-600 transition-colors duration-200"
              >
                <X className="h-3 w-3" />
                Limpar filtro
              </button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category.name
                    ? 'ring-2 ring-blue-500 shadow-lg scale-105'
                    : ''
                } ${category.color}`}
              >
                {category.name}
                <span className="bg-white/60 px-2 py-0.5 rounded-full text-xs font-bold">
                  {category.count}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Cases List */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 hidden lg:block" />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {filteredCases.length > 0 ? (
                filteredCases.map((caseItem, index) => (
                  <motion.div
                    key={`${selectedCategory}-${index}`}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="relative"
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-6 w-4 h-4 bg-white border-4 border-blue-500 rounded-full z-10 hidden lg:block" />
                    
                    <div className="lg:ml-20">
                      <MagicCard className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl bg-gradient-to-r ${caseItem.color} text-white`}>
                              {caseItem.icon}
                            </div>
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${categoryColors[caseItem.category]}`}>
                                  {caseItem.category}
                                </span>
                                <div className="flex items-center gap-1 text-gray-500 text-sm">
                                  <Calendar className="h-4 w-4" />
                                  {caseItem.year}
                                </div>
                              </div>
                              <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {caseItem.title}
                              </h3>
                            </div>
                          </div>
                          <button
                            onClick={() => toggleExpand(index)}
                            className="p-2 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                          >
                            {expandedCase === index ? (
                              <ChevronUp className="h-5 w-5 text-gray-500" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-500" />
                            )}
                          </button>
                        </div>

                        <AnimatePresence>
                          {expandedCase === index && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="border-t border-gray-200 pt-6 space-y-6 overflow-hidden"
                            >
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Contexto:</h4>
                                <p className="text-gray-600 leading-relaxed">{caseItem.context}</p>
                              </div>

                              <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Ação:</h4>
                                <p className="text-gray-600 leading-relaxed">{caseItem.action}</p>
                              </div>

                              <div>
                                <h4 className="font-semibold text-gray-900 mb-3">Resultados:</h4>
                                <ul className="space-y-2">
                                  {caseItem.results.map((result, idx) => (
                                    <li key={idx} className="text-gray-600 flex items-start">
                                      <span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 flex-shrink-0" />
                                      {result}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </MagicCard>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="text-gray-400 mb-4">
                    <Filter className="h-12 w-12 mx-auto" />
                  </div>
                  <p className="text-gray-500">Nenhum case encontrado para esta categoria.</p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

export default Cases