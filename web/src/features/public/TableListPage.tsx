import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PageHeader } from '@components/ui/page-header'
import { usePublicTables, useEligibleTables, usePublicTournaments } from './hooks'
import {
  LayoutGridIcon,
  UsersIcon,
  AlertCircle,
  XCircle,
  ClockIcon,
  InfoIcon,
  Mail,
  CreditCard,
} from 'lucide-react'
import { RegistrationPanel } from '../registration/RegistrationPanel'
import { CartSummary } from '../registration/CartSummary'
import { TableFilters } from '../registration/TableFilters'
import { useCreateRegistrations } from '../registration/hooks'
import { TableCard } from '../tables/components/TableCard'
import type { Player } from '../registration/types'
import type { EligibleTable } from '../tables/types'
import { cn } from '@lib/utils'

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
  const { data: tournaments } = usePublicTournaments()
  const tournament = tournaments?.find((t) => t.id.toString() === tournamentId)
  const { data: publicTables, isLoading: isLoadingPublic } = usePublicTables(tournamentId)
  const { data: eligibleTables, isLoading: isLoadingEligible } = useEligibleTables(player?.id)
  const createRegistrations = useCreateRegistrations()

  // Période d'inscription
  const registrationStatus = tournament?.registrationStatus
  const isRegistrationOpen = registrationStatus?.isOpen ?? true

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

  // Compter les tableaux non-spéciaux par jour (inscriptions existantes + sélection)
  const nonSpecialCountByDay = useMemo(() => {
    if (!eligibleTables) return new Map<string, number>()
    const countByDay = new Map<string, number>()

    // Compter les inscriptions existantes (tableaux avec ALREADY_REGISTERED)
    for (const table of eligibleTables) {
      if (!table.isSpecial && table.ineligibilityReasons?.includes('ALREADY_REGISTERED')) {
        const currentCount = countByDay.get(table.date) || 0
        countByDay.set(table.date, currentCount + 1)
      }
    }

    // Ajouter les tableaux sélectionnés dans le panier
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
        initiatePayment: true,
      })

      const waitlistCount = result.registrations.filter((r) => r.status === 'waitlist').length
      const directCount = result.registrations.filter((r) => r.status === 'pending_payment').length

      // Reset local state
      setPlayer(null)
      setSelectedTableIds([])

      // If we have a redirect URL, redirect directly to HelloAsso for payment
      if (result.redirectUrl) {
        window.location.href = result.redirectUrl
        return
      }

      // If payment initiation failed but registrations were created
      if (result.paymentError) {
        navigate('/dashboard', {
          state: {
            message:
              "Inscriptions créées mais le paiement n'a pas pu être initié. Veuillez procéder au paiement depuis le tableau de bord.",
            variant: 'warning',
          },
        })
        return
      }

      // All waitlist case (no payment needed)
      if (waitlistCount > 0 && directCount === 0) {
        navigate('/dashboard', {
          state: {
            message: `${waitlistCount} inscription(s) ajoutée(s) en liste d'attente.`,
          },
        })
        return
      }

      // Mixed case: some waitlist, some pending payment but no redirectUrl
      // This shouldn't happen normally, but handle it gracefully
      if (waitlistCount > 0 && directCount > 0) {
        navigate('/dashboard', {
          state: {
            message: `${directCount} inscription(s) confirmée(s) et ${waitlistCount} ajoutée(s) en liste d'attente.`,
          },
        })
      } else {
        // Fallback: redirect to dashboard
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
    <div className="min-h-screen bg-grain">
      <div className="bg-gradient-secondary-to-white min-h-screen">
        <div className={cn('max-w-7xl mx-auto p-6', cartPaddingBottom)}>
          <div className={cn('max-w-7xl mx-auto p-6', cartPaddingBottom)}>
            <PageHeader
              title="Tableaux disponibles"
              icon={LayoutGridIcon}
              backLink="/"
            />

            {/* Aide inscription */}
            <div className="animate-on-load animate-slide-in-left animation-delay-150 mb-8">
              <div className="bg-white neo-brutal p-4 md:p-6">
                <h2 className="text-xl font-black mb-6 flex items-center gap-3">
                  <div className="bg-blue-300 p-2 neo-brutal-sm">
                    <InfoIcon className="w-5 h-5" />
                  </div>
                  Comment s'inscrire ?
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-4">
                  {/* Step 1 */}
                  <div className="bg-pink-100 p-4 border-2 border-foreground relative hover:-translate-y-1 transition-transform shadow-none hover:shadow-shadow">
                    <div className="absolute -top-3 -right-3 bg-primary text-background font-black w-8 h-8 flex items-center justify-center rounded-full border-2 border-foreground">
                      1
                    </div>
                    <Mail className="w-8 h-8 mb-3 text-pink-600" />
                    <h3 className="font-bold text-lg leading-tight mb-2">Connexion</h3>
                    <p className="text-sm text-foreground/80 font-medium leading-snug">
                      Je me connecte avec mon adresse email.
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-yellow-100 p-4 border-2 border-foreground relative hover:-translate-y-1 transition-transform shadow-none hover:shadow-shadow">
                    <div className="absolute -top-3 -right-3 bg-primary text-background font-black w-8 h-8 flex items-center justify-center rounded-full border-2 border-foreground">
                      2
                    </div>
                    <UsersIcon className="w-8 h-8 mb-3 text-yellow-600" />
                    <h3 className="font-bold text-lg leading-tight mb-2">Joueur</h3>
                    <p className="text-sm text-foreground/80 font-medium leading-snug">
                      Je retrouve mon profil via mon n° de licence.
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-green-100 p-4 border-2 border-foreground relative hover:-translate-y-1 transition-transform shadow-none hover:shadow-shadow">
                    <div className="absolute -top-3 -right-3 bg-primary text-background font-black w-8 h-8 flex items-center justify-center rounded-full border-2 border-foreground">
                      3
                    </div>
                    <LayoutGridIcon className="w-8 h-8 mb-3 text-green-600" />
                    <h3 className="font-bold text-lg leading-tight mb-2">Tableaux</h3>
                    <p className="text-sm text-foreground/80 font-medium leading-snug">
                      Je sélectionne les tableaux souhaités.
                    </p>
                  </div>

                  {/* Step 4 */}
                  <div className="bg-blue-100 p-4 border-2 border-foreground relative hover:-translate-y-1 transition-transform shadow-none hover:shadow-shadow">
                    <div className="absolute -top-3 -right-3 bg-primary text-background font-black w-8 h-8 flex items-center justify-center rounded-full border-2 border-foreground">
                      4
                    </div>
                    <CreditCard className="w-8 h-8 mb-3 text-blue-600" />
                    <h3 className="font-bold text-lg leading-tight mb-2">Paiement</h3>
                    <p className="text-sm text-foreground/80 font-medium leading-snug">
                      Je confirme et paie via HelloAsso.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Alerte période d'inscription */}
            {!isRegistrationOpen && registrationStatus && (
              <div className="animate-on-load animate-scale-in animation-delay-200 mb-6 p-4 bg-card neo-brutal">
                <div className="flex items-center gap-3">
                  {registrationStatus.status === 'not_started' ? (
                    <ClockIcon className="w-6 h-6 text-muted-foreground" />
                  ) : (
                    <XCircle className="w-6 h-6 text-destructive" />
                  )}
                  <div>
                    <div className="font-bold text-lg">
                      {registrationStatus.status === 'not_started'
                        ? 'Les inscriptions ne sont pas encore ouvertes'
                        : 'Les inscriptions sont terminées'}
                    </div>
                    <div className="text-muted-foreground">{registrationStatus.message}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Panneau d'inscription (seulement si période ouverte) */}
            {isRegistrationOpen && (
              <div className="animate-on-load animate-slide-up animation-delay-200 mb-6">
                <RegistrationPanel
                  player={player}
                  onPlayerSelect={handlePlayerSelect}
                  onPlayerClear={handlePlayerClear}
                />
              </div>
            )}

            {/* Erreur */}
            {error && (
              <div className="animate-on-load animate-scale-in mb-6 p-4 bg-destructive/10 border border-destructive text-destructive rounded-md whitespace-pre-line">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <AlertCircle className="w-4 h-4" />
                  Erreur
                </div>
                {error}
              </div>
            )}

            {/* Filtres */}
            {player && (
              <div className="animate-on-load animate-slide-up animation-delay-300 mb-4">
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
              <div className="grid gap-4 animate-on-load animate-slide-up animation-delay-400">
                {filteredTables?.map((table) => {
                  const eligibleTable = table as EligibleTable
                  const isEligible = player ? eligibleTable.isEligible : false
                  const isEffectivelyFull =
                    table.registeredCount + table.waitlistCount >= table.quota

                  // Vérifier si bloqué par la sélection actuelle
                  const blockedByTimeConflict =
                    player && isEligible && isBlockedByTimeConflict(eligibleTable)
                  const blockedByDailyLimit =
                    player && isEligible && isBlockedByDailyLimit(eligibleTable)
                  const blockedBySelection = blockedByTimeConflict || blockedByDailyLimit

                  let blockedReason = undefined
                  if (blockedByTimeConflict) blockedReason = "Même horaire"
                  else if (blockedByDailyLimit) blockedReason = "Un maximum de deux tableaux par jour est autorisé (hors tableaux spéciaux)"

                  return (
                    <TableCard
                      key={table.id}
                      table={table}
                      variant="public"
                      player={player}
                      isSelected={selectedTableIds.includes(table.id)}
                      isBlocked={!!blockedBySelection}
                      blockedReason={blockedReason}
                      isEffectivelyFull={isEffectivelyFull}
                      onToggle={handleToggle}
                    />
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
        </div>
      </div>
    </div>
  )
}