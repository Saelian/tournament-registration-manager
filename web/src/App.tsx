import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, UserAuthProvider, ProtectedRoute, UserLoginPage } from './features/auth'
import { TournamentConfigPage } from './features/tournament'
import { TableListPage } from './features/tables'
import { TournamentListPage, PublicTableListPage } from './features/public'
import { AdminLayout } from './components/layout/AdminLayout'
import { PublicLayout } from './components/layout/PublicLayout'

function App() {
  return (
    <AuthProvider>
      <UserAuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <PublicLayout>
                <TournamentListPage />
              </PublicLayout>
            }
          />
          <Route path="/login" element={<UserLoginPage />} />
          <Route
            path="/tournaments/:tournamentId/tables"
            element={
              <PublicLayout>
                <PublicTableListPage />
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
                    <Route path="tournament" element={<TournamentConfigPage />} />
                    <Route path="tables" element={<TableListPage />} />
                    <Route path="*" element={<Navigate to="tournament" replace />} />
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
