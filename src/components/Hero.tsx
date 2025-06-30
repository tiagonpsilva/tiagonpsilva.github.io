import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowDown, Github, Linkedin, Mail, MessageSquare } from 'lucide-react'
import { MagicCard } from './ui/magic-card'
import { useMetrics } from '../contexts/MetricsContext'

const Hero: React.FC = () => {
  const { portfolio, contact } = useMetrics()

  // Track homepage view on mount
  useEffect(() => {
    portfolio.trackHomepageView()
  }, [portfolio])

  const scrollToNext = () => {
    const aboutSection = document.querySelector('#expertise')
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' })
      portfolio.trackExpertiseView()
    }
  }

  const highlights = [
    { 
      title: "Liderança", 
      subtitle: "Executiva",
      description: "Roadmap tecnológico e transformação digital",
      gradient: "from-emerald-400 to-teal-600",
      icon: "👑"
    },
    { 
      title: "Software", 
      subtitle: "Engineering",
      description: "Arquitetura e desenvolvimento full-stack",
      gradient: "from-blue-400 to-indigo-600",
      icon: "💻"
    },
    { 
      title: "Dados", 
      subtitle: "& Analytics",
      description: "Modern data stack e democratização",
      gradient: "from-purple-400 to-violet-600",
      icon: "📊"
    },
    { 
      title: "IA", 
      subtitle: "Generativa",
      description: "Automação inteligente e LLMs",
      gradient: "from-pink-400 to-rose-600",
      icon: "🤖"
    }
  ]

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-background to-gray-50 dark:from-[hsl(var(--background))] dark:via-[hsl(var(--background))] dark:to-[hsl(var(--card))]">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `
            linear-gradient(rgba(71, 85, 105, 0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(71, 85, 105, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }} />
        
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-300/20 to-cyan-300/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-r from-purple-300/20 to-violet-300/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-gradient-to-r from-blue-300/20 to-indigo-300/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000" />
      </div>
      
      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="max-w-6xl mx-auto text-center">
          {/* Profile Image */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
            className="w-72 h-72 mx-auto mb-12 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-slate-300 to-slate-400 rounded-full animate-spin-slow opacity-75" />
            <div className="relative w-full h-full p-2">
              <img 
                src="https://github.com/tiagonpsilva.png" 
                alt="Tiago Pinto"
                className="w-full h-full rounded-full object-cover ring-4 ring-background shadow-2xl"
              />
            </div>
          </motion.div>

          {/* Main title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-6"
          >
            <h1 className="text-6xl lg:text-8xl font-bold mb-4 tracking-tight">
              <span className="bg-gradient-to-r from-foreground via-foreground/80 to-foreground bg-clip-text text-transparent">
                Tiago Pinto
              </span>
            </h1>
            <div className="space-y-2">
              <p className="text-2xl lg:text-3xl font-semibold text-foreground">
                Head de Tecnologia
              </p>
              <p className="text-lg text-muted-foreground font-medium">
                20+ Anos transformando ideias em soluções digitais
              </p>
            </div>
          </motion.div>

          {/* Highlights Cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12"
          >
            {highlights.map((highlight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
              >
                <MagicCard className="p-6 h-full group hover:-translate-y-1 transition-transform duration-300">
                  <div className="text-4xl mb-4">{highlight.icon}</div>
                  <div className="text-left">
                    <h3 className="font-bold text-card-foreground text-xl leading-tight">
                      {highlight.title}
                    </h3>
                    <p className={`font-semibold text-base bg-gradient-to-r ${highlight.gradient} bg-clip-text text-transparent mb-3`}>
                      {highlight.subtitle}
                    </p>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {highlight.description}
                    </p>
                  </div>
                </MagicCard>
              </motion.div>
            ))}
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Especialista em arquitetura de sistemas, liderança de equipes e implementação de IA. 
            Desenvolvendo soluções inovadoras que impactam milhares de usuários e transformam negócios.
          </motion.p>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex justify-center space-x-4 mb-16"
          >
            {[
              { icon: Github, href: "https://github.com/tiagonpsilva", label: "GitHub", color: "hover:bg-gray-700" },
              { icon: Linkedin, href: "https://linkedin.com/in/tiagonpsilva", label: "LinkedIn", color: "hover:bg-blue-600" },
              { icon: Mail, href: "mailto:tiagonpsilva@gmail.com", label: "Email", color: "hover:bg-emerald-600" },
              { icon: MessageSquare, href: "https://wa.me/5511996531591", label: "WhatsApp", color: "hover:bg-green-600" }
            ].map((social, index) => (
              <motion.a
                key={index}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                onClick={() => {
                  if (social.label === 'GitHub') portfolio.trackGithubVisit('portfolio')
                  else if (social.label === 'LinkedIn') contact.trackLinkedInClick()
                  else if (social.label === 'Email') contact.trackEmailClick()
                  else if (social.label === 'WhatsApp') contact.trackWhatsAppClick()
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <MagicCard className={`p-4 group ${social.color} hover:text-white transition-all duration-300 hover:-translate-y-1`}>
                  <social.icon className="h-6 w-6 text-muted-foreground group-hover:text-white transition-colors duration-300" />
                </MagicCard>
              </motion.a>
            ))}
          </motion.div>

          {/* Scroll indicator */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            onClick={scrollToNext}
            className="group flex flex-col items-center text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            <span className="text-sm mb-2 tracking-wide font-medium">Explorar expertise</span>
            <MagicCard className="p-3 rounded-full group-hover:-translate-y-1 transition-transform duration-300">
              <ArrowDown className="h-5 w-5 animate-bounce" />
            </MagicCard>
          </motion.button>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  )
}

export default Hero