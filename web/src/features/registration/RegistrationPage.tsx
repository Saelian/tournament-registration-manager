import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { PlayerSearch } from './PlayerSearch'
import { useLinkPlayer } from './hooks'
import { useRegistrationFlow } from './RegistrationFlowContext'
import type { Player } from './types'

export function RegistrationPage() {
  const { tournamentId } = useParams()
  const navigate = useNavigate()
  const { mutateAsync: linkPlayer } = useLinkPlayer()
  const { setTournamentId, setRegisteringFor, setPlayer, registeringFor } = useRegistrationFlow()

  const [step, setStep] = useState<'choice' | 'search'>('choice')

  useEffect(() => {
    if (tournamentId) {
      setTournamentId(Number(tournamentId))
    }
  }, [tournamentId, setTournamentId])

  const handleChoice = (choice: 'self' | 'other') => {
    setRegisteringFor(choice)
    setStep('search')
  }

  const handleBack = () => {
    setStep('choice')
  }

  const handlePlayerSelect = async (player: Player) => {
    if (registeringFor === 'self') {
      try {
        const linkedPlayer = await linkPlayer(player)
        setPlayer(linkedPlayer)
        navigate(`/tournaments/${tournamentId}/register/selection`)
      } catch (e) {
        console.error(e)
      }
    } else {
      setPlayer(player)
      navigate(`/tournaments/${tournamentId}/register/selection`)
    }
  }

  if (step === 'choice') {
    return (
      <div className="max-w-md mx-auto p-6 space-y-6">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">Etape 1 sur 2</p>
          <h1 className="text-2xl font-bold">Inscription au tournoi</h1>
        </div>
        <div className="space-y-4">
          <Button onClick={() => handleChoice('self')} className="w-full text-lg py-6 bg-primary hover:bg-primary/90">
            Je m'inscris (Moi-meme)
          </Button>
          <Button onClick={() => handleChoice('other')} variant="outline" className="w-full text-lg py-6">
            J'inscris un autre joueur
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <Button variant="ghost" onClick={handleBack}>
        &larr; Retour
      </Button>
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">Etape 2 sur 2</p>
        <h1 className="text-2xl font-bold">
          {registeringFor === 'self' ? 'Recherchez votre licence' : 'Recherchez le joueur'}
        </h1>
      </div>
      <PlayerSearch onSelect={handlePlayerSelect} />
    </div>
  )
}
