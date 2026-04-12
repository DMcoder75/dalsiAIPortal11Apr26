import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './index.css'
import './App.css'
import { AuthProvider } from './contexts/AuthContext'
import { AdminAuthProvider } from './contexts/AdminAuthContext'
import logger from './lib/logger'
import DebugPanel from './components/DebugPanel'

// Redirect from www to non-www domain for consistent OAuth URIs
if (typeof window !== 'undefined' && window.location.hostname === 'www.neodalsi.com') {
  const newUrl = 'https://neodalsi.com' + window.location.pathname + window.location.search + window.location.hash
  window.location.href = newUrl
}

// Initialize logger on app start
logger.info('🚀 Application started at', new Date().toISOString())
logger.info('📍 Initial URL:', window.location.href)

// Import page components
import HomePage from './pages/HomePage'
import About from './pages/About'
import Contact from './pages/Contact'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsConditions from './pages/TermsConditions'
import Sitemap from './pages/Sitemap'
import VerifyEmail from './pages/VerifyEmail'
import ApiDocs from './pages/ApiDocs'
import Careers from './pages/Careers'
import NewsUpdates from './pages/NewsUpdates'
import SupportCenter from './pages/SupportCenter'
import Documentation from './pages/Documentation'
import Community from './pages/Community'
import Partners from './pages/Partners'
import SubscriptionSettings from './pages/SubscriptionSettings'
import GmailCallback from './pages/GmailCallback'
import Experience from './pages/Experience'
import VertoAI from './pages/VertoAI'

// Import admin components
import AdminLogin from './pages/admin/AdminLogin'
import AdminLayout from './components/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import UserManagement from './pages/admin/UserManagement'
import ApiKeysManagement from './pages/admin/ApiKeysManagement'
import Analytics from './pages/admin/Analytics'
import ApiLogs from './pages/admin/ApiLogs'
import Subscriptions from './pages/admin/Subscriptions'
import FrictionManagement from './pages/admin/FrictionManagement'

function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <Router>
        <DebugPanel />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route path="/sitemap" element={<Sitemap />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/api-docs" element={<ApiDocs />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/news-updates" element={<NewsUpdates />} />
          <Route path="/support-center" element={<SupportCenter />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="/community" element={<Community />} />
          <Route path="/partners" element={<Partners />} />
          <Route path="/subscription-settings" element={<SubscriptionSettings />} />
          <Route path="/auth/gmail/callback" element={<GmailCallback />} />
          <Route path="/experience" element={<Experience />} />
          <Route path="/chat" element={<Experience />} />
          <Route path="/vertoai" element={<VertoAI />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="api-keys" element={<ApiKeysManagement />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="logs" element={<ApiLogs />} />
            <Route path="subscriptions" element={<Subscriptions />} />
            <Route path="friction" element={<FrictionManagement />} />
          </Route>
        </Routes>
        </Router>
      </AdminAuthProvider>
    </AuthProvider>
  )
}

export default App
