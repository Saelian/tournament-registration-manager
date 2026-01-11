import { useState, useMemo } from 'react'
import { Button } from '@components/ui/button'
import { PageHeader } from '@components/ui/page-header'
import { SearchInput } from '@components/ui/search-input'
import { FilterDropdown } from '@components/ui/filter-dropdown'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog'
import { useTables, useCreateTable, useUpdateTable, useDeleteTable } from './hooks'
import { TableForm } from './TableForm'
import { CsvImportDialog } from './CsvImportDialog'
import { TableCard } from './components/TableCard'
import type { Table, TableFormData } from './types'
import {
  PlusIcon,
  X,
  Upload,
  Download,
} from 'lucide-react'
import { CsvExportModal, useExportCsv, type ExportColumn } from '@components/export'
import type { FilterConfig, FilterValue, FiltersState } from '../../hooks/use-table-filters'

// Colonnes disponibles pour l'export des tableaux
const TABLES_EXPORT_COLUMNS: ExportColumn[] = [
  { key: 'referenceLetter', label: 'Lettre de référence', included: true },
  { key: 'name', label: 'Nom', included: true },
  { key: 'date', label: 'Date', included: true },
  { key: 'startTime', label: 'Heure de début', included: true },
  { key: 'pointsMin', label: 'Points min', included: true },
  { key: 'pointsMax', label: 'Points max', included: true },
  { key: 'quota', label: 'Quota', included: true },
  { key: 'price', label: 'Prix', included: true },
  { key: 'isSpecial', label: 'Spécial', included: true },
  { key: 'genderRestriction', label: 'Restriction de genre', included: true },
  { key: 'allowedCategories', label: 'Catégories autorisées', included: true },
  { key: 'maxCheckinTime', label: 'Heure limite de pointage', included: true },
  { key: 'nonNumberedOnly', label: 'Non numéroté uniquement', included: true },
]

const filterConfigs: FilterConfig[] = [
  {
    key: 'fillRate',
    type: 'select',
    label: 'Remplissage',
    options: [
      { value: 'empty', label: 'Vide (0%)' },
      { value: 'low', label: 'Faible (<50%)' },
      { value: 'medium', label: 'Moyen (50-80%)' },
      { value: 'high', label: 'Presque complet (>80%)' },
      { value: 'full', label: 'Complet (100%)' },
    ],
  },
  {
    key: 'pointsMin',
    type: 'range',
    label: 'Points min',
    min: 0,
    max: 4000,
  },
]

function calculateFillRate(table: Table): number {
  return (table.registeredCount / table.quota) * 100
}

function matchesFillRateFilter(table: Table, filterValue: string): boolean {
  const fillRate = calculateFillRate(table)
  switch (filterValue) {
    case 'empty':
      return fillRate === 0
    case 'low':
      return fillRate > 0 && fillRate < 50
    case 'medium':
      return fillRate >= 50 && fillRate <= 80
    case 'high':
      return fillRate > 80 && fillRate < 100
    case 'full':
      return fillRate >= 100
    default:
      return true
  }
}

