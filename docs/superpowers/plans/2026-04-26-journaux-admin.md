# Journaux Admin – Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter une page "Journaux" dans le menu "Suivi tournoi" de l'admin, affichant une timeline chronologique des événements du tournoi reconstruits depuis les tables existantes.

**Architecture:** Un contrôleur AdonisJS effectue deux requêtes parallèles (registrations + payments), reconstruit jusqu'à 7 types d'événements par enregistrement, fusionne et trie par timestamp desc. Le frontend consomme l'endpoint via un hook TanStack Query et affiche les événements dans un `SortableDataTable` avec filtre par type et recherche par joueur.

**Tech Stack:** AdonisJS v6 + Lucid ORM (backend), React 19 + TanStack Query + SortableDataTable (frontend), Japa (tests backend).

---

## File Map

### Créés
- `api/app/controllers/admin_audit_log_controller.ts` — Reconstruit les événements depuis `registrations` et `payments`, fusionne et retourne triés par timestamp desc
- `api/tests/functional/admin_audit_log.spec.ts` — Tests Japa pour `GET /admin/audit-log`
- `web/src/features/admin/hooks/useAdminAuditLog.ts` — Hook TanStack Query + type `AuditEvent`
- `web/src/features/admin/pages/AdminLogsPage.tsx` — Page de la timeline avec `SortableDataTable`

### Modifiés
- `api/start/routes.ts` — Ajout de `GET /admin/audit-log` sous `admin_auth_middleware`
- `web/src/features/admin/hooks/index.ts` — Re-export de `useAdminAuditLog`
- `web/src/features/admin/index.ts` — Re-export de `AdminLogsPage`
- `web/src/components/layout/AdminLayout.tsx` — Ajout entrée "Journaux" (icône `ScrollText`) dans le dropdown "Suivi tournoi" desktop et mobile
- `web/src/App.tsx` — Ajout route `/admin/logs → AdminLogsPage`

---

## Task 1: Backend – Contrôleur, route et tests

**Files:**
- Create: `api/app/controllers/admin_audit_log_controller.ts`
- Create: `api/tests/functional/admin_audit_log.spec.ts`
- Modify: `api/start/routes.ts`

- [ ] **Step 1: Écrire le test fonctionnel (attendu: FAIL)**

Créer `api/tests/functional/admin_audit_log.spec.ts` avec le contenu suivant :

