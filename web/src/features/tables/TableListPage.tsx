import { useState, useMemo } from 'react'
import { Button } from '../../components/ui/button'
import { useTables, useCreateTable, useUpdateTable, useDeleteTable } from './hooks'
import { TableForm } from './TableForm'
import type { TableFormData } from './types'
import { Trash2Icon, EditIcon, PlusIcon, UsersIcon, TrophyIcon } from 'lucide-react'
import { formatDate, formatTime, formatPrice } from '../../lib/formatters'

export function TableListPage() {
  const { data: tables, isLoading } = useTables()
  const createMutation = useCreateTable()
  const updateMutation = useUpdateTable()
  const deleteMutation = useDeleteTable()

  const [selectedTableId, setSelectedTableId] = useState<number | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  // Get the selected table from the fresh data
  const selectedTable = useMemo(
    () => tables?.find((t) => t.id === selectedTableId) ?? null,
    [tables, selectedTableId]
  )

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

  const handleDelete = (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce tableau ?')) {
      deleteMutation.mutate(id)
    }
  }

  if (isLoading) {
    return <div>Chargement...</div>
  }

  if (isCreating || selectedTable) {
    return (
      <div className="max-w-2xl mx-auto p-6">
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
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6 border-b-4 border-foreground pb-4">
        <h1 className="text-3xl font-bold">Tableaux</h1>
        <Button onClick={() => setIsCreating(true)}>
          <PlusIcon className="w-4 h-4 mr-2" />
          Nouveau Tableau
        </Button>
      </div>

      <div className="grid gap-4">
        {tables?.map((table) => {
          const fillRate = Math.min(100, Math.round((table.registeredCount / table.quota) * 100))

          return (
            <div
              key={table.id}
              className="bg-card p-4 border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row justify-between gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h3 className="text-xl font-bold">{table.name}</h3>
                  {table.isSpecial && (
                    <span className="bg-yellow-300 text-xs px-2 py-1 font-bold border border-foreground rounded">
                      Spécial
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
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                  <div>
                    <span className="font-bold">Date:</span> {formatDate(table.date)}
                  </div>
                  <div>
                    <span className="font-bold">Début:</span> {formatTime(table.startTime)}
                  </div>
                  <div>
                    <span className="font-bold">Points:</span> {table.pointsMin} - {table.pointsMax}
                  </div>
                  <div>
                    <span className="font-bold">Prix:</span> {formatPrice(table.price)} €
                  </div>
                </div>

                {table.allowedCategories && table.allowedCategories.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    <span className="text-xs font-bold text-muted-foreground">Catégories:</span>
                    {table.allowedCategories.map((cat) => (
                      <span
                        key={cat}
                        className="bg-secondary text-xs px-2 py-0.5 border border-foreground rounded"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-1 text-xs text-muted-foreground">
                  <span className="font-bold">Pointage avant:</span>{' '}
                  {formatTime(table.effectiveCheckinTime)}
                </div>

                {(table.totalCashPrize > 0 || table.prizes.length > 0) && (
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

                {table.sponsors.length > 0 && (
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
                      Inscrits: {table.registeredCount} / {table.quota}
                    </span>
                    <span>{fillRate}%</span>
                  </div>
                  <div className="h-2 w-full bg-secondary border border-foreground rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${fillRate}%` }} />
                  </div>
                </div>
              </div>

              <div className="flex md:flex-col justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => setSelectedTableId(table.id)}>
                  <EditIcon className="w-4 h-4" />
                </Button>
                <Button
                  className="bg-white text-black"
                  size="sm"
                  onClick={() => handleDelete(table.id)}
                >
                  <Trash2Icon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )
        })}

        {tables?.length === 0 && (
          <div className="text-center p-8 bg-secondary border-2 border-dashed border-foreground">
            <p className="font-bold text-muted-foreground">Aucun tableau créé.</p>
          </div>
        )}
      </div>
    </div>
  )
}
