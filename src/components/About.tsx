import React from 'react'
import { motion } from 'framer-motion'
import { MagicCard } from './ui/magic-card'
import { Code, Users, Lightbulb, Target, Star } from 'lucide-react'

const About: React.FC = () => {
  const highlights = [
    {
      icon: <Code className="h-6 w-6 text-purple-400" />,
      title: "Full-Stack Development",
      description: "Expertise em tecnologias modernas, desde frontend responsivo até arquiteturas backend escaláveis."
    },
    {
      icon: <Users className="h-6 w-6 text-pink-400" />,
      title: "Tech Leadership",
      description: "Experiência em gestão de equipes de desenvolvimento e mentoria de profissionais."
    },
    {
      icon: <Lightbulb className="h-6 w-6 text-blue-400" />,
      title: "Inovação Digital",
      description: "Soluções criativas que agregam valor real ao negócio e melhoram a experiência do usuário."
    },
    {
      icon: <Target className="h-6 w-6 text-green-400" />,
      title: "Resultados",
      description: "Track record comprovado em entregar projetos complexos dentro do prazo e orçamento."
    }
  ]

  return (
    <section id="about" className="section-padding bg-gray-950 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(168, 85, 247, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(217, 70, 239, 0.1) 0%, transparent 50%)
          `
        }} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 glass-effect rounded-full text-sm text-gray-400">
            <Star className="h-4 w-4 text-purple-400" />
            Sobre mim
          </div>
          <h2 className="text-4xl lg:text-6xl font-bold mb-6 tracking-tight">
            <span className="text-white">Transformando</span>
            <br />
            <span className="gradient-text">ideias em código</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Com mais de 8 anos de experiência, atuo como Head de Tecnologia 
            criando produtos digitais que fazem a diferença no mercado.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Left side - Personal story */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <MagicCard className="p-8 bg-gray-900/50 border-gray-800">
              <h3 className="text-2xl font-bold mb-6 text-white">Minha Jornada</h3>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  Comecei como desenvolvedor full-stack apaixonado por resolver 
                  problemas complexos com código elegante e eficiente.
                </p>
                <p>
                  Evoluí para posições de liderança, onde pude combinar expertise 
                  técnica com visão estratégica de negócio.
                </p>
                <p>
                  Hoje lidero equipes na criação de produtos que impactam 
                  milhares de usuários, sempre priorizando qualidade e inovação.
                </p>
              </div>
              
              <div className="mt-8 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-2xl">
                  🚀
                </div>
                <div>
                  <p className="text-white font-semibold">Próximo nível</p>
                  <p className="text-gray-400 text-sm">Sempre buscando inovação</p>
                </div>
              </div>
            </MagicCard>
          </motion.div>

          {/* Right side - Stats */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-6"
          >
            {[
              { number: "8+", label: "Anos de Experiência", color: "text-purple-400" },
              { number: "50+", label: "Projetos Entregues", color: "text-pink-400" },
              { number: "15+", label: "Tecnologias", color: "text-blue-400" },
              { number: "10+", label: "Devs Mentorados", color: "text-green-400" }
            ].map((stat, index) => (
              <MagicCard key={index} className="text-center p-6 bg-gray-900/30 border-gray-800">
                <div className={`text-3xl font-bold mb-2 ${stat.color}`}>{stat.number}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </MagicCard>
            ))}
          </motion.div>
        </div>

        {/* Highlights grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((highlight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <MagicCard className="p-6 h-full bg-gray-900/30 border-gray-800 hover:bg-gray-900/50 transition-all duration-300">
                <div className="mb-4 p-3 bg-gray-800/50 rounded-xl w-fit">
                  {highlight.icon}
                </div>
                <h4 className="text-lg font-semibold mb-3 text-white">
                  {highlight.title}
                </h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {highlight.description}
                </p>
              </MagicCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default About