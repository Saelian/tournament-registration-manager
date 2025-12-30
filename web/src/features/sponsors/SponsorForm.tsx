import { useForm, Controller, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Checkbox } from '../../components/ui/checkbox'
import { sponsorSchema, type SponsorFormData, type Sponsor } from './types'
import { useEffect } from 'react'

interface SponsorFormProps {
  initialData?: Sponsor | null
  onSubmit: (data: SponsorFormData) => void
  onCancel: () => void
  isLoading?: boolean
}

export function SponsorForm({ initialData, onSubmit, onCancel, isLoading }: SponsorFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<SponsorFormData>({
    resolver: zodResolver(sponsorSchema) as Resolver<SponsorFormData>,
    defaultValues: {
      name: '',
      websiteUrl: null,
      contactEmail: null,
      description: null,
      isGlobal: false,
    },
  })

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        websiteUrl: initialData.websiteUrl,
        contactEmail: initialData.contactEmail,
        description: initialData.description,
        isGlobal: initialData.isGlobal,
      })
    } else {
      reset({
        name: '',
        websiteUrl: null,
        contactEmail: null,
        description: null,
        isGlobal: false,
      })
    }
  }, [initialData, reset])

  const onFormSubmit = (data: SponsorFormData) => {
    onSubmit(data)
  }

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className="space-y-4 bg-card p-6 border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
    >
      <h2 className="text-xl font-bold mb-4">
        {initialData ? 'Modifier le sponsor' : 'Nouveau sponsor'}
      </h2>

      <div className="space-y-2">
        <Label htmlFor="name">Nom *</Label>
        <Input id="name" {...register('name')} placeholder="Ex: Entreprise ABC" />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="websiteUrl">Site web</Label>
        <Controller
          name="websiteUrl"
          control={control}
          render={({ field }) => (
            <Input
              id="websiteUrl"
              type="url"
              placeholder="https://exemple.com"
              value={field.value ?? ''}
              onChange={(e) => field.onChange(e.target.value || null)}
            />
          )}
        />
        {errors.websiteUrl && (
          <p className="text-sm text-destructive">{errors.websiteUrl.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactEmail">Email de contact</Label>
        <Controller
          name="contactEmail"
          control={control}
          render={({ field }) => (
            <Input
              id="contactEmail"
              type="email"
              placeholder="contact@exemple.com"
              value={field.value ?? ''}
              onChange={(e) => field.onChange(e.target.value || null)}
            />
          )}
        />
        {errors.contactEmail && (
          <p className="text-sm text-destructive">{errors.contactEmail.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <textarea
              id="description"
              className="flex min-h-[80px] w-full rounded-md border-2 border-foreground bg-background px-3 py-2 text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Description du sponsor..."
              value={field.value ?? ''}
              onChange={(e) => field.onChange(e.target.value || null)}
            />
          )}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Controller
          name="isGlobal"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="isGlobal"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Label htmlFor="isGlobal">Sponsor global du tournoi (visibilité accrue)</Label>
      </div>

      {initialData && initialData.tables.length > 0 && (
        <div className="border-t-2 border-foreground pt-4 mt-4">
          <h3 className="font-bold mb-2">Tableaux associés</h3>
          <div className="flex flex-wrap gap-2">
            {initialData.tables.map((table) => (
              <span
                key={table.id}
                className="bg-secondary text-sm px-2 py-1 border border-foreground rounded"
              >
                {table.name}
              </span>
            ))}
          </div>
        </div>
      )}

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
