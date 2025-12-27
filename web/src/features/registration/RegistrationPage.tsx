import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { PlayerSearch } from './PlayerSearch'
import { useLinkPlayer } from './hooks'
import type { Player } from './types'

export function RegistrationPage() {
  const { tournamentId } = useParams()
  const navigate = useNavigate()
  const { mutateAsync: linkPlayer } = useLinkPlayer()

  const [step, setStep] = useState<'choice' | 'search'>('choice')
  const [registeringWho, setRegisteringWho] = useState<'self' | 'other' | null>(null)

  const handleChoice = (choice: 'self' | 'other') => {
    setRegisteringWho(choice)
    setStep('search')
  }

  const handlePlayerSelect = async (player: Player) => {
    if (registeringWho === 'self') {
       try {
         await linkPlayer(player)
         // Proceed to next step
         alert(`Joueur ${player.lastName} ${player.firstName} lié à votre compte.`)
         navigate(`/tournaments/${tournamentId}/tables`) 
       } catch (e) {
         console.error(e)
         alert("Une erreur est survenue lors de la liaison du joueur.")
       }
    } else {
         // Pass this player to registration flow
         // For now, I'll store it in localStorage or state?
         // Since I don't have the next step, I'll just alert
         alert(`Joueur ${player.lastName} ${player.firstName} sélectionné pour inscription.`)
         navigate(`/tournaments/${tournamentId}/tables`)
    }
  }

  if (step === 'choice') {
    return (
      <div className="max-w-md mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center">Inscription au tournoi</h1>
        <div className="space-y-4">
          <Button onClick={() => handleChoice('self')} className="w-full text-lg py-6 bg-primary hover:bg-primary/90">
            Je m'inscris (Moi-même)
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
      <Button variant="ghost" onClick={() => setStep('choice')}>
        &larr; Retour
      </Button>
      <h1 className="text-2xl font-bold text-center">
        {registeringWho === 'self' ? "Recherchez votre licence" : "Recherchez le joueur"}
      </h1>
      <PlayerSearch onSelect={handlePlayerSelect} />
    </div>
  )
}
