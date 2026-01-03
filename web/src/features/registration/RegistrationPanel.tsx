import { useState } from 'react'
import { Button } from '../../components/ui/button'
import { useUserAuth } from '../auth'
import { LoginModal } from '../auth/LoginModal'
import { PlayerSearch } from './PlayerSearch'
import type { Player } from './types'
import { UserIcon, LogIn } from 'lucide-react'

interface RegistrationPanelProps {
  player: Player | null
  onPlayerSelect: (player: Player) => void
  onPlayerClear: () => void
}

export function RegistrationPanel({
  player,
  onPlayerSelect,
  onPlayerClear,
}: RegistrationPanelProps) {
  const { user, isAuthenticated, isLoading } = useUserAuth()
  const [loginModalOpen, setLoginModalOpen] = useState(false)

  const handleChangePlayer = () => {
    onPlayerClear()
  }

  if (isLoading) {
    return (
      <div className="bg-card border-2 border-foreground p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    )
  }

  // Non connecté : message avec bouton de connexion
  if (!isAuthenticated) {
    return (
      <>
        <div className="bg-card border-2 border-foreground p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                <UserIcon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-bold">Connectez-vous pour vous inscrire</p>
                <p className="text-sm text-muted-foreground">
                  Un simple email suffit, pas de mot de passe !
                </p>
              </div>
            </div>
            <Button onClick={() => setLoginModalOpen(true)} className="gap-2 whitespace-nowrap">
              <LogIn className="w-4 h-4" />
              SE CONNECTER
            </Button>
          </div>
        </div>
        <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />
      </>
    )
  }

  // Joueur déjà sélectionné
  if (player) {
    return (
      <div className="bg-card border-2 border-foreground p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Inscription pour</p>
            <p className="font-bold text-lg">
              {player.firstName} {player.lastName}
            </p>
            <p className="text-sm text-muted-foreground">
              {player.points} pts - {player.club}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleChangePlayer}>
            Changer
          </Button>
        </div>
        <p className="mt-3 text-sm text-primary font-medium">
          Sélectionnez les tableaux ci-dessous
        </p>
      </div>
    )
  }

  // Connecté mais pas de joueur sélectionné
  return (
    <div className="bg-card border-2 border-foreground p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      {/* Header avec email */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-foreground/20">
        <div className="flex items-center gap-2">
          <UserIcon className="w-4 h-4" />
          <span className="text-sm font-medium">
            Connecté en tant que : {user?.firstName} {user?.lastName} - {user?.email}
          </span>
        </div>
      </div>

      {/* Player Search */}
      <PlayerSearch onSelect={onPlayerSelect} />
    </div>
  )
}
