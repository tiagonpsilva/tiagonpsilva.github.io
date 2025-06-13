import Header from './components/Header'
import Hero from './components/Hero'
import Expertise from './components/Expertise'
import Cases from './components/Cases'
import Education from './components/Education'
import Projects from './components/Projects'
import Contact from './components/Contact'
import { ThemeProvider } from './contexts/ThemeContext'

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background transition-colors duration-300">
        <Header />
        <Hero />
        <Expertise />
        <Cases />
        <Education />
        <Projects />
        <Contact />
      </div>
    </ThemeProvider>
  )
}

export default App