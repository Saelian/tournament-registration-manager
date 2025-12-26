import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Checkbox } from '../../components/ui/checkbox'
import { tableSchema, type TableFormData, type Table } from './types'
import { useEffect } from 'react'

interface TableFormProps {
  initialData?: Table | null
  onSubmit: (data: TableFormData) => void
  onCancel: () => void
  isLoading?: boolean
}

export function TableForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: TableFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TableFormData>({
    resolver: zodResolver(tableSchema),
    defaultValues: {
      name: '',
      date: '',
      startTime: '',
      pointsMin: 0,
      pointsMax: 3000,
      quota: 24,
      price: 0,
      isSpecial: false,
    },
  })

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        date: initialData.date,
        startTime: initialData.startTime,
        pointsMin: initialData.pointsMin,
        pointsMax: initialData.pointsMax,
        quota: initialData.quota,
        price: initialData.price / 100, // Convert cents to euros
        isSpecial: initialData.isSpecial,
      })
    } else {
      reset({
        name: '',
        date: '',
        startTime: '',
        pointsMin: 0,
        pointsMax: 3000,
        quota: 24,
        price: 0,
        isSpecial: false,
      })
    }
  }, [initialData, reset])

  const onFormSubmit = (data: TableFormData) => {
    onSubmit({
      ...data,
      price: Math.round(data.price * 100), // Convert euros to cents
    })
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 bg-card p-6 border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <h2 className="text-xl font-bold mb-4">
        {initialData ? 'Modifier le tableau' : 'Nouveau tableau'}
      </h2>

      <div className="space-y-2">
        <Label htmlFor="name">Nom</Label>
        <Input id="name" {...register('name')} placeholder="Ex: Tableau A" />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" {...register('date')} />
          {errors.date && (
            <p className="text-sm text-destructive">{errors.date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="startTime">Heure de début</Label>
          <Input id="startTime" type="time" {...register('startTime')} />
          {errors.startTime && (
            <p className="text-sm text-destructive">
              {errors.startTime.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="pointsMin">Points Min</Label>
          <Input
            id="pointsMin"
            type="number"
            {...register('pointsMin')}
          />
          {errors.pointsMin && (
            <p className="text-sm text-destructive">
              {errors.pointsMin.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="pointsMax">Points Max</Label>
          <Input
            id="pointsMax"
            type="number"
            {...register('pointsMax')}
          />
          {errors.pointsMax && (
            <p className="text-sm text-destructive">
              {errors.pointsMax.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quota">Quota</Label>
          <Input id="quota" type="number" {...register('quota')} />
          {errors.quota && (
            <p className="text-sm text-destructive">{errors.quota.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Prix (€)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            {...register('price')}
          />
          {errors.price && (
            <p className="text-sm text-destructive">{errors.price.message}</p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="isSpecial" {...register('isSpecial')} />
        <Label htmlFor="isSpecial">Tableau Spécial (ignore règle 2 tableaux/jour)</Label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </div>
    </form>
  )
}
