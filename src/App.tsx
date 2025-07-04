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
import LinkedInCallbackPage from './pages/LinkedInCallbackPage'
import AuthModal from './components/AuthModal'
import AuthStatusIndicator from './components/AuthStatusIndicator'
import AuthErrorDisplayWrapper from './components/AuthErrorDisplayWrapper'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import { MixpanelProvider } from './contexts/MixpanelContext'
import { AuthProvider } from './contexts/AuthContext'
import { MetricsProvider } from './contexts/MetricsContext'
import { ToastProvider } from './components/ToastManager'
import { useRouteTracing } from './hooks/useRouteTracing'

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
  // Track route changes for analytics with enhanced tracing
  useRouteTracing()
  
  return (
    <Routes>
      {/* LinkedIn Callback - FORA da estrutura principal para evitar carregar Header/Nav */}
      <Route path="/oauth/linkedin/callback" element={<LinkedInCallbackPage />} />
      
      {/* Todas outras rotas com estrutura completa */}
      <Route path="/*" element={
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
      } />
    </Routes>
  )
}

function App() {
  return (
    <ThemeProvider>
      <MixpanelProvider>
        <MetricsProvider>
          <ToastProvider>
            <Router>
              <AuthProvider>
                <AppContent />
              </AuthProvider>
            </Router>
          </ToastProvider>
        </MetricsProvider>
      </MixpanelProvider>
    </ThemeProvider>
  )
}

export default App