import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { useTournament, useUpdateTournament } from './hooks'
import { tournamentSchema, type TournamentFormData } from './types'
import { isApiError } from '../../lib/api'

export function TournamentConfigPage() {
  const { data: tournament, isLoading, error } = useTournament()
  const updateMutation = useUpdateTournament()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<TournamentFormData>({
    resolver: zodResolver(tournamentSchema),
    defaultValues: {
      name: '',
      startDate: '',
      endDate: '',
      location: '',
      refundDeadline: null,
      waitlistTimerHours: 4,
    },
  })

  useEffect(() => {
    if (tournament) {
      reset({
        name: tournament.name,
        startDate: tournament.startDate,
        endDate: tournament.endDate,
        location: tournament.location,
        refundDeadline: tournament.refundDeadline,
        waitlistTimerHours: tournament.waitlistTimerHours,
      })
    }
  }, [tournament, reset])

  const onSubmit = (data: TournamentFormData) => {
    updateMutation.mutate(data)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-lg font-bold">Chargement...</p>
      </div>
    )
  }

  const isNotConfigured = error && isApiError(error) && error.status === 404

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 border-b-4 border-foreground pb-2">
        Configuration du Tournoi
      </h1>

      {isNotConfigured && (
        <div className="mb-6 p-4 bg-secondary neo-brutal">
          <p className="font-bold">Aucun tournoi configuré</p>
          <p className="text-sm text-muted-foreground">
            Remplissez le formulaire ci-dessous pour créer la configuration.
          </p>
        </div>
      )}

      {updateMutation.isSuccess && (
        <div className="mb-6 p-4 bg-green-100 border-2 border-foreground">
          <p className="font-bold text-green-800">Configuration enregistrée</p>
        </div>
      )}

      {updateMutation.error && (
        <div className="mb-6 p-4 bg-red-100 border-2 border-foreground">
          <p className="font-bold text-red-800">
            {isApiError(updateMutation.error)
              ? updateMutation.error.message
              : 'Une erreur est survenue'}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nom du tournoi *</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="Tournoi de Badminton 2025"
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Date de début *</Label>
            <Input id="startDate" type="date" {...register('startDate')} />
            {errors.startDate && (
              <p className="text-sm text-destructive">
                {errors.startDate.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">Date de fin *</Label>
            <Input id="endDate" type="date" {...register('endDate')} />
            {errors.endDate && (
              <p className="text-sm text-destructive">
                {errors.endDate.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Lieu *</Label>
          <Input
            id="location"
            {...register('location')}
            placeholder="Gymnase Municipal, 123 Rue du Sport"
          />
          {errors.location && (
            <p className="text-sm text-destructive">{errors.location.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="refundDeadline">Date limite de remboursement</Label>
          <Input
            id="refundDeadline"
            type="date"
            {...register('refundDeadline')}
          />
          <p className="text-sm text-muted-foreground">
            Les participants ne pourront plus être remboursés après cette date.
          </p>
          {errors.refundDeadline && (
            <p className="text-sm text-destructive">
              {errors.refundDeadline.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="waitlistTimerHours">
            Délai de confirmation liste d'attente (heures)
          </Label>
          <Input
            id="waitlistTimerHours"
            type="number"
            min={1}
            max={168}
            {...register('waitlistTimerHours')}
          />
          <p className="text-sm text-muted-foreground">
            Temps accordé aux participants en liste d'attente pour confirmer
            leur place (1-168 heures).
          </p>
          {errors.waitlistTimerHours && (
            <p className="text-sm text-destructive">
              {errors.waitlistTimerHours.message}
            </p>
          )}
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            disabled={updateMutation.isPending || (!isDirty && !!tournament)}
          >
            {updateMutation.isPending
              ? 'Enregistrement...'
              : tournament
                ? 'Mettre à jour'
                : 'Créer le tournoi'}
          </Button>
        </div>
      </form>
    </div>
  )
}
