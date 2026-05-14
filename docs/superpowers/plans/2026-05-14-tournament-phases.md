# Tournament Phases Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter un système de deux phases (before / event) au tournoi, configurable manuellement depuis l'admin, avec une section "Événement" affichée en tête de la page d'accueil publique.

**Architecture:** Trois nouvelles colonnes sur `tournaments` (phase, event_result_url, event_content). Le controller existant est étendu, le type `Tournament` frontend mis à jour. La `LandingPage` affiche un nouveau composant `EventSection` quand `phase === 'event'`. La `AdminTournamentConfigPage` gagne une section dédiée.

**Tech Stack:** AdonisJS v6 (Lucid, VineJS), React 19, TanStack Query, Zod, qrcode.react, Vitest, Japa

---

## Fichiers touchés

| Fichier | Action |
|---|---|
| `api/database/migrations/1778800000000_add_phase_to_tournaments.ts` | Créer |
| `api/app/models/tournament.ts` | Modifier |
| `api/app/validators/tournament.ts` | Modifier |
| `api/app/controllers/tournament_controller.ts` | Modifier |
| `api/tests/functional/tournament_phase.spec.ts` | Créer |
| `web/src/features/tournament/types/index.ts` | Modifier |
| `web/src/features/tournament/components/EventSection.tsx` | Créer |
| `web/src/features/tournament/components/EventSection.test.tsx` | Créer |
| `web/src/features/tournament/pages/LandingPage.tsx` | Modifier |
| `web/src/features/tournament/pages/AdminTournamentConfigPage.tsx` | Modifier |

---

## Task 1 : Migration DB

**Files:**
- Create: `api/database/migrations/1778800000000_add_phase_to_tournaments.ts`

- [ ] **Créer le fichier de migration**

```typescript
// api/database/migrations/1778800000000_add_phase_to_tournaments.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tournaments'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('phase').notNullable().defaultTo('before')
      table.string('event_result_url', 2048).nullable()
      table.text('event_content').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('phase')
      table.dropColumn('event_result_url')
      table.dropColumn('event_content')
    })
  }
}
```

- [ ] **Appliquer la migration**

```bash
cd api && node ace migration:run
```

Résultat attendu : `Executed 1 migrations`

- [ ] **Commit**

```bash
git add api/database/migrations/1778800000000_add_phase_to_tournaments.ts
git commit -m "feat: add phase, event_result_url, event_content columns to tournaments"
```

---

## Task 2 : Modèle, validator et controller (backend)

**Files:**
- Modify: `api/app/models/tournament.ts`
- Modify: `api/app/validators/tournament.ts`
- Modify: `api/app/controllers/tournament_controller.ts`
- Create: `api/tests/functional/tournament_phase.spec.ts`

- [ ] **Écrire le test qui échoue**

```typescript
// api/tests/functional/tournament_phase.spec.ts
import { test } from '@japa/runner'
import Tournament from '#models/tournament'
import { DateTime } from 'luxon'

test.group('Tournament phase | Public API', (group) => {
  group.each.setup(async () => {
    await Tournament.query().delete()
  })

  test('retourne phase=before par défaut', async ({ client }) => {
    await Tournament.create({
      name: 'Test',
      startDate: DateTime.fromISO('2026-05-16'),
      endDate: DateTime.fromISO('2026-05-17'),
      location: 'Champhol',
      options: {
        refundDeadline: null,
        waitlistTimerHours: 4,
        registrationStartDate: null,
        registrationEndDate: null,
        faqItems: [],
      },
    })

    const response = await client.get('/tournaments')
    response.assertStatus(200)
    response.assertBodyContains({
      data: [{ phase: 'before', eventResultUrl: null, eventContent: null }],
    })
  })

  test('retourne les champs événement quand phase=event', async ({ client }) => {
    await Tournament.create({
      name: 'Test',
      startDate: DateTime.fromISO('2026-05-16'),
      endDate: DateTime.fromISO('2026-05-17'),
      location: 'Champhol',
      phase: 'event',
      eventResultUrl: 'https://docs.google.com/spreadsheets/d/123',
      eventContent: '**Buvette** : sandwich 3€',
      options: {
        refundDeadline: null,
        waitlistTimerHours: 4,
        registrationStartDate: null,
        registrationEndDate: null,
        faqItems: [],
      },
    })

    const response = await client.get('/tournaments')
    response.assertStatus(200)
    response.assertBodyContains({
      data: [
        {
          phase: 'event',
          eventResultUrl: 'https://docs.google.com/spreadsheets/d/123',
          eventContent: '**Buvette** : sandwich 3€',
        },
      ],
    })
  })
})
```

