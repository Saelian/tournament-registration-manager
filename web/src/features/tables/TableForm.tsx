import { useForm, Controller, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Checkbox } from '../../components/ui/checkbox'
import {
  tableSchema,
  FFTT_CATEGORIES,
  type TableFormData,
  type Table,
  type FfttCategory,
} from './types'
import { useEffect } from 'react'
import { TablePrizesSection } from './TablePrizesSection'
import { TableSponsorsSection } from './TableSponsorsSection'

interface TableFormProps {
  initialData?: Table | null
  onSubmit: (data: TableFormData) => void
  onCancel: () => void
  isLoading?: boolean
}

export function TableForm({ initialData, onSubmit, onCancel, isLoading }: TableFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TableFormData>({
    resolver: zodResolver(tableSchema) as Resolver<TableFormData>,
    defaultValues: {
      name: '',
      referenceLetter: null,
      date: '',
      startTime: '',
      pointsMin: 0,
      pointsMax: 3000,
      quota: 24,
      price: 0,
      isSpecial: false,
      nonNumberedOnly: false,
      genderRestriction: null,
      allowedCategories: null,
      maxCheckinTime: null,
      prizes: [],
      sponsorIds: [],
    },
  })

  const startTime = watch('startTime')
  const prizes = watch('prizes')
  const sponsorIds = watch('sponsorIds')

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        referenceLetter: initialData.referenceLetter,
        date: initialData.date,
        startTime: initialData.startTime.slice(0, 5),
        pointsMin: initialData.pointsMin,
        pointsMax: initialData.pointsMax,
        quota: initialData.quota,
        price: initialData.price,
        isSpecial: initialData.isSpecial,
        nonNumberedOnly: initialData.nonNumberedOnly,
        genderRestriction: initialData.genderRestriction,
        allowedCategories: initialData.allowedCategories,
        maxCheckinTime: initialData.maxCheckinTime?.slice(0, 5) ?? null,
        // When editing, prizes and sponsors are handled by their own components fetching from API
        // We don't need to load them into the form state, unless we wanted to support "batch update"
        // But for now, we'll keep the existing behavior for editing (separate components).
        prizes: [],
        sponsorIds: [],
      })
    } else {
      reset({
        name: '',
        referenceLetter: null,
        date: '',
        startTime: '',
        pointsMin: 0,
        pointsMax: 3000,
        quota: 24,
        price: 0,
        isSpecial: false,
        nonNumberedOnly: false,
        genderRestriction: null,
        allowedCategories: null,
        maxCheckinTime: null,
        prizes: [],
        sponsorIds: [],
      })
    }
  }, [initialData, reset])

  const calculateDefaultCheckinTime = (time: string): string => {
    if (!time || !time.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) return ''
    const [hours, minutes] = time.split(':').map(Number)
    let totalMinutes = hours * 60 + minutes - 30
    if (totalMinutes < 0) totalMinutes += 24 * 60
    const newHours = Math.floor(totalMinutes / 60) % 24
    const newMins = totalMinutes % 60
    return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`
  }

  const onFormSubmit = (data: TableFormData) => {
    onSubmit(data)
  }

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className="space-y-4 bg-card p-6 border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
    >
      <h2 className="text-xl font-bold mb-4">
        {initialData ? 'Modifier le tableau' : 'Nouveau tableau'}
      </h2>

      <div className="grid grid-cols-4 gap-4">
        <div className="space-y-2 col-span-3">
          <Label htmlFor="name">Nom</Label>
          <Input id="name" {...register('name')} placeholder="Ex: Tableau A - 1500pts" />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="referenceLetter">Lettre</Label>
          <Input
            id="referenceLetter"
            {...register('referenceLetter')}
            placeholder="A"
            maxLength={5}
          />
          {errors.referenceLetter && (
            <p className="text-sm text-destructive">{errors.referenceLetter.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" {...register('date')} />
          {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="startTime">Heure de début</Label>
          <Input id="startTime" type="time" {...register('startTime')} />
          {errors.startTime && (
            <p className="text-sm text-destructive">{errors.startTime.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="pointsMin">Points Min</Label>
          <Input id="pointsMin" type="number" {...register('pointsMin')} />
          {errors.pointsMin && (
            <p className="text-sm text-destructive">{errors.pointsMin.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="pointsMax">Points Max</Label>
          <Input id="pointsMax" type="number" {...register('pointsMax')} />
          {errors.pointsMax && (
            <p className="text-sm text-destructive">{errors.pointsMax.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quota">Quota</Label>
          <Input id="quota" type="number" {...register('quota')} />
          {errors.quota && <p className="text-sm text-destructive">{errors.quota.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Prix (€)</Label>
          <Input id="price" type="number" step="0.01" {...register('price')} />
          {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="isSpecial" {...register('isSpecial')} />
        <Label htmlFor="isSpecial">Tableau Spécial (ignore règle 2 tableaux/jour)</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="nonNumberedOnly" {...register('nonNumberedOnly')} />
        <Label htmlFor="nonNumberedOnly">
          Non numérotés uniquement (exclut les joueurs N1, N2...)
        </Label>
      </div>

      <div className="border-t-2 border-foreground pt-4 mt-4">
        <h3 className="font-bold mb-3">Restrictions d'éligibilité</h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="genderRestriction">Restriction de genre</Label>
            <Controller
              name="genderRestriction"
              control={control}
              render={({ field }) => (
                <select
                  id="genderRestriction"
                  className="flex h-10 w-full rounded-md border-2 border-foreground bg-background px-3 py-2 text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-ring"
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value || null)}
                >
                  <option value="">Tous</option>
                  <option value="F">Féminin uniquement</option>
                  <option value="M">Masculin uniquement</option>
                </select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Catégories autorisées</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Laissez vide pour autoriser toutes les catégories
            </p>
            <Controller
              name="allowedCategories"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {FFTT_CATEGORIES.map((category) => {
                    const isChecked = field.value?.includes(category) ?? false
                    return (
                      <label key={category} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const current = field.value ?? []
                            if (e.target.checked) {
                              field.onChange([...current, category] as FfttCategory[])
                            } else {
                              const filtered = current.filter((c) => c !== category)
                              field.onChange(filtered.length > 0 ? filtered : null)
                            }
                          }}
                          className="h-4 w-4 border-2 border-foreground"
                        />
                        <span className="text-sm">{category}</span>
                      </label>
                    )
                  })}
                </div>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxCheckinTime">Heure limite de pointage</Label>
            <p className="text-xs text-muted-foreground">
              Par défaut: {calculateDefaultCheckinTime(startTime) || '30 min avant le début'}
            </p>
            <Controller
              name="maxCheckinTime"
              control={control}
              render={({ field }) => (
                <Input
                  id="maxCheckinTime"
                  type="time"
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value || null)}
                  placeholder={calculateDefaultCheckinTime(startTime)}
                />
              )}
            />
          </div>
        </div>
      </div>

      <TablePrizesSection
        tableId={initialData?.id}
        value={prizes || []}
        onChange={(newPrizes) => setValue('prizes', newPrizes)}
      />

      <TableSponsorsSection
        tableId={initialData?.id}
        value={sponsorIds || []}
        onChange={(newIds) => setValue('sponsorIds', newIds)}
      />

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
