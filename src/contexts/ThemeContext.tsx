import React, { createContext, useContext, useState, useEffect } from 'react'

interface ThemeContextType {
  isDarkMode: boolean
  toggleDarkMode: () => void
  setDarkModeForBlog: () => void
  restorePreviousTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : false
  })

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode))
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    // Se o usuário mudou manualmente o tema, remover o tema salvo
    // para que a preferência manual seja respeitada
    localStorage.removeItem('preBlogTheme')
  }

  const setDarkModeForBlog = () => {
    // Salvar o tema atual antes de ativar dark mode para o blog
    const currentTheme = localStorage.getItem('darkMode')
    localStorage.setItem('preBlogTheme', currentTheme || 'false')
    setIsDarkMode(true)
  }

  const restorePreviousTheme = () => {
    // Restaurar o tema que estava ativo antes de entrar no blog
    const preBlogTheme = localStorage.getItem('preBlogTheme')
    if (preBlogTheme !== null) {
      const wasLightMode = JSON.parse(preBlogTheme) === false
      if (wasLightMode) {
        setIsDarkMode(false)
      }
      // Remove o tema salvo após restaurar
      localStorage.removeItem('preBlogTheme')
    }
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, setDarkModeForBlog, restorePreviousTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}