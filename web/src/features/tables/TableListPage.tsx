import { useState } from 'react'
import { Button } from '../../components/ui/button'
import {
  useTables,
  useCreateTable,
  useUpdateTable,
  useDeleteTable,
} from './hooks'
import { TableForm } from './TableForm'
import type { Table, TableFormData } from './types'
import { Trash2Icon, EditIcon, PlusIcon, UsersIcon } from 'lucide-react'

export function TableListPage() {
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
            setSelectedTable(null)
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
          const fillRate = Math.min(
            100,
            Math.round((table.registeredCount / table.quota) * 100)
          )

          return (
            <div
              key={table.id}
              className="bg-card p-4 border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row justify-between gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold">{table.name}</h3>
                  {table.isSpecial && (
                    <span className="bg-yellow-300 text-xs px-2 py-1 font-bold border border-foreground rounded">
                      Spécial
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                  <div>
                    <span className="font-bold">Date:</span> {table.date}
                  </div>
                  <div>
                    <span className="font-bold">Début:</span> {table.startTime.slice(0, 5)}
                  </div>
                  <div>
                    <span className="font-bold">Points:</span>{' '}
                    {table.pointsMin} - {table.pointsMax}
                  </div>
                  <div>
                    <span className="font-bold">Prix:</span> {table.price / 100} €
                  </div>
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
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${fillRate}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex md:flex-col justify-end gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedTable(table)}
                >
                  <EditIcon className="w-4 h-4" />
                </Button>
                <Button
                  variant="destructive"
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
            <p className="font-bold text-muted-foreground">
              Aucun tableau créé.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
