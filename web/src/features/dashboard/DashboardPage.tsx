import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useMyRegistrations } from './hooks'
import { RegistrationCard } from './RegistrationCard'
import { useUserAuth } from '../auth'
import { SearchInput } from '../../components/ui/search-input'
import { FilterDropdown } from '../../components/ui/filter-dropdown'
import { Button } from '../../components/ui/button'
import type { RegistrationStatus } from './types'
import type { FilterConfig, FilterValue, FiltersState } from '../../hooks/use-table-filters'
import { User, Calendar, X, ArrowUp, ArrowDown } from 'lucide-react'

const filterConfigs: FilterConfig[] = [
  {
    key: 'status',
    type: 'select',
    label: 'Statut',
    options: [
      { value: 'paid', label: 'Payé' },
      { value: 'pending_payment', label: 'En attente' },
      { value: 'waitlist', label: "Liste d'attente" },
      { value: 'cancelled', label: 'Annulé' },
    ],
  },
]

function getNextTournamentId(registrations: { table: { tournament: { id: number; startDate: string } } }[]) {
  if (!registrations || registrations.length === 0) return null

  const now = new Date()
  const upcomingTournaments = registrations
    .map((r) => r.table.tournament)
    .filter((t) => new Date(t.startDate) >= now)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())

  return upcomingTournaments[0]?.id ?? registrations[0].table.tournament.id
}

type SortField = 'date' | 'name' | 'createdAt'
type SortDirection = 'asc' | 'desc'

export function DashboardPage() {
  const { user } = useUserAuth()
  const { data: registrations, isLoading, error } = useMyRegistrations()
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<FiltersState>({})
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const hasActiveFilters = search.length > 0 || Object.keys(filters).length > 0
  const nextTournamentId = getNextTournamentId(registrations ?? [])
  const tablesLink = nextTournamentId ? `/tournaments/${nextTournamentId}/tables` : '/'

  const filteredRegistrations = useMemo(() => {
    if (!registrations) return []

    let result = registrations

    // Apply search
    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(
        (r) =>
          r.table.name.toLowerCase().includes(searchLower) ||
          r.table.tournament.name.toLowerCase().includes(searchLower) ||
          r.player.firstName.toLowerCase().includes(searchLower) ||
          r.player.lastName.toLowerCase().includes(searchLower)
      )
    }

    // Apply status filter
    const statusFilter = filters.status?.select as RegistrationStatus | undefined
    if (statusFilter) {
      result = result.filter((r) => r.status === statusFilter)
    }

    // Apply sort
    result = [...result].sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'date':
          comparison = new Date(a.table.date).getTime() - new Date(b.table.date).getTime()
          break
        case 'name':
          comparison = a.table.name.localeCompare(b.table.name, 'fr')
          break
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return result
  }, [registrations, search, filters, sortField, sortDirection])

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
      setSortDirection('asc')
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-pulse text-lg font-bold">Chargement...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-destructive/10 border-2 border-destructive p-6 text-center">
          <p className="font-bold text-destructive">
            Une erreur est survenue lors du chargement de vos inscriptions.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
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

      {/* Inscriptions Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Mes inscriptions
            {registrations && registrations.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({registrations.length})
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
        {registrations && registrations.length > 0 && (
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
                { field: 'name' as SortField, label: 'Nom' },
                { field: 'createdAt' as SortField, label: "Date d'inscription" },
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
            {filteredRegistrations.length} résultat
            {filteredRegistrations.length !== 1 ? 's' : ''} trouvé
            {filteredRegistrations.length !== 1 ? 's' : ''}
          </div>
        )}

        {/* Registration list */}
        {!registrations || registrations.length === 0 ? (
          <div className="bg-secondary border-2 border-dashed border-foreground p-12 text-center">
            <p className="font-bold text-muted-foreground mb-4">
              Vous n'avez aucune inscription pour le moment.
            </p>
            <Link to={tablesLink}>
              <Button>Voir les tableaux disponibles</Button>
            </Link>
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <div className="bg-secondary border-2 border-dashed border-foreground p-12 text-center">
            <p className="font-bold text-muted-foreground">
              Aucune inscription ne correspond à vos critères.
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
          <div className="space-y-4">
            {filteredRegistrations.map((registration) => (
              <RegistrationCard key={registration.id} registration={registration} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
