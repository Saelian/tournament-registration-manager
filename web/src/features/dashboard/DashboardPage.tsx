import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useMyRegistrations, useMyPaymentsWithRegistrations } from './hooks'
import { PaymentGroup, PendingPaymentGroup } from './PaymentGroup'
import { useUserAuth } from '../auth'
import { SearchInput } from '@components/ui/search-input'
import { FilterDropdown } from '@components/ui/filter-dropdown'
import { Button } from '@components/ui/button'
import { useCreatePaymentIntent } from '../payment'
import type { FilterConfig, FilterValue, FiltersState } from '@/hooks/use-table-filters'
import type { PaymentStatus } from '../payment/types'
import { User, Calendar, X, ArrowUp, ArrowDown, CreditCard, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { formatPrice } from '@lib/formatters'
import { RegistrationCard } from './RegistrationCard'

const filterConfigs: FilterConfig[] = [
  {
    key: 'paymentStatus',
    type: 'select',
    label: 'Statut paiement',
    options: [
      { value: 'succeeded', label: 'Payé' },
      { value: 'pending', label: 'En attente' },
      { value: 'refunded', label: 'Remboursé' },
    ],
  },
]

function getNextTournamentId(
  registrations: { table: { tournament: { id: number; startDate: string } } }[]
) {
  if (!registrations || registrations.length === 0) return null

  const now = new Date()
  const upcomingTournaments = registrations
    .map((r) => r.table.tournament)
    .filter((t) => new Date(t.startDate) >= now)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())

  return upcomingTournaments[0]?.id ?? registrations[0].table.tournament.id
}

type SortField = 'date' | 'amount'
type SortDirection = 'asc' | 'desc'