- [ ] **Vérifier que le test échoue**

```bash
cd api && node ace test tests/functional/tournament_phase.spec.ts
```

Résultat attendu : FAIL (colonnes inconnues ou champs manquants dans la réponse)

- [ ] **Mettre à jour le modèle Tournament**

Ajouter les trois propriétés après `declare ffttHomologationLink`:

```typescript
// api/app/models/tournament.ts — après ffttHomologationLink
@column()
declare phase: 'before' | 'event'

@column()
declare eventResultUrl: string | null

@column()
declare eventContent: string | null
```

- [ ] **Mettre à jour le validator**

Dans `updateTournamentValidator` et `createTournamentValidator`, ajouter après `ffttHomologationLink` :

```typescript
// api/app/validators/tournament.ts
phase: vine.enum(['before', 'event'] as const).optional(),
eventResultUrl: vine.string().url().maxLength(2048).nullable().optional(),
eventContent: vine.string().nullable().optional(),
```

- [ ] **Mettre à jour la méthode `serialize` du controller**

```typescript
// api/app/controllers/tournament_controller.ts — méthode serialize
private serialize(tournament: Tournament) {
  return {
    id: tournament.id,
    name: tournament.name,
    startDate: tournament.startDate.toISODate(),
    endDate: tournament.endDate.toISODate(),
    location: tournament.location,
    options: tournament.options,
    shortDescription: tournament.shortDescription,
    longDescription: tournament.longDescription,
    rulesLink: tournament.rulesLink,
    rulesContent: tournament.rulesContent,
    ffttHomologationLink: tournament.ffttHomologationLink,
    phase: tournament.phase,
    eventResultUrl: tournament.eventResultUrl,
    eventContent: tournament.eventContent,
    registrationStatus: registrationPeriodService.getRegistrationPeriodInfo(tournament),
  }
}
```

- [ ] **Mettre à jour `tournamentData` dans la méthode `update`**

Ajouter les trois champs dans l'objet `tournamentData` :

```typescript
// api/app/controllers/tournament_controller.ts — dans update(), après ffttHomologationLink
phase: data.phase ?? 'before',
eventResultUrl: data.eventResultUrl ?? null,
eventContent: data.eventContent ?? null,
```

- [ ] **Relancer les tests pour vérifier qu'ils passent**

```bash
cd api && node ace test tests/functional/tournament_phase.spec.ts
```

Résultat attendu : 2 tests PASS

- [ ] **Vérifier qu'on n'a pas cassé les autres tests**

```bash
cd api && node ace test
```

Résultat attendu : tous les tests passent

- [ ] **Commit**

```bash
git add api/app/models/tournament.ts api/app/validators/tournament.ts \
        api/app/controllers/tournament_controller.ts \
        api/tests/functional/tournament_phase.spec.ts
git commit -m "feat: expose phase and event fields in tournament API"
```

---

## Task 3 : Types frontend

**Files:**
- Modify: `web/src/features/tournament/types/index.ts`

- [ ] **Mettre à jour l'interface `Tournament`**

Ajouter après `ffttHomologationLink` dans l'interface :