```typescript
import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import Admin from '#models/admin'
import Tournament from '#models/tournament'
import Table from '#models/table'
import Player from '#models/player'
import Registration from '#models/registration'
import User from '#models/user'
import Payment from '#models/payment'

test.group('Admin Audit Log | GET /admin/audit-log', (group) => {
  group.each.setup(async () => {
    await Registration.query().delete()
    await Payment.query().delete()
    await Table.query().delete()
    await Player.query().delete()
    await User.query().delete()
    await Tournament.query().delete()
    await Admin.updateOrCreate(
      { email: 'admin@example.com' },
      { fullName: 'Admin Test', password: 'password' }
    )
  })

  group.each.teardown(async () => {
    await Registration.query().delete()
    await Payment.query().delete()
    await Table.query().delete()
    await Player.query().delete()
    await User.query().delete()
    await Tournament.query().delete()
  })

  async function createFixtures() {
    const admin = await Admin.findByOrFail('email', 'admin@example.com')
    const tournament = await Tournament.create({
      name: 'Test Tournament',
      startDate: DateTime.now().plus({ days: 30 }),
      endDate: DateTime.now().plus({ days: 31 }),
      location: 'Paris',
    })
    const table = await Table.create({
      tournamentId: tournament.id,
      name: 'Tableau A',
      date: tournament.startDate,
      startTime: '10:00',
      pointsMin: 0,
      pointsMax: 2000,
      quota: 32,
      price: 12,
      isSpecial: false,
    })
    const user = await User.create({ email: 'player@example.com' })
    const player = await Player.create({
      licence: '1234567',
      firstName: 'Jean',
      lastName: 'Dupont',
      club: 'TT Club',
      points: 800,
    })
    return { admin, tournament, table, user, player }
  }

  test('retourne 401 sans authentification', async ({ client }) => {
    const response = await client.get('/admin/audit-log')
    response.assertStatus(401)
  })

  test('retourne un tableau vide sans données', async ({ client }) => {
    const admin = await Admin.findByOrFail('email', 'admin@example.com')
    const response = await client.get('/admin/audit-log').withGuard('admin').loginAs(admin)
    response.assertStatus(200)
    response.assertBodyContains({ status: 'success', data: { events: [] } })
  })

  test('retourne un événement inscription_utilisateur pour inscription user', async ({ client, assert }) => {
    const { admin, table, user, player } = await createFixtures()

    await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: table.id,
      status: 'paid',
      isAdminCreated: false,
    })

    const response = await client.get('/admin/audit-log').withGuard('admin').loginAs(admin)
    response.assertStatus(200)

    const events = response.body().data.events as Array<{ type: string; playerName: string; tableName: string }>
    const evt = events.find((e) => e.type === 'inscription_utilisateur')
    assert.exists(evt, 'inscription_utilisateur event missing')
    assert.equal(evt!.playerName, 'Jean Dupont')
    assert.equal(evt!.tableName, 'Tableau A')
  })

  test('retourne un événement inscription_admin pour inscription admin', async ({ client, assert }) => {
    const { admin, table, user, player } = await createFixtures()

    await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: table.id,
      status: 'paid',
      isAdminCreated: true,
      adminId: admin.id,
    })

    const response = await client.get('/admin/audit-log').withGuard('admin').loginAs(admin)
    response.assertStatus(200)

    const events = response.body().data.events as Array<{ type: string; actor: string }>
    const evt = events.find((e) => e.type === 'inscription_admin')
    assert.exists(evt, 'inscription_admin event missing')
    assert.equal(evt!.actor, 'Admin Test')
  })

  test('retourne un événement pointage quand checkedInAt est défini', async ({ client, assert }) => {
    const { admin, table, user, player } = await createFixtures()

    await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: table.id,
      status: 'paid',
      checkedInAt: DateTime.now(),
    })

    const response = await client.get('/admin/audit-log').withGuard('admin').loginAs(admin)
    response.assertStatus(200)

    const events = response.body().data.events as Array<{ type: string }>
    assert.exists(events.find((e) => e.type === 'pointage'), 'pointage event missing')
  })

  test('retourne un événement promotion_liste_attente quand promotedAt est défini', async ({ client, assert }) => {
    const { admin, table, user, player } = await createFixtures()

    await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: table.id,
      status: 'paid',
      promotedAt: DateTime.now(),
    })

    const response = await client.get('/admin/audit-log').withGuard('admin').loginAs(admin)
    response.assertStatus(200)

    const events = response.body().data.events as Array<{ type: string }>
    assert.exists(events.find((e) => e.type === 'promotion_liste_attente'), 'promotion_liste_attente event missing')
  })

  test('retourne un événement annulation_admin quand cancelledByAdminId est défini', async ({ client, assert }) => {
    const { admin, table, user, player } = await createFixtures()

    await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: table.id,
      status: 'cancelled',
      cancelledByAdminId: admin.id,
    })

    const response = await client.get('/admin/audit-log').withGuard('admin').loginAs(admin)
    response.assertStatus(200)

    const events = response.body().data.events as Array<{ type: string; actor: string }>
    const evt = events.find((e) => e.type === 'annulation_admin')
    assert.exists(evt, 'annulation_admin event missing')
    assert.equal(evt!.actor, 'Admin Test')
  })

  test('retourne un événement paiement_confirme pour un paiement succeeded', async ({ client, assert }) => {
    const { admin, table, user, player } = await createFixtures()

    const registration = await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: table.id,
      status: 'paid',
    })

    const payment = await Payment.create({
      userId: user.id,
      helloassoCheckoutIntentId: `test-checkout-${Date.now()}`,
      amount: 1200,
      status: 'succeeded',
      paymentMethod: 'cash',
    })
    await payment.related('registrations').attach([registration.id])

    const response = await client.get('/admin/audit-log').withGuard('admin').loginAs(admin)
    response.assertStatus(200)

    const events = response.body().data.events as Array<{ type: string; actor: string; details: string }>
    const evt = events.find((e) => e.type === 'paiement_confirme')
    assert.exists(evt, 'paiement_confirme event missing')
    assert.equal(evt!.actor, 'Espèces')
    assert.isTrue(evt!.details.includes('12,00 €'), `details should contain amount, got: ${evt!.details}`)
  })

  test('retourne un événement remboursement quand refundedAt est défini', async ({ client, assert }) => {
    const { admin, table, user, player } = await createFixtures()

    const registration = await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: table.id,
      status: 'paid',
    })

    const payment = await Payment.create({
      userId: user.id,
      helloassoCheckoutIntentId: `test-checkout-${Date.now()}`,
      amount: 1200,
      status: 'refunded',
      paymentMethod: 'helloasso',
      refundedAt: DateTime.now(),
    })
    await payment.related('registrations').attach([registration.id])

    const response = await client.get('/admin/audit-log').withGuard('admin').loginAs(admin)
    response.assertStatus(200)

    const events = response.body().data.events as Array<{ type: string }>
    assert.exists(events.find((e) => e.type === 'remboursement'), 'remboursement event missing')
  })

  test('filtre les événements par playerId', async ({ client, assert }) => {
    const { admin, table, user, player } = await createFixtures()

    const user2 = await User.create({ email: 'player2@example.com' })
    const player2 = await Player.create({
      licence: '9999999',
      firstName: 'Marie',
      lastName: 'Martin',
      club: 'TT Club',
      points: 600,
    })

    await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: table.id,
      status: 'paid',
    })
    await Registration.create({
      userId: user2.id,
      playerId: player2.id,
      tableId: table.id,
      status: 'paid',
    })

    const response = await client
      .get('/admin/audit-log')
      .qs({ playerId: player.id })
      .withGuard('admin')
      .loginAs(admin)

    response.assertStatus(200)
    const events = response.body().data.events as Array<{ playerId: number }>
    assert.isTrue(events.every((e) => e.playerId === player.id), 'all events should be for player1')
    assert.equal(events.length, 1)
  })

  test('retourne les événements triés par timestamp desc', async ({ client, assert }) => {
    const { admin, table, user, player } = await createFixtures()

    // Crée une registration + un paiement pour avoir des timestamps différents
    const registration = await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: table.id,
      status: 'paid',
      checkedInAt: DateTime.now(), // génère un événement pointage supplémentaire
    })

    const payment = await Payment.create({
      userId: user.id,
      helloassoCheckoutIntentId: `test-checkout-sort-${Date.now()}`,
      amount: 1200,
      status: 'succeeded',
      paymentMethod: 'cash',
    })
    await payment.related('registrations').attach([registration.id])

    const response = await client.get('/admin/audit-log').withGuard('admin').loginAs(admin)
    response.assertStatus(200)

    const events = response.body().data.events as Array<{ timestamp: string }>
    assert.isAbove(events.length, 1, 'should have multiple events')

    for (let i = 0; i < events.length - 1; i++) {
      assert.isAtLeast(
        events[i].timestamp.localeCompare(events[i + 1].timestamp),
        0,
        `event[${i}] should not be before event[${i + 1}] (timestamps: ${events[i].timestamp} vs ${events[i + 1].timestamp})`
      )
    }
  })
})
```

