import Header from './components/Header'
import Hero from './components/Hero'
import Expertise from './components/Expertise'
import Cases from './components/Cases'
import Education from './components/Education'
import Projects from './components/Projects'
import Contact from './components/Contact'

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <Expertise />
      <Cases />
      <Education />
      <Projects />
      <Contact />
    </div>
  )
}

export default App