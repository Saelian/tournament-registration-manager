import { useState, type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { Menu, Home, PenLine, Users, HelpCircle, FileText, LogIn, User, LogOut } from 'lucide-react'
import { Button } from '@components/ui/button'
import { NavItem } from '@components/ui/nav-item'
import { useUserAuth } from '@features/auth'
import { LoginModal } from '@features/auth'
import { ProfileCompletionModal } from '@features/profile'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu'
import { usePublicTournaments } from '@features/tournament'

interface PublicLayoutProps {
  children: ReactNode
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const { user, isAuthenticated, isLoading, logout, isLoggingOut } = useUserAuth()
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const { data: tournaments } = usePublicTournaments()
  const activeTournament = tournaments?.[0]

  const showProfileModal = isAuthenticated && user && !user.isProfileComplete

  const hasFaq = activeTournament?.options?.faqItems && activeTournament.options.faqItems.length > 0
  const rulesLink = activeTournament?.rulesLink

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b-4 border-foreground bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          {/* Navigation desktop */}
          <div className="hidden lg:flex items-center gap-2 flex-wrap">
            <NavItem to="/" label="Accueil" icon={Home} end />

            {activeTournament && (
              <NavItem
                to={`/tournaments/${activeTournament.id}/tables`}
                label="Inscription"
                icon={PenLine}
              />
            )}

            <NavItem to="/players" label="Joueurs inscrits" icon={Users} />

            {hasFaq && <NavItem to="/faq" label="FAQ" icon={HelpCircle} />}
            {rulesLink && <NavItem to={rulesLink} label="Règlement" icon={FileText} external />}
          </div>

          <div className="lg:hidden font-black text-xl uppercase tracking-tighter"></div>

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
                    <NavLink to="/" className="w-full cursor-pointer flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      Accueil
                    </NavLink>
                  </DropdownMenuItem>

                  {activeTournament && (
                    <DropdownMenuItem asChild>
                      <NavLink
                        to={`/tournaments/${activeTournament.id}/tables`}
                        className="w-full cursor-pointer flex items-center gap-2"
                      >
                        <PenLine className="h-4 w-4" />
                        Inscription
                      </NavLink>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem asChild>
                    <NavLink
                      to="/players"
                      className="w-full cursor-pointer flex items-center gap-2"
                    >
                      <Users className="h-4 w-4" />
                      Joueurs inscrits
                    </NavLink>
                  </DropdownMenuItem>

                  {hasFaq && (
                    <DropdownMenuItem asChild>
                      <NavLink to="/faq" className="w-full cursor-pointer flex items-center gap-2">
                        <HelpCircle className="h-4 w-4" />
                        FAQ
                      </NavLink>
                    </DropdownMenuItem>
                  )}

                  {rulesLink && (
                    <DropdownMenuItem asChild>
                      <a
                        href={rulesLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full cursor-pointer flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        Règlement
                      </a>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />

                  {isAuthenticated && user && (
                    <>
                      <DropdownMenuItem asChild>
                        <NavLink
                          to="/profile"
                          className="w-full cursor-pointer flex items-center gap-2"
                        >
                          <User className="h-4 w-4" />
                          Mon espace
                        </NavLink>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={logout}
                        disabled={isLoggingOut}
                        className="cursor-pointer text-destructive focus:text-destructive"
                      >
                        {isLoggingOut ? 'Déconnexion...' : 'Déconnexion'}
                      </DropdownMenuItem>
                    </>
                  )}

                  {!isAuthenticated && (
                    <DropdownMenuItem
                      onSelect={() => setLoginModalOpen(true)}
                      className="cursor-pointer flex items-center gap-2"
                    >
                      <LogIn className="h-4 w-4" />
                      Se connecter
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {/* End burger mobile */}

          <div className="flex items-center gap-3">
            {isLoading ? (
              <span className="text-sm text-muted-foreground">...</span>
            ) : isAuthenticated && user ? (
              <>
                {/* Bouton Mon espace visible */}
                <NavItem
                  to="/profile"
                  label="Mon espace"
                  icon={User}
                  className="hidden bg-primary text-primary-foreground lg:flex"
                />

                {/* Bouton déconnexion (icône seule) */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  disabled={isLoggingOut}
                  className="hidden lg:flex border-2 border-foreground w-8 h-8 p-0"
                  title="Déconnexion"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="sr-only">Déconnexion</span>
                </Button>
              </>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => setLoginModalOpen(true)}
                className="hidden lg:inline-flex font-black uppercase tracking-tight"
              >
                <LogIn className="h-4 w-4" />
                Se connecter
              </Button>
            )}
          </div>
        </div>
      </header>
      <main className="bg-gradient-secondary-to-white min-h-screen">{children}</main>

      <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />

      <ProfileCompletionModal user={user ?? null} open={!!showProfileModal} />
    </div>
  )
}
