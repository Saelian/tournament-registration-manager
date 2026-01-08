import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, UserAuthProvider, ProtectedRoute, UserLoginPage } from '@features/auth'
import { TournamentConfigPage } from '@features/tournament'
import { TableListPage } from '@features/tables'
import { SponsorListPage } from '@features/sponsors'
import { LandingPage, PublicTableListPage, PlayersPage, FAQPage } from '@features/public'
import { DashboardPage } from '@features/dashboard'
import { ProfilePage } from '@features/profile'
import { PaymentCallbackPage } from '@features/payment'
import { AdminDashboardPage } from '@features/admin'
import { RegistrationsPage } from '@features/admin/registrations'
import { PaymentsPage } from '@features/admin/payments'
import { CheckinPage } from '@features/admin/checkin'
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
          <Route
            path="/players"
            element={
              <PublicLayout>
                <PlayersPage />
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
                    <Route path="tournament" element={<TournamentConfigPage />} />
                    <Route path="tables" element={<TableListPage />} />
                    <Route path="registrations" element={<RegistrationsPage />} />
                    <Route path="payments" element={<PaymentsPage />} />
                    <Route path="checkin" element={<CheckinPage />} />
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
