import { useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { usePublicTables, useEligibleTables } from './hooks'
import { ArrowLeftIcon, UsersIcon, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { formatDate, formatTime, formatPrice } from '../../lib/formatters'
import { RegistrationPanel } from '../registration/RegistrationPanel'
import { CartSummary } from '../registration/CartSummary'
import { useCreateRegistrations } from '../registration/hooks'
import type { Player } from '../registration/types'
import type { EligibleTable } from '../tables/types'
import { cn } from '../../lib/utils'

export function PublicTableListPage() {
  const { tournamentId } = useParams()
  const navigate = useNavigate()

  // Etat local du flux
  const [player, setPlayer] = useState<Player | null>(null)
  const [selectedTableIds, setSelectedTableIds] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null)

  // Queries
  const { data: publicTables, isLoading: isLoadingPublic } = usePublicTables(tournamentId)
  const { data: eligibleTables, isLoading: isLoadingEligible } = useEligibleTables(player?.id)
  const createRegistrations = useCreateRegistrations()

  // Determiner quelles tables afficher
  const tables = player?.id ? eligibleTables : publicTables
  const isLoading = isLoadingPublic || (player?.id && isLoadingEligible)

  const selectedTables = useMemo(() => {
    if (!eligibleTables) return []
    return eligibleTables.filter(t => selectedTableIds.includes(t.id))
  }, [eligibleTables, selectedTableIds])

  const handlePlayerSelect = (selectedPlayer: Player) => {
    setPlayer(selectedPlayer)
    setSelectedTableIds([])
    setError(null)
  }

  const handlePlayerClear = () => {
    setPlayer(null)
    setSelectedTableIds([])
    setError(null)
  }

  const handleToggle = (tableId: number) => {
    setSelectedTableIds(prev =>
      prev.includes(tableId)
        ? prev.filter(id => id !== tableId)
        : [...prev, tableId]
    )
    setError(null)
  }

  const handleRemove = (tableId: number) => {
    setSelectedTableIds(prev => prev.filter(id => id !== tableId))
    setError(null)
  }

  const handleSubmit = async () => {
    if (!player?.id) return
    setError(null)

    try {
      const result = await createRegistrations.mutateAsync({
        playerId: player.id,
        tableIds: selectedTableIds,
      })

      const waitlistCount = result.registrations.filter(r => r.status === 'waitlist').length
      const directCount = result.registrations.filter(r => r.status === 'pending_payment').length

      // Reset local state
      setPlayer(null)
      setSelectedTableIds([])

      if (waitlistCount > 0 && directCount > 0) {
        navigate('/dashboard', {
          state: {
            message: `${directCount} inscription(s) confirmee(s) et ${waitlistCount} ajoutee(s) en liste d'attente.`
          }
        })
      } else if (waitlistCount > 0) {
        navigate('/dashboard', {
          state: {
            message: `${waitlistCount} inscription(s) ajoutee(s) en liste d'attente.`
          }
        })
      } else {
        navigate('/dashboard', {
          state: {
            message: `${directCount} inscription(s) confirmee(s) ! Procedez au paiement.`
          }
        })
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string; errors?: string[] } } }
      const msg = error.response?.data?.message || 'Erreur lors de l\'inscription'
      const details = error.response?.data?.errors
      setError(details ? details.join('\n') : msg)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 pb-48">
      <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeftIcon className="w-4 h-4 mr-2" />
        Retour aux tournois
      </Link>

      <h1 className="text-3xl font-bold mb-6">Tableaux disponibles</h1>

      {/* Panneau d'inscription */}
      <div className="mb-6">
        <RegistrationPanel
          player={player}
          onPlayerSelect={handlePlayerSelect}
          onPlayerClear={handlePlayerClear}
        />
      </div>

      {/* Message si pas de joueur selectionne */}
      {!player && (
        <div className="mb-4 p-3 bg-secondary/50 border border-foreground/20 rounded text-sm text-muted-foreground text-center">
          Connectez-vous et selectionnez un joueur pour pouvoir vous inscrire aux tableaux
        </div>
      )}

      {/* Erreur */}
      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive text-destructive rounded-md whitespace-pre-line">
          <div className="flex items-center gap-2 font-bold mb-1">
            <AlertCircle className="w-4 h-4" />
            Erreur
          </div>
          {error}
        </div>
      )}

      {/* Liste des tableaux */}
      {isLoading ? (
        <div className="p-8 text-center">Chargement des tableaux...</div>
      ) : (
        <div className="grid gap-4">
          {tables?.map((table) => {
            const fillRate = Math.min(
              100,
              Math.round((table.registeredCount / table.quota) * 100)
            )

            const isSelected = selectedTableIds.includes(table.id)
            const eligibleTable = table as EligibleTable
            const isEligible = player ? eligibleTable.isEligible : false
            const isFull = table.registeredCount >= table.quota
            const canSelect = player && isEligible

            return (
              <div
                key={table.id}
                className={cn(
                  "relative bg-card p-4 border-2 transition-all select-none",
                  canSelect ? "cursor-pointer" : "cursor-default",
                  !player && "opacity-70",
                  player && !isEligible && "opacity-60 grayscale-[0.5]",
                  isSelected ? "border-primary shadow-[4px_4px_0px_0px_var(--primary)]" : "border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                )}
                onClick={() => {
                  if (canSelect) handleToggle(table.id)
                }}
              >
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {isSelected && <CheckCircle className="w-5 h-5 text-primary" />}
                      <h3 className="text-xl font-bold">{table.name}</h3>
                      {table.isSpecial && (
                        <span className="bg-yellow-300 text-xs px-2 py-1 font-bold border border-foreground rounded text-black">
                          Special
                        </span>
                      )}
                      {isFull && player && isEligible && (
                        <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 font-bold border border-amber-300 rounded flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Liste d'attente
                        </span>
                      )}
                      {player && !isEligible && (
                        <span className="bg-destructive text-destructive-foreground text-xs px-2 py-1 font-bold rounded">
                          Ineligible
                        </span>
                      )}
                    </div>

                    {player && !isEligible && eligibleTable.ineligibilityReasons?.length > 0 && (
                      <div className="text-xs text-destructive font-semibold mb-2">
                        Raison: {eligibleTable.ineligibilityReasons.join(', ')}
                      </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="font-bold">Date:</span> {formatDate(table.date)}
                      </div>
                      <div>
                        <span className="font-bold">Debut:</span> {formatTime(table.startTime)}
                      </div>
                      <div>
                        <span className="font-bold">Points:</span>{' '}
                        {table.pointsMin} - {table.pointsMax}
                      </div>
                      <div>
                        <span className="font-bold">Prix:</span> {formatPrice(table.price)} EUR
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
                          className={cn(
                            "h-full",
                            isFull ? "bg-amber-500" : "bg-primary"
                          )}
                          style={{ width: `${fillRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {tables?.length === 0 && (
            <div className="text-center p-8 bg-secondary border-2 border-dashed border-foreground">
              <p className="font-bold text-muted-foreground">
                Aucun tableau disponible pour ce tournoi.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Panier */}
      {player && (
        <CartSummary
          selectedTables={selectedTables}
          onRemove={handleRemove}
          onSubmit={handleSubmit}
          isSubmitting={createRegistrations.isPending}
        />
      )}
    </div>
  )
}
