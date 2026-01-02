import { useState, type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { Menu, ExternalLink } from 'lucide-react'
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
import { usePublicTournaments } from '../../features/public/hooks'

interface PublicLayoutProps {
  children: ReactNode
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const { user, isAuthenticated, isLoading, logout, isLoggingOut } = useUserAuth()
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const { data: tournaments } = usePublicTournaments()
  const activeTournament = tournaments?.[0]

  const showProfileModal = isAuthenticated && user && !user.isProfileComplete

  const getUserDisplayName = () => {
    if (!user) return ''
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`
    }
    return user.email
  }

  const hasFaq = activeTournament?.options?.faqItems && activeTournament.options.faqItems.length > 0
  const rulesLink = activeTournament?.rulesLink

  const NavItem = ({ to, label, external = false }: { to: string; label: string; external?: boolean }) => {
    if (external) {
      return (
        <a
          href={to}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), "font-bold uppercase tracking-tight")}
        >
          {label} <ExternalLink className="ml-2 h-3 w-3" />
        </a>
      )
    }
    return (
      <NavLink
        to={to}
        className={({ isActive }) => cn(
          buttonVariants({ variant: isActive ? 'secondary' : 'ghost', size: 'sm' }),
          "font-bold uppercase tracking-tight",
          isActive && "bg-secondary"
        )}
      >
        {label}
      </NavLink>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b-4 border-foreground bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

          {/* Navigation desktop */}
          <div className="hidden lg:flex items-center gap-2 overflow-x-auto no-scrollbar">
            <NavItem to="/" label="Accueil" />

            {activeTournament && (
              <>
                <NavLink
                  to={`/tournaments/${activeTournament.id}/tables`}
                  className={({ isActive }) => cn(
                    buttonVariants({ variant: isActive ? 'default' : 'secondary', size: 'sm' }),
                    "font-black uppercase tracking-tight",
                    isActive ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                >
                  Inscription
                </NavLink>
              </>
            )}

            <NavItem to="/players" label="Inscrits" />
            <NavItem to="/players/by-table" label="Par tableau" />

            {hasFaq && <NavItem to="/faq" label="FAQ" />}
            {rulesLink && <NavItem to={rulesLink} label="Règlement" external />}

          </div>

          <div className="lg:hidden font-black text-xl uppercase tracking-tighter">
            PING PONG
          </div>

          {/* Menu burger mobile */}
          <div className="lg:hidden flex items-center gap-2">
            <div className="flex bg-card items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="sm" className="border-2 border-foreground">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 font-bold">
                  <DropdownMenuItem asChild>
                    <NavLink to="/" className="w-full cursor-pointer">
                      ACCUEIL
                    </NavLink>
                  </DropdownMenuItem>

                  {activeTournament && (
                    <DropdownMenuItem asChild>
                      <NavLink to={`/tournaments/${activeTournament.id}/tables`} className="w-full cursor-pointer bg-primary/20">
                        INSCRIPTION
                      </NavLink>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem asChild>
                    <NavLink to="/players" className="w-full cursor-pointer">
                      JOUEURS INSCRITS
                    </NavLink>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <NavLink to="/players/by-table" className="w-full cursor-pointer">
                      PAR TABLEAU
                    </NavLink>
                  </DropdownMenuItem>

                  {hasFaq && (
                    <DropdownMenuItem asChild>
                      <NavLink to="/faq" className="w-full cursor-pointer">
                        FAQ
                      </NavLink>
                    </DropdownMenuItem>
                  )}

                  {rulesLink && (
                    <DropdownMenuItem asChild>
                      <a href={rulesLink} target="_blank" rel="noopener noreferrer" className="w-full cursor-pointer flex items-center">
                        RÈGLEMENT <ExternalLink className="ml-2 h-3 w-3" />
                      </a>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />

                  {isAuthenticated && user && (
                    <>
                      <DropdownMenuItem asChild>
                        <NavLink to="/profile" className="w-full cursor-pointer">
                          MON PROFIL
                        </NavLink>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <NavLink to="/dashboard" className="w-full cursor-pointer">
                          MES INSCRIPTIONS
                        </NavLink>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={logout}
                        disabled={isLoggingOut}
                        className="cursor-pointer text-destructive focus:text-destructive"
                      >
                        {isLoggingOut ? 'DÉCONNEXION...' : 'DÉCONNEXION'}
                      </DropdownMenuItem>
                    </>
                  )}

                  {!isAuthenticated && (
                    <DropdownMenuItem onSelect={() => setLoginModalOpen(true)} className="cursor-pointer">
                      SE CONNECTER
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isLoading ? (
              <span className="text-sm text-muted-foreground">...</span>
            ) : isAuthenticated && user ? (
              <div className="hidden lg:flex items-center gap-3">
                <div className="flex flex-col items-end leading-tight">
                  <span className="text-xs font-bold uppercase text-muted-foreground">Connecté en tant que</span>
                  <span className="text-sm font-black truncate max-w-[150px]">{getUserDisplayName()}</span>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-full border-2 border-foreground bg-primary text-primary-foreground font-bold">
                      {user.firstName ? user.firstName[0].toUpperCase() : 'U'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <NavLink to="/profile" className="font-bold">Mon profil</NavLink>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <NavLink to="/dashboard" className="font-bold">Mes inscriptions</NavLink>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} disabled={isLoggingOut} className="text-destructive font-bold cursor-pointer">
                      Déconnexion
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Button variant="default" size="sm" onClick={() => setLoginModalOpen(true)} className="hidden lg:inline-flex font-black uppercase tracking-tight">
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
