import { useState } from 'react'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { useTables, useCreateTable, useUpdateTable, useDeleteTable } from './hooks'
import { TableForm } from './TableForm'
import type { Table, TableFormData } from './types'
import { Trash2Icon, EditIcon, PlusIcon, UsersIcon } from 'lucide-react'
import { formatDate, formatTime, formatPrice } from '../../lib/formatters'

export function TableList() {
  const { data: tables, isLoading } = useTables()
  const createMutation = useCreateTable()
  const updateMutation = useUpdateTable()
  const deleteMutation = useDeleteTable()

  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [isCreating, setIsCreating] = useState(false)

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
            setSelectedTable(null)
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
    return <div className="text-center py-8">Chargement des tableaux...</div>
  }

  if (isCreating || selectedTable) {
    return (
      <TableForm
        initialData={selectedTable}
        onSubmit={selectedTable ? handleUpdate : handleCreate}
        onCancel={() => {
          setIsCreating(false)
          setSelectedTable(null)
        }}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Tableaux</h2>
        <Button onClick={() => setIsCreating(true)}>
          <PlusIcon className="w-4 h-4 mr-2" />
          Nouveau Tableau
        </Button>
      </div>

      <div className="grid gap-4">
        {tables?.map((table) => {
          const fillRate = Math.min(100, Math.round((table.registeredCount / table.quota) * 100))

          return (
            <Card key={table.id} className="p-4 flex flex-col md:flex-row justify-between gap-4">
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
                  {table.nonNumberedOnly && (
                    <span className="bg-green-200 text-xs px-2 py-1 font-bold border border-foreground rounded">
                      Non numéroté
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
                <Button variant="secondary" size="sm" onClick={() => setSelectedTable(table)}>
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
            </Card>
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
