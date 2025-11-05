import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Welcome from '@/pages/Welcome'
import LandingPage from '@/pages/LandingPage'
import Login from '@/pages/Login'
import Signup from '@/pages/Signup'
import DashboardNew from '@/pages/DashboardNew'
import Journal from '@/pages/Journal'
import MindMap from '@/pages/MindMap'
import LifeTimeline from '@/pages/LifeTimeline'
import AICompanion from '@/pages/AICompanion'
import Community from '@/pages/Community'
import MindArchitect from '@/pages/MindArchitect'
import DigitalSoul from '@/pages/DigitalSoul'
import SensoryExpansion from '@/pages/SensoryExpansion'
import NeuroAdaptiveSettings from '@/pages/NeuroAdaptiveSettings'
import Pricing from '@/pages/Pricing'
import Marketplace from '@/pages/Marketplace'
import DeveloperPortal from '@/pages/DeveloperPortal'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { CustomCursor } from '@/components/CustomCursor'
import { AuthPrompt } from '@/components/AuthPrompt'
import Search from '@/pages/Search'
import APIDocs from '@/pages/APIDocs'

function App() {

  return (
    <Router>
      <CustomCursor />
      <AuthPrompt />
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/home" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/marketplace" element={<Marketplace />} />
  <Route path="/api-docs" element={<APIDocs />} />
  <Route path="/search" element={<Search />} />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardNew />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard-new"
          element={
            <ProtectedRoute>
              <DashboardNew />
            </ProtectedRoute>
          }
        />
        <Route
          path="/journal"
          element={
            <ProtectedRoute>
              <Journal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mind-map"
          element={
            <ProtectedRoute>
              <MindMap />
            </ProtectedRoute>
          }
        />
        <Route
          path="/timeline"
          element={
            <ProtectedRoute>
              <LifeTimeline />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-companion"
          element={
            <ProtectedRoute>
              <AICompanion />
            </ProtectedRoute>
          }
        />
        <Route
          path="/community"
          element={
            <ProtectedRoute>
              <Community />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mind-architect"
          element={
            <ProtectedRoute>
              <MindArchitect />
            </ProtectedRoute>
          }
        />
        <Route
          path="/digital-soul"
          element={
            <ProtectedRoute>
              <DigitalSoul />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sensory-expansion"
          element={
            <ProtectedRoute>
              <SensoryExpansion />
            </ProtectedRoute>
          }
        />
        <Route
          path="/neuro-adaptive"
          element={
            <ProtectedRoute>
              <NeuroAdaptiveSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/developer"
          element={<DeveloperPortal />}
        />
  <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Router>
  )
}

export default App