```typescript
// web/src/features/tournament/types/index.ts — interface Tournament
phase: 'before' | 'event'
eventResultUrl: string | null
eventContent: string | null
```

- [ ] **Mettre à jour `tournamentSchema`**

Ajouter dans l'objet `.object({...})` du schema :

```typescript
// web/src/features/tournament/types/index.ts — tournamentSchema
phase: z.enum(['before', 'event']).optional().default('before'),
eventResultUrl: z.string().url('URL invalide').max(2048).nullable().optional().or(z.literal('')),
eventContent: z.string().nullable().optional(),
```

- [ ] **Vérifier le typecheck**

```bash
cd web && pnpm typecheck
```

Résultat attendu : aucune erreur (les champs manquants dans les appels existants vont apparaître — les corriger au fur et à mesure dans les tasks suivantes)

- [ ] **Commit**

```bash
git add web/src/features/tournament/types/index.ts
git commit -m "feat: add phase and event fields to Tournament type"
```

---

## Task 4 : Composant EventSection

**Files:**
- Create: `web/src/features/tournament/components/EventSection.tsx`
- Create: `web/src/features/tournament/components/EventSection.test.tsx`

- [ ] **Installer qrcode.react**

```bash
cd web && pnpm add qrcode.react
```

- [ ] **Écrire les tests qui échouent**

```typescript
// web/src/features/tournament/components/EventSection.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { EventSection } from './EventSection'

const baseTournament = {
  name: 'Tournoi National B',
  startDate: '2026-05-16',
  endDate: '2026-05-17',
  eventResultUrl: null,
  eventContent: null,
}

describe('EventSection', () => {
  it('ne rend rien si eventResultUrl et eventContent sont null', () => {
    const { container } = render(<EventSection tournament={baseTournament} />)
    expect(container.firstChild).toBeNull()
  })

  it('affiche le lien et le QR code si eventResultUrl est défini', () => {
    render(
      <EventSection
        tournament={{
          ...baseTournament,
          eventResultUrl: 'https://docs.google.com/spreadsheets/d/123',
        }}
      />
    )
    expect(screen.getByText('Voir les résultats')).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      'https://docs.google.com/spreadsheets/d/123'
    )
  })

  it('affiche le contenu markdown si eventContent est défini', () => {
    render(
      <EventSection
        tournament={{
          ...baseTournament,
          eventContent: 'Buvette sur place',
        }}
      />
    )
    expect(screen.getByText(/Buvette sur place/)).toBeInTheDocument()
  })

  it('masque la bande markdown si eventContent est null', () => {
    render(
      <EventSection
        tournament={{
          ...baseTournament,
          eventResultUrl: 'https://docs.google.com/spreadsheets/d/123',
          eventContent: null,
        }}
      />
    )
    // Le lien est là mais pas de bande de contenu
    expect(screen.getByText('Voir les résultats')).toBeInTheDocument()
    expect(screen.queryByTestId('event-content')).toBeNull()
  })
})
```

- [ ] **Vérifier que les tests échouent**

```bash
cd web && pnpm test EventSection
```

Résultat attendu : FAIL (module not found)

- [ ] **Créer le composant EventSection**

