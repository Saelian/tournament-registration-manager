import { useEffect, useState } from 'react'
import { useForm, type Resolver, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { Textarea } from '@components/ui/textarea'
import { Card, CardTitle, CardContent } from '@components/ui/card'
import { MarkdownRenderer } from '@components/ui/markdown-renderer'
import { PageHeader } from '@components/ui/page-header'
import { toast } from '@components/ui/sonner'
import { useTournament, useUpdateTournament } from './hooks'
import { tournamentSchema, type TournamentFormData } from './types'
import { isApiError } from '@lib/api'
import {
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  FileTextIcon,
  LinkIcon,
  ExternalLinkIcon,
  CalendarCheck,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  HelpCircle,
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
    control,
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
        registrationStartDate: null,
        registrationEndDate: null,
        faqItems: [],
      },
      shortDescription: null,
      longDescription: null,
      rulesLink: null,
      rulesContent: null,
      ffttHomologationLink: null,
    },
  })

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'options.faqItems',
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
          registrationStartDate: tournament.options.registrationStartDate,
          registrationEndDate: tournament.options.registrationEndDate,
          faqItems: tournament.options.faqItems || [],
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
      <div className="max-w-7xl mx-auto p-6 animate-on-load animate-slide-up">
        <PageHeader
          title={tournament.name}
          actions={<Button onClick={() => setIsEditing(true)}>Modifier la configuration</Button>}
          className="border-b-4 border-foreground pb-4"
        />

        {tournament.shortDescription && (
          <Card className="mb-6">
            <MarkdownRenderer content={tournament.shortDescription} />
          </Card>
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
                  {new Date(tournament.options.refundDeadline).toLocaleDateString('fr-FR')}
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

          <Card className="md:col-span-2">
            <CardTitle>
              <CalendarCheck className="h-5 w-5" /> Période d'inscription
            </CardTitle>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <p>
                  <span className="font-bold">Ouverture :</span>{' '}
                  {tournament.options.registrationStartDate
                    ? new Date(tournament.options.registrationStartDate).toLocaleDateString('fr-FR')
                    : 'Pas de date (ouverture immédiate)'}
                </p>
                <p>
                  <span className="font-bold">Fermeture :</span>{' '}
                  {tournament.options.registrationEndDate
                    ? new Date(tournament.options.registrationEndDate).toLocaleDateString('fr-FR')
                    : 'Pas de date limite'}
                </p>
              </div>
              {tournament.registrationStatus && (
                <p className="mt-2 p-2 bg-secondary border border-foreground text-sm">
                  <span className="font-bold">État actuel :</span>{' '}
                  {tournament.registrationStatus.message}
                </p>
              )}
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
                {tournament.rulesContent && <MarkdownRenderer content={tournament.rulesContent} />}
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
      </div>
    )
  }

  // Edit Mode (Form)
  return (
    <div className="max-w-7xl mx-auto p-6 animate-on-load animate-slide-up">
      <PageHeader
        title={tournament ? 'Modifier le tournoi' : 'Configuration du Tournoi'}
        actions={
          tournament && (
            <Button variant="ghost" onClick={() => setIsEditing(false)}>
              Annuler
            </Button>
          )
        }
        className="border-b-4 border-foreground pb-2"
      />

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
              <Input id="name" {...register('name')} placeholder="Tournoi de ..." />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Date de début *</Label>
                <Input id="startDate" type="date" {...register('startDate')} />
                {errors.startDate && (
                  <p className="text-sm text-destructive">{errors.startDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Date de fin *</Label>
                <Input id="endDate" type="date" {...register('endDate')} />
                {errors.endDate && (
                  <p className="text-sm text-destructive">{errors.endDate.message}</p>
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
                <p className="text-sm text-destructive">{errors.shortDescription.message}</p>
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
                    <p className="text-muted-foreground italic">L'aperçu apparaîtra ici...</p>
                  )}
                </div>
              </div>
              {errors.longDescription && (
                <p className="text-sm text-destructive">{errors.longDescription.message}</p>
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
                <p className="text-sm text-destructive">{errors.rulesLink.message}</p>
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
                    <p className="text-muted-foreground italic">L'aperçu apparaîtra ici...</p>
                  )}
                </div>
              </div>
              {errors.rulesContent && (
                <p className="text-sm text-destructive">{errors.rulesContent.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ffttHomologationLink">Lien homologation FFTT</Label>
              <Input
                id="ffttHomologationLink"
                type="url"
                {...register('ffttHomologationLink')}
                placeholder="https://www.fftt.com/..."
              />
              {errors.ffttHomologationLink && (
                <p className="text-sm text-destructive">{errors.ffttHomologationLink.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Section: Période d'inscription */}
        <Card>
          <CardTitle>
            <CalendarCheck className="h-5 w-5" /> Période d'inscription
          </CardTitle>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="options.registrationStartDate">Ouverture des inscriptions</Label>
                <Input
                  id="options.registrationStartDate"
                  type="date"
                  {...register('options.registrationStartDate')}
                />
                <p className="text-sm text-muted-foreground">
                  Laisser vide pour des inscriptions immédiatement ouvertes.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="options.registrationEndDate">Fermeture des inscriptions</Label>
                <Input
                  id="options.registrationEndDate"
                  type="date"
                  {...register('options.registrationEndDate')}
                />
                <p className="text-sm text-muted-foreground">
                  Laisser vide pour des inscriptions sans date limite.
                </p>
              </div>
            </div>

            {/* Aperçu du statut calculé */}
            {tournament?.registrationStatus && (
              <div className="p-3 bg-secondary border-2 border-foreground">
                <p className="text-sm font-bold mb-1">État actuel :</p>
                <p className="text-sm">{tournament.registrationStatus.message}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section: FAQ */}
        <Card>
          <CardTitle>
            <HelpCircle className="h-5 w-5" /> Foire Aux Questions
          </CardTitle>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Configurez les questions fréquentes qui seront affichées sur la page FAQ publique.
            </p>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="bg-card border-2 border-foreground p-4 relative flex gap-4"
                >
                  <div className="flex flex-col gap-2 pt-8">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 px-0"
                      disabled={index === 0}
                      onClick={() => move(index, index - 1)}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 px-0"
                      disabled={index === fields.length - 1}
                      onClick={() => move(index, index + 1)}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="font-bold bg-secondary px-2 py-1 text-sm border border-foreground">
                        Question {index + 1}
                      </span>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => remove(index)}
                        className="h-8"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label>Question</Label>
                      <Input
                        {...register(`options.faqItems.${index}.question` as const)}
                        placeholder="Ex: À quelle heure dois-je arriver ?"
                      />
                      {errors.options?.faqItems?.[index]?.question && (
                        <p className="text-sm text-destructive">
                          {errors.options.faqItems[index]?.question?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Réponse</Label>
                      <Textarea
                        {...register(`options.faqItems.${index}.answer` as const)}
                        placeholder="Ex: Il est conseillé d'arriver 30 minutes avant..."
                        rows={3}
                      />
                      {errors.options?.faqItems?.[index]?.answer && (
                        <p className="text-sm text-destructive">
                          {errors.options.faqItems[index]?.answer?.message}
                        </p>
                      )}
                    </div>

                    {/* Hidden fields */}
                    <input type="hidden" {...register(`options.faqItems.${index}.id` as const)} />
                    <input
                      type="hidden"
                      {...register(`options.faqItems.${index}.order` as const)}
                      value={index}
                    />
                  </div>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="secondary"
              className="w-full border-dashed border-2"
              onClick={() =>
                append({
                  id: crypto.randomUUID(),
                  question: '',
                  answer: '',
                  order: fields.length,
                })
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une question
            </Button>
          </CardContent>
        </Card>

        {/* Section: Options */}
        <Card>
          <CardTitle>Options avancées</CardTitle>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="options.refundDeadline">Date limite de remboursement</Label>
              <Input
                id="options.refundDeadline"
                type="date"
                {...register('options.refundDeadline')}
              />
              <p className="text-sm text-muted-foreground">
                Les participants ne pourront plus être remboursés après cette date.
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
                Temps accordé aux participants en liste d'attente pour confirmer leur place (1-168
                heures).
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={updateMutation.isPending || (!isDirty && !!tournament)}>
            {updateMutation.isPending
              ? 'Enregistrement...'
              : tournament
                ? 'Mettre à jour'
                : 'Créer le tournoi'}
          </Button>
          {tournament && (
            <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>
              Annuler
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
