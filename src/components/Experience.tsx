import React from 'react'
import { motion } from 'framer-motion'
import { MagicCard } from './ui/magic-card'
import { Calendar, MapPin, Briefcase } from 'lucide-react'

const Experience: React.FC = () => {
  const experiences = [
    {
      id: '1',
      company: 'Bantu Digital',
      position: 'Head de Tecnologia',
      location: 'São Paulo, SP',
      startDate: '2022',
      endDate: null,
      current: true,
      description: [
        'Liderança estratégica da área de tecnologia, definindo roadmap e arquitetura de sistemas',
        'Gestão de equipe multidisciplinar de 12+ desenvolvedores e designers',
        'Implementação de metodologias ágeis e melhores práticas de desenvolvimento',
        'Arquitetura e desenvolvimento de plataformas digitais escaláveis'
      ],
      technologies: ['React', 'Node.js', 'TypeScript', 'AWS', 'Docker', 'MongoDB'],
      achievements: [
        'Aumento de 300% na velocidade de entrega de features',
        'Redução de 80% nos bugs em produção',
        'Implementação de CI/CD que reduziu tempo de deploy em 90%'
      ]
    },
    {
      id: '2',
      company: 'TechSolutions',
      position: 'Tech Lead',
      location: 'São Paulo, SP',
      startDate: '2020',
      endDate: '2022',
      current: false,
      description: [
        'Liderança técnica de projetos complexos e mentoria de desenvolvedores',
        'Arquitetura de soluções escaláveis para clientes enterprise',
        'Implementação de padrões de código e revisão técnica',
        'Coordenação entre equipes de desenvolvimento e produto'
      ],
      technologies: ['Vue.js', 'Python', 'Django', 'PostgreSQL', 'Redis', 'Kubernetes'],
      achievements: [
        'Entrega de 5 projetos enterprise de grande escala',
        'Formação de 8 desenvolvedores júnior',
        'Implementação de arquitetura microserviços'
      ]
    },
    {
      id: '3',
      company: 'StartupTech',
      position: 'Full Stack Developer Senior',
      location: 'São Paulo, SP',
      startDate: '2018',
      endDate: '2020',
      current: false,
      description: [
        'Desenvolvimento full-stack de aplicações web e mobile',
        'Criação de APIs RESTful e GraphQL escaláveis',
        'Implementação de testes automatizados e integração contínua',
        'Colaboração direta com product managers e designers'
      ],
      technologies: ['React', 'React Native', 'Node.js', 'GraphQL', 'MySQL', 'Jest'],
      achievements: [
        'Desenvolvimento de MVP que captou R$ 2M em investimento',
        'Otimização que melhorou performance em 250%',
        'Implementação de cobertura de testes de 95%'
      ]
    }
  ]

  return (
    <section id="experience" className="section-padding bg-white">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            <span className="gradient-text">Experiência Profissional</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Uma jornada de crescimento contínuo, liderando equipes e construindo 
            soluções que transformam negócios.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {experiences.map((exp, index) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative mb-12"
            >
              {/* Timeline line */}
              {index < experiences.length - 1 && (
                <div className="absolute left-1/2 top-full w-0.5 h-12 bg-gradient-to-b from-blue-500 to-purple-500 transform -translate-x-1/2 hidden lg:block" />
              )}
              
              {/* Timeline dot */}
              <div className="absolute left-1/2 top-8 w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transform -translate-x-1/2 hidden lg:block" />
              
              <MagicCard className="p-8 lg:ml-8">
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Left: Company info */}
                  <div className="lg:col-span-1">
                    <div className="flex items-center mb-2">
                      <Briefcase className="h-5 w-5 text-blue-600 mr-2" />
                      <h3 className="text-xl font-bold text-gray-800">{exp.position}</h3>
                    </div>
                    <p className="text-lg font-semibold text-purple-600 mb-2">{exp.company}</p>
                    
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{exp.location}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600 mb-4">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span className="text-sm">
                        {exp.startDate} - {exp.current ? 'Presente' : exp.endDate}
                      </span>
                    </div>

                    {exp.current && (
                      <span className="inline-flex px-3 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                        Atual
                      </span>
                    )}
                  </div>

                  {/* Right: Details */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Responsabilidades:</h4>
                      <ul className="space-y-2">
                        {exp.description.map((desc, idx) => (
                          <li key={idx} className="text-gray-600 text-sm flex items-start">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0" />
                            {desc}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Technologies */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Tecnologias:</h4>
                      <div className="flex flex-wrap gap-2">
                        {exp.technologies.map((tech, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Achievements */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Principais Conquistas:</h4>
                      <ul className="space-y-1">
                        {exp.achievements.map((achievement, idx) => (
                          <li key={idx} className="text-gray-600 text-sm flex items-start">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 flex-shrink-0" />
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </MagicCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Experience