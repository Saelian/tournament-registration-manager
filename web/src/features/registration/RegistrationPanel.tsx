import { useState } from 'react'
import { Button } from '../../components/ui/button'
import { useUserAuth } from '../auth'
import { PlayerSearch } from './PlayerSearch'
import { useLinkPlayer } from './hooks'
import type { Player } from './types'
import { UserIcon, Search, Users } from 'lucide-react'

interface RegistrationPanelProps {
  player: Player | null
  onPlayerSelect: (player: Player) => void
  onPlayerClear: () => void
}

export function RegistrationPanel({ player, onPlayerSelect, onPlayerClear }: RegistrationPanelProps) {
  const { user, isAuthenticated, isLoading } = useUserAuth()
  const { mutateAsync: linkPlayer } = useLinkPlayer()
  const [isRegisteringForOther, setIsRegisteringForOther] = useState(false)

  // Si l'utilisateur a déjà un joueur lié
  const linkedPlayer = user?.players?.[0]

  const handleSelectLinkedPlayer = async () => {
    if (linkedPlayer) {
      onPlayerSelect(linkedPlayer)
    }
  }

  const handlePlayerSelect = async (selectedPlayer: Player) => {
    if (!isRegisteringForOther) {
      // Inscription pour soi-même : lier le joueur au compte
      try {
        const linked = await linkPlayer(selectedPlayer)
        onPlayerSelect(linked)
      } catch (e) {
        console.error(e)
      }
    } else {
      // Inscription pour un autre : pas de liaison
      onPlayerSelect(selectedPlayer)
    }
  }

  const handleChangePlayer = () => {
    onPlayerClear()
    setIsRegisteringForOther(false)
  }

  if (isLoading) {
    return (
      <div className="bg-card border-2 border-foreground p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    )
  }

  // Non connecté : message simple
  if (!isAuthenticated) {
    return (
      <div className="bg-card border-2 border-foreground p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-bold">Connectez-vous pour vous inscrire</p>
            <p className="text-sm text-muted-foreground">
              Utilisez le bouton "Se connecter" en haut à droite (un simple email suffit)
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Joueur déjà sélectionné
  if (player) {
    return (
      <div className="bg-card border-2 border-foreground p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
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
          <span className="text-sm font-medium">{user?.email}</span>
        </div>
      </div>

      {/* Si on a un joueur lié, proposer de l'utiliser directement */}
      {linkedPlayer && !isRegisteringForOther ? (
        <div>
          <p className="text-sm text-muted-foreground mb-3">Vous inscrire :</p>
          <button
            onClick={handleSelectLinkedPlayer}
            className="w-full text-left p-3 bg-secondary/50 border border-foreground/20 rounded hover:bg-secondary transition-colors"
          >
            <p className="font-bold">{linkedPlayer.firstName} {linkedPlayer.lastName}</p>
            <p className="text-sm text-muted-foreground">{linkedPlayer.points} pts - {linkedPlayer.club}</p>
          </button>
          <button
            onClick={() => setIsRegisteringForOther(true)}
            className="mt-3 text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <Users className="w-3 h-3" />
            Inscrire un autre joueur
          </button>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold flex items-center gap-2">
              <Search className="w-4 h-4" />
              {isRegisteringForOther ? 'Rechercher le joueur' : 'Rechercher votre licence'}
            </h3>
            {isRegisteringForOther && linkedPlayer && (
              <button
                onClick={() => setIsRegisteringForOther(false)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ← Retour
              </button>
            )}
          </div>
          <PlayerSearch onSelect={handlePlayerSelect} />
          {!isRegisteringForOther && !linkedPlayer && (
            <button
              onClick={() => setIsRegisteringForOther(true)}
              className="mt-4 text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <Users className="w-3 h-3" />
              Inscrire un autre joueur (coach, parent...)
            </button>
          )}
        </div>
      )}
    </div>
  )
}