- [ ] **Step 2: Exécuter le test pour vérifier qu'il échoue**

```bash
cd api && node ace test tests/functional/admin_audit_log.spec.ts
```

Résultat attendu : FAIL avec "Cannot GET /admin/audit-log" ou erreur 404.

- [ ] **Step 3: Créer le contrôleur**

Créer `api/app/controllers/admin_audit_log_controller.ts` :

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import Registration from '#models/registration'
import Payment from '#models/payment'
import { success } from '#helpers/api_response'

type AuditEventType =
  | 'inscription_utilisateur'
  | 'inscription_admin'
  | 'promotion_liste_attente'
  | 'paiement_confirme'
  | 'remboursement'
  | 'annulation_admin'
  | 'pointage'

interface AuditEvent {
  id: string
  type: AuditEventType
  timestamp: string
  playerName: string
  playerId: number
  playerLicence: string
  tableName: string | null
  actor: string | null
  details: string
}

const PAYMENT_METHOD_ACTOR: Record<string, string> = {
  helloasso: 'HelloAsso',
  cash: 'Espèces',
  check: 'Chèque',
  card: 'CB',
}

export default class AdminAuditLogController {
  async index(ctx: HttpContext) {
    const playerIdParam = ctx.request.input('playerId')
    const playerId = playerIdParam ? Number(playerIdParam) : null

    const [registrations, payments] = await Promise.all([
      this.#fetchRegistrations(playerId),
      this.#fetchPayments(playerId),
    ])

    const events: AuditEvent[] = [
      ...this.#buildRegistrationEvents(registrations),
      ...this.#buildPaymentEvents(payments, playerId),
    ]

    events.sort((a, b) => b.timestamp.localeCompare(a.timestamp))

    return success(ctx, { events })
  }

