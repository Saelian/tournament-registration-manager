import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../ui/button'
import { useUserAuth } from '../../features/auth/UserAuthContext'
import { LoginModal } from '../../features/auth/LoginModal'
import { UserMenu } from './UserMenu'
import { ProfileCompletionModal } from '../../features/profile/ProfileCompletionModal'

interface PublicLayoutProps {
  children: ReactNode
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const { user, isAuthenticated, isLoading, logout, isLoggingOut } = useUserAuth()
  const [loginModalOpen, setLoginModalOpen] = useState(false)

  const showProfileModal = isAuthenticated && user && !user.isProfileComplete

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
              <UserMenu user={user} onLogout={logout} isLoggingOut={isLoggingOut} />
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

      <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />

      <ProfileCompletionModal user={user} open={!!showProfileModal} />
    </div>
  )
}
