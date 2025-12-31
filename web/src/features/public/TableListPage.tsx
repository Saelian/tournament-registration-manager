import { useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { usePublicTables, useEligibleTables } from './hooks'
import {
  ArrowLeftIcon,
  UsersIcon,
  CheckCircle,
  Clock,
  AlertCircle,
  Ban,
  TrophyIcon,
} from 'lucide-react'
import { formatDate, formatTime, formatPrice } from '../../lib/formatters'
import { RegistrationPanel } from '../registration/RegistrationPanel'
import { CartSummary } from '../registration/CartSummary'
import { TableFilters } from '../registration/TableFilters'
import { useCreateRegistrations } from '../registration/hooks'
import type { Player } from '../registration/types'
import type { EligibleTable } from '../tables/types'
import { cn } from '../../lib/utils'

const INELIGIBILITY_LABELS: Record<string, string> = {
  POINTS_TOO_LOW: 'Points insuffisants',
  POINTS_TOO_HIGH: 'Points trop élevés',
  DAILY_LIMIT_REACHED: 'Limite journalière atteinte',
  TIME_CONFLICT: "Conflit d'horaire",
  GENDER_RESTRICTED: 'Réservé à un autre genre',
  CATEGORY_RESTRICTED: 'Catégorie non autorisée',
  ALREADY_REGISTERED: 'Déjà inscrit',
}

export function PublicTableListPage() {
  const { tournamentId } = useParams()
  const navigate = useNavigate()

  // Etat local du flux
  const [player, setPlayer] = useState<Player | null>(null)
  const [selectedTableIds, setSelectedTableIds] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showRegistered, setShowRegistered] = useState(true)
  const [showEligibleOnly, setShowEligibleOnly] = useState(true)

  // Queries
  const { data: publicTables, isLoading: isLoadingPublic } = usePublicTables(tournamentId)
  const { data: eligibleTables, isLoading: isLoadingEligible } = useEligibleTables(player?.id)
  const createRegistrations = useCreateRegistrations()

  // Determiner quelles tables afficher
  const tables = player?.id ? eligibleTables : publicTables
  const isLoading = isLoadingPublic || (player?.id && isLoadingEligible)

  // Calculer les créneaux horaires occupés par la sélection actuelle
  const selectedTimeSlots = useMemo(() => {
    if (!eligibleTables) return new Set<string>()
    const slots = new Set<string>()
    for (const tableId of selectedTableIds) {
      const table = eligibleTables.find((t) => t.id === tableId)
      if (table) {
        slots.add(`${table.date}|${table.startTime}`)
      }
    }
    return slots
  }, [eligibleTables, selectedTableIds])

  // Compter les tableaux non-spéciaux sélectionnés par jour (pour la limite de 2/jour)
  const nonSpecialCountByDay = useMemo(() => {
    if (!eligibleTables) return new Map<string, number>()
    const countByDay = new Map<string, number>()
    for (const tableId of selectedTableIds) {
      const table = eligibleTables.find((t) => t.id === tableId)
      if (table && !table.isSpecial) {
        const currentCount = countByDay.get(table.date) || 0
        countByDay.set(table.date, currentCount + 1)
      }
    }
    return countByDay
  }, [eligibleTables, selectedTableIds])

  const selectedTables = useMemo(() => {
    if (!eligibleTables) return []
    return eligibleTables.filter((t) => selectedTableIds.includes(t.id))
  }, [eligibleTables, selectedTableIds])

  // Calculer le padding bottom dynamique pour éviter que le panier ne cache le contenu
  // Hauteur approximative : header(60px) + liste tables (min 40px par table, max 160px) + footer(80px) + marge(40px)
  const cartPaddingBottom = useMemo(() => {
    if (selectedTableIds.length === 0) return 'pb-6'
    // Base: ~180px + ~44px par table (jusqu'à max-h-40 = 160px)
    const tableListHeight = Math.min(selectedTableIds.length * 44, 160)
    const totalHeight = 180 + tableListHeight + 40 // +40px de marge de sécurité
    // Convertir en classes Tailwind approximatives
    if (totalHeight <= 240) return 'pb-60' // 240px
    if (totalHeight <= 288) return 'pb-72' // 288px
    if (totalHeight <= 320) return 'pb-80' // 320px
    return 'pb-96' // 384px max
  }, [selectedTableIds.length])

  const filteredTables = useMemo(() => {
    if (!tables) return []
    if (!player) return tables // Pas de filtre si pas de joueur sélectionné
    return tables.filter((table) => {
      const eligibleTable = table as EligibleTable
      const isAlreadyRegistered = eligibleTable.ineligibilityReasons?.includes('ALREADY_REGISTERED')
      if (!showRegistered && isAlreadyRegistered) return false
      if (showEligibleOnly && !eligibleTable.isEligible) return false
      return true
    })
  }, [tables, player, showRegistered, showEligibleOnly])

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

      // Reset local state
      setPlayer(null)
      setSelectedTableIds([])

      if (waitlistCount > 0 && directCount > 0) {
        navigate('/dashboard', {
          state: {
            message: `${directCount} inscription(s) confirmée(s) et ${waitlistCount} ajoutée(s) en liste d'attente.`,
          },
        })
      } else if (waitlistCount > 0) {
        navigate('/dashboard', {
          state: {
            message: `${waitlistCount} inscription(s) ajoutée(s) en liste d'attente.`,
          },
        })
      } else {
        navigate('/dashboard', {
          state: {
            message: `${directCount} inscription(s) confirmée(s) ! Procédez au paiement.`,
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

  // Vérifier si un tableau est bloqué par la sélection actuelle (conflit d'horaire)
  const isBlockedByTimeConflict = (table: EligibleTable): boolean => {
    if (selectedTableIds.includes(table.id)) return false // Ne pas bloquer si déjà sélectionné
    const timeSlot = `${table.date}|${table.startTime}`
    return selectedTimeSlots.has(timeSlot)
  }

  // Vérifier si un tableau est bloqué par la limite quotidienne (max 2 non-spéciaux par jour)
  const isBlockedByDailyLimit = (table: EligibleTable): boolean => {
    if (selectedTableIds.includes(table.id)) return false // Ne pas bloquer si déjà sélectionné
    if (table.isSpecial) return false // Les tableaux spéciaux ne comptent pas
    const dailyCount = nonSpecialCountByDay.get(table.date) || 0
    return dailyCount >= 2
  }

  return (
    <div className={cn('max-w-7xl mx-auto p-6', cartPaddingBottom)}>
      <Link
        to="/"
        className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeftIcon className="w-4 h-4 mr-2" />
        Retour
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

      {/* Filtres */}
      {player && (
        <div className="mb-4">
          <TableFilters
            showRegistered={showRegistered}
            showEligibleOnly={showEligibleOnly}
            onShowRegisteredChange={setShowRegistered}
            onShowEligibleOnlyChange={setShowEligibleOnly}
          />
        </div>
      )}

      {/* Liste des tableaux */}
      {isLoading ? (
        <div className="p-8 text-center">Chargement des tableaux...</div>
      ) : (
        <div className="grid gap-4">
          {filteredTables?.map((table) => {
            const fillRate = Math.min(100, Math.round((table.registeredCount / table.quota) * 100))

            const isSelected = selectedTableIds.includes(table.id)
            const eligibleTable = table as EligibleTable
            const isEligible = player ? eligibleTable.isEligible : false
            const isFull = table.registeredCount >= table.quota

            // Vérifier si bloqué par la sélection actuelle
            const blockedByTimeConflict =
              player && isEligible && isBlockedByTimeConflict(eligibleTable)
            const blockedByDailyLimit = player && isEligible && isBlockedByDailyLimit(eligibleTable)
            const blockedBySelection = blockedByTimeConflict || blockedByDailyLimit
            const canSelect = player && isEligible && !blockedBySelection

            // Determiner le badge à afficher
            const isAlreadyRegistered =
              eligibleTable.ineligibilityReasons?.includes('ALREADY_REGISTERED')
            const hasTimeConflict = eligibleTable.ineligibilityReasons?.includes('TIME_CONFLICT')
            const hasDailyLimitFromApi =
              eligibleTable.ineligibilityReasons?.includes('DAILY_LIMIT_REACHED')

            return (
              <div
                key={table.id}
                className={cn(
                  'relative bg-card p-4 border-2 transition-all select-none',
                  canSelect
                    ? 'cursor-pointer hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
                    : 'cursor-default',
                  !player && 'opacity-70',
                  player && !isEligible && 'opacity-60 grayscale-[0.5]',
                  blockedBySelection && 'opacity-50',
                  isSelected
                    ? 'border-primary shadow-[4px_4px_0px_0px_var(--primary)]'
                    : 'border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
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
                          Spécial
                        </span>
                      )}
                      {player && isAlreadyRegistered && (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 font-bold border border-green-300 rounded flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Déjà inscrit
                        </span>
                      )}
                      {player && hasTimeConflict && !isAlreadyRegistered && (
                        <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 font-bold border border-amber-300 rounded flex items-center gap-1">
                          <Ban className="w-3 h-3" />
                          Conflit d'horaire
                        </span>
                      )}
                      {player &&
                        hasDailyLimitFromApi &&
                        !isAlreadyRegistered &&
                        !hasTimeConflict && (
                          <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 font-bold border border-amber-300 rounded flex items-center gap-1">
                            <Ban className="w-3 h-3" />
                            Limite 2/jour atteinte
                          </span>
                        )}
                      {blockedByTimeConflict && (
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 font-bold border border-gray-300 rounded flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Même horaire
                        </span>
                      )}
                      {blockedByDailyLimit && (
                        <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 font-bold border border-orange-300 rounded flex items-center gap-1">
                          <Ban className="w-3 h-3" />
                          Limite 2/jour
                        </span>
                      )}
                      {isFull && player && isEligible && !blockedBySelection && (
                        <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 font-bold border border-amber-300 rounded flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Liste d'attente
                        </span>
                      )}
                      {player && !isEligible && !isAlreadyRegistered && !hasTimeConflict && (
                        <span className="bg-destructive text-destructive-foreground text-xs px-2 py-1 font-bold rounded">
                          Inéligible
                        </span>
                      )}
                    </div>

                    {player &&
                      !isEligible &&
                      eligibleTable.ineligibilityReasons?.length > 0 &&
                      !isAlreadyRegistered && (
                        <div className="text-xs text-muted-foreground font-medium mb-2">
                          {eligibleTable.ineligibilityReasons
                            .filter((r) => r !== 'ALREADY_REGISTERED' && r !== 'TIME_CONFLICT')
                            .map((r) => INELIGIBILITY_LABELS[r] || r)
                            .join(', ')}
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
                        <span className="font-bold">Points:</span> {table.pointsMin} -{' '}
                        {table.pointsMax}
                      </div>
                      <div>
                        <span className="font-bold">Prix:</span> {formatPrice(table.price)} €
                      </div>
                    </div>

                    {(table.totalCashPrize > 0 || table.prizes?.length > 0) && (
                      <div className="mt-2 flex items-center gap-2 text-sm">
                        <TrophyIcon className="w-4 h-4 text-yellow-600" />
                        {table.totalCashPrize > 0 ? (
                          <span className="font-bold text-yellow-700">
                            {formatPrice(table.totalCashPrize)} € de dotation
                          </span>
                        ) : (
                          <span className="text-muted-foreground">
                            {table.prizes.length} lot{table.prizes.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    )}

                    {table.sponsors?.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        <span className="text-xs font-bold text-muted-foreground">Sponsors:</span>
                        {table.sponsors.map((sponsor) => (
                          <span
                            key={sponsor.id}
                            className="bg-blue-100 text-xs px-2 py-0.5 border border-blue-300 rounded"
                          >
                            {sponsor.name}
                          </span>
                        ))}
                      </div>
                    )}

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

          {filteredTables?.length === 0 && (
            <div className="text-center p-8 bg-secondary border-2 border-dashed border-foreground">
              <p className="font-bold text-muted-foreground">
                {tables?.length === 0
                  ? 'Aucun tableau disponible pour ce tournoi.'
                  : 'Aucun tableau ne correspond aux filtres sélectionnés.'}
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
