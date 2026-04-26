import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, UserAuthProvider, ProtectedRoute, UserProtectedRoute, UserLoginPage } from '@features/auth'
import { AdminTournamentConfigPage } from '@features/tournament'
import { AdminTableListPage, PublicTableListPage } from '@features/tables'
import { SponsorListPage } from '@features/sponsors'
import { LandingPage, FAQPage } from '@features/tournament'
import { PublicPlayersPage, AdminRegistrationsPage } from '@features/registrations'
import { MySpacePage } from '@features/user-space'
import { PaymentCallbackPage, AdminPaymentsPage } from '@features/payments'
import { AdminDashboardPage, AdminLogsPage } from '@features/admin'
import { AdminCheckinPage } from '@features/checkin'
import { AdminLayout } from '@components/layout/AdminLayout'
import { PublicLayout } from '@components/layout/PublicLayout'
import { Toaster } from '@components/ui/sonner'

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
            path="/profile"
            element={
              <UserProtectedRoute>
                <PublicLayout>
                  <MySpacePage />
                </PublicLayout>
              </UserProtectedRoute>
            }
          />
          {/* Redirections pour compatibilité */}
          <Route path="/dashboard" element={<Navigate to="/profile" replace />} />
          <Route path="/mon-espace" element={<Navigate to="/profile" replace />} />
          <Route
            path="/tournaments/:tournamentId/tables"
            element={
              <PublicLayout>
                <PublicTableListPage />
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
          <Route
            path="/players"
            element={
              <PublicLayout>
                <PublicPlayersPage />
              </PublicLayout>
            }
          />
          {/* Redirection pour compatibilité avec l'ancienne URL */}
          <Route path="/players/by-table" element={<Navigate to="/players" replace />} />
          <Route
            path="/faq"
            element={
              <PublicLayout>
                <FAQPage />
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
                    <Route path="tournament" element={<AdminTournamentConfigPage />} />
                    <Route path="tables" element={<AdminTableListPage />} />
                    <Route path="registrations" element={<AdminRegistrationsPage />} />
                    <Route path="payments" element={<AdminPaymentsPage />} />
                    <Route path="checkin" element={<AdminCheckinPage />} />
                    <Route path="logs" element={<AdminLogsPage />} />
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
