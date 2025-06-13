import React from 'react'
import { motion } from 'framer-motion'
import { MagicCard } from './ui/magic-card'
import { 
  Github, 
  ExternalLink, 
  BookOpen,
  Mail,
  Code,
  Database,
  Brain,
  FileText,
  Star
} from 'lucide-react'

const Projects: React.FC = () => {
  const githubProjects = [
    {
      name: "Github MCPilot para Cursor IDE",
      description: "Agente de IA para automação real de operações no Github via Cursor IDE",
      tags: ["Github", "Cursor IDE", "MCP", "Agente IA"],
      link: "https://github.com/tiagonpsilva/github-mcpilot",
      icon: <Github className="h-6 w-6" />,
      color: "border-purple-200 hover:border-purple-300"
    },
    {
      name: "System Design Concepts",
      description: "Conceitos fundamentais de design de sistemas distribuídos e escaláveis",
      tags: ["System Design", "Architecture", "Scalability"],
      link: "https://github.com/tiagonpsilva/system-design-concepts",
      icon: <Code className="h-6 w-6" />,
      color: "border-blue-200 hover:border-blue-300"
    },
    {
      name: "Modern Data Stack Training",
      description: "Curso prático sobre ferramentas modernas de engenharia de dados e pipelines",
      tags: ["Data Engineering", "Airflow", "dbt", "Spark"],
      link: "https://github.com/tiagonpsilva/treinamento-modern-data-stack-01",
      icon: <Database className="h-6 w-6" />,
      color: "border-cyan-200 hover:border-cyan-300"
    },
    {
      name: "GenAI LangChain Tutorial",
      description: "Guia completo para desenvolvimento de aplicações com LangChain e IA Generativa",
      tags: ["AI", "LangChain", "LLM", "GenAI"],
      link: "https://github.com/tiagonpsilva/genai-langchain-tutorial",
      icon: <Brain className="h-6 w-6" />,
      color: "border-pink-200 hover:border-pink-300"
    },
    {
      name: "Architecture Decision Records",
      description: "Coleção de templates e exemplos para documentação de decisões arquiteturais",
      tags: ["ADR", "Documentation", "Architecture"],
      link: "https://github.com/tiagonpsilva/architecture-decision-records",
      icon: <FileText className="h-6 w-6" />,
      color: "border-green-200 hover:border-green-300"
    }
  ]

  const newsletter = {
    name: "Bantu Digital",
    description: "Newsletter semanal sobre Tecnologia, IA, Dados, Arquitetura e Engenharia",
    content: "Prático, tendências e experiências reais para liderança e inovação digital",
    link: "https://www.linkedin.com/newsletters/7331120186697138176/",
    subscribers: "1.200+ profissionais",
    frequency: "Semanal",
    topics: ["Tecnologia", "IA", "Dados", "Arquitetura", "Engenharia", "Liderança"]
  }

  return (
    <section id="projects" className="section-padding bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-blue-100 rounded-full text-sm text-blue-700 font-medium">
            <Code className="h-4 w-4" />
            Projetos & Conteúdo
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-foreground">
            <span className="gradient-text">Projetos Compartilhados</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Projetos open source e conteúdo educacional para compartilhar conhecimento com a comunidade tech.
          </p>
        </motion.div>

        {/* Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <MagicCard className="p-8 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-700">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-500 rounded-xl">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">
                      Newsletter {newsletter.name}
                    </h3>
                    <p className="text-blue-600 font-medium">
                      {newsletter.subscribers} • {newsletter.frequency}
                    </p>
                  </div>
                </div>
                
                <p className="text-foreground/80 mb-4 leading-relaxed">
                  {newsletter.description}
                </p>
                
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {newsletter.content}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {newsletter.topics.map((topic, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-full font-medium">
                      {topic}
                    </span>
                  ))}
                </div>

                <a
                  href={newsletter.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors duration-300"
                >
                  <Mail className="h-5 w-5" />
                  Assinar Newsletter
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>

              <div className="relative">
                <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden">
                      <img 
                        src="/bantu01.png" 
                        alt="Logo Bantu Digital"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Bantu Digital</h4>
                      <p className="text-gray-500 text-sm">Newsletter Tecnológica</p>
                    </div>
                  </div>
                  <div className="h-32 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                    {/* Background pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <img 
                        src="/bantu01.png" 
                        alt="Bantu Digital"
                        className="w-full h-full object-cover blur-sm"
                      />
                    </div>
                    <div className="relative text-center z-10">
                      <BookOpen className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-700 font-medium">Conteúdo Técnico Semanal</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Toda Sexta-feira</span>
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      4.8/5.0
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </MagicCard>
        </motion.div>

        {/* GitHub Projects */}
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-2">
            <Github className="h-6 w-6 text-muted-foreground" />
            Projetos Open Source (5 Repositórios)
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {githubProjects.map((project, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <MagicCard className={`p-6 h-full ${project.color} group`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-muted rounded-xl group-hover:bg-muted/80 transition-colors duration-300">
                      {project.icon}
                    </div>
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-muted rounded-lg transition-colors duration-200"
                    >
                      <ExternalLink className="h-5 w-5 text-muted-foreground hover:text-blue-600" />
                    </a>
                  </div>

                  <h4 className="text-lg font-bold text-card-foreground mb-3 group-hover:text-blue-600 transition-colors duration-300">
                    {project.name}
                  </h4>

                  <p className="text-muted-foreground text-base mb-4 leading-relaxed">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-1 bg-muted text-muted-foreground text-sm rounded-full mono-font">
                        {tag}
                      </span>
                    ))}
                  </div>
                </MagicCard>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
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
  )
}

export default Projects