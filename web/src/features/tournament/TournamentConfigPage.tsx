import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { useTournament, useUpdateTournament } from './hooks'
import { tournamentSchema, type TournamentFormData } from './types'
import { isApiError } from '../../lib/api'
import { CalendarIcon, MapPinIcon, ClockIcon } from 'lucide-react'

export function TournamentConfigPage() {
  const { data: tournament, isLoading, error } = useTournament()
  const updateMutation = useUpdateTournament()
  const [isEditing, setIsEditing] = useState(false)

  // Automatically enter edit mode if not configured
  const isNotConfigured = error && isApiError(error) && error.status === 404

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
    updateMutation.mutate(data, {
      onSuccess: () => {
        setIsEditing(false)
      },
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-lg font-bold">Chargement...</p>
      </div>
    )
  }

  // View Mode (Dashboard)
  if (!isEditing && tournament) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8 border-b-4 border-foreground pb-4">
          <h1 className="text-3xl font-bold">{tournament.name}</h1>
          <Button onClick={() => setIsEditing(true)}>
            Modifier la configuration
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card p-6 border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" /> Dates
            </h2>
            <div className="space-y-2">
              <p>
                <span className="font-bold">Début :</span>{' '}
                {new Date(tournament.startDate).toLocaleDateString('fr-FR')}
              </p>
              <p>
                <span className="font-bold">Fin :</span>{' '}
                {new Date(tournament.endDate).toLocaleDateString('fr-FR')}
              </p>
              {tournament.refundDeadline && (
                <p className="text-sm text-muted-foreground mt-2">
                  Remboursement possible jusqu'au{' '}
                  {new Date(tournament.refundDeadline).toLocaleDateString('fr-FR')}
                </p>
              )}
            </div>
          </div>

          <div className="bg-card p-6 border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <MapPinIcon className="h-5 w-5" /> Lieu
            </h2>
            <p className="text-lg">{tournament.location}</p>
          </div>

          <div className="bg-card p-6 border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:col-span-2">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <ClockIcon className="h-5 w-5" /> Paramètres
            </h2>
            <p>
              <span className="font-bold">Délai liste d'attente :</span>{' '}
              {tournament.waitlistTimerHours} heures
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Edit Mode (Form)
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8 border-b-4 border-foreground pb-2">
        <h1 className="text-3xl font-bold">
          {tournament ? 'Modifier le tournoi' : 'Configuration du Tournoi'}
        </h1>
        {tournament && (
          <Button variant="ghost" onClick={() => setIsEditing(false)}>
            Annuler
          </Button>
        )}
      </div>

      {isNotConfigured && (
        <div className="mb-6 p-4 bg-secondary neo-brutal">
          <p className="font-bold">Aucun tournoi configuré</p>
          <p className="text-sm text-muted-foreground">
            Remplissez le formulaire ci-dessous pour créer la configuration.
          </p>
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

        <div className="pt-4 flex gap-4">
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
          {tournament && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsEditing(false)}
            >
              Annuler
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
