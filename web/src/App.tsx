import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, UserAuthProvider, ProtectedRoute, UserLoginPage } from './features/auth'
import { TournamentConfigPage } from './features/tournament'
import { SponsorListPage } from './features/sponsors'
import { LandingPage, PublicTableListPage } from './features/public'
import { DashboardPage } from './features/dashboard'
import { ProfilePage } from './features/profile'
import { PaymentCallbackPage } from './features/payment'
import { AdminDashboardPage } from './features/admin'
import { AdminLayout } from './components/layout/AdminLayout'
import { PublicLayout } from './components/layout/PublicLayout'
import { Toaster } from './components/ui/sonner'

function App() {
  return (
    <AuthProvider>
      <UserAuthProvider>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <PublicLayout>
                <LandingPage />
              </PublicLayout>
            }
          />
          <Route path="/login" element={<UserLoginPage />} />
          <Route
            path="/dashboard"
            element={
              <PublicLayout>
                <DashboardPage />
              </PublicLayout>
            }
          />
          <Route
            path="/tournaments/:tournamentId/tables"
            element={
              <PublicLayout>
                <PublicTableListPage />
              </PublicLayout>
            }
          />
          <Route
            path="/profile"
            element={
              <PublicLayout>
                <ProfilePage />
              </PublicLayout>
            }
          />
          <Route
            path="/payment/callback"
            element={
              <PublicLayout>
                <PaymentCallbackPage />
              </PublicLayout>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Routes>
                    <Route index element={<AdminDashboardPage />} />
                    <Route path="tournament" element={<TournamentConfigPage />} />
                    <Route path="sponsors" element={<SponsorListPage />} />
                    <Route path="*" element={<Navigate to="/admin" replace />} />
                  </Routes>
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </UserAuthProvider>
    </AuthProvider>
  )
}

export default App