```typescript
// web/src/features/tournament/components/EventSection.tsx
import { QRCodeSVG } from 'qrcode.react'
import { ExternalLinkIcon } from 'lucide-react'
import { MarkdownRenderer } from '@components/ui/markdown-renderer'

interface EventSectionProps {
  tournament: {
    name: string
    startDate: string
    endDate: string
    eventResultUrl: string | null
    eventContent: string | null
  }
}

export function EventSection({ tournament }: EventSectionProps) {
  const hasResultUrl = !!tournament.eventResultUrl
  const hasContent = !!tournament.eventContent

  if (!hasResultUrl && !hasContent) return null

  const dateRange = (() => {
    const fmt = (d: string) =>
      new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
    return tournament.startDate === tournament.endDate
      ? fmt(tournament.startDate)
      : `${fmt(tournament.startDate)} — ${fmt(tournament.endDate)}`
  })()

  return (
    <div className="bg-card border-4 border-foreground neo-brutal-lg overflow-hidden">
      {/* Barre de titre */}
      <div className="bg-destructive text-destructive-foreground px-4 py-2 flex justify-between items-center">
        <span className="font-black text-sm tracking-widest uppercase">🏓 Tournoi en cours</span>
        <span className="text-sm font-bold">{dateRange}</span>
      </div>

      {/* Zone résultats + QR code */}
      {hasResultUrl && (
        <div className="flex items-center gap-4 p-4">
          <div className="flex-shrink-0">
            <QRCodeSVG value={tournament.eventResultUrl!} size={72} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-black text-base mb-1">📊 Résultats en direct</div>
            <p className="text-sm text-muted-foreground mb-3">
              Scannez le QR code ou cliquez pour suivre l'avancement du tournoi
            </p>
            <a
              href={tournament.eventResultUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 bg-accent px-3 py-1 neo-brutal-sm font-bold text-sm hover:opacity-80 transition-opacity"
            >
              Voir les résultats
              <ExternalLinkIcon className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* Bande de contenu markdown */}
      {hasContent && (
        <div
          data-testid="event-content"
          className="border-t-2 border-foreground px-4 py-3 bg-muted/30"
        >
          <MarkdownRenderer content={tournament.eventContent!} />
        </div>
      )}
    </div>
  )
}
```

- [ ] **Relancer les tests pour vérifier qu'ils passent**

```bash
cd web && pnpm test EventSection
```

Résultat attendu : 4 tests PASS

- [ ] **Exporter le composant depuis l'index du feature**

