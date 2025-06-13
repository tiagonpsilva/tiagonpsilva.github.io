import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { MagicCard } from './ui/magic-card'
import { 
  GraduationCap, 
  Award, 
  BookOpen,
  Calendar,
  Star,
  CheckCircle,
  Clock
} from 'lucide-react'

const Education: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'education' | 'certifications'>('education')

  const educationData = [
    {
      year: "2025",
      status: "Em Andamento",
      institution: "Full Cycle",
      course: "MBA Arquitetura Full Cycle",
      tags: ["Arquitetura de Software", "Full Stack Development", "DevOps", "Microserviços", "Cloud Native"],
      description: "Liderança, arquitetura e desenvolvimento de soluções de grande porte com participações de Uncle Bob, Alistair Cockburn, Vaughn Vernon, Elemar Jr, Greg Young",
      color: "border-purple-200 hover:border-purple-300"
    },
    {
      year: "2022",
      status: "Concluído",
      institution: "CTO Academy",
      course: "Executive Program CTO & Liderança em Tecnologia",
      tags: ["Liderança em Tecnologia", "Gestão de Times", "Estratégia de TI", "Desenvolvimento de Carreira"],
      description: "Programa executivo internacional para desenvolvimento de competências de liderança e gestão de times de tecnologia",
      color: "border-blue-200 hover:border-blue-300"
    },
    {
      year: "2019-2020",
      status: "Concluído",
      institution: "FIAP",
      course: "MBA Big Data / Data Science",
      tags: ["Big Data", "Data Science", "Machine Learning", "Analytics", "Data Engineering"],
      description: "Formação em plataformas de dados, analytics e inteligência artificial",
      color: "border-cyan-200 hover:border-cyan-300"
    },
    {
      year: "2012-2013",
      status: "Concluído",
      institution: "FIAP",
      course: "MBA Engenharia de Software Orientado a Serviços - SOA",
      tags: ["Service-Oriented Architecture", "Web Services", "Enterprise Integration", "Software Engineering"],
      description: "Arquitetura orientada a serviços, integração de sistemas corporativos",
      color: "border-indigo-200 hover:border-indigo-300"
    },
    {
      year: "2005-2008",
      status: "Concluído",
      institution: "Faculdade Impacta Tecnologia",
      course: "Bacharelado Gestão de Sistemas de Informação",
      tags: ["Gestão de TI", "Análise de Sistemas", "Banco de Dados", "Desenvolvimento de Software"],
      description: "Gestão estratégica de TI, análise e modelagem de sistemas",
      color: "border-green-200 hover:border-green-300"
    },
    {
      year: "2003-2004",
      status: "Concluído",
      institution: "Faculdade Anhembi Morumbi",
      course: "Tecnólogo Redes de Computadores",
      tags: ["Redes", "Infraestrutura", "Protocolos", "Administração de Sistemas"],
      description: "Redes de computadores, infraestrutura de TI, protocolos de comunicação",
      color: "border-orange-200 hover:border-orange-300"
    }
  ]

  const specializationData = [
    {
      year: "2025",
      status: "Em Andamento",
      institution: "LINUXtips",
      program: "PICK (Programa Intensivo em Containers e Kubernetes)",
      tags: ["Containers", "Kubernetes", "Mentoria", "Hands-on", "Carreira", "Especialista"],
      description: "Programa avançado em containers e Kubernetes para liderança e excelência operacional",
      color: "border-blue-200 hover:border-blue-300"
    },
    {
      year: "2025",
      status: "Em Andamento",
      institution: "Elemar Júnior",
      program: "Arquitetura de Software com ênfase em IA",
      tags: ["Arquitetura de Software", "Domain-Driven Design", "Padrões Arquiteturais", "Mentoria"],
      description: "Formação avançada em arquitetura de software, DDD e padrões arquiteturais",
      color: "border-purple-200 hover:border-purple-300"
    },
    {
      year: "2024",
      status: "Concluído",
      institution: "Strides Tech Community",
      program: "Head de Tecnologia 5.0",
      tags: ["Liderança Tech", "Networking", "Benchmark", "Mentoria com C-Levels", "Resolução de Problemas", "Aprendizado Contínuo"],
      description: "Programa executivo para líderes de tecnologia com networking e mentorias",
      color: "border-amber-200 hover:border-amber-300"
    },
    {
      year: "2023",
      status: "Concluído",
      institution: "Insper",
      program: "CTO: Chief Technology Officer",
      tags: ["Chief Technology Officer", "Estratégia de TI", "Governança Tecnológica", "Inovação", "Digital Leadership", "Transformação Digital"],
      description: "Formação executiva em transformação digital e liderança estratégica",
      color: "border-indigo-200 hover:border-indigo-300"
    }
  ]

  const certificationsData = [
    {
      name: "AWS Solutions Architect Associate",
      tags: ["Cloud Architecture", "Infrastructure", "Scalability"],
      description: "Arquitetura de soluções em nuvem, infraestrutura escalável, alta disponibilidade",
      color: "border-orange-200"
    },
    {
      name: "AWS Developer Associate",
      tags: ["Serverless", "APIs", "DevOps"],
      description: "Desenvolvimento de aplicações serverless, integração de APIs, automação de pipelines",
      color: "border-orange-200"
    },
    {
      name: "AWS Cloud Practitioner",
      tags: ["Cloud Fundamentals", "Cost Optimization"],
      description: "Fundamentos de computação em nuvem, conceitos de segurança, otimização de custos",
      color: "border-orange-200"
    },
    {
      name: "AWS AI Practitioner (Early Adopter)",
      tags: ["Machine Learning", "AI Services", "GenAI"],
      description: "Serviços de IA na AWS, fundamentos de machine learning, GenAI",
      color: "border-orange-200"
    },
    {
      name: "Kanban Management Professional (KMP)",
      tags: ["Agile", "Flow Management", "Lean"],
      description: "Gestão de fluxo de trabalho, práticas ágeis, sistemas Lean Kanban",
      color: "border-blue-200"
    },
    {
      name: "Customer Experience Professional (CXP)",
      tags: ["UX Strategy", "Customer Journey"],
      description: "Estratégias de experiência do usuário, mapeamento de jornada do cliente",
      color: "border-green-200"
    },
    {
      name: "Flight Levels Systems Architecture (FLSA)",
      tags: ["Systems Thinking", "Organizational Design"],
      description: "Pensamento sistêmico, arquitetura de níveis organizacionais",
      color: "border-purple-200"
    }
  ]

  const statusColors = {
    "Em Andamento": "bg-yellow-100 text-yellow-800",
    "Concluído": "bg-green-100 text-green-800"
  }


  return (
    <section id="education" className="section-padding bg-muted">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-blue-100 rounded-full text-sm text-blue-700 font-medium">
            <GraduationCap className="h-4 w-4" />
            Formação Acadêmica & Certificações
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-foreground">
            <span className="gradient-text">Educação Continuada</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Formação sólida e certificações técnicas que fundamentam a expertise em tecnologia e liderança.
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="bg-card rounded-xl p-2 shadow-lg border border-border">
            <button
              onClick={() => setActiveTab('education')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === 'education'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-muted-foreground hover:text-blue-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Formação & Especializações
              </div>
            </button>
            <button
              onClick={() => setActiveTab('certifications')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === 'certifications'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-muted-foreground hover:text-blue-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Certificações
              </div>
            </button>
          </div>
        </div>

        {activeTab === 'education' && (
          <div className="space-y-8">
            {/* Academic Education */}
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-blue-500" />
                Formação Acadêmica (6 Cursos)
              </h3>
              <div className="grid lg:grid-cols-2 gap-6">
                {educationData.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <MagicCard className={`p-6 h-full ${item.color}`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-muted-foreground text-sm">
                            <Calendar className="h-4 w-4" />
                            {item.year}
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[item.status as keyof typeof statusColors]}`}>
                            {item.status === 'Em Andamento' ? (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {item.status}
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                {item.status}
                              </div>
                            )}
                          </span>
                        </div>
                      </div>

                      <h4 className="text-lg font-bold text-card-foreground mb-2">
                        {item.course}
                      </h4>
                      <p className="text-sm font-medium text-blue-600 mb-3">
                        {item.institution}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                        {item.tags.length > 3 && (
                          <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                            +{item.tags.length - 3} mais
                          </span>
                        )}
                      </div>

                      <p className="text-muted-foreground text-base leading-relaxed">
                        {item.description}
                      </p>
                    </MagicCard>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Specializations */}
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Star className="h-6 w-6 text-purple-500" />
                Especializações (4 Programas)
              </h3>
              <div className="grid lg:grid-cols-2 gap-6">
                {specializationData.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <MagicCard className={`p-6 h-full ${item.color}`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-muted-foreground text-sm">
                            <Calendar className="h-4 w-4" />
                            {item.year}
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[item.status as keyof typeof statusColors]}`}>
                            {item.status === 'Em Andamento' ? (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {item.status}
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                {item.status}
                              </div>
                            )}
                          </span>
                        </div>
                      </div>

                      <h4 className="text-lg font-bold text-card-foreground mb-2">
                        {item.program}
                      </h4>
                      <p className="text-sm font-medium text-purple-600 mb-3">
                        {item.institution}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                        {item.tags.length > 3 && (
                          <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                            +{item.tags.length - 3} mais
                          </span>
                        )}
                      </div>

                      <p className="text-muted-foreground text-base leading-relaxed">
                        {item.description}
                      </p>
                    </MagicCard>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'certifications' && (
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Award className="h-6 w-6 text-green-500" />
              Certificações Técnicas (7 Certificações)
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificationsData.map((cert, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <MagicCard className={`p-6 h-full ${cert.color}`}>
                    <div className="p-3 bg-gray-50 rounded-xl w-fit mb-4">
                      <Award className="h-6 w-6 text-green-500" />
                    </div>

                    <h4 className="text-lg font-bold text-card-foreground mb-3">
                      {cert.name}
                    </h4>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {cert.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <p className="text-gray-600 text-base leading-relaxed">
                      {cert.description}
                    </p>
                  </MagicCard>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default Education