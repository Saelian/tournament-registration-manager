import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useEligibleTables, usePublicTournaments } from '../public/hooks'
import { useCreateRegistrations } from './hooks'
import { useRegistrationFlow } from './RegistrationFlowContext'
import { CartSummary } from './CartSummary'
import { TableFilters } from './TableFilters'
import { formatDate, formatTime, formatPrice } from '../../lib/formatters'
import { UsersIcon, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from '../../components/ui/button'

export function TableSelectionPage() {
  const navigate = useNavigate()
  const { tournamentId } = useParams()
  const { player, registeringFor, isComplete, reset } = useRegistrationFlow()

  const { data: tables, isLoading } = useEligibleTables(player?.id)
  const createRegistrations = useCreateRegistrations()

  // Récupérer le tournoi pour vérifier la période d'inscription
  const { data: tournaments } = usePublicTournaments()
  const tournament = tournaments?.find((t) => t.id.toString() === tournamentId)
  const isRegistrationOpen = tournament?.registrationStatus?.isOpen ?? true

  const [selectedTableIds, setSelectedTableIds] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showRegistered, setShowRegistered] = useState(true)
  const [showEligibleOnly, setShowEligibleOnly] = useState(true)

  // Rediriger si le flux n'est pas complet
  useEffect(() => {
    if (!isComplete && !isLoading) {
      navigate(`/tournaments/${tournamentId}/register`, { replace: true })
    }
  }, [isComplete, isLoading, navigate, tournamentId])

  // Rediriger si la période d'inscription est fermée
  useEffect(() => {
    if (!isRegistrationOpen && tournament) {
      navigate(`/tournaments/${tournamentId}/tables`, { replace: true })
    }
  }, [isRegistrationOpen, tournament, navigate, tournamentId])

  const selectedTables = useMemo(() => {
    if (!tables) return []
    return tables.filter((t) => selectedTableIds.includes(t.id))
  }, [tables, selectedTableIds])

  const filteredTables = useMemo(() => {
    if (!tables) return []
    return tables.filter((table) => {
      const isAlreadyRegistered = table.ineligibilityReasons?.includes('ALREADY_REGISTERED')
      if (!showRegistered && isAlreadyRegistered) return false
      if (showEligibleOnly && !table.isEligible) return false
      return true
    })
  }, [tables, showRegistered, showEligibleOnly])

  const handleToggle = (tableId: number) => {
    setSelectedTableIds((prev) =>
      prev.includes(tableId) ? prev.filter((id) => id !== tableId) : [...prev, tableId]
    )
    setError(null)
  }

  const handleRemove = (tableId: number) => {
    setSelectedTableIds((prev) => prev.filter((id) => id !== tableId))
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

      const waitlistCount = result.registrations.filter((r) => r.status === 'waitlist').length
      const directCount = result.registrations.filter((r) => r.status === 'pending_payment').length

      reset()

      if (waitlistCount > 0 && directCount > 0) {
        navigate('/dashboard', {
          state: {
            message: `${directCount} inscription(s) confirmee(s) et ${waitlistCount} ajoutee(s) en liste d'attente.`,
          },
        })
      } else if (waitlistCount > 0) {
        navigate('/dashboard', {
          state: {
            message: `${waitlistCount} inscription(s) ajoutee(s) en liste d'attente.`,
          },
        })
      } else {
        navigate('/dashboard', {
          state: {
            message: `${directCount} inscription(s) confirmee(s) ! Procedez au paiement.`,
          },
        })
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string; errors?: string[] } } }
      const msg = error.response?.data?.message || "Erreur lors de l'inscription"
      const details = error.response?.data?.errors
      setError(details ? details.join('\n') : msg)
    }
  }

  if (isLoading) {
    return <div className="p-8 text-center">Chargement des tableaux...</div>
  }

  if (!player) {
    return (
      <div className="max-w-md mx-auto p-6 text-center space-y-4">
        <p className="text-destructive">
          Aucun joueur selectionne. Veuillez recommencer le processus d'inscription.
        </p>
        <Link to={`/tournaments/${tournamentId}/register`}>
          <Button>Recommencer</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 pb-48">
      <Link to={`/tournaments/${tournamentId}/register`}>
        <Button variant="ghost" className="mb-4">
          &larr; Retour
        </Button>
      </Link>

      <h1 className="text-2xl font-bold mb-2">Selection des tableaux</h1>
      <div className="mb-6 p-4 bg-secondary/50 border border-foreground rounded-md">
        <p className="text-sm text-muted-foreground">
          {registeringFor === 'self'
            ? 'Inscription pour vous-meme'
            : 'Inscription pour un autre joueur'}
        </p>
        <p className="font-semibold text-lg">
          {player.firstName} {player.lastName}{' '}
          <span className="text-muted-foreground">({player.points} pts)</span>
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive text-destructive rounded-md whitespace-pre-line">
          <div className="flex items-center gap-2 font-bold mb-1">
            <AlertCircle className="w-4 h-4" />
            Erreur
          </div>
          {error}
        </div>
      )}

      <TableFilters
        showRegistered={showRegistered}
        showEligibleOnly={showEligibleOnly}
        onShowRegisteredChange={setShowRegistered}
        onShowEligibleOnlyChange={setShowEligibleOnly}
      />

      <div className="grid gap-4 mt-4">
        {filteredTables?.map((table) => {
          const fillRate = Math.min(100, Math.round((table.registeredCount / table.quota) * 100))

          const isSelected = selectedTableIds.includes(table.id)
          const isEligible = table.isEligible
          const isFull = table.registeredCount >= table.quota

          return (
            <div
              key={table.id}
              className={cn(
                'relative bg-card p-4 border-2 transition-all select-none',
                isEligible ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed grayscale-[0.5]',
                isSelected
                  ? 'border-primary shadow-[4px_4px_0px_0px_var(--primary)]'
                  : 'border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
              )}
              onClick={() => {
                if (isEligible) handleToggle(table.id)
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
                    {isFull && isEligible && (
                      <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 font-bold border border-amber-300 rounded flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Liste d'attente
                      </span>
                    )}
                    {!isEligible && (
                      <span className="bg-destructive text-destructive-foreground text-xs px-2 py-1 font-bold rounded">
                        Ineligible
                      </span>
                    )}
                    {table.genderRestriction === 'F' && (
                      <span className="bg-pink-200 text-xs px-2 py-1 font-bold border border-foreground rounded">
                        Féminin
                      </span>
                    )}
                    {table.genderRestriction === 'M' && (
                      <span className="bg-blue-200 text-xs px-2 py-1 font-bold border border-foreground rounded">
                        Masculin
                      </span>
                    )}
                    {table.nonNumberedOnly && (
                      <span className="bg-green-200 text-xs px-2 py-1 font-bold border border-foreground rounded">
                        Non numéroté
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
                      <span className="font-bold">Debut:</span> {formatTime(table.startTime)}
                    </div>
                    <div>
                      <span className="font-bold">Points:</span> {table.pointsMin} -{' '}
                      {table.pointsMax}
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
                        className={cn('h-full', isFull ? 'bg-amber-500' : 'bg-primary')}
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

      <CartSummary
        selectedTables={selectedTables}
        onRemove={handleRemove}
        onSubmit={handleSubmit}
        isSubmitting={createRegistrations.isPending}
      />
    </div>
  )
}