export function TableListPage() {
  const { data: tables, isLoading } = useTables()
  const createMutation = useCreateTable()
  const updateMutation = useUpdateTable()
  const deleteMutation = useDeleteTable()

  const [selectedTableId, setSelectedTableId] = useState<number | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [tableToDelete, setTableToDelete] = useState<Table | null>(null)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<FiltersState>({})

  // Get the selected table from the fresh data
  const selectedTable = useMemo(
    () => tables?.find((t) => t.id === selectedTableId) ?? null,
    [tables, selectedTableId]
  )

  // Filter and search tables
  const filteredTables = useMemo(() => {
    if (!tables) return []

    let result = tables

    // Apply search
    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(
        (table) =>
          table.name.toLowerCase().includes(searchLower) ||
          table.referenceLetter?.toLowerCase().includes(searchLower)
      )
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (key === 'fillRate' && value.select) {
        result = result.filter((table) => matchesFillRateFilter(table, value.select!))
      }
      if (key === 'pointsMin' && value.range) {
        const { min, max } = value.range
        result = result.filter((table) => {
          if (min !== undefined && table.pointsMin < min) return false
          if (max !== undefined && table.pointsMin > max) return false
          return true
        })
      }
    })

    // Sort by date
    return result.slice().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [tables, search, filters])

  const hasActiveFilters = search.length > 0 || Object.keys(filters).length > 0

  // Export CSV
  const { exportCsv, isExporting } = useExportCsv({
    endpoint: '/admin/exports/tables',
    filenamePrefix: 'tableaux',
  })

  const handleExport = async (config: { columns: ExportColumn[]; separator: ';' | ',' | '\t' }) => {
    await exportCsv(config)
    setIsExportModalOpen(false)
  }

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

  const handleCreate = (data: TableFormData) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setIsCreating(false)
      },
    })
  }

  const handleUpdate = (data: TableFormData) => {
    if (selectedTable) {
      updateMutation.mutate(
        { id: selectedTable.id, data },
        {
          onSuccess: () => {
            setSelectedTableId(null)
          },
        }
      )
    }
  }

  const handleDeleteConfirm = () => {
    if (tableToDelete) {
      deleteMutation.mutate(tableToDelete.id, {
        onSuccess: () => {
          setTableToDelete(null)
        },
      })
    }
  }

  if (isLoading) {
    return <div>Chargement...</div>
  }

  if (isCreating || selectedTable) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <TableForm
          initialData={selectedTable}
          onSubmit={selectedTable ? handleUpdate : handleCreate}
          onCancel={() => {
            setIsCreating(false)
            setSelectedTableId(null)
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 animate-on-load animate-slide-up">
      <PageHeader
        title="Tableaux"
        className="mb-6 border-b-4 border-foreground pb-4"
        actions={
          <>
            <Button variant="secondary" onClick={() => setIsExportModalOpen(true)}>
              <Download className="w-4 h-4 mr-2" />
              Exporter CSV
            </Button>
            <Button variant="secondary" onClick={() => setIsImportDialogOpen(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Importer CSV
            </Button>
            <Button onClick={() => setIsCreating(true)}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Nouveau Tableau
            </Button>
          </>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Rechercher un tableau..."
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
              Effacer tout
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      {hasActiveFilters && (
        <div className="text-sm text-muted-foreground mb-4">
          {filteredTables.length} résultat{filteredTables.length !== 1 ? 's' : ''} trouvé
          {filteredTables.length !== 1 ? 's' : ''}
        </div>
      )}

      <div className="grid gap-4">
        {filteredTables.map((table) => (
          <TableCard
            key={table.id}
            table={table}
            variant="admin"
            onEdit={(t) => setSelectedTableId(t.id)}
            onDelete={(t) => setTableToDelete(t)}
          />
        ))}

        {filteredTables.length === 0 && (
          <div className="text-center p-8 bg-secondary border-2 border-dashed border-foreground">
            <p className="font-bold text-muted-foreground">
              {hasActiveFilters
                ? 'Aucun tableau ne correspond aux critères.'
                : 'Aucun tableau créé.'}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="mt-2 text-sm text-primary hover:underline"
              >
                Effacer les filtres
              </button>
            )}
          </div>
        )}
      </div>

      <CsvImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onSuccess={() => {}}
      />

      <CsvExportModal
        open={isExportModalOpen}
        onOpenChange={setIsExportModalOpen}
        title="Exporter les tableaux"
        columns={TABLES_EXPORT_COLUMNS}
        onExport={handleExport}
        isExporting={isExporting}
      />

      <Dialog open={!!tableToDelete} onOpenChange={(open) => !open && setTableToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le tableau "{tableToDelete?.name}" ? Cette action
              est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="secondary" onClick={() => setTableToDelete(null)}>
              Annuler
            </Button>
            <Button
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Suppression...' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