Dans `web/src/features/tournament/index.ts`, vérifier que `EventSection` est exporté (ou l'ajouter) :

```typescript
export { EventSection } from './components/EventSection'
```

- [ ] **Commit**

```bash
git add web/src/features/tournament/components/EventSection.tsx \
        web/src/features/tournament/components/EventSection.test.tsx \
        web/src/features/tournament/index.ts
git commit -m "feat: add EventSection component with QR code and markdown content"
```

---

## Task 5 : LandingPage — intégration du mode Événement

**Files:**
- Modify: `web/src/features/tournament/pages/LandingPage.tsx`

- [ ] **Importer EventSection en tête de LandingPage**

```typescript
// web/src/features/tournament/pages/LandingPage.tsx — dans les imports
import { EventSection } from '../components/EventSection'
```

- [ ] **Calculer `isEventMode` après le calcul de `registrationStatus`**

```typescript
// Après : const isRegistrationOpen = registrationStatus?.isOpen ?? true
const isEventMode = tournament.phase === 'event'
```

- [ ] **Insérer `<EventSection>` avant le bloc dégradé principal**

Remplacer la ligne `<div className="min-h-screen bg-grain">` et son premier enfant `<div className="bg-gradient-secondary-to-white">` pour insérer EventSection entre les deux :

```tsx
<div className="min-h-screen bg-grain">
  {/* Section Événement (mode pendant/après tournoi) */}
  {isEventMode && (
    <div className="max-w-7xl mx-auto px-6 pt-6">
      <EventSection tournament={tournament} />
    </div>
  )}

  {/* === PREMIER BLOC AVEC DÉGRADÉ: Hero -> Stats -> Pourquoi participer === */}
  <div className="bg-gradient-secondary-to-white">
```

- [ ] **Masquer le badge de statut d'inscription en mode Événement**

```tsx
{/* Remplacer : */}
<div className="animate-on-load animate-slide-in-left inline-block mb-6 transform -rotate-2">
  <div className={`inline-flex items-center gap-2 ${statusBadge.bgColor} ...`}>
    ...
  </div>
</div>

{/* Par : */}
{!isEventMode && (
  <div className="animate-on-load animate-slide-in-left inline-block mb-6 transform -rotate-2">
    <div className={`inline-flex items-center gap-2 ${statusBadge.bgColor} text-foreground px-4 py-2 font-black text-sm neo-brutal-sm`}>
      <StatusIcon className="w-4 h-4" />
      {statusBadge.text}
    </div>
  </div>
)}
```

- [ ] **Masquer les boutons CTA d'inscription en mode Événement**

```tsx
{/* Remplacer le bloc des CTA buttons par : */}
{!isEventMode && (
  <div className="animate-on-load animate-slide-up animation-delay-400 flex flex-wrap gap-4">
    {isRegistrationOpen ? (
      <Link to={`/tournaments/${tournament.id}/tables`}>
        <Button size="lg" className="gap-2">
          Je m'inscris maintenant
          <ArrowRight className="w-5 h-5" />
        </Button>
      </Link>
    ) : (
      <Button size="lg" className="gap-2" disabled>
        {registrationStatus?.status === 'not_started'
          ? 'Inscriptions bientôt ouvertes'
          : 'Inscriptions terminées'}
      </Button>
    )}
    <a href="#tableaux">
      <Button size="lg" variant="outline" className="gap-2">
        Voir les tableaux
        <ArrowRight className="w-5 h-5" />
      </Button>
    </a>
  </div>
)}
```

- [ ] **Masquer la section "Pourquoi participer" en mode Événement**

```tsx
{/* Envelopper la section Why Participate dans : */}
{!isEventMode && (
  <section className="py-12">
    {/* ... contenu existant des 4 cartes ... */}
  </section>
)}
```

- [ ] **Masquer la section "Choisissez votre tableau" CTA en mode Événement (garder la liste des tableaux)**

Dans la section `#tableaux`, le titre + CTA button du haut est masqué, la grille de tableaux reste :

```tsx
{/* Remplacer le bloc text-center mb-12 par : */}
{!isEventMode && (
  <div className="text-center mb-12">
    <h2 className="animate-on-load animate-slide-up text-3xl md:text-4xl font-black mb-4">
      Choisissez votre tableau
    </h2>
    <p className="animate-on-load animate-slide-up animation-delay-100 text-muted-foreground text-lg mb-6">
      Des catégories pour tous les niveaux, trouvez celle qui vous correspond
    </p>
    {isRegistrationOpen ? (
      <Link to={`/tournaments/${tournament.id}/tables`}>
        <Button size="lg" className="animate-on-load animate-scale-in animation-delay-200 gap-2">
          Je m'inscris maintenant
          <ArrowRight className="w-5 h-5" />
        </Button>
      </Link>
    ) : (
      <Button size="lg" className="animate-on-load animate-scale-in animation-delay-200" disabled>
        {registrationStatus?.status === 'not_started'
          ? 'Inscriptions bientôt ouvertes'
          : 'Inscriptions terminées'}
      </Button>
    )}
  </div>
)}
{isEventMode && (
  <div className="mb-12">
    <h2 className="animate-on-load animate-slide-up text-3xl md:text-4xl font-black mb-4">
      Tableaux
    </h2>
  </div>
)}
```

- [ ] **Masquer la section finale "Prêt à relever le défi ?" en mode Événement**

```tsx
{/* Envelopper la Final CTA Section dans : */}
{!isEventMode && (
  <section className="bg-primary py-16 border-t-4 border-foreground">
    {/* ... contenu existant ... */}
  </section>
)}
```

- [ ] **Vérifier le typecheck**

```bash
cd web && pnpm typecheck
```

Résultat attendu : aucune erreur TypeScript

- [ ] **Commit**

```bash
git add web/src/features/tournament/pages/LandingPage.tsx
git commit -m "feat: show EventSection and adapt landing page in event mode"
```

---

## Task 6 : AdminTournamentConfigPage — section Phase Événement

**Files:**
- Modify: `web/src/features/tournament/pages/AdminTournamentConfigPage.tsx`

- [ ] **Ajouter les imports nécessaires**

Ajouter dans les imports de `AdminTournamentConfigPage.tsx` :

```typescript
import { QRCodeSVG } from 'qrcode.react'
import { Flag } from 'lucide-react'
```

- [ ] **Ajouter `useWatch` pour la preview du QR code**

Après la ligne `const rulesContentValue = useWatch(...)` :

```typescript
const eventResultUrlValue = useWatch({ control, name: 'eventResultUrl' })
```

- [ ] **Ajouter les champs dans `defaultValues`**

Dans l'objet `defaultValues` du `useForm` :

```typescript
phase: 'before' as const,
eventResultUrl: null,
eventContent: null,
```

- [ ] **Ajouter les champs dans le `reset()` de useEffect**

Dans l'appel `reset({...})` à l'intérieur du `useEffect([tournament, reset])` :

```typescript
phase: (tournament.phase ?? 'before') as 'before' | 'event',
eventResultUrl: tournament.eventResultUrl ?? null,
eventContent: tournament.eventContent ?? null,
```

- [ ] **Ajouter l'affichage en mode View (avant le formulaire)**

Dans la section view mode (après le bloc des `<Card>` existantes), ajouter :

```tsx
{/* Phase Événement — affichage view mode */}
<Card className="mt-6">
  <CardTitle>
    <Flag className="h-5 w-5" /> Phase du tournoi
  </CardTitle>
  <CardContent>
    <div className="flex items-center gap-3 mb-4">
      <span
        className={`px-3 py-1 font-bold text-sm neo-brutal-sm ${
          tournament.phase === 'event'
            ? 'bg-destructive text-destructive-foreground'
            : 'bg-muted'
        }`}
      >
        {tournament.phase === 'event' ? '🏓 Événement en cours' : '📝 Avant le tournoi'}
      </span>
    </div>
    {tournament.eventResultUrl && (
      <div className="flex items-center gap-4">
        <QRCodeSVG value={tournament.eventResultUrl} size={64} />
        <a
          href={tournament.eventResultUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline break-all"
        >
          {tournament.eventResultUrl}
        </a>
      </div>
    )}
    {tournament.eventContent && (
      <div className="mt-4">
        <MarkdownRenderer content={tournament.eventContent} />
      </div>
    )}
  </CardContent>
</Card>
```

- [ ] **Ajouter la section Phase Événement dans le formulaire d'édition**

Dans le formulaire (mode edit), ajouter une section après les champs `rulesContent` / `ffttHomologationLink`. Trouver le dernier bloc de champs du formulaire et ajouter après :

```tsx
{/* Section Phase Événement */}
<div className="border-t-4 border-foreground pt-6 mt-6">
  <h3 className="text-lg font-black mb-4 flex items-center gap-2">
    <Flag className="w-5 h-5" />
    Phase du tournoi
  </h3>

  {/* Toggle de phase */}
  <div className="mb-6">
    <Label className="block mb-2 font-bold">Phase courante</Label>
    <div className="flex gap-3">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="radio"
          value="before"
          {...register('phase')}
          className="w-4 h-4"
        />
        <span className="font-medium">📝 Avant le tournoi</span>
      </label>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="radio"
          value="event"
          {...register('phase')}
          className="w-4 h-4"
        />
        <span className="font-medium">🏓 Événement en cours</span>
      </label>
    </div>
    <p className="text-xs text-muted-foreground mt-1">
      En mode "Événement", une section dédiée s'affiche en tête de la page publique.
    </p>
  </div>

  {/* URL des résultats */}
  <div className="mb-4">
    <Label htmlFor="eventResultUrl" className="font-bold">
      URL des résultats
    </Label>
    <Input
      id="eventResultUrl"
      placeholder="https://docs.google.com/spreadsheets/d/..."
      {...register('eventResultUrl')}
      className="mt-1"
    />
    {errors.eventResultUrl && (
      <p className="text-destructive text-sm mt-1">{errors.eventResultUrl.message}</p>
    )}
    {/* Aperçu QR code en temps réel */}
    {eventResultUrlValue && (() => {
      try { new URL(eventResultUrlValue); return true } catch { return false }
    })() && (
      <div className="mt-3 flex items-center gap-3">
        <QRCodeSVG value={eventResultUrlValue} size={80} />
        <span className="text-sm text-muted-foreground">Aperçu du QR code</span>
      </div>
    )}
  </div>

  {/* Contenu libre markdown */}
  <div>
    <Label htmlFor="eventContent" className="font-bold">
      Contenu libre (markdown)
    </Label>
    <p className="text-xs text-muted-foreground mb-1">
      Tarifs buvette, infos pratiques, liens photos post-tournoi...
    </p>
    <Textarea
      id="eventContent"
      rows={6}
      placeholder={'**Buvette** : sandwich 3€ · boisson 1€\n📍 Entrée libre pour les spectateurs'}
      {...register('eventContent')}
      className="mt-1 font-mono text-sm"
    />
    {/* Preview markdown */}
    {longDescriptionValue && (
      <div className="mt-2 p-3 bg-muted/30 border-2 border-foreground text-sm">
        <MarkdownRenderer content={longDescriptionValue} />
      </div>
    )}
  </div>
</div>
```

Note : le preview markdown pour `eventContent` doit utiliser `eventContentValue = useWatch({ control, name: 'eventContent' })` (pas `longDescriptionValue`). Ajouter ce watch après les watches existants et l'utiliser dans le preview.

- [ ] **Corriger la preview markdown pour eventContent**

Ajouter après `const rulesContentValue = useWatch(...)` :

```typescript
const eventContentValue = useWatch({ control, name: 'eventContent' })
```

Puis dans le JSX du formulaire, remplacer la référence erronée `longDescriptionValue` par `eventContentValue` dans la section Phase Événement.

- [ ] **Vérifier le typecheck**

```bash
cd web && pnpm typecheck
```

Résultat attendu : aucune erreur

- [ ] **Vérifier le lint**

```bash
cd web && pnpm lint
```

Résultat attendu : aucune erreur

- [ ] **Commit**

```bash
git add web/src/features/tournament/pages/AdminTournamentConfigPage.tsx
git commit -m "feat: add Phase Événement section to admin tournament config"
```

---

## Task 7 : Vérification finale

- [ ] **Lancer tous les tests backend**

```bash
cd api && node ace test
```

Résultat attendu : tous les tests passent

- [ ] **Lancer tous les tests frontend**

```bash
cd web && pnpm test
```

Résultat attendu : tous les tests passent

- [ ] **Lancer le typecheck global**

```bash
pnpm typecheck
```

Résultat attendu : aucune erreur

- [ ] **Démarrer l'appli et tester manuellement**

```bash
docker compose up -d && pnpm dev
```

Vérifications à faire :
1. Page admin `/admin/tournament` → section "Phase du tournoi" visible en view mode → affiche "Avant le tournoi"
2. Cliquer "Modifier" → section Phase Événement présente → sélectionner "Événement en cours" → entrer une URL Google Sheet → voir le QR code en aperçu → entrer du contenu markdown → sauvegarder
3. Page publique `/` → `EventSection` apparaît en haut avec QR code et contenu markdown
4. Sections masquées : badge inscriptions, boutons CTA, "Pourquoi participer", "Prêt à relever le défi"
5. Sections visibles : dates, stats, liste tableaux, sponsors
6. Repasser en mode "Avant" → page publique revient à la normale

- [ ] **Commit final si tout est OK**

```bash
git add -p  # vérifier qu'il ne reste rien d'non-commité
```