  async #fetchRegistrations(playerId: number | null) {
    const query = Registration.query()
      .preload('player')
      .preload('table')
      .preload('user')
      .preload('createdByAdmin')
      .preload('cancelledByAdmin')

    if (playerId) {
      query.where('player_id', playerId)
    }

    return query
  }

  async #fetchPayments(playerId: number | null) {
    const query = Payment.query()
      .where((q) => {
        q.where('status', 'succeeded').orWhereNotNull('refunded_at')
      })
      .preload('registrations', (q) => {
        q.preload('player').preload('table')
      })

    if (playerId) {
      query.whereHas('registrations', (q) => {
        q.where('player_id', playerId)
      })
    }

    return query
  }

  #buildRegistrationEvents(registrations: Awaited<ReturnType<typeof Registration.query>>) {
    const events: AuditEvent[] = []

    for (const reg of registrations) {
      const playerName = `${reg.player.firstName} ${reg.player.lastName}`
      const tableName = reg.table.name
      const base = {
        playerName,
        playerId: reg.player.id,
        playerLicence: reg.player.licence,
        tableName,
      }

      // Inscription (toujours)
      if (reg.isAdminCreated) {
        events.push({
          id: `reg-${reg.id}-created`,
          type: 'inscription_admin',
          timestamp: reg.createdAt.toISO()!,
          ...base,
          actor: reg.createdByAdmin?.fullName ?? null,
          details: `${tableName} – Inscription admin`,
        })
      } else {
        events.push({
          id: `reg-${reg.id}-created`,
          type: 'inscription_utilisateur',
          timestamp: reg.createdAt.toISO()!,
          ...base,
          actor: reg.user.email,
          details: `${tableName} – Inscription`,
        })
      }

      // Promotion liste d'attente
      if (reg.promotedAt) {
        events.push({
          id: `reg-${reg.id}-promoted`,
          type: 'promotion_liste_attente',
          timestamp: reg.promotedAt.toISO()!,
          ...base,
          actor: null,
          details: `${tableName} – Promu depuis la liste d'attente`,
        })
      }

      // Annulation admin
      if (reg.cancelledByAdminId) {
        events.push({
          id: `reg-${reg.id}-cancelled`,
          type: 'annulation_admin',
          timestamp: reg.updatedAt.toISO()!,
          ...base,
          actor: reg.cancelledByAdmin?.fullName ?? null,
          details: `${tableName} – Annulation admin`,
        })
      }

      // Pointage
      if (reg.checkedInAt) {
        events.push({
          id: `reg-${reg.id}-checkin`,
          type: 'pointage',
          timestamp: reg.checkedInAt.toISO()!,
          ...base,
          actor: null,
          details: `${tableName} – Pointage`,
        })
      }
    }

    return events
  }

  #buildPaymentEvents(
    payments: Awaited<ReturnType<typeof Payment.query>>,
    playerId: number | null
  ) {
    const events: AuditEvent[] = []

    for (const payment of payments) {
      if (payment.registrations.length === 0) continue

      const relevantRegs = playerId
        ? payment.registrations.filter((r) => r.player.id === playerId)
        : payment.registrations

      if (relevantRegs.length === 0) continue

      const firstReg = relevantRegs[0]
      const playerName = `${firstReg.player.firstName} ${firstReg.player.lastName}`
      const tableNames = [...new Set(payment.registrations.map((r) => r.table.name))].join(' / ')
      const actor = PAYMENT_METHOD_ACTOR[payment.paymentMethod] ?? payment.paymentMethod
      const amountFormatted =
        (payment.amount / 100).toFixed(2).replace('.', ',') + ' €'

      const base = {
        playerName,
        playerId: firstReg.player.id,
        playerLicence: firstReg.player.licence,
        tableName: tableNames || null,
        actor,
      }

      if (payment.status === 'succeeded') {
        events.push({
          id: `pay-${payment.id}-succeeded`,
          type: 'paiement_confirme',
          timestamp: payment.updatedAt.toISO()!,
          ...base,
          details: `${tableNames} – Paiement ${actor} (${amountFormatted})`,
        })
      }

      if (payment.refundedAt) {
        events.push({
          id: `pay-${payment.id}-refunded`,
          type: 'remboursement',
          timestamp: payment.refundedAt.toISO()!,
          ...base,
          details: `${tableNames} – Remboursement ${actor} (${amountFormatted})`,
        })
      }
    }

    return events
  }
}
```

- [ ] **Step 4: Ajouter la route dans `api/start/routes.ts`**

Dans `api/start/routes.ts`, ajouter en haut du fichier l'import du contrôleur :

```typescript
const AdminAuditLogController = () => import('#controllers/admin_audit_log_controller')
```

Puis ajouter la route dans le groupe protégé par `admin_auth_middleware` (après la ligne `router.get('/checkin/:date/players', ...)`):

```typescript
// Audit log
router.get('/audit-log', [AdminAuditLogController, 'index'])
```

Le bloc final dans `routes.ts` ressemble à (extrait) :

```typescript
const AdminAuditLogController = () => import('#controllers/admin_audit_log_controller')
// ... autres imports ...

