import { useState } from 'react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { useCreatePrize, useUpdatePrize, useDeletePrize, useTablePrizes } from './hooks'
import type { TablePrize } from './types'
import {
  PlusIcon,
  Trash2Icon,
  TrophyIcon,
  GiftIcon,
  EditIcon,
  XIcon,
  CheckIcon,
} from 'lucide-react'
import { formatPrice } from '../../lib/formatters'

interface TablePrizesSectionProps {
  tableId: number
}

interface PrizeFormState {
  rank: number
  prizeType: 'cash' | 'item'
  cashAmount: string
  itemDescription: string
}

export function TablePrizesSection({ tableId }: TablePrizesSectionProps) {
  const { data } = useTablePrizes(tableId)
  const prizes = data?.prizes ?? []
  const totalCashPrize = data?.totalCashPrize ?? 0

  const createMutation = useCreatePrize()
  const updateMutation = useUpdatePrize()
  const deleteMutation = useDeletePrize()

  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formState, setFormState] = useState<PrizeFormState>({
    rank: 1,
    prizeType: 'cash',
    cashAmount: '',
    itemDescription: '',
  })

  const sortedPrizes = [...prizes].sort((a, b) => a.rank - b.rank)

  const handleAdd = () => {
    const nextRank = Math.max(0, ...prizes.map((p) => p.rank)) + 1
    setFormState({
      rank: nextRank,
      prizeType: 'cash',
      cashAmount: '',
      itemDescription: '',
    })
    setIsAdding(true)
  }

  const handleEdit = (prize: TablePrize) => {
    setFormState({
      rank: prize.rank,
      prizeType: prize.prizeType,
      cashAmount: prize.cashAmount?.toString() ?? '',
      itemDescription: prize.itemDescription ?? '',
    })
    setEditingId(prize.id)
  }

  const handleSave = () => {
    const data = {
      rank: formState.rank,
      prizeType: formState.prizeType,
      cashAmount: formState.prizeType === 'cash' ? parseFloat(formState.cashAmount) || null : null,
      itemDescription: formState.prizeType === 'item' ? formState.itemDescription || null : null,
    }

    if (editingId) {
      updateMutation.mutate(
        { tableId, prizeId: editingId, data },
        {
          onSuccess: () => {
            setEditingId(null)
          },
        }
      )
    } else {
      createMutation.mutate(
        { tableId, data },
        {
          onSuccess: () => {
            setIsAdding(false)
          },
        }
      )
    }
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingId(null)
  }

  const handleDelete = (prizeId: number) => {
    if (window.confirm('Supprimer ce prix ?')) {
      deleteMutation.mutate({ tableId, prizeId })
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  const getRankLabel = (rank: number) => {
    if (rank === 1) return '1er'
    return `${rank}ème`
  }

  return (
    <div className="border-t-2 border-foreground pt-4 mt-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold flex items-center gap-2">
          <TrophyIcon className="w-4 h-4" />
          Prix et dotations
        </h3>
        {!isAdding && !editingId && (
          <Button type="button" variant="secondary" size="sm" onClick={handleAdd}>
            <PlusIcon className="w-4 h-4 mr-1" />
            Ajouter
          </Button>
        )}
      </div>

      {totalCashPrize > 0 && (
        <div className="bg-yellow-100 border-2 border-yellow-400 p-2 mb-3 rounded text-sm">
          <strong>Total cash prizes:</strong> {formatPrice(totalCashPrize)} €
        </div>
      )}

      <div className="space-y-2">
        {sortedPrizes.map((prize) => (
          <div
            key={prize.id}
            className="flex items-center justify-between bg-secondary p-2 rounded border border-foreground"
          >
            {editingId === prize.id ? (
              <div className="flex-1 flex flex-wrap items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  value={formState.rank}
                  onChange={(e) =>
                    setFormState({ ...formState, rank: parseInt(e.target.value) || 1 })
                  }
                  className="w-16"
                  placeholder="Rang"
                />
                <select
                  value={formState.prizeType}
                  onChange={(e) =>
                    setFormState({ ...formState, prizeType: e.target.value as 'cash' | 'item' })
                  }
                  className="h-10 rounded-md border-2 border-foreground bg-background px-2 text-sm"
                >
                  <option value="cash">Cash</option>
                  <option value="item">Lot</option>
                </select>
                {formState.prizeType === 'cash' ? (
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formState.cashAmount}
                    onChange={(e) => setFormState({ ...formState, cashAmount: e.target.value })}
                    className="w-24"
                    placeholder="€"
                  />
                ) : (
                  <Input
                    value={formState.itemDescription}
                    onChange={(e) =>
                      setFormState({ ...formState, itemDescription: e.target.value })
                    }
                    className="flex-1"
                    placeholder="Description du lot"
                  />
                )}
                <div className="flex gap-1">
                  <Button type="button" size="sm" onClick={handleSave} disabled={isLoading}>
                    <CheckIcon className="w-4 h-4" />
                  </Button>
                  <Button type="button" variant="secondary" size="sm" onClick={handleCancel}>
                    <XIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm w-12">{getRankLabel(prize.rank)}</span>
                  {prize.prizeType === 'cash' ? (
                    <span className="flex items-center gap-1 text-sm">
                      <TrophyIcon className="w-3 h-3 text-yellow-600" />
                      {formatPrice(prize.cashAmount ?? 0)} €
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-sm">
                      <GiftIcon className="w-3 h-3 text-purple-600" />
                      {prize.itemDescription}
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEdit(prize)}
                  >
                    <EditIcon className="w-3 h-3" />
                  </Button>
                  <Button
                    type="button"
                    className="bg-white text-black"
                    size="sm"
                    onClick={() => handleDelete(prize.id)}
                  >
                    <Trash2Icon className="w-3 h-3" />
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}

        {isAdding && (
          <div className="flex flex-wrap items-center gap-2 bg-secondary p-2 rounded border-2 border-dashed border-foreground">
            <Input
              type="number"
              min="1"
              value={formState.rank}
              onChange={(e) => setFormState({ ...formState, rank: parseInt(e.target.value) || 1 })}
              className="w-16"
              placeholder="Rang"
            />
            <select
              value={formState.prizeType}
              onChange={(e) =>
                setFormState({ ...formState, prizeType: e.target.value as 'cash' | 'item' })
              }
              className="h-10 rounded-md border-2 border-foreground bg-background px-2 text-sm"
            >
              <option value="cash">Cash</option>
              <option value="item">Lot</option>
            </select>
            {formState.prizeType === 'cash' ? (
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formState.cashAmount}
                onChange={(e) => setFormState({ ...formState, cashAmount: e.target.value })}
                className="w-24"
                placeholder="€"
              />
            ) : (
              <Input
                value={formState.itemDescription}
                onChange={(e) => setFormState({ ...formState, itemDescription: e.target.value })}
                className="flex-1"
                placeholder="Description du lot"
              />
            )}
            <div className="flex gap-1">
              <Button type="button" size="sm" onClick={handleSave} disabled={isLoading}>
                <CheckIcon className="w-4 h-4" />
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={handleCancel}>
                <XIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {prizes.length === 0 && !isAdding && (
          <p className="text-sm text-muted-foreground text-center py-2">
            Aucun prix configuré pour ce tableau
          </p>
        )}
      </div>
    </div>
  )
}
