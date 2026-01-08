import { useState, useMemo } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  UserPlus,
  Copy,
  Check,
  AlertTriangle,
  Loader2,
  Search,
  X,
  UsersIcon,
  Ban,
  Clock,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { Checkbox } from '@components/ui/checkbox'
import { api } from '../../../lib/api'
import { useCreateAdminRegistration, useAdminRegistrations } from './hooks'
import { formatDate, formatTime, formatPrice } from '../../../lib/formatters'
import { cn } from '../../../lib/utils'
import type { Table } from '../../tables/types'

interface Player {
  id: number
  licence: string
  firstName: string
  lastName: string
  club: string
  points: number
  sex: string | null
  category: string | null
}

interface AdminRegistrationFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type PaymentMethod = 'helloasso' | 'cash' | 'check' | 'card'

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Espèces' },
  { value: 'check', label: 'Chèque' },
  { value: 'card', label: 'Carte bancaire (TPE)' },
  { value: 'helloasso', label: 'HelloAsso (générer un lien)' },
]

export function AdminRegistrationForm({ open, onOpenChange }: AdminRegistrationFormProps) {
  const [step, setStep] = useState<'player' | 'tables' | 'payment' | 'success'>('player')
  const [licence, setLicence] = useState('')
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [selectedTableIds, setSelectedTableIds] = useState<number[]>([])
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [collected, setCollected] = useState(true)
  const [bypassRules, setBypassRules] = useState(false)
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const createMutation = useCreateAdminRegistration()

  // Player search
  const playerSearch = useMutation({
    mutationFn: async (searchLicence: string) => {
      const { data } = await api.get<Player>('/api/players/search', {
        params: { licence: searchLicence },
      })
      return data
    },
  })

  // Fetch tables (using same endpoint as admin tables which includes registeredCount)
  const { data: tables = [] } = useQuery({
    queryKey: ['admin', 'tables'],
    queryFn: async () => {
      const response = await api.get<Table[]>('/admin/tables')
      return response.data
    },
  })

  // Use admin registrations for checking existing registrations (more complete than public endpoint)
  const { data: adminRegistrationsData } = useAdminRegistrations()

  // Compute player's existing registrations from admin data
  const playerExistingRegistrations = useMemo(() => {
    if (!selectedPlayer || !adminRegistrationsData?.registrations) return []
    return adminRegistrationsData.registrations
      .filter(
        (r) =>
          r.player.licence === selectedPlayer.licence &&
          (r.status === 'paid' || r.status === 'pending_payment' || r.status === 'waitlist')
      )
      .map((r) => ({
        table: {
          id: r.table.id,
          date: r.table.date,
          startTime: r.table.startTime,
        },
        status: r.status,
      }))
  }, [selectedPlayer, adminRegistrationsData])

  // Set of table IDs where player is already registered
  const alreadyRegisteredTableIds = useMemo(() => {
    return new Set(playerExistingRegistrations.map((r) => r.table.id))
  }, [playerExistingRegistrations])

  // Compute time slots occupied by existing registrations
  const existingTimeSlots = useMemo(() => {
    const slots = new Set<string>()
    for (const reg of playerExistingRegistrations) {
      slots.add(`${reg.table.date}|${reg.table.startTime}`)
    }
    return slots
  }, [playerExistingRegistrations])

  // Compute time slots occupied by current selection
  const selectedTimeSlots = useMemo(() => {
    const slots = new Set<string>()
    for (const tableId of selectedTableIds) {
      const table = tables.find((t) => t.id === tableId)
      if (table) {
        const dateStr = typeof table.date === 'string' ? table.date : table.date
        slots.add(`${dateStr}|${table.startTime}`)
      }
    }
    return slots
  }, [tables, selectedTableIds])

  // Count non-special tables per day (existing registrations + selection)
  const nonSpecialCountByDay = useMemo(() => {
    const countByDay = new Map<string, number>()

    // Count existing registrations
    for (const reg of playerExistingRegistrations) {
      const table = tables.find((t) => t.id === reg.table.id)
      if (table && !table.isSpecial) {
        const dateStr = typeof table.date === 'string' ? table.date : table.date
        const currentCount = countByDay.get(dateStr) || 0
        countByDay.set(dateStr, currentCount + 1)
      }
    }

    // Add currently selected tables
    for (const tableId of selectedTableIds) {
      const table = tables.find((t) => t.id === tableId)
      if (table && !table.isSpecial) {
        const dateStr = typeof table.date === 'string' ? table.date : table.date
        const currentCount = countByDay.get(dateStr) || 0
        countByDay.set(dateStr, currentCount + 1)
      }
    }
    return countByDay
  }, [playerExistingRegistrations, selectedTableIds, tables])

  const handleSearchPlayer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!licence.trim()) return

    try {
      const player = await playerSearch.mutateAsync(licence.trim())
      if (player) {
        setSelectedPlayer(player)
        setSelectedTableIds([]) // Reset selection when player changes
        setStep('tables')
      }
    } catch {
      // Error is handled by the mutation state
    }
  }

  const handleTableToggle = (tableId: number) => {
    setSelectedTableIds((prev) =>
      prev.includes(tableId) ? prev.filter((id) => id !== tableId) : [...prev, tableId]
    )
  }

  const handleSubmit = async () => {
    if (!selectedPlayer || selectedTableIds.length === 0) return

    const result = await createMutation.mutateAsync({
      licence: selectedPlayer.licence,
      tableIds: selectedTableIds,
      paymentMethod,
      bypassRules,
      collected: paymentMethod !== 'helloasso' ? collected : undefined,
    })

    if (result.checkoutUrl) {
      setCheckoutUrl(result.checkoutUrl)
    }
    setStep('success')
  }

  const handleCopyLink = async () => {
    if (!checkoutUrl) return
    await navigator.clipboard.writeText(checkoutUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClose = () => {
    setStep('player')
    setLicence('')
    setSelectedPlayer(null)
    setSelectedTableIds([])
    setPaymentMethod('cash')
    setCollected(true)
    setBypassRules(false)
    setCheckoutUrl(null)
    onOpenChange(false)
  }

  const totalAmount = tables
    .filter((t) => selectedTableIds.includes(t.id))
    .reduce((sum, t) => sum + t.price, 0)

  // Check if player is eligible for a table (based on points, gender, category - NEVER bypassable)
  const isPlayerEligible = (table: Table): { eligible: boolean; reason: string | null } => {
    if (!selectedPlayer) return { eligible: true, reason: null }

    // Check points
    if (selectedPlayer.points < table.pointsMin) {
      return { eligible: false, reason: 'points_too_low' }
    }
    if (selectedPlayer.points > table.pointsMax) {
      return { eligible: false, reason: 'points_too_high' }
    }

    // Check gender restriction (NEVER bypassable)
    if (table.genderRestriction && selectedPlayer.sex !== table.genderRestriction) {
      return { eligible: false, reason: 'gender_restricted' }
    }

    // Check category restriction (NEVER bypassable)
    if (table.allowedCategories && table.allowedCategories.length > 0) {
      if (
        !selectedPlayer.category ||
        !table.allowedCategories.includes(
          selectedPlayer.category as (typeof table.allowedCategories)[number]
        )
      ) {
        return { eligible: false, reason: 'category_restricted' }
      }
    }

    return { eligible: true, reason: null }
  }

  // Check if blocked by time conflict with selection
  const isBlockedByTimeConflict = (table: Table): boolean => {
    if (selectedTableIds.includes(table.id)) return false
    const dateStr = typeof table.date === 'string' ? table.date : table.date
    const timeSlot = `${dateStr}|${table.startTime}`
    return selectedTimeSlots.has(timeSlot)
  }

  // Check if blocked by existing registration time conflict
  const hasExistingTimeConflict = (table: Table): boolean => {
    const dateStr = typeof table.date === 'string' ? table.date : table.date
    const timeSlot = `${dateStr}|${table.startTime}`
    return existingTimeSlots.has(timeSlot)
  }

  // Check if blocked by daily limit (max 2 non-special per day)
  const isBlockedByDailyLimit = (table: Table): boolean => {
    if (selectedTableIds.includes(table.id)) return false
    if (table.isSpecial) return false
    if (bypassRules) return false
    const dateStr = typeof table.date === 'string' ? table.date : table.date
    const dailyCount = nonSpecialCountByDay.get(dateStr) || 0
    return dailyCount >= 2
  }

  // Check if table is full (quota reached)
  const isTableFull = (table: Table): boolean => {
    if (bypassRules) return false
    return table.registeredCount >= table.quota
  }

  // Determine if a table can be selected
  const canSelectTable = (table: Table): boolean => {
    // Already registered - never selectable
    if (alreadyRegisteredTableIds.has(table.id)) return false
    // Points/gender/category ineligibility - never selectable
    if (!isPlayerEligible(table).eligible) return false
    // Already selected - can toggle off
    if (selectedTableIds.includes(table.id)) return true
    // Time conflict with existing - never selectable
    if (hasExistingTimeConflict(table)) return false
    // Time conflict with selection - not selectable
    if (isBlockedByTimeConflict(table)) return false
    // Daily limit reached - not selectable (unless bypassed)
    if (isBlockedByDailyLimit(table)) return false
    // Table full - not selectable (unless bypassed)
    if (isTableFull(table)) return false
    return true
  }

  // Get blocking reason for display
  const getBlockingReason = (table: Table): string | null => {
    if (alreadyRegisteredTableIds.has(table.id)) return 'already_registered'
    const eligibility = isPlayerEligible(table)
    if (!eligibility.eligible) return eligibility.reason
    if (selectedTableIds.includes(table.id)) return null
    if (hasExistingTimeConflict(table)) return 'time_conflict_existing'
    if (isBlockedByTimeConflict(table)) return 'time_conflict_selection'
    if (isBlockedByDailyLimit(table)) return 'daily_limit'
    if (isTableFull(table)) return 'full'
    return null
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Nouvelle inscription admin
          </DialogTitle>
          <DialogDescription>Créer une inscription pour le compte d'un joueur.</DialogDescription>
        </DialogHeader>

        {/* Step 1: Player Search */}
        {step === 'player' && (
          <div className="space-y-4 mt-4">
            <form onSubmit={handleSearchPlayer} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="licence">Numéro de licence</Label>
                <div className="flex gap-2">
                  <Input
                    id="licence"
                    value={licence}
                    onChange={(e) => setLicence(e.target.value)}
                    placeholder="Ex: 123456"
                    className="font-mono"
                  />
                  <Button type="submit" disabled={playerSearch.isPending}>
                    {playerSearch.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </form>

            {playerSearch.isError && (
              <div className="bg-destructive/10 border-2 border-destructive p-3 text-sm">
                {(playerSearch.error as Error).message || 'Joueur non trouvé'}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Table Selection */}
        {step === 'tables' && selectedPlayer && (
          <div className="space-y-4 mt-4">
            {/* Selected player info */}
            <div className="bg-muted/50 border-2 border-foreground p-3 flex justify-between items-center">
              <div>
                <p className="font-bold">
                  {selectedPlayer.firstName} {selectedPlayer.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedPlayer.licence} • {selectedPlayer.points} pts • {selectedPlayer.club}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedPlayer(null)
                  setSelectedTableIds([])
                  setStep('player')
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Existing registrations info */}
            {playerExistingRegistrations.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-300 p-3 text-sm">
                <p className="font-medium">
                  Ce joueur a déjà {playerExistingRegistrations.length} inscription(s) existante(s).
                </p>
              </div>
            )}

            {/* Bypass rules checkbox */}
            <div className="space-y-2">
              <label className="flex items-start space-x-2 cursor-pointer">
                <Checkbox
                  checked={bypassRules}
                  onChange={(e) => setBypassRules(e.target.checked)}
                  className="mt-0.5"
                />
                <div>
                  <span className="text-sm font-medium">Ignorer certaines règles</span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Permet d'outrepasser la limite de 2 tableaux par jour et le quota maximum de
                    joueurs.
                  </p>
                </div>
              </label>
            </div>

            {bypassRules && (
              <div className="bg-amber-100 dark:bg-amber-900/30 border-2 border-amber-500 p-3 flex items-start gap-2 text-sm">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p>
                  L'inscription sera créée même si le joueur dépasse la limite de 2 tableaux par
                  jour ou si le tableau a atteint son quota maximum. Les règles de classement
                  restent appliquées.
                </p>
              </div>
            )}

            {/* Table list */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              <Label>Sélectionner les tableaux</Label>
              {tables.map((table) => {
                const isSelected = selectedTableIds.includes(table.id)
                const canSelect = canSelectTable(table)
                const blockingReason = getBlockingReason(table)
                const fillRate = Math.min(
                  100,
                  Math.round((table.registeredCount / table.quota) * 100)
                )
                const isFull = table.registeredCount >= table.quota

                return (
                  <div
                    key={table.id}
                    className={cn(
                      'relative bg-card p-4 border-2 transition-all select-none',
                      canSelect
                        ? 'cursor-pointer hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
                        : 'cursor-default opacity-60 grayscale-[0.5]',
                      isSelected
                        ? 'border-primary shadow-[4px_4px_0px_0px_var(--primary)]'
                        : 'border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                    )}
                    onClick={() => canSelect && handleTableToggle(table.id)}
                  >
                    <div className="flex flex-col gap-2">
                      {/* Header */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {isSelected && <Check className="w-5 h-5 text-primary" />}
                        {table.referenceLetter && (
                          <span className="bg-primary text-primary-foreground text-sm px-2 py-1 font-bold border-2 border-foreground rounded">
                            {table.referenceLetter}
                          </span>
                        )}
                        <h3 className="text-lg font-bold">{table.name}</h3>
                        {table.isSpecial && (
                          <span className="bg-yellow-300 text-xs px-2 py-1 font-bold border border-foreground rounded text-black">
                            Spécial
                          </span>
                        )}

                        {/* Blocking reason badges */}
                        {blockingReason === 'already_registered' && (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 font-bold border border-green-300 rounded flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Déjà inscrit
                          </span>
                        )}
                        {blockingReason === 'points_too_low' && (
                          <span className="bg-destructive text-destructive-foreground text-xs px-2 py-1 font-bold rounded">
                            Points insuffisants
                          </span>
                        )}
                        {blockingReason === 'points_too_high' && (
                          <span className="bg-destructive text-destructive-foreground text-xs px-2 py-1 font-bold rounded">
                            Points trop élevés
                          </span>
                        )}
                        {blockingReason === 'gender_restricted' && (
                          <span className="bg-destructive text-destructive-foreground text-xs px-2 py-1 font-bold rounded">
                            {table.genderRestriction === 'F'
                              ? 'Réservé aux femmes'
                              : 'Réservé aux hommes'}
                          </span>
                        )}
                        {blockingReason === 'category_restricted' && (
                          <span className="bg-destructive text-destructive-foreground text-xs px-2 py-1 font-bold rounded">
                            Catégorie non autorisée
                          </span>
                        )}
                        {blockingReason === 'time_conflict_existing' && (
                          <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 font-bold border border-amber-300 rounded flex items-center gap-1">
                            <Ban className="w-3 h-3" />
                            Conflit d'horaire (existant)
                          </span>
                        )}
                        {blockingReason === 'time_conflict_selection' && (
                          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 font-bold border border-gray-300 rounded flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Même horaire
                          </span>
                        )}
                        {blockingReason === 'daily_limit' && (
                          <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 font-bold border border-orange-300 rounded flex items-center gap-1">
                            <Ban className="w-3 h-3" />
                            Limite 2 tableaux/jour
                          </span>
                        )}
                        {blockingReason === 'full' && (
                          <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 font-bold border border-amber-300 rounded">
                            Complet
                          </span>
                        )}
                        {isFull && !blockingReason && (
                          <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 font-bold border border-amber-300 rounded">
                            Complet
                          </span>
                        )}
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
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

                      {/* Fill bar */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-bold flex items-center gap-1">
                            <UsersIcon className="w-3 h-3" />
                            Places: {table.registeredCount} / {table.quota}
                            {table.waitlistCount > 0 && (
                              <span className="text-amber-600 ml-1">
                                (+{table.waitlistCount} en attente)
                              </span>
                            )}
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
                )
              })}
            </div>

            <div className="flex justify-between items-center pt-4 border-t-2 border-foreground">
              <Button variant="secondary" onClick={() => setStep('player')}>
                Retour
              </Button>
              <Button onClick={() => setStep('payment')} disabled={selectedTableIds.length === 0}>
                Continuer ({formatPrice(totalAmount)} €)
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 'payment' && (
          <div className="space-y-4 mt-4">
            <div className="bg-muted/50 border-2 border-foreground p-3">
              <p className="font-bold text-lg">Total: {formatPrice(totalAmount)} €</p>
              <p className="text-sm text-muted-foreground">
                {selectedTableIds.length} tableau(x) sélectionné(s)
              </p>
            </div>

            <div className="space-y-3">
              <Label>Mode de paiement</Label>
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_METHODS.map((method) => (
                  <Button
                    key={method.value}
                    type="button"
                    variant={paymentMethod === method.value ? 'default' : 'secondary'}
                    className="justify-start"
                    onClick={() => setPaymentMethod(method.value)}
                  >
                    {method.label}
                  </Button>
                ))}
              </div>
            </div>

            {paymentMethod !== 'helloasso' && (
              <div className="flex items-center justify-between border-2 border-foreground p-3">
                <div>
                  <p className="font-medium">Paiement encaissé</p>
                  <p className="text-sm text-muted-foreground">
                    {collected
                      ? "Le paiement a été reçu, l'inscription sera confirmée"
                      : 'Le paiement sera à encaisser ultérieurement'}
                  </p>
                </div>
                <label className="flex items-center cursor-pointer">
                  <Checkbox checked={collected} onChange={(e) => setCollected(e.target.checked)} />
                </label>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t-2 border-foreground">
              <Button variant="secondary" onClick={() => setStep('tables')}>
                Retour
              </Button>
              <Button onClick={handleSubmit} disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Création...
                  </>
                ) : (
                  "Créer l'inscription"
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 'success' && (
          <div className="space-y-4 mt-4">
            <div className="bg-green-100 dark:bg-green-900/30 border-2 border-green-500 p-4 text-center">
              <Check className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <p className="font-bold text-lg">Inscription créée avec succès !</p>
            </div>

            {checkoutUrl && (
              <div className="space-y-2">
                <Label>Lien de paiement HelloAsso</Label>
                <div className="flex gap-2">
                  <Input value={checkoutUrl} readOnly className="font-mono text-sm" />
                  <Button onClick={handleCopyLink} variant="secondary">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Envoyez ce lien au joueur pour qu'il puisse effectuer le paiement.
                </p>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button onClick={handleClose}>Fermer</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
