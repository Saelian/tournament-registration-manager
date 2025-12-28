import { useEffect, useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Card, CardTitle, CardContent } from '../../components/ui/card'
import { MarkdownRenderer } from '../../components/ui/markdown-renderer'
import { toast } from '../../components/ui/sonner'
import { useTournament, useUpdateTournament } from './hooks'
import { tournamentSchema, type TournamentFormData } from './types'
import { TableList } from '../tables'
import { isApiError } from '../../lib/api'
import {
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  FileTextIcon,
  LinkIcon,
  ExternalLinkIcon,
} from 'lucide-react'

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
    watch,
    formState: { errors, isDirty },
  } = useForm<TournamentFormData>({
    resolver: zodResolver(tournamentSchema) as Resolver<TournamentFormData>,
    defaultValues: {
      name: '',
      startDate: '',
      endDate: '',
      location: '',
      options: {
        refundDeadline: null,
        waitlistTimerHours: 4,
      },
      shortDescription: null,
      longDescription: null,
      rulesLink: null,
      rulesContent: null,
      ffttHomologationLink: null,
    },
  })

  const longDescriptionValue = watch('longDescription')
  const rulesContentValue = watch('rulesContent')

  useEffect(() => {
    if (tournament) {
      reset({
        name: tournament.name,
        startDate: tournament.startDate,
        endDate: tournament.endDate,
        location: tournament.location,
        options: {
          refundDeadline: tournament.options.refundDeadline,
          waitlistTimerHours: tournament.options.waitlistTimerHours,
        },
        shortDescription: tournament.shortDescription,
        longDescription: tournament.longDescription,
        rulesLink: tournament.rulesLink,
        rulesContent: tournament.rulesContent,
        ffttHomologationLink: tournament.ffttHomologationLink,
      })
    }
  }, [tournament, reset])

  const onSubmit = (data: TournamentFormData) => {
    updateMutation.mutate(data, {
      onSuccess: () => {
        setIsEditing(false)
        toast.success('Tournoi enregistré avec succès')
      },
      onError: (err) => {
        const message = isApiError(err) ? err.message : 'Une erreur est survenue'
        toast.error(message)
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
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8 border-b-4 border-foreground pb-4">
          <h1 className="text-3xl font-bold">{tournament.name}</h1>
          <Button onClick={() => setIsEditing(true)}>
            Modifier la configuration
          </Button>
        </div>

        {tournament.shortDescription && (
          <p className="text-lg text-muted-foreground mb-6">
            {tournament.shortDescription}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardTitle>
              <CalendarIcon className="h-5 w-5" /> Dates
            </CardTitle>
            <CardContent className="space-y-2">
              <p>
                <span className="font-bold">Début :</span>{' '}
                {new Date(tournament.startDate).toLocaleDateString('fr-FR')}
              </p>
              <p>
                <span className="font-bold">Fin :</span>{' '}
                {new Date(tournament.endDate).toLocaleDateString('fr-FR')}
              </p>
              {tournament.options.refundDeadline && (
                <p className="text-sm text-muted-foreground mt-2">
                  Remboursement possible jusqu'au{' '}
                  {new Date(tournament.options.refundDeadline).toLocaleDateString(
                    'fr-FR'
                  )}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardTitle>
              <MapPinIcon className="h-5 w-5" /> Lieu
            </CardTitle>
            <CardContent>
              <p className="text-lg">{tournament.location}</p>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardTitle>
              <ClockIcon className="h-5 w-5" /> Paramètres
            </CardTitle>
            <CardContent>
              <p>
                <span className="font-bold">Délai liste d'attente :</span>{' '}
                {tournament.options.waitlistTimerHours} heures
              </p>
            </CardContent>
          </Card>

          {tournament.longDescription && (
            <Card className="md:col-span-2">
              <CardTitle>
                <FileTextIcon className="h-5 w-5" /> Description
              </CardTitle>
              <CardContent>
                <MarkdownRenderer content={tournament.longDescription} />
              </CardContent>
            </Card>
          )}

          {(tournament.rulesLink || tournament.rulesContent) && (
            <Card className="md:col-span-2">
              <CardTitle>
                <FileTextIcon className="h-5 w-5" /> Règlement
              </CardTitle>
              <CardContent>
                {tournament.rulesLink && (
                  <a
                    href={tournament.rulesLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:underline mb-4"
                  >
                    <ExternalLinkIcon className="h-4 w-4" />
                    Consulter le règlement
                  </a>
                )}
                {tournament.rulesContent && (
                  <MarkdownRenderer content={tournament.rulesContent} />
                )}
              </CardContent>
            </Card>
          )}

          {tournament.ffttHomologationLink && (
            <Card className="md:col-span-2">
              <CardTitle>
                <LinkIcon className="h-5 w-5" /> Homologation FFTT
              </CardTitle>
              <CardContent>
                <a
                  href={tournament.ffttHomologationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  <ExternalLinkIcon className="h-4 w-4" />
                  Voir sur le site FFTT
                </a>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Tables Section */}
        <div className="mt-12 pt-8 border-t-4 border-foreground">
          <TableList />
        </div>
      </div>
    )
  }

  // Edit Mode (Form)
  return (
    <div className="max-w-4xl mx-auto p-6">
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section: Informations générales */}
        <Card>
          <CardTitle>Informations générales</CardTitle>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du tournoi *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Tournoi de ..."
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
                <p className="text-sm text-destructive">
                  {errors.location.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Section: Contenu */}
        <Card>
          <CardTitle>Contenu</CardTitle>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shortDescription">
                Description courte ({(watch('shortDescription') ?? '').length}/500)
              </Label>
              <Textarea
                id="shortDescription"
                {...register('shortDescription')}
                placeholder="Brève présentation du tournoi..."
                maxLength={500}
                rows={2}
              />
              {errors.shortDescription && (
                <p className="text-sm text-destructive">
                  {errors.shortDescription.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="longDescription">Description détaillée</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Textarea
                    id="longDescription"
                    {...register('longDescription')}
                    placeholder="Description complète du tournoi (Markdown supporté)..."
                    rows={8}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Supporte le Markdown (titres, listes, liens...)
                  </p>
                </div>
                <div className="border-2 border-foreground p-4 bg-background">
                  <p className="text-xs text-muted-foreground mb-2">Aperçu :</p>
                  {longDescriptionValue ? (
                    <MarkdownRenderer content={longDescriptionValue} />
                  ) : (
                    <p className="text-muted-foreground italic">
                      L'aperçu apparaîtra ici...
                    </p>
                  )}
                </div>
              </div>
              {errors.longDescription && (
                <p className="text-sm text-destructive">
                  {errors.longDescription.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Section: Règlement */}
        <Card>
          <CardTitle>Règlement</CardTitle>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rulesLink">Lien vers le règlement</Label>
              <Input
                id="rulesLink"
                type="url"
                {...register('rulesLink')}
                placeholder="https://example.com/reglement.pdf"
              />
              {errors.rulesLink && (
                <p className="text-sm text-destructive">
                  {errors.rulesLink.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rulesContent">Contenu du règlement</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Textarea
                    id="rulesContent"
                    {...register('rulesContent')}
                    placeholder="Règles et conditions du tournoi (Markdown supporté)..."
                    rows={8}
                  />
                </div>
                <div className="border-2 border-foreground p-4 bg-background">
                  <p className="text-xs text-muted-foreground mb-2">Aperçu :</p>
                  {rulesContentValue ? (
                    <MarkdownRenderer content={rulesContentValue} />
                  ) : (
                    <p className="text-muted-foreground italic">
                      L'aperçu apparaîtra ici...
                    </p>
                  )}
                </div>
              </div>
              {errors.rulesContent && (
                <p className="text-sm text-destructive">
                  {errors.rulesContent.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ffttHomologationLink">
                Lien homologation FFTT
              </Label>
              <Input
                id="ffttHomologationLink"
                type="url"
                {...register('ffttHomologationLink')}
                placeholder="https://www.fftt.com/..."
              />
              {errors.ffttHomologationLink && (
                <p className="text-sm text-destructive">
                  {errors.ffttHomologationLink.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Section: Options */}
        <Card>
          <CardTitle>Options</CardTitle>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="options.refundDeadline">
                Date limite de remboursement
              </Label>
              <Input
                id="options.refundDeadline"
                type="date"
                {...register('options.refundDeadline')}
              />
              <p className="text-sm text-muted-foreground">
                Les participants ne pourront plus être remboursés après cette
                date.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="options.waitlistTimerHours">
                Délai de confirmation liste d'attente (heures)
              </Label>
              <Input
                id="options.waitlistTimerHours"
                type="number"
                min={1}
                max={168}
                {...register('options.waitlistTimerHours')}
              />
              <p className="text-sm text-muted-foreground">
                Temps accordé aux participants en liste d'attente pour confirmer
                leur place (1-168 heures).
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
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