export function DashboardPage() {
  const { user } = useUserAuth()
  const { data: registrations, isLoading: registrationsLoading } = useMyRegistrations()
  const { data: payments, isLoading: paymentsLoading } = useMyPaymentsWithRegistrations()
  const paymentMutation = useCreatePaymentIntent()

  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<FiltersState>({})
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const isLoading = registrationsLoading || paymentsLoading

  const hasActiveFilters = search.length > 0 || Object.keys(filters).length > 0
  const nextTournamentId = getNextTournamentId(registrations ?? [])
  const tablesLink = nextTournamentId ? `/tournaments/${nextTournamentId}/tables` : '/'

  // Get pending payment registrations (not linked to any payment)
  const pendingPaymentRegistrations = useMemo(() => {
    if (!registrations) return []
    return registrations.filter((r) => r.status === 'pending_payment')
  }, [registrations])

  // Get waitlist registrations
  const waitlistRegistrations = useMemo(() => {
    if (!registrations) return []
    return registrations.filter((r) => r.status === 'waitlist')
  }, [registrations])

  // Filter and sort payments
  const filteredPayments = useMemo(() => {
    if (!payments) return []

    let result = payments

    // Apply search
    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter((p) =>
        p.registrations?.some(
          (r) =>
            (r.table?.name ?? '').toLowerCase().includes(searchLower) ||
            (r.player?.firstName ?? '').toLowerCase().includes(searchLower) ||
            (r.player?.lastName ?? '').toLowerCase().includes(searchLower)
        )
      )
    }

    // Apply status filter
    const statusFilter = filters.paymentStatus?.select as PaymentStatus | undefined
    if (statusFilter) {
      result = result.filter((p) => p.status === statusFilter)
    }

    // Apply sort
    result = [...result].sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'amount':
          comparison = a.amount - b.amount
          break
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return result
  }, [payments, search, filters, sortField, sortDirection])

  const setFilter = (key: string, value: FilterValue) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilter = (key: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev }
      delete newFilters[key]
      return newFilters
    })
  }

  const clearAllFilters = () => {
    setSearch('')
    setFilters({})
  }

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const handlePayPending = () => {
    const ids = pendingPaymentRegistrations.map((r) => r.id)
    paymentMutation.mutate(ids, {
      onSuccess: (data) => {
        window.location.href = data.redirectUrl
      },
      onError: (error) => {
        toast.error('Erreur lors de la création du paiement: ' + error.message)
      },
    })
  }

  const totalPendingAmount = pendingPaymentRegistrations.reduce(
    (sum, r) => sum + Number(r.table.price),
    0
  )

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-pulse text-lg font-bold">Chargement...</div>
      </div>
    )
  }

  const hasNoData =
    (!payments || payments.length === 0) &&
    pendingPaymentRegistrations.length === 0 &&
    waitlistRegistrations.length === 0

  return (
    <div className="min-h-screen bg-grain">
      <div className="bg-gradient-secondary-to-white min-h-screen">
        <div className="max-w-7xl mx-auto p-6 space-y-6 animate-on-load animate-slide-up">
          {/* Header */}
          <div className="bg-card p-6 border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary flex items-center justify-center border-2 border-foreground">
                <User className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Mon tableau de bord</h1>
                <p className="text-muted-foreground">Bonjour {user?.fullName || user?.email}</p>
              </div>
            </div>
          </div>

          {pendingPaymentRegistrations.length > 0 && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  En attente de paiement
                  <span className="text-sm font-normal text-muted-foreground">
                    ({pendingPaymentRegistrations.length})
                  </span>
                </h2>
                <Button onClick={handlePayPending} disabled={paymentMutation.isPending}>
                  {paymentMutation.isPending
                    ? 'Redirection...'
                    : `Payer ${formatPrice(totalPendingAmount)} €`}
                </Button>
              </div>
              <PendingPaymentGroup registrations={pendingPaymentRegistrations} />
            </div>
          )}

          {/* Waitlist Section */}
          {waitlistRegistrations.length > 0 && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  En liste d'attente
                  <span className="text-sm font-normal text-muted-foreground">
                    ({waitlistRegistrations.length})
                  </span>
                </h2>
              </div>
              <div className="space-y-4">
                {waitlistRegistrations.map((registration) => (
                  <RegistrationCard key={registration.id} registration={registration} />
                ))}
              </div>
            </div>
          )}

          {/* Payments Section */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Mes inscriptions
                {payments && payments.length > 0 && (
                  <span className="text-sm font-normal text-muted-foreground">
                    ({payments.length} paiement{payments.length > 1 ? 's' : ''})
                  </span>
                )}
              </h2>
              <Link to={tablesLink}>
                <Button variant="outline" size="sm">
                  Voir les tableaux
                </Button>
              </Link>
            </div>

            {/* Toolbar */}
            {payments && payments.length > 0 && (
              <div className="space-y-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Rechercher..."
                    className="sm:w-64"
                  />
                  <div className="flex flex-wrap gap-2">
                    {filterConfigs.map((config) => (
                      <FilterDropdown
                        key={config.key}
                        config={config}
                        value={filters[config.key]}
                        onChange={(value) => setFilter(config.key, value)}
                        onClear={() => clearFilter(config.key)}
                      />
                    ))}
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={clearAllFilters}
                        className="flex items-center gap-1 h-10 px-3 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Effacer
                      </button>
                    )}
                  </div>
                </div>

                {/* Sort buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-muted-foreground">Trier par :</span>
                  {[
                    { field: 'date' as SortField, label: 'Date' },
                    { field: 'amount' as SortField, label: 'Montant' },
                  ].map(({ field, label }) => (
                    <button
                      key={field}
                      type="button"
                      onClick={() => toggleSort(field)}
                      className={`flex items-center gap-1 h-8 px-3 text-sm border-2 border-foreground transition-colors ${
                        sortField === field
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card hover:bg-secondary/50'
                      }`}
                    >
                      {label}
                      {sortField === field &&
                        (sortDirection === 'asc' ? (
                          <ArrowUp className="w-3 h-3" />
                        ) : (
                          <ArrowDown className="w-3 h-3" />
                        ))}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Results count */}
            {hasActiveFilters && (
              <div className="text-sm text-muted-foreground mb-4">
                {filteredPayments.length} résultat
                {filteredPayments.length !== 1 ? 's' : ''} trouvé
                {filteredPayments.length !== 1 ? 's' : ''}
              </div>
            )}

            {/* Payment list */}
            {hasNoData ? (
              <div className="bg-secondary border-2 border-dashed border-foreground p-12 text-center">
                <p className="font-bold text-muted-foreground mb-4">
                  Vous n'avez aucune inscription pour le moment.
                </p>
                <Link to={tablesLink}>
                  <Button>Voir les tableaux disponibles</Button>
                </Link>
              </div>
            ) : filteredPayments.length === 0 && payments && payments.length > 0 ? (
              <div className="bg-secondary border-2 border-dashed border-foreground p-12 text-center">
                <p className="font-bold text-muted-foreground">
                  Aucun paiement ne correspond à vos critères.
                </p>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="mt-2 text-sm text-primary hover:underline"
                >
                  Effacer les filtres
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredPayments.map((payment) => (
                  <PaymentGroup
                    key={payment.id}
                    payment={payment}
                    registrations={payment.registrations || []}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
