import { AuthProvider, ProtectedRoute } from './features/auth'
import { TournamentConfigPage } from './features/tournament'
import { AdminLayout } from './components/layout/AdminLayout'

function App() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <AdminLayout>
          <TournamentConfigPage />
        </AdminLayout>
      </ProtectedRoute>
    </AuthProvider>
  )
}

export default App