// Dans le groupe admin protégé :
router.get('/audit-log', [AdminAuditLogController, 'index'])
```

- [ ] **Step 5: Exécuter les tests pour vérifier qu'ils passent**

```bash
cd api && node ace test tests/functional/admin_audit_log.spec.ts
```

Résultat attendu : tous les tests PASS.

- [ ] **Step 6: Typecheck backend**

```bash
cd api && npx tsc --noEmit
```

Résultat attendu : aucune erreur.

- [ ] **Step 7: Commit**

```bash
git add api/app/controllers/admin_audit_log_controller.ts api/tests/functional/admin_audit_log.spec.ts api/start/routes.ts
git commit -m "feat: add admin audit log endpoint GET /admin/audit-log"
```

---

## Task 2: Frontend – Hook TanStack Query

**Files:**
- Create: `web/src/features/admin/hooks/useAdminAuditLog.ts`
- Modify: `web/src/features/admin/hooks/index.ts`

- [ ] **Step 1: Créer le hook**

Créer `web/src/features/admin/hooks/useAdminAuditLog.ts` :

```typescript
import { useQuery } from '@tanstack/react-query'
import { api } from '../../../lib/api'

export type AuditEventType =
  | 'inscription_utilisateur'
  | 'inscription_admin'
  | 'promotion_liste_attente'
  | 'paiement_confirme'
  | 'remboursement'
  | 'annulation_admin'
  | 'pointage'

export interface AuditEvent {
  id: string
  type: AuditEventType
  timestamp: string
  playerName: string
  playerId: number
  playerLicence: string
  tableName: string | null
  actor: string | null
  details: string
}

interface AuditLogResponse {
  events: AuditEvent[]
}

async function fetchAuditLog(playerId?: number): Promise<AuditLogResponse> {
  const params = playerId !== undefined ? { playerId } : {}
  const response = await api.get<AuditLogResponse>('/admin/audit-log', { params })
  return response.data
}

export function useAdminAuditLog(playerId?: number) {
  return useQuery({
    queryKey: ['admin', 'audit-log', playerId],
    queryFn: () => fetchAuditLog(playerId),
  })
}
```

- [ ] **Step 2: Exporter depuis `hooks/index.ts`**

Le fichier `web/src/features/admin/hooks/index.ts` contient actuellement la fonction `useAdminStats`. Ajouter à la fin :

```typescript
export * from './useAdminAuditLog'
```

- [ ] **Step 3: Typecheck**

```bash
cd web && npx tsc --noEmit
```

Résultat attendu : aucune erreur.

- [ ] **Step 4: Commit**

```bash
git add web/src/features/admin/hooks/useAdminAuditLog.ts web/src/features/admin/hooks/index.ts
git commit -m "feat: add useAdminAuditLog hook"
```

---

## Task 3: Frontend – Page AdminLogsPage + Navigation

**Files:**
- Create: `web/src/features/admin/pages/AdminLogsPage.tsx`
- Modify: `web/src/features/admin/index.ts`
- Modify: `web/src/components/layout/AdminLayout.tsx`
- Modify: `web/src/App.tsx`

- [ ] **Step 1: Créer la page `AdminLogsPage.tsx`**

Créer `web/src/features/admin/pages/AdminLogsPage.tsx` :

```tsx
import { useMemo } from 'react'
import { ScrollText, Loader2 } from 'lucide-react'
import { PageHeader } from '@components/ui/page-header'
import { SortableDataTable, type SortableColumn } from '@components/ui/sortable-data-table'
import { useAdminAuditLog, type AuditEvent, type AuditEventType } from '../hooks/useAdminAuditLog'
import { formatDateTime } from '../../../lib/formatters'
import type { FilterConfig } from '../../../hooks/use-table-filters'

const AUDIT_EVENT_LABELS: Record<AuditEventType, string> = {
  inscription_utilisateur: 'Inscription joueur',
  inscription_admin: 'Inscription admin',
  promotion_liste_attente: "Promotion liste d'attente",
  paiement_confirme: 'Paiement confirmé',
  remboursement: 'Remboursement',
  annulation_admin: 'Annulation admin',
  pointage: 'Pointage',
}

const AUDIT_EVENT_COLORS: Record<AuditEventType, string> = {
  inscription_utilisateur: 'bg-blue-200 text-blue-900 border-blue-600',
  inscription_admin: 'bg-violet-200 text-violet-900 border-violet-600',
  promotion_liste_attente: 'bg-orange-200 text-orange-900 border-orange-600',
  paiement_confirme: 'bg-green-200 text-green-900 border-green-600',
  remboursement: 'bg-yellow-200 text-yellow-900 border-yellow-600',
  annulation_admin: 'bg-red-200 text-red-900 border-red-600',
  pointage: 'bg-emerald-200 text-emerald-900 border-emerald-600',
}

const FILTER_CONFIGS: FilterConfig[] = [
  {
    key: 'type',
    label: "Type d'événement",
    type: 'select',
    options: [
      { value: 'inscription_utilisateur', label: 'Inscription joueur' },
      { value: 'inscription_admin', label: 'Inscription admin' },
      { value: 'promotion_liste_attente', label: "Promotion liste d'attente" },
      { value: 'paiement_confirme', label: 'Paiement confirmé' },
      { value: 'remboursement', label: 'Remboursement' },
      { value: 'annulation_admin', label: 'Annulation admin' },
      { value: 'pointage', label: 'Pointage' },
    ],
  },
]

