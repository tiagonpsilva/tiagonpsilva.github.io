import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import Expertise from './components/Expertise'
import Education from './components/Education'
import Projects from './components/Projects'
import Contact from './components/Contact'
import BlogPage from './pages/BlogPage'
import ArticlePage from './pages/ArticlePage'
import CasesPage from './pages/CasesPage'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'

function HomePage() {
  const { restorePreviousTheme } = useTheme()
  
  useEffect(() => {
    // Restaurar tema anterior quando voltar para a página principal
    restorePreviousTheme()
  }, [restorePreviousTheme])

  return (
    <>
      <Hero />
      <Expertise />
      <Education />
      <Projects />
      <Contact />
    </>
  )
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-background transition-colors duration-300">
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/cases" element={<CasesPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<ArticlePage />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App