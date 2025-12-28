import { useState } from 'react'
import { Button } from '../../components/ui/button'
import { useUserAuth } from '../auth'
import { InlineOtpForm } from './InlineOtpForm'
import { PlayerSearch } from './PlayerSearch'
import { useLinkPlayer } from './hooks'
import type { Player } from './types'
import { UserIcon, LogOut } from 'lucide-react'

interface RegistrationPanelProps {
  player: Player | null
  onPlayerSelect: (player: Player) => void
  onPlayerClear: () => void
}

export function RegistrationPanel({ player, onPlayerSelect, onPlayerClear }: RegistrationPanelProps) {
  const { user, isAuthenticated, logout, isLoading } = useUserAuth()
  const { mutateAsync: linkPlayer } = useLinkPlayer()
  const [registeringFor, setRegisteringFor] = useState<'self' | 'other' | null>(null)

  const handlePlayerSelect = async (selectedPlayer: Player) => {
    if (registeringFor === 'self') {
      try {
        const linkedPlayer = await linkPlayer(selectedPlayer)
        onPlayerSelect(linkedPlayer)
      } catch (e) {
        console.error(e)
      }
    } else {
      onPlayerSelect(selectedPlayer)
    }
  }

  const handleChangePlayer = () => {
    onPlayerClear()
    setRegisteringFor(null)
  }

  if (isLoading) {
    return (
      <div className="bg-card border-2 border-foreground p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="bg-card border-2 border-foreground p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      {/* Header avec statut de connexion */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-foreground/20">
        <div className="flex items-center gap-2">
          <UserIcon className="w-4 h-4" />
          {isAuthenticated ? (
            <span className="text-sm font-medium">{user?.email}</span>
          ) : (
            <span className="text-sm text-muted-foreground">Non connecte</span>
          )}
        </div>
        {isAuthenticated && (
          <Button variant="ghost" size="sm" onClick={logout} className="h-8 px-2">
            <LogOut className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Contenu selon l'etat */}
      {!isAuthenticated ? (
        // Etape 1: Connexion OTP
        <div>
          <h3 className="font-bold mb-3">Connectez-vous pour vous inscrire</h3>
          <InlineOtpForm onSuccess={() => {}} />
        </div>
      ) : player ? (
        // Etape 3: Joueur selectionne
        <div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Inscription pour</p>
              <p className="font-bold text-lg">{player.firstName} {player.lastName}</p>
              <p className="text-sm text-muted-foreground">{player.points} pts - {player.club}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleChangePlayer}>
              Changer
            </Button>
          </div>
          <p className="mt-3 text-sm text-primary font-medium">
            Selectionnez les tableaux ci-dessous
          </p>
        </div>
      ) : registeringFor ? (
        // Etape 2b: Recherche licence
        <div>
          <Button variant="ghost" size="sm" onClick={() => setRegisteringFor(null)} className="mb-2">
            &larr; Retour
          </Button>
          <h3 className="font-bold mb-3">
            {registeringFor === 'self' ? 'Recherchez votre licence' : 'Recherchez le joueur'}
          </h3>
          <PlayerSearch onSelect={handlePlayerSelect} />
        </div>
      ) : (
        // Etape 2a: Choix moi/autre
        <div>
          <h3 className="font-bold mb-3">Qui souhaitez-vous inscrire ?</h3>
          <div className="space-y-2">
            <Button
              onClick={() => setRegisteringFor('self')}
              className="w-full justify-start"
            >
              Moi-meme
            </Button>
            <Button
              onClick={() => setRegisteringFor('other')}
              variant="outline"
              className="w-full justify-start"
            >
              Un autre joueur
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
