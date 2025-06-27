import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { MagicCard } from '../components/ui/magic-card'
import { useTheme } from '../contexts/ThemeContext'
import { useInteractionTracking } from '../contexts/MixpanelContext'
import { 
  Mail, 
  Github, 
  Linkedin, 
  MessageSquare,
  Send,
  ExternalLink
} from 'lucide-react'

const ContactPage: React.FC = () => {
  const { restorePreviousTheme } = useTheme()
  const { trackExternalLink, trackClick } = useInteractionTracking()

  useEffect(() => {
    // Restaurar tema anterior quando voltar para a página principal
    restorePreviousTheme()
    // Forçar scroll para o topo da página
    window.scrollTo(0, 0)
  }, [restorePreviousTheme])

  const contactMethods = [
    {
      icon: <Linkedin className="h-6 w-6 text-blue-600" />,
      title: "LinkedIn",
      value: "/in/tiagonpsilva",
      description: "Networking profissional e conteúdo",
      link: "https://linkedin.com/in/tiagonpsilva",
      action: "Conectar"
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
      icon: <Github className="h-6 w-6 text-gray-700" />,
      title: "GitHub",
      value: "/tiagonpsilva",
      description: "Projetos open source e colaborações",
      link: "https://github.com/tiagonpsilva",
      action: "Ver Perfil"
    },
    {
      icon: <Mail className="h-6 w-6 text-blue-500" />,
      title: "Email",
      value: "tiagonpsilva@gmail.com",
      description: "Para discussões técnicas e oportunidades",
      link: "mailto:tiagonpsilva@gmail.com",
      action: "Enviar Email"
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
      title: "Adoção de IA",
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
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-blue-100 rounded-full text-sm text-blue-700 font-medium">
              <Send className="h-4 w-4" />
              Vamos Conversar
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-foreground leading-tight">
              <span className="gradient-text">Entre em Contato</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-tight">
              Pronto para transformar sua visão tecnológica em realidade? Vamos discutir como posso ajudar.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-padding bg-muted">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Contact Methods */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="text-2xl font-bold text-foreground mb-8">
                Formas de Contato
              </h3>
              <div className="space-y-6">
                {contactMethods.map((method, index) => (
                  <MagicCard key={index} className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-muted rounded-xl">
                        {method.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-card-foreground mb-1">
                          {method.title}
                        </h4>
                        <p className="text-blue-600 font-medium mb-2 mono-font">
                          {method.value}
                        </p>
                        <p className="text-muted-foreground text-sm mb-4">
                          {method.description}
                        </p>
                        <a
                          href={method.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-200"
                          onClick={() => {
                            if (method.title === 'Email') {
                              trackClick('Contact Method', 'Contact Page', {
                                contact_method: 'email',
                                contact_href: method.link
                              })
                            } else {
                              trackExternalLink(method.link, method.title)
                            }
                          }}
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
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="text-2xl font-bold text-foreground mb-8">
                Como Posso Ajudar
              </h3>
              <div className="space-y-6">
                {availableServices.map((service, index) => (
                  <MagicCard key={index} className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{service.icon}</div>
                      <div>
                        <h4 className="text-lg font-bold text-card-foreground mb-2">
                          {service.title}
                        </h4>
                        <p className="text-muted-foreground leading-relaxed">
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
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
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
                    className="inline-flex items-center gap-2 px-8 py-4 bg-card text-blue-600 font-semibold rounded-xl hover:bg-muted transition-colors duration-300"
                    onClick={() => trackClick('Quick Contact CTA', 'Contact Page', {
                      contact_method: 'email_proposal',
                      contact_href: 'mailto:tiagonpsilva@gmail.com'
                    })}
                  >
                    <Mail className="h-5 w-5" />
                    Enviar Proposta
                  </a>
                  <a
                    href="https://wa.me/5511996531591?text=Olá%20Tiago!%20Gostaria%20de%20conversar%20sobre%20uma%20oportunidade%20de%20consultoria."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-blue-700 text-white font-semibold rounded-xl hover:bg-blue-800 transition-colors duration-300"
                    onClick={() => trackExternalLink('https://wa.me/5511996531591', 'WhatsApp Business')}
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
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
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
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center mt-16 pt-8 border-t border-border"
          >
            <p className="text-muted-foreground mb-4">
              © 2025 Tiago Pinto. Head de Tecnologia • 20+ Anos de Experiência
            </p>
            <div className="flex justify-center space-x-6">
              <a
                href="https://github.com/tiagonpsilva"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground/60 hover:text-muted-foreground transition-colors duration-200"
                onClick={() => trackExternalLink('https://github.com/tiagonpsilva', 'GitHub Footer')}
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com/in/tiagonpsilva"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground/60 hover:text-muted-foreground transition-colors duration-200"
                onClick={() => trackExternalLink('https://linkedin.com/in/tiagonpsilva', 'LinkedIn Footer')}
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="mailto:tiagonpsilva@gmail.com"
                className="text-muted-foreground/60 hover:text-muted-foreground transition-colors duration-200"
                onClick={() => trackClick('Contact Footer', 'Contact Page', {
                  contact_method: 'email',
                  contact_href: 'mailto:tiagonpsilva@gmail.com'
                })}
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bottom spacing */}
      <div className="pb-20 lg:pb-16"></div>
    </div>
  )
}

export default ContactPage