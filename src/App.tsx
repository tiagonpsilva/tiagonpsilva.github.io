import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './components/Header'
import BottomNavigation from './components/BottomNavigation'
import Hero from './components/Hero'
import Expertise from './components/Expertise'
import Education from './components/Education'
import BlogPage from './pages/BlogPage'
import ArticlePage from './pages/ArticlePage'
import CasesPage from './pages/CasesPage'
import LabsPage from './pages/LabsPage'
import ContactPage from './pages/ContactPage'
import AuthDebugPage from './pages/AuthDebugPage'
import LinkedInCallback from './components/LinkedInCallback'
import AuthModal from './components/AuthModal'
import AuthStatusIndicator from './components/AuthStatusIndicator'
import AuthErrorDisplayWrapper from './components/AuthErrorDisplayWrapper'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import { MixpanelProvider } from './contexts/MixpanelContext'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './components/ToastManager'
import { useRouteTracking } from './hooks/useRouteTracking'

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
    </>
  )
}

function AppContent() {
  // Track route changes for analytics
  useRouteTracking()
  
  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cases" element={<CasesPage />} />
        <Route path="/labs" element={<LabsPage />} />
        <Route path="/projects" element={<LabsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<ArticlePage />} />
        <Route path="/auth/debug" element={<AuthDebugPage />} />
        <Route path="/auth/linkedin/callback" element={<LinkedInCallback />} />
      </Routes>
      <BottomNavigation />
      {/* Add bottom padding to prevent content from being hidden behind bottom nav */}
      <div className="lg:hidden h-16" />
      {/* Auth Modal */}
      <AuthModal />
      {/* Auth Status Indicator */}
      <AuthStatusIndicator />
      {/* Auth Error Display */}
      <AuthErrorDisplayWrapper />
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <MixpanelProvider>
        <ToastProvider>
          <Router>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </Router>
        </ToastProvider>
      </MixpanelProvider>
    </ThemeProvider>
  )
}

export default App