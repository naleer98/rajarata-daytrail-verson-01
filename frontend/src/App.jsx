import { useEffect, useRef } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import AIChatBot from './components/AIChatBot.jsx'
import ToastHost from './components/ToastHost.jsx'
import SeoManager from './components/SeoManager.jsx'
import InstallPrompt from './components/InstallPrompt.jsx'
import { SitePreferencesProvider } from './context/SitePreferencesContext.jsx'
import HomePage from './pages/HomePage.jsx'
import ExplorePage from './pages/ExplorePage.jsx'
import PlaceDetailPage from './pages/PlaceDetailPage.jsx'
import PlannerPage from './pages/PlannerPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import AdminDashboardPage from './pages/AdminDashboardPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname])
  return null
}

function AdminRoute({ children }) {
  const isAdmin = localStorage.getItem('token') && localStorage.getItem('userRole') === 'admin'
  return isAdmin ? children : <Navigate to="/login" replace />
}

function AnimatedRoutes() {
  const location = useLocation()
  const routeRef = useRef(null)

  useEffect(() => {
    routeRef.current?.focus({ preventScroll: true })
  }, [location.pathname])

  return (
    <div
      className="route-transition"
      id="main-content"
      key={location.pathname}
      ref={routeRef}
      tabIndex="-1"
    >
      <Routes location={location}>
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/place/:id" element={<PlaceDetailPage />} />
        <Route path="/planner" element={<PlannerPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <SitePreferencesProvider>
      <BrowserRouter>
        <ScrollToTop />
        <SeoManager />
        <div className="app-shell">
          <a className="skip-link" href="#main-content">Skip to main content</a>
          <Navbar />
          <AnimatedRoutes />
          <AIChatBot />
          <Footer />
          <InstallPrompt />
          <ToastHost />
        </div>
      </BrowserRouter>
    </SitePreferencesProvider>
  )
}