export function AdminLogsPage() {
  const { data, isLoading, error } = useAdminAuditLog()

  const events = useMemo(() => data?.events ?? [], [data?.events])

  const columns: SortableColumn<AuditEvent>[] = useMemo(
    () => [
      {
        key: 'timestamp',
        header: 'Horodatage',
        render: (event) => (
          <span className="text-sm font-mono">{formatDateTime(event.timestamp)}</span>
        ),
      },
      {
        key: 'type',
        header: 'Type',
        render: (event) => (
          <span
            className={`inline-flex items-center px-2 py-0.5 text-xs font-bold border ${AUDIT_EVENT_COLORS[event.type]}`}
          >
            {AUDIT_EVENT_LABELS[event.type]}
          </span>
        ),
      },
      {
        key: 'playerName',
        header: 'Joueur',
        render: (event) => (
          <div>
            <div className="font-medium">{event.playerName}</div>
            <div className="text-xs text-muted-foreground">{event.playerLicence}</div>
          </div>
        ),
      },
      {
        key: 'tableName',
        header: 'Tableau',
        render: (event) => (
          <span className="text-sm">{event.tableName ?? '—'}</span>
        ),
      },
      {
        key: 'actor',
        header: 'Acteur',
        render: (event) => (
          <span className="text-sm text-muted-foreground">{event.actor ?? '—'}</span>
        ),
      },
      {
        key: 'details',
        header: 'Détails',
        render: (event) => (
          <span className="text-sm">{event.details}</span>
        ),
      },
    ],
    []
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-destructive/10 border-2 border-destructive p-4">
          <p className="font-bold text-destructive">Erreur lors du chargement des journaux</p>
          <p className="text-sm text-destructive/80">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <PageHeader
        title="Journaux"
        description="Historique chronologique des événements du tournoi"
        icon={ScrollText}
      />

      <SortableDataTable
        data={events}
        columns={columns}
        keyExtractor={(event) => event.id}
        sortable
        initialSort={{ column: 'timestamp', direction: 'desc' }}
        searchable
        searchPlaceholder="Rechercher par joueur ou licence..."
        searchKeys={['playerName', 'playerLicence']}
        filters={FILTER_CONFIGS}
        pagination={{ pageSize: 50, showFirstLast: true, showPageNumbers: true }}
        emptyMessage="Aucun événement trouvé"
      />
    </div>
  )
}
```

- [ ] **Step 2: Exporter depuis `web/src/features/admin/index.ts`**

Ajouter à la fin de `web/src/features/admin/index.ts` :

```typescript
export * from './pages/AdminLogsPage'
```

- [ ] **Step 3: Ajouter l'entrée dans `AdminLayout.tsx`**

Dans `web/src/components/layout/AdminLayout.tsx`, modifier les imports Lucide pour ajouter `ScrollText` :

```typescript
import {
  Menu,
  Home,
  Trophy,
  LayoutGrid,
  ClipboardList,
  Heart,
  LogOut,
  CreditCard,
  UserCheck,
  Settings,
  Activity,
  ScrollText,
} from 'lucide-react'
```

Dans le dropdown desktop "Suivi tournoi", ajouter l'entrée Journaux après Pointage :

```tsx
<NavDropdown
  label="Suivi tournoi"
  icon={Activity}
  items={[
    { to: '/admin/registrations', label: 'Inscriptions', icon: ClipboardList },
    { to: '/admin/payments', label: 'Paiements', icon: CreditCard },
    { to: '/admin/checkin', label: 'Pointage', icon: UserCheck },
    { to: '/admin/logs', label: 'Journaux', icon: ScrollText },
  ]}
/>
```

Dans le menu mobile (DropdownMenuContent), ajouter après le `DropdownMenuItem` pour le pointage et avant Sponsors :

```tsx
<DropdownMenuItem asChild>
  <NavLink to="/admin/logs" className="w-full cursor-pointer">
    <ScrollText className="h-4 w-4" />
    Journaux
  </NavLink>
</DropdownMenuItem>
```

- [ ] **Step 4: Ajouter la route dans `web/src/App.tsx`**

Ajouter l'import de `AdminLogsPage` :

```typescript
import { AdminDashboardPage, AdminLogsPage } from '@features/admin'
```

Ajouter la route dans le bloc admin Routes, après `<Route path="checkin" .../>` :

```tsx
<Route path="logs" element={<AdminLogsPage />} />
```

- [ ] **Step 5: Typecheck frontend**

```bash
cd web && npx tsc --noEmit
```

Résultat attendu : aucune erreur.

- [ ] **Step 6: Commit**

```bash
git add web/src/features/admin/pages/AdminLogsPage.tsx web/src/features/admin/index.ts web/src/features/admin/hooks/index.ts web/src/components/layout/AdminLayout.tsx web/src/App.tsx
git commit -m "feat: add admin logs page at /admin/logs"
```
