import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../ui/button'
import { useUserAuth } from '../../features/auth/UserAuthContext'
import { LoginModal } from '../../features/auth/LoginModal'
import { User, LogOut } from 'lucide-react'

interface PublicLayoutProps {
  children: ReactNode
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const { user, isAuthenticated, isLoading, logout, isLoggingOut } = useUserAuth()
  const [loginModalOpen, setLoginModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b-4 border-foreground bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold">
            Tournoi
          </Link>
          <div className="flex items-center gap-3">
            {isLoading ? (
              <span className="text-sm text-muted-foreground">...</span>
            ) : isAuthenticated && user ? (
              <>
                <Link to="/dashboard">
                  <Button variant="secondary" size="sm" className="gap-2">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">{user.email}</span>
                    <span className="sm:hidden">Mon espace</span>
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  disabled={isLoggingOut}
                  className="gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Déconnexion</span>
                </Button>
              </>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setLoginModalOpen(true)}
              >
                Se connecter
              </Button>
            )}
          </div>
        </div>
      </header>
      <main>{children}</main>

      <LoginModal
        open={loginModalOpen}
        onOpenChange={setLoginModalOpen}
      />
    </div>
  )
}
