import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { useEligibleTables } from '../public/hooks'
import { Button } from '../../components/ui/button'
import { formatDate, formatTime, formatPrice } from '../../lib/formatters'
import { UsersIcon, AlertCircle, CheckCircle } from 'lucide-react'
import { api } from '../../lib/api'
import { cn } from '../../lib/utils'

export function TableSelectionPage() {
  const { tournamentId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  // Assuming "Self" registration for now, picking the first linked player. 
  const player = user?.players?.[0] 

  const { data: tables, isLoading } = useEligibleTables(player?.id)
  
  const [selectedTableIds, setSelectedTableIds] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  const handleToggle = (tableId: number) => {
    setSelectedTableIds(prev => 
      prev.includes(tableId) 
        ? prev.filter(id => id !== tableId)
        : [...prev, tableId]
    )
    setError(null)
  }

  const handleSubmit = async () => {
      setIsValidating(true)
      setError(null)
      try {
          await api.post('/api/registrations/validate', {
              playerId: player?.id,
              tableIds: selectedTableIds
          })
          // If valid, proceed. For now, alert.
          alert('Sélection valide ! (Redirection vers paiement...)')
          // navigate(`/tournaments/${tournamentId}/payment`) or similar
      } catch (err: any) {
          const msg = err.response?.data?.message || 'Validation failed'
          const details = err.response?.data?.errors 
          setError(details ? details.join('\n') : msg)
      } finally {
          setIsValidating(false)
      }
  }

  if (isLoading) {
    return <div className="p-8 text-center">Chargement des tableaux...</div>
  }

  if (!player) {
      return <div className="p-8 text-center text-red-500">Aucun joueur lié à ce compte. Veuillez lier un joueur.</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6 pb-24">
      <h1 className="text-2xl font-bold mb-2">Sélection des tableaux</h1>
      <p className="text-muted-foreground mb-6">
        Joueur : <span className="font-semibold text-foreground">{player.firstName} {player.lastName}</span> ({player.points} pts)
      </p>

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive text-destructive rounded-md whitespace-pre-line">
            <div className="flex items-center gap-2 font-bold mb-1">
                <AlertCircle className="w-4 h-4" />
                Erreur de validation
            </div>
            {error}
        </div>
      )}

      <div className="grid gap-4">
        {tables?.map((table) => {
           const fillRate = Math.min(
            100,
            Math.round((table.registeredCount / table.quota) * 100)
          )
          
          const isSelected = selectedTableIds.includes(table.id)
          const isEligible = table.isEligible
          
          return (
            <div
              key={table.id}
              className={cn(
                  "relative bg-card p-4 border-2 transition-all select-none",
                  isEligible ? "cursor-pointer" : "opacity-60 cursor-not-allowed grayscale-[0.5]",
                  isSelected ? "border-primary shadow-[4px_4px_0px_0px_var(--primary)]" : "border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              )}
              onClick={() => {
                  if (isEligible) handleToggle(table.id)
              }}
            >
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {isSelected && <CheckCircle className="w-5 h-5 text-primary" />}
                    <h3 className="text-xl font-bold">{table.name}</h3>
                    {table.isSpecial && (
                      <span className="bg-yellow-300 text-xs px-2 py-1 font-bold border border-foreground rounded text-black">
                        Spécial
                      </span>
                    )}
                    {!isEligible && (
                        <span className="bg-destructive text-destructive-foreground text-xs px-2 py-1 font-bold rounded">
                            Inéligible
                        </span>
                    )}
                  </div>
                  
                  {!isEligible && table.ineligibilityReasons.length > 0 && (
                      <div className="text-xs text-destructive font-semibold mb-2">
                          Raison: {table.ineligibilityReasons.join(', ')}
                      </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                    <div>
                      <span className="font-bold">Date:</span> {formatDate(table.date)}
                    </div>
                    <div>
                      <span className="font-bold">Début:</span> {formatTime(table.startTime)}
                    </div>
                    <div>
                      <span className="font-bold">Points:</span>{' '}
                      {table.pointsMin} - {table.pointsMax}
                    </div>
                    <div>
                      <span className="font-bold">Prix:</span> {formatPrice(table.price)} €
                    </div>
                  </div>

                  <div className="mt-4">
                     <div className="flex justify-between text-xs mb-1">
                      <span className="font-bold flex items-center gap-1">
                        <UsersIcon className="w-3 h-3" />
                        Places: {table.registeredCount} / {table.quota}
                      </span>
                      <span>{fillRate}%</span>
                    </div>
                    <div className="h-2 w-full bg-secondary border border-foreground rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${fillRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border flex justify-center">
          <Button 
            size="lg" 
            onClick={handleSubmit} 
            disabled={selectedTableIds.length === 0 || isValidating}
            className="w-full max-w-md shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            {isValidating ? 'Validation...' : `Valider la sélection (${selectedTableIds.length})`}
          </Button>
      </div>
    </div>
  )
}
