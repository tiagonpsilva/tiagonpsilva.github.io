import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  Home, 
  Sparkles,
  GraduationCap,
  BarChart3,
  Layers3,
  PenTool,
  MessageCircle,
  ChevronUp
} from 'lucide-react'

const BottomNavigation: React.FC = () => {
  const [isInicioExpanded, setIsInicioExpanded] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const inicioSubItems = [
    { href: '#home', label: 'Início', icon: <Home className="h-4 w-4" /> },
    { href: '#expertise', label: 'Expertise', icon: <Sparkles className="h-4 w-4" /> },
    { href: '#education', label: 'Formação', icon: <GraduationCap className="h-4 w-4" /> },
  ]

  const mainItems = [
    { 
      href: 'inicio', 
      label: 'Início', 
      icon: <Home className="h-5 w-5" />,
      isExpandable: true,
      subItems: inicioSubItems
    },
    { href: '/cases', label: 'Cases', icon: <BarChart3 className="h-5 w-5" />, isExternal: true },
    { href: '#projects', label: 'Projetos', icon: <Layers3 className="h-5 w-5" /> },
    { href: '/blog', label: 'Blog', icon: <PenTool className="h-5 w-5" />, isExternal: true },
    { href: '#contact', label: 'Contato', icon: <MessageCircle className="h-5 w-5" /> },
  ]

  const handleNavigation = (href: string, isExternal?: boolean, isExpandable?: boolean) => {
    if (isExpandable) {
      setIsInicioExpanded(!isInicioExpanded)
      return
    }

    if (isExternal) {
      navigate(href)
    } else {
      // Se estamos tentando navegar para uma seção e não estamos na página inicial
      if (location.pathname !== '/') {
        // Navegar para a página inicial com a âncora
        navigate('/' + href)
      } else {
        // Se já estamos na página inicial, fazer scroll para a seção com offset para o header
        const element = document.querySelector(href)
        if (element) {
          const headerHeight = 80 // Altura aproximada do header
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
          const offsetPosition = elementPosition - headerHeight
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          })
        }
      }
    }
    setIsInicioExpanded(false)
  }

  const handleSubItemClick = (href: string) => {
    // Se estamos tentando navegar para uma seção e não estamos na página inicial
    if (location.pathname !== '/') {
      // Navegar para a página inicial com a âncora
      navigate('/' + href)
    } else {
      // Se já estamos na página inicial, fazer scroll para a seção com offset para o header
      const element = document.querySelector(href)
      if (element) {
        const headerHeight = 80 // Altura aproximada do header
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
        const offsetPosition = elementPosition - headerHeight
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        })
      }
    }
    setIsInicioExpanded(false)
  }

  return (
    <>
      {/* Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border">
        <div className="flex items-center justify-around py-2 px-4">
          {mainItems.map((item) => (
            <button
              key={item.href}
              onClick={() => handleNavigation(item.href, item.isExternal, item.isExpandable)}
              className="flex flex-col items-center gap-1 p-2 min-w-0 text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              <div className="relative">
                {item.icon}
                {item.isExpandable && (
                  <motion.div
                    animate={{ rotate: isInicioExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute -top-1 -right-1"
                  >
                    <ChevronUp className="h-3 w-3" />
                  </motion.div>
                )}
              </div>
              <span className="text-xs font-medium truncate">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Expandable Menu for Início */}
      {isInicioExpanded && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.2 }}
          className="lg:hidden fixed bottom-16 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border"
        >
          <div className="p-4 space-y-2">
            {inicioSubItems.map((subItem) => (
              <button
                key={subItem.href}
                onClick={() => handleSubItemClick(subItem.href)}
                className="flex items-center gap-3 w-full p-3 text-left text-foreground hover:text-primary hover:bg-muted/50 rounded-lg transition-all duration-200"
              >
                {subItem.icon}
                <span className="font-medium">{subItem.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Overlay to close expanded menu */}
      {isInicioExpanded && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/20"
          onClick={() => setIsInicioExpanded(false)}
        />
      )}
    </>
  )
}

export default BottomNavigation