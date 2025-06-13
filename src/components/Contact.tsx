import React from 'react'
import { motion } from 'framer-motion'
import { MagicCard } from './ui/magic-card'
import { 
  Mail, 
  Github, 
  Linkedin, 
  MessageSquare,
  Send,
  ExternalLink
} from 'lucide-react'

const Contact: React.FC = () => {
  const contactMethods = [
    {
      icon: <Mail className="h-6 w-6 text-blue-500" />,
      title: "Email",
      value: "tiagonpsilva@gmail.com",
      description: "Para discussões técnicas e oportunidades",
      link: "mailto:tiagonpsilva@gmail.com",
      action: "Enviar Email"
    },
    {
      icon: <MessageSquare className="h-6 w-6 text-green-500" />,
      title: "WhatsApp",
      value: "+55 11 99653-1591",
      description: "Para conversas rápidas e networking",
      link: "https://wa.me/5511996531591",
      action: "Abrir WhatsApp"
    },
    {
      icon: <Linkedin className="h-6 w-6 text-blue-600" />,
      title: "LinkedIn",
      value: "/in/tiagonpsilva",
      description: "Networking profissional e conteúdo",
      link: "https://linkedin.com/in/tiagonpsilva",
      action: "Conectar"
    },
    {
      icon: <Github className="h-6 w-6 text-gray-700" />,
      title: "GitHub",
      value: "/tiagonpsilva",
      description: "Projetos open source e colaborações",
      link: "https://github.com/tiagonpsilva",
      action: "Ver Perfil"
    }
  ]

  const availableServices = [
    {
      title: "Consultoria em Arquitetura",
      description: "System design, modernização de sistemas legados e definição de arquiteturas escaláveis",
      icon: "🏗️"
    },
    {
      title: "Liderança Técnica",
      description: "Mentoria de equipes, roadmap tecnológico e gestão de transformação digital",
      icon: "👥"
    },
    {
      title: "Implementação de IA",
      description: "Estratégia e implementação de soluções de IA Generativa em processos e produtos",
      icon: "🤖"
    },
    {
      title: "Modern Data Stack",
      description: "Plataformas de dados, analytics, governança e democratização de informações",
      icon: "📊"
    }
  ]

  return (
    <section id="contact" className="section-padding bg-gray-50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-blue-100 rounded-full text-sm text-blue-700 font-medium">
            <Send className="h-4 w-4" />
            Vamos Conversar
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-gray-900">
            <span className="gradient-text">Entre em Contato</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Pronto para transformar sua visão tecnológica em realidade? Vamos discutir como posso ajudar.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Contact Methods */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-8">
              Formas de Contato
            </h3>
            <div className="space-y-6">
              {contactMethods.map((method, index) => (
                <MagicCard key={index} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gray-50 rounded-xl">
                      {method.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900 mb-1">
                        {method.title}
                      </h4>
                      <p className="text-blue-600 font-medium mb-2 mono-font">
                        {method.value}
                      </p>
                      <p className="text-gray-600 text-sm mb-4">
                        {method.description}
                      </p>
                      <a
                        href={method.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-200"
                      >
                        {method.action}
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </MagicCard>
              ))}
            </div>
          </motion.div>

          {/* Services */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-8">
              Como Posso Ajudar
            </h3>
            <div className="space-y-6">
              {availableServices.map((service, index) => (
                <MagicCard key={index} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{service.icon}</div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">
                        {service.title}
                      </h4>
                      <p className="text-gray-600 leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </MagicCard>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Quick Contact */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <MagicCard className="p-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">
                Pronto para começar um projeto?
              </h3>
              <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
                Seja para uma consultoria pontual, liderança técnica ou implementação completa, 
                estou disponível para discutir como podemos trabalhar juntos.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:tiagonpsilva@gmail.com?subject=Oportunidade de Consultoria&body=Olá Tiago,%0D%0A%0D%0AGostaria de conversar sobre uma oportunidade de consultoria/projeto.%0D%0A%0D%0DDetalhes do projeto:%0D%0A%0D%0D%0D%0DObrigado!"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors duration-300"
                >
                  <Mail className="h-5 w-5" />
                  Enviar Proposta
                </a>
                <a
                  href="https://wa.me/5511996531591?text=Olá%20Tiago!%20Gostaria%20de%20conversar%20sobre%20uma%20oportunidade%20de%20consultoria."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-blue-700 text-white font-semibold rounded-xl hover:bg-blue-800 transition-colors duration-300"
                >
                  <MessageSquare className="h-5 w-5" />
                  Chat no WhatsApp
                </a>
              </div>
            </div>
          </MagicCard>
        </motion.div>

        {/* Background Image Card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <MagicCard className="p-0 overflow-hidden">
            <img 
              src="/background-blog.png" 
              alt="Background" 
              className="w-full h-auto"
            />
          </MagicCard>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-16 pt-8 border-t border-gray-200"
        >
          <p className="text-gray-500 mb-4">
            © 2025 Tiago Pinto. Head de Tecnologia • 20+ Anos de Experiência
          </p>
          <div className="flex justify-center space-x-6">
            <a
              href="https://github.com/tiagonpsilva"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="https://linkedin.com/in/tiagonpsilva"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a
              href="mailto:tiagonpsilva@gmail.com"
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Contact