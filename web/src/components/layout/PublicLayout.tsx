import { useState, type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { Button, buttonVariants } from '../ui/button'
import { useUserAuth } from '../../features/auth/UserAuthContext'
import { LoginModal } from '../../features/auth/LoginModal'
import { ProfileCompletionModal } from '../../features/profile/ProfileCompletionModal'
import { cn } from '../../lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'

interface PublicLayoutProps {
  children: ReactNode
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const { user, isAuthenticated, isLoading, logout, isLoggingOut } = useUserAuth()
  const [loginModalOpen, setLoginModalOpen] = useState(false)

  const showProfileModal = isAuthenticated && user && !user.isProfileComplete

  const getUserDisplayName = () => {
    if (!user) return ''
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`
    }
    return user.email
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b-4 border-foreground bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">

          {/* Navigation desktop */}
          <div className="hidden md:block">
            {isAuthenticated && user && (
              <nav className="flex items-center gap-4">
                <NavLink
                  to="/"
                  className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }))}
                >
                  Accueil
                </NavLink>
                <NavLink
                  to="/profile"
                  className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }))}
                >
                  Mon profil
                </NavLink>
                <NavLink
                  to="/dashboard"
                  className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }))}
                >
                  Mes inscriptions
                </NavLink>
              </nav>
            )}
          </div>

          {/* Menu burger mobile */}
          <div className="md:hidden">
            {isAuthenticated && user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="sm">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem asChild>
                    <NavLink to="/" className="w-full cursor-pointer">
                      Accueil
                    </NavLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <NavLink to="/profile" className="w-full cursor-pointer">
                      Mon profil
                    </NavLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <NavLink to="/dashboard" className="w-full cursor-pointer">
                      Mes inscriptions
                    </NavLink>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-muted-foreground text-xs">
                    {getUserDisplayName()}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={logout}
                    disabled={isLoggingOut}
                    className="cursor-pointer"
                  >
                    {isLoggingOut ? 'Déconnexion...' : 'Déconnexion'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isLoading ? (
              <span className="text-sm text-muted-foreground">...</span>
            ) : isAuthenticated && user ? (
              <>
                <span className="text-sm font-medium hidden md:inline-block">
                  Connecté en tant que {getUserDisplayName()}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={logout}
                  disabled={isLoggingOut}
                  className="hidden md:inline-flex"
                >
                  {isLoggingOut ? 'Déconnexion...' : 'Déconnexion'}
                </Button>
              </>
            ) : (
              <Button variant="secondary" size="sm" onClick={() => setLoginModalOpen(true)}>
                Se connecter
              </Button>
            )}
          </div>
        </div>
      </header>
      <main>{children}</main>

      <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />

      <ProfileCompletionModal user={user ?? null} open={!!showProfileModal} />
    </div>
  )
}
