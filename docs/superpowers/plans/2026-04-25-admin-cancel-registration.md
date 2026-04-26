# Admin Cancel Registration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permettre à un admin de désinscrire un joueur (d'un ou tous les tableaux) depuis le back-office, en conservant un suivi du remboursement.

**Architecture:** Deux nouveaux endpoints REST (`DELETE /admin/registrations/:id` et `DELETE /admin/registrations/player/:playerId`) délèguent au `CancellationService`. Les champs de suivi du remboursement sont portés au niveau de chaque inscription. Le frontend expose deux modales (annulation unitaire depuis `PlayerDetailsModal`, annulation complète depuis le tableau des joueurs).

**Tech Stack:** AdonisJS v6 + Lucid ORM + VineJS (backend) ; React 19 + TanStack Query + Zod (frontend) ; Japa (tests)

---

## File Structure

### Backend – Créer
- `api/database/migrations/1769100000000_add_admin_cancel_fields_to_registrations.ts` — 4 nouvelles colonnes sur `registrations`
- `api/tests/functional/admin_cancel_registration.spec.ts` — tests fonctionnels pour les 2 nouveaux endpoints

### Backend – Modifier
- `api/app/models/registration.ts` — 4 nouveaux attributs + nouvelle relation `cancelledByAdmin`
- `api/app/validators/admin_registration.ts` — nouveau validator `adminCancelRegistrationValidator`
- `api/app/services/cancellation_service.ts` — 2 nouvelles méthodes publiques + extension du type `CancellationError`
- `api/app/controllers/admin_registrations_controller.ts` — méthodes `cancelOne` + `cancelAll` ; `index` inclut désormais les inscriptions annulées par admin
- `api/start/routes.ts` — 2 nouvelles routes DELETE (ordre important)

### Frontend – Créer
- `web/src/features/registrations/components/admin/AdminCancelRegistrationModal.tsx` — modale annulation tableau unique
- `web/src/features/registrations/components/admin/AdminCancelPlayerModal.tsx` — modale annulation complète joueur

### Frontend – Modifier
- `web/src/features/registrations/types/adminTypes.ts` — champs `adminCancellation` sur `RegistrationData` et `RegistrationGroup`
- `web/src/features/registrations/api/adminApi.ts` — 2 nouvelles fonctions API
- `web/src/features/registrations/hooks/adminHooks.ts` — 2 nouvelles mutations TanStack Query ; `buildRegistrationGroups` transmet `adminCancellation`
- `web/src/features/registrations/components/admin/adminColumns.tsx` — colonne `createActionsColumn` avec bouton "Désinscrire"
- `web/src/features/registrations/components/admin/PlayerDetailsModal.tsx` — bouton "Annuler ce tableau" + affichage statut post-annulation + modale intégrée
- `web/src/features/registrations/pages/AdminRegistrationsPage.tsx` — câblage `AdminCancelPlayerModal`

---

## Task 1 : Migration – ajout des colonnes sur `registrations`

**Files:**
- Create: `api/database/migrations/1769100000000_add_admin_cancel_fields_to_registrations.ts`

- [ ] **Step 1 : Créer le fichier de migration**

```typescript
// api/database/migrations/1769100000000_add_admin_cancel_fields_to_registrations.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'registrations'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('cancelled_by_admin_id').nullable().references('id').inTable('admins')
      table.string('refund_status').nullable() // 'none' | 'requested' | 'done'
      table.string('refund_method').nullable() // 'cash' | 'check' | 'bank_transfer'
      table.timestamp('refunded_at').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('cancelled_by_admin_id')
      table.dropColumn('refund_status')
      table.dropColumn('refund_method')
      table.dropColumn('refunded_at')
    })
  }
}
```

- [ ] **Step 2 : Exécuter la migration**

```bash
cd api && node ace migration:run
```

Expected output: `Completed 1769100000000_add_admin_cancel_fields_to_registrations`

- [ ] **Step 3 : Commit**

```bash
git add api/database/migrations/1769100000000_add_admin_cancel_fields_to_registrations.ts
git commit -m "feat: add admin cancel fields to registrations table"
```

---

## Task 2 : Modèle `Registration` – nouveaux attributs et relation

**Files:**
- Modify: `api/app/models/registration.ts`

- [ ] **Step 1 : Ajouter les 4 colonnes et la nouvelle relation**

Remplacer le contenu de `api/app/models/registration.ts` (après `promotedAt`) par la version complète :

```typescript
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Player from '#models/player'
import Table from '#models/table'
import Payment from '#models/payment'
import Admin from '#models/admin'

export default class Registration extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare playerId: number

  @column()
  declare tableId: number

  @column()
  declare adminId: number | null

  @column()
  declare status: 'pending_payment' | 'paid' | 'waitlist' | 'cancelled'

  @column()
  declare waitlistRank: number | null

  @column()
  declare isAdminCreated: boolean

  @column.dateTime()
  declare checkedInAt: DateTime | null

  @column()
  declare presenceStatus: 'unknown' | 'present' | 'absent'

  @column.dateTime()
  declare promotedAt: DateTime | null

  @column()
  declare cancelledByAdminId: number | null

  @column()
  declare refundStatus: 'none' | 'requested' | 'done' | null

  @column()
  declare refundMethod: 'cash' | 'check' | 'bank_transfer' | null

  @column.dateTime()
  declare refundedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Player)
  declare player: BelongsTo<typeof Player>

  @belongsTo(() => Table)
  declare table: BelongsTo<typeof Table>

  @belongsTo(() => Admin)
  declare createdByAdmin: BelongsTo<typeof Admin>

  @belongsTo(() => Admin, { foreignKey: 'cancelledByAdminId' })
  declare cancelledByAdmin: BelongsTo<typeof Admin>

  @manyToMany(() => Payment, {
    pivotTable: 'payment_registrations',
    pivotTimestamps: {
      createdAt: 'created_at',
      updatedAt: false,
    },
  })
  declare payments: ManyToMany<typeof Payment>
}
```

- [ ] **Step 2 : Vérifier le typecheck**

```bash
cd api && node ace typecheck
```

Expected: no errors.

- [ ] **Step 3 : Commit**

```bash
git add api/app/models/registration.ts
git commit -m "feat: add admin cancellation columns to Registration model"
```

---

## Task 3 : Validator `adminCancelRegistrationValidator`

**Files:**
- Modify: `api/app/validators/admin_registration.ts`

- [ ] **Step 1 : Écrire le test (fichier test créé plus tard en Task 7 — passer cette étape)**

Ce validator sera testé à travers les tests fonctionnels de Task 7. Continuer.

- [ ] **Step 2 : Ajouter le validator**

Ajouter à la fin de `api/app/validators/admin_registration.ts` :

```typescript
/**
 * Validateur pour l'annulation admin d'une inscription.
 * DELETE /admin/registrations/:id
 * DELETE /admin/registrations/player/:playerId
 */
export const adminCancelRegistrationValidator = vine.compile(
  vine.object({
    refundStatus: vine.enum(['none', 'requested', 'done'] as const),
    refundMethod: vine
      .enum(['cash', 'check', 'bank_transfer'] as const)
      .optional()
      .requiredWhen('refundStatus', '=', 'done'),
  })
)
```

- [ ] **Step 3 : Vérifier le typecheck**

```bash
cd api && node ace typecheck
```

Expected: no errors.

- [ ] **Step 4 : Commit**

```bash
git add api/app/validators/admin_registration.ts
git commit -m "feat: add adminCancelRegistrationValidator"
```

---

## Task 4 : `CancellationService` – méthode `adminCancelRegistration`

**Files:**
- Modify: `api/app/services/cancellation_service.ts`

- [ ] **Step 1 : Étendre le type `CancellationError` et ajouter `CancellationRefundPayload`**

En haut du fichier, modifier la ligne `export type CancellationError = ...` pour ajouter `'NO_ACTIVE_REGISTRATIONS'` :

```typescript
export type CancellationError =
  | 'REGISTRATION_NOT_FOUND'
  | 'PAYMENT_NOT_FOUND'
  | 'NOT_OWNER'
  | 'INVALID_STATUS'
  | 'REFUND_DEADLINE_PASSED'
  | 'MISSING_PAYMENT_ID'
  | 'REFUND_FAILED'
  | 'NO_ACTIVE_REGISTRATIONS'

export interface CancellationRefundPayload {
  refundStatus: 'none' | 'requested' | 'done'
  refundMethod?: 'cash' | 'check' | 'bank_transfer'
}
```

- [ ] **Step 2 : Ajouter la méthode `adminCancelRegistration`**

Ajouter à la fin de la classe `CancellationService`, avant le `}` fermant :

```typescript
  /**
   * Cancel a single registration as admin, with refund tracking.
   * Payments are NOT modified (partial cancellation: payment may cover other active registrations).
   */
  async adminCancelRegistration(
    registrationId: number,
    adminId: number,
    payload: CancellationRefundPayload
  ): Promise<CancellationResult> {
    const registration = await Registration.find(registrationId)

    if (!registration) {
      return { success: false, error: 'REGISTRATION_NOT_FOUND' }
    }

    if (!['paid', 'pending_payment', 'waitlist'].includes(registration.status)) {
      return {
        success: false,
        error: 'INVALID_STATUS',
        message: `Cannot cancel a registration with status '${registration.status}'`,
      }
    }

    const wasWaitlist = registration.status === 'waitlist'
    const tableId = registration.tableId

    registration.status = 'cancelled'
    registration.waitlistRank = null
    registration.cancelledByAdminId = adminId
    registration.refundStatus = payload.refundStatus
    registration.refundMethod = payload.refundMethod ?? null
    registration.refundedAt = payload.refundStatus === 'done' ? DateTime.now() : null
    await registration.save()

    if (wasWaitlist) {
      await waitlistService.recalculateRanks(tableId)
    }

    return { success: true }
  }
```

- [ ] **Step 3 : Vérifier le typecheck**

```bash
cd api && node ace typecheck
```

Expected: no errors.

- [ ] **Step 4 : Commit**

```bash
git add api/app/services/cancellation_service.ts
git commit -m "feat: add adminCancelRegistration to CancellationService"
```

---

## Task 5 : `CancellationService` – méthode `adminCancelAllRegistrations`

**Files:**
- Modify: `api/app/services/cancellation_service.ts`

- [ ] **Step 1 : Ajouter la méthode `adminCancelAllRegistrations`**

Ajouter à la fin de la classe `CancellationService`, après `adminCancelRegistration` :

```typescript
  /**
   * Cancel all active registrations for a player as admin, with refund tracking.
   * Updates linked payments based on refundStatus:
   *   'requested' → payment moves to 'refund_requested'
   *   'done'      → payment moves to 'refunded' with refundedAt and refundMethod
   *   'none'      → payments unchanged
   * Already-refunded payments are skipped.
   */
  async adminCancelAllRegistrations(
    playerId: number,
    adminId: number,
    payload: CancellationRefundPayload
  ): Promise<CancellationResult> {
    const activeRegistrations = await Registration.query()
      .where('player_id', playerId)
      .whereIn('status', ['paid', 'pending_payment', 'waitlist'])
      .preload('payments')

    if (activeRegistrations.length === 0) {
      return { success: false, error: 'NO_ACTIVE_REGISTRATIONS' }
    }

    const waitlistTableIds: number[] = activeRegistrations
      .filter((r) => r.status === 'waitlist')
      .map((r) => r.tableId)

    await db.transaction(async (trx) => {
      const now = DateTime.now()

      // Cancel all active registrations
      for (const registration of activeRegistrations) {
        registration.useTransaction(trx)
        registration.status = 'cancelled'
        registration.waitlistRank = null
        registration.cancelledByAdminId = adminId
        registration.refundStatus = payload.refundStatus
        registration.refundMethod = payload.refundMethod ?? null
        registration.refundedAt = payload.refundStatus === 'done' ? now : null
        await registration.save()
      }

      // Update payments if needed
      if (payload.refundStatus !== 'none') {
        // Collect unique payment IDs across all registrations
        const paymentIds = new Set<number>()
        for (const registration of activeRegistrations) {
          for (const payment of registration.payments) {
            paymentIds.add(payment.id)
          }
        }

        for (const paymentId of paymentIds) {
          const payment = await Payment.query({ client: trx }).where('id', paymentId).first()
          if (!payment) continue
          // Skip payments already in a refunded/refund_requested state
          if (['refunded', 'refund_requested', 'refund_pending'].includes(payment.status)) continue

          if (payload.refundStatus === 'requested') {
            payment.status = 'refund_requested'
          } else {
            // 'done'
            payment.status = 'refunded'
            payment.refundedAt = now
            payment.refundMethod = payload.refundMethod === 'bank_transfer'
              ? 'bank_transfer'
              : payload.refundMethod === 'cash'
              ? 'cash'
              : null
          }
          await payment.save()
        }
      }
    })

    // Recalculate waitlist ranks for affected tables
    for (const tableId of waitlistTableIds) {
      await waitlistService.recalculateRanks(tableId)
    }

    return { success: true }
  }
```

- [ ] **Step 2 : Vérifier le typecheck**

```bash
cd api && node ace typecheck
```

Expected: no errors.

- [ ] **Step 3 : Commit**

```bash
git add api/app/services/cancellation_service.ts
git commit -m "feat: add adminCancelAllRegistrations to CancellationService"
```

---

## Task 6 : Contrôleur + routes + mise à jour de `index`

**Files:**
- Modify: `api/app/controllers/admin_registrations_controller.ts`
- Modify: `api/start/routes.ts`

- [ ] **Step 1 : Ajouter les champs admin cancellation à l'interface `RegistrationData` (contrôleur)**

Dans `admin_registrations_controller.ts`, modifier l'interface `RegistrationData` pour ajouter le champ `adminCancellation` :

```typescript
interface RegistrationData {
  id: number
  status: string
  waitlistRank: number | null
  isAdminCreated: boolean
  checkedInAt: string | null
  createdAt: string
  createdByAdmin: {
    id: number
    fullName: string
    email: string
  } | null
  adminCancellation: {
    cancelledByAdminId: number
    cancelledByAdmin: { id: number; fullName: string; email: string } | null
    refundStatus: 'none' | 'requested' | 'done'
    refundMethod: 'cash' | 'check' | 'bank_transfer' | null
    refundedAt: string | null
  } | null
  player: { ... }   // inchangé
  table: { ... }    // inchangé
  subscriber: { ... } // inchangé
  payment: { ... } | null // inchangé
  payments: { ... }[] // inchangé
}
```

Note : remplacer entièrement le bloc `interface RegistrationData` existant par :

```typescript
interface RegistrationData {
  id: number
  status: string
  waitlistRank: number | null
  isAdminCreated: boolean
  checkedInAt: string | null
  createdAt: string
  createdByAdmin: {
    id: number
    fullName: string
    email: string
  } | null
  adminCancellation: {
    cancelledByAdminId: number
    cancelledByAdmin: { id: number; fullName: string; email: string } | null
    refundStatus: 'none' | 'requested' | 'done'
    refundMethod: 'cash' | 'check' | 'bank_transfer' | null
    refundedAt: string | null
  } | null
  player: {
    id: number
    licence: string
    firstName: string
    lastName: string
    club: string
    points: number
    sex: string | null
    category: string | null
    bibNumber: number | null
  }
  table: {
    id: number
    name: string
    date: string
    startTime: string
  }
  subscriber: {
    id: number
    firstName: string | null
    lastName: string | null
    email: string
    phone: string | null
  }
  payment: {
    id: number
    amount: number
    status: string
    createdAt: string
    helloassoOrderId: string | null
  } | null
  payments: {
    id: number
    amount: number
    status: string
    createdAt: string
    helloassoOrderId: string | null
    payer: {
      id: number
      firstName: string | null
      lastName: string | null
      email: string
    }
  }[]
}
```

- [ ] **Step 2 : Ajouter les imports nécessaires**

En haut du fichier contrôleur, ajouter l'import de `cancellationService` et `adminCancelRegistrationValidator` :

```typescript
import cancellationService, { type CancellationRefundPayload } from '#services/cancellation_service'
import {
  createAdminRegistrationValidator,
  generatePaymentLinkValidator,
  adminCancelRegistrationValidator,
} from '#validators/admin_registration'
```

- [ ] **Step 3 : Modifier la méthode `index` pour inclure les inscriptions annulées par admin**

Remplacer le début de la méthode `index` (la query) :

```typescript
// Avant :
const registrations = await Registration.query()
  .whereNot('status', 'cancelled')
  .preload('player')
  .preload('table')
  .preload('user')
  .preload('createdByAdmin')
  .preload('payments', (query) => {
    query.orderBy('created_at', 'desc')
    query.preload('user')
  })
  .orderBy('created_at', 'desc')

// Après :
const registrations = await Registration.query()
  .where((q) => {
    q.whereNot('status', 'cancelled').orWhere((q2) => {
      q2.where('status', 'cancelled').whereNotNull('cancelled_by_admin_id')
    })
  })
  .preload('player')
  .preload('table')
  .preload('user')
  .preload('createdByAdmin')
  .preload('cancelledByAdmin')
  .preload('payments', (query) => {
    query.orderBy('created_at', 'desc')
    query.preload('user')
  })
  .orderBy('created_at', 'desc')
```

- [ ] **Step 4 : Modifier le formatage dans `index` pour inclure `adminCancellation`**

Dans `index`, modifier le `.map()` qui construit les `formattedRegistrations` pour ajouter le champ :

```typescript
// Dans le return du .map() de formattedRegistrations, ajouter après createdByAdmin :
adminCancellation: reg.cancelledByAdminId
  ? {
      cancelledByAdminId: reg.cancelledByAdminId,
      cancelledByAdmin: reg.cancelledByAdmin
        ? {
            id: reg.cancelledByAdmin.id,
            fullName: reg.cancelledByAdmin.fullName,
            email: reg.cancelledByAdmin.email,
          }
        : null,
      refundStatus: reg.refundStatus as 'none' | 'requested' | 'done',
      refundMethod: reg.refundMethod as 'cash' | 'check' | 'bank_transfer' | null,
      refundedAt: reg.refundedAt ? reg.refundedAt.toISO()! : null,
    }
  : null,
```

- [ ] **Step 5 : Ajouter la méthode `cancelOne`**

Ajouter à la fin de la classe `AdminRegistrationsController`, après `generatePaymentLink` :

```typescript
  /**
   * Cancel a single registration as admin.
   * DELETE /admin/registrations/:id
   */
  async cancelOne(ctx: HttpContext) {
    const registrationId = Number(ctx.params.id)
    const admin = ctx.auth.use('admin').user!
    const payload = await ctx.request.validateUsing(adminCancelRegistrationValidator)

    const result = await cancellationService.adminCancelRegistration(
      registrationId,
      admin.id,
      payload as CancellationRefundPayload
    )

    if (!result.success) {
      if (result.error === 'REGISTRATION_NOT_FOUND') {
        return notFound(ctx, 'Registration not found')
      }
      return badRequest(ctx, result.message ?? result.error ?? 'Cancellation failed')
    }

    return success(ctx, { message: 'Registration cancelled by admin' })
  }

  /**
   * Cancel all active registrations of a player as admin.
   * DELETE /admin/registrations/player/:playerId
   */
  async cancelAll(ctx: HttpContext) {
    const playerId = Number(ctx.params.playerId)
    const admin = ctx.auth.use('admin').user!
    const payload = await ctx.request.validateUsing(adminCancelRegistrationValidator)

    const result = await cancellationService.adminCancelAllRegistrations(
      playerId,
      admin.id,
      payload as CancellationRefundPayload
    )

    if (!result.success) {
      if (result.error === 'NO_ACTIVE_REGISTRATIONS') {
        return badRequest(ctx, 'No active registrations found for this player')
      }
      return badRequest(ctx, result.message ?? result.error ?? 'Cancellation failed')
    }

    return success(ctx, { message: 'All registrations cancelled by admin' })
  }
```

- [ ] **Step 6 : Ajouter les routes dans `routes.ts`**

Dans `api/start/routes.ts`, dans le groupe admin protégé, ajouter **avant** la ligne `router.get('/registrations', ...)` les deux routes DELETE. L'ordre est important : `/player/:playerId` doit être déclaré **avant** `/:id` pour éviter que `:id` capture le segment `player`.

```typescript
// Ajouter ces deux lignes dans le groupe registrations admin,
// AVANT router.get('/registrations', ...)
router.delete('/registrations/player/:playerId', [AdminRegistrationsController, 'cancelAll'])
router.delete('/registrations/:id', [AdminRegistrationsController, 'cancelOne'])
```

- [ ] **Step 7 : Vérifier le typecheck**

```bash
cd api && node ace typecheck
```

Expected: no errors.

- [ ] **Step 8 : Commit**

```bash
git add api/app/controllers/admin_registrations_controller.ts api/start/routes.ts
git commit -m "feat: add cancelOne and cancelAll to AdminRegistrationsController"
```

---

## Task 7 : Tests fonctionnels backend

**Files:**
- Create: `api/tests/functional/admin_cancel_registration.spec.ts`

- [ ] **Step 1 : Créer le fichier de test**

```typescript
// api/tests/functional/admin_cancel_registration.spec.ts
import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import Admin from '#models/admin'
import Tournament from '#models/tournament'
import Table from '#models/table'
import Player from '#models/player'
import Registration from '#models/registration'
import User from '#models/user'
import Payment from '#models/payment'
import TournamentPlayer from '#models/tournament_player'

test.group('Admin Cancel | DELETE /admin/registrations/:id', (group) => {
  group.each.setup(async () => {
    await Registration.query().delete()
    await TournamentPlayer.query().delete()
    await Payment.query().delete()
    await Table.query().delete()
    await Player.query().delete()
    await User.query().delete()
    await Tournament.query().delete()
    await Admin.updateOrCreate(
      { email: 'admin@example.com' },
      { fullName: 'Admin', password: 'password' }
    )
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
      pointsMin: 500,
      pointsMax: 1500,
      quota: 32,
      price: 10,
      isSpecial: false,
    })
    const user = await User.create({ email: 'player@example.com' })
    const player = await Player.create({
      userId: user.id,
      licence: '1234567',
      firstName: 'Jean',
      lastName: 'Dupont',
      club: 'TT Club',
      points: 800,
    })
    return { admin, tournament, table, user, player }
  }

  test('returns 404 when registration does not exist', async ({ client }) => {
    const admin = await Admin.findByOrFail('email', 'admin@example.com')

    const response = await client
      .delete('/admin/registrations/99999')
      .json({ refundStatus: 'none' })
      .withGuard('admin')
      .loginAs(admin)

    response.assertStatus(404)
  })

  test('returns 400 when registration is already cancelled', async ({ client }) => {
    const { admin, table, user, player } = await createFixtures()

    const registration = await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: table.id,
      status: 'cancelled',
    })

    const response = await client
      .delete(`/admin/registrations/${registration.id}`)
      .json({ refundStatus: 'none' })
      .withGuard('admin')
      .loginAs(admin)

    response.assertStatus(400)
    response.assertBodyContains({ status: 'error' })
  })

  test('cancels a paid registration without refund', async ({ client, assert }) => {
    const { admin, table, user, player } = await createFixtures()

    const registration = await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: table.id,
      status: 'paid',
    })

    const response = await client
      .delete(`/admin/registrations/${registration.id}`)
      .json({ refundStatus: 'none' })
      .withGuard('admin')
      .loginAs(admin)

    response.assertStatus(200)
    response.assertBodyContains({ status: 'success' })

    await registration.refresh()
    assert.equal(registration.status, 'cancelled')
    assert.equal(registration.cancelledByAdminId, admin.id)
    assert.equal(registration.refundStatus, 'none')
    assert.isNull(registration.refundMethod)
    assert.isNull(registration.refundedAt)
  })

  test('cancels a paid registration with refund requested', async ({ client, assert }) => {
    const { admin, table, user, player } = await createFixtures()

    const registration = await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: table.id,
      status: 'paid',
    })

    const response = await client
      .delete(`/admin/registrations/${registration.id}`)
      .json({ refundStatus: 'requested' })
      .withGuard('admin')
      .loginAs(admin)

    response.assertStatus(200)

    await registration.refresh()
    assert.equal(registration.status, 'cancelled')
    assert.equal(registration.refundStatus, 'requested')
  })

  test('cancels a paid registration with refund done (cash)', async ({ client, assert }) => {
    const { admin, table, user, player } = await createFixtures()

    const registration = await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: table.id,
      status: 'paid',
    })

    const response = await client
      .delete(`/admin/registrations/${registration.id}`)
      .json({ refundStatus: 'done', refundMethod: 'cash' })
      .withGuard('admin')
      .loginAs(admin)

    response.assertStatus(200)

    await registration.refresh()
    assert.equal(registration.status, 'cancelled')
    assert.equal(registration.refundStatus, 'done')
    assert.equal(registration.refundMethod, 'cash')
    assert.isNotNull(registration.refundedAt)
  })

  test('returns 400 when refundStatus=done but refundMethod missing', async ({ client }) => {
    const { admin, table, user, player } = await createFixtures()

    const registration = await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: table.id,
      status: 'paid',
    })

    const response = await client
      .delete(`/admin/registrations/${registration.id}`)
      .json({ refundStatus: 'done' })
      .withGuard('admin')
      .loginAs(admin)

    response.assertStatus(422)
  })

  test('does not modify payments on single registration cancel', async ({ client, assert }) => {
    const { admin, table, user, player } = await createFixtures()

    const registration = await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: table.id,
      status: 'paid',
    })
    const payment = await Payment.create({
      userId: user.id,
      helloassoCheckoutIntentId: 'test-intent',
      amount: 1000,
      status: 'succeeded',
      paymentMethod: 'cash',
    })
    await payment.related('registrations').attach([registration.id])

    await client
      .delete(`/admin/registrations/${registration.id}`)
      .json({ refundStatus: 'requested' })
      .withGuard('admin')
      .loginAs(admin)

    await payment.refresh()
    assert.equal(payment.status, 'succeeded') // payment NOT modified for single cancel
  })

  test('unauthenticated request returns 401', async ({ client }) => {
    const response = await client
      .delete('/admin/registrations/1')
      .json({ refundStatus: 'none' })

    response.assertStatus(401)
  })
})

test.group('Admin Cancel | DELETE /admin/registrations/player/:playerId', (group) => {
  group.each.setup(async () => {
    await Registration.query().delete()
    await TournamentPlayer.query().delete()
    await Payment.query().delete()
    await Table.query().delete()
    await Player.query().delete()
    await User.query().delete()
    await Tournament.query().delete()
    await Admin.updateOrCreate(
      { email: 'admin@example.com' },
      { fullName: 'Admin', password: 'password' }
    )
  })

  async function createFixtures() {
    const admin = await Admin.findByOrFail('email', 'admin@example.com')
    const tournament = await Tournament.create({
      name: 'Test Tournament',
      startDate: DateTime.now().plus({ days: 30 }),
      endDate: DateTime.now().plus({ days: 31 }),
      location: 'Paris',
    })
    const tableA = await Table.create({
      tournamentId: tournament.id,
      name: 'Tableau A',
      date: tournament.startDate,
      startTime: '10:00',
      pointsMin: 500,
      pointsMax: 1500,
      quota: 32,
      price: 10,
      isSpecial: false,
    })
    const tableB = await Table.create({
      tournamentId: tournament.id,
      name: 'Tableau B',
      date: tournament.startDate,
      startTime: '14:00',
      pointsMin: 500,
      pointsMax: 1500,
      quota: 32,
      price: 10,
      isSpecial: false,
    })
    const user = await User.create({ email: 'player@example.com' })
    const player = await Player.create({
      userId: user.id,
      licence: '1234567',
      firstName: 'Jean',
      lastName: 'Dupont',
      club: 'TT Club',
      points: 800,
    })
    return { admin, tournament, tableA, tableB, user, player }
  }

  test('returns 400 when player has no active registrations', async ({ client }) => {
    const { admin, player } = await createFixtures()

    const response = await client
      .delete(`/admin/registrations/player/${player.id}`)
      .json({ refundStatus: 'none' })
      .withGuard('admin')
      .loginAs(admin)

    response.assertStatus(400)
    response.assertBodyContains({ status: 'error' })
  })

  test('cancels all active registrations without refund', async ({ client, assert }) => {
    const { admin, tableA, tableB, user, player } = await createFixtures()

    const regA = await Registration.create({
      userId: user.id, playerId: player.id, tableId: tableA.id, status: 'paid',
    })
    const regB = await Registration.create({
      userId: user.id, playerId: player.id, tableId: tableB.id, status: 'pending_payment',
    })

    const response = await client
      .delete(`/admin/registrations/player/${player.id}`)
      .json({ refundStatus: 'none' })
      .withGuard('admin')
      .loginAs(admin)

    response.assertStatus(200)

    await regA.refresh()
    await regB.refresh()
    assert.equal(regA.status, 'cancelled')
    assert.equal(regB.status, 'cancelled')
    assert.equal(regA.cancelledByAdminId, admin.id)
    assert.equal(regB.refundStatus, 'none')
  })

  test('cancels all and marks payments as refund_requested when refundStatus=requested', async ({ client, assert }) => {
    const { admin, tableA, user, player } = await createFixtures()

    const registration = await Registration.create({
      userId: user.id, playerId: player.id, tableId: tableA.id, status: 'paid',
    })
    const payment = await Payment.create({
      userId: user.id,
      helloassoCheckoutIntentId: 'test-intent',
      amount: 1000,
      status: 'succeeded',
      paymentMethod: 'cash',
    })
    await payment.related('registrations').attach([registration.id])

    const response = await client
      .delete(`/admin/registrations/player/${player.id}`)
      .json({ refundStatus: 'requested' })
      .withGuard('admin')
      .loginAs(admin)

    response.assertStatus(200)

    await payment.refresh()
    assert.equal(payment.status, 'refund_requested')
  })

  test('cancels all and marks payments as refunded when refundStatus=done', async ({ client, assert }) => {
    const { admin, tableA, user, player } = await createFixtures()

    const registration = await Registration.create({
      userId: user.id, playerId: player.id, tableId: tableA.id, status: 'paid',
    })
    const payment = await Payment.create({
      userId: user.id,
      helloassoCheckoutIntentId: 'test-intent',
      amount: 1000,
      status: 'succeeded',
      paymentMethod: 'cash',
    })
    await payment.related('registrations').attach([registration.id])

    const response = await client
      .delete(`/admin/registrations/player/${player.id}`)
      .json({ refundStatus: 'done', refundMethod: 'bank_transfer' })
      .withGuard('admin')
      .loginAs(admin)

    response.assertStatus(200)

    await payment.refresh()
    assert.equal(payment.status, 'refunded')
    assert.isNotNull(payment.refundedAt)
    assert.equal(payment.refundMethod, 'bank_transfer')
  })

  test('skips already-refunded payments', async ({ client, assert }) => {
    const { admin, tableA, user, player } = await createFixtures()

    const registration = await Registration.create({
      userId: user.id, playerId: player.id, tableId: tableA.id, status: 'paid',
    })
    const payment = await Payment.create({
      userId: user.id,
      helloassoCheckoutIntentId: 'test-intent',
      amount: 1000,
      status: 'refunded',
      paymentMethod: 'cash',
    })
    await payment.related('registrations').attach([registration.id])

    await client
      .delete(`/admin/registrations/player/${player.id}`)
      .json({ refundStatus: 'requested' })
      .withGuard('admin')
      .loginAs(admin)

    await payment.refresh()
    assert.equal(payment.status, 'refunded') // unchanged
  })

  test('does not cancel already-cancelled registrations', async ({ client, assert }) => {
    const { admin, tableA, tableB, user, player } = await createFixtures()

    // regA is cancelled (user-initiated), regB is active
    await Registration.create({
      userId: user.id, playerId: player.id, tableId: tableA.id, status: 'cancelled',
    })
    const regB = await Registration.create({
      userId: user.id, playerId: player.id, tableId: tableB.id, status: 'paid',
    })

    const response = await client
      .delete(`/admin/registrations/player/${player.id}`)
      .json({ refundStatus: 'none' })
      .withGuard('admin')
      .loginAs(admin)

    response.assertStatus(200)

    await regB.refresh()
    assert.equal(regB.status, 'cancelled')
    assert.equal(regB.cancelledByAdminId, admin.id)
  })
})
```

- [ ] **Step 2 : Lancer les tests**

```bash
cd api && node ace test tests/functional/admin_cancel_registration.spec.ts
```

Expected: all tests pass.

- [ ] **Step 3 : Commit**

```bash
git add api/tests/functional/admin_cancel_registration.spec.ts
git commit -m "test: admin cancel registration functional tests"
```

---

## Task 8 : Types frontend – `adminTypes.ts`

**Files:**
- Modify: `web/src/features/registrations/types/adminTypes.ts`

- [ ] **Step 1 : Ajouter le type `AdminCancellationInfo` et mettre à jour les interfaces**

Ajouter après les interfaces existantes, et mettre à jour `RegistrationData` et `RegistrationGroup` :

```typescript
// Ajouter ce nouveau type :
export interface AdminCancellationInfo {
  cancelledByAdminId: number
  cancelledByAdmin: { id: number; fullName: string; email: string } | null
  refundStatus: 'none' | 'requested' | 'done'
  refundMethod: 'cash' | 'check' | 'bank_transfer' | null
  refundedAt: string | null
}
```

Dans `RegistrationData`, ajouter après `createdByAdmin` :

```typescript
adminCancellation: AdminCancellationInfo | null
```

Dans `RegistrationGroup`, le type des tables inclut désormais `adminCancellation`. Modifier la définition du champ `tables` dans l'interface `RegistrationGroup` :

```typescript
tables: (TableInfo & {
  registrationId: number
  status: string
  checkedInAt: string | null
  waitlistRank: number | null
  adminCancellation: AdminCancellationInfo | null
})[]
```

- [ ] **Step 2 : Vérifier le typecheck frontend**

```bash
cd web && pnpm typecheck
```

Expected: errors sur les fichiers qui utilisent `RegistrationGroup` et `RegistrationData` (car le nouveau champ est requis). Ces erreurs seront corrigées dans les prochaines tâches.

- [ ] **Step 3 : Commit**

```bash
git add web/src/features/registrations/types/adminTypes.ts
git commit -m "feat: add AdminCancellationInfo type to frontend types"
```

---

## Task 9 : API et hooks TanStack Query

**Files:**
- Modify: `web/src/features/registrations/api/adminApi.ts`
- Modify: `web/src/features/registrations/hooks/adminHooks.ts`

- [ ] **Step 1 : Ajouter les fonctions API dans `adminApi.ts`**

Ajouter à la fin du fichier :

```typescript
export interface AdminCancelPayload {
  refundStatus: 'none' | 'requested' | 'done'
  refundMethod?: 'cash' | 'check' | 'bank_transfer'
}

export async function adminCancelRegistration(
  registrationId: number,
  payload: AdminCancelPayload
): Promise<{ message: string }> {
  const response = await api.delete<{ message: string }>(
    `/admin/registrations/${registrationId}`,
    { data: payload }
  )
  return response.data
}

export async function adminCancelAllRegistrations(
  playerId: number,
  payload: AdminCancelPayload
): Promise<{ message: string }> {
  const response = await api.delete<{ message: string }>(
    `/admin/registrations/player/${playerId}`,
    { data: payload }
  )
  return response.data
}
```

- [ ] **Step 2 : Ajouter les hooks dans `adminHooks.ts`**

Ajouter les imports nécessaires en haut de `adminHooks.ts` :

```typescript
import {
  fetchAdminRegistrations,
  promoteRegistration,
  createAdminRegistration,
  generatePaymentLink,
  collectPayment,
  adminCancelRegistration,
  adminCancelAllRegistrations,
  type CreateAdminRegistrationPayload,
  type AdminCancelPayload,
} from '../api/adminApi'
```

Ajouter les hooks après `useCollectPayment` :

```typescript
export function useAdminCancelRegistration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ registrationId, payload }: { registrationId: number; payload: AdminCancelPayload }) =>
      adminCancelRegistration(registrationId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'registrations'] })
    },
  })
}

export function useAdminCancelAllRegistrations() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ playerId, payload }: { playerId: number; payload: AdminCancelPayload }) =>
      adminCancelAllRegistrations(playerId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'registrations'] })
    },
  })
}
```

- [ ] **Step 3 : Mettre à jour `buildRegistrationGroups` pour transmettre `adminCancellation`**

Dans `adminHooks.ts`, dans la fonction `buildRegistrationGroups`, modifier le mapping des tables dans `groups.push(...)` :

```typescript
// Avant :
tables: regs.map((r) => ({
  ...r.table,
  registrationId: r.id,
  status: r.status,
  checkedInAt: r.checkedInAt,
  waitlistRank: r.waitlistRank,
})),

// Après :
tables: regs.map((r) => ({
  ...r.table,
  registrationId: r.id,
  status: r.status,
  checkedInAt: r.checkedInAt,
  waitlistRank: r.waitlistRank,
  adminCancellation: r.adminCancellation ?? null,
})),
```

- [ ] **Step 4 : Vérifier le typecheck**

```bash
cd web && pnpm typecheck
```

Expected: errors résiduels uniquement dans les fichiers non encore mis à jour (modales, etc.). Continuer.

- [ ] **Step 5 : Commit**

```bash
git add web/src/features/registrations/api/adminApi.ts \
        web/src/features/registrations/hooks/adminHooks.ts
git commit -m "feat: add admin cancel API functions and TanStack Query hooks"
```

---

## Task 10 : `AdminCancelRegistrationModal` – annulation d'un tableau unique

**Files:**
- Create: `web/src/features/registrations/components/admin/AdminCancelRegistrationModal.tsx`

- [ ] **Step 1 : Créer le composant**

```typescript
// web/src/features/registrations/components/admin/AdminCancelRegistrationModal.tsx
import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { Label } from '@components/ui/label'
import type { AdminCancelPayload } from '../../api/adminApi'

interface AdminCancelRegistrationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tableName: string
  registrationId: number
  onConfirm: (payload: AdminCancelPayload) => void
  isPending: boolean
}

const REFUND_OPTIONS = [
  { value: 'none', label: 'Pas de remboursement' },
  { value: 'requested', label: 'Remboursement à traiter' },
  { value: 'done', label: 'Remboursement déjà effectué' },
] as const

const REFUND_METHODS = [
  { value: 'cash', label: 'Espèces' },
  { value: 'check', label: 'Chèque' },
  { value: 'bank_transfer', label: 'Virement' },
] as const

export function AdminCancelRegistrationModal({
  open,
  onOpenChange,
  tableName,
  onConfirm,
  isPending,
}: AdminCancelRegistrationModalProps) {
  const [refundStatus, setRefundStatus] = useState<'none' | 'requested' | 'done' | null>(null)
  const [refundMethod, setRefundMethod] = useState<'cash' | 'check' | 'bank_transfer' | null>(null)

  const canConfirm =
    refundStatus !== null &&
    (refundStatus !== 'done' || refundMethod !== null)

  function handleConfirm() {
    if (!refundStatus) return
    const payload: AdminCancelPayload = {
      refundStatus,
      ...(refundStatus === 'done' && refundMethod ? { refundMethod } : {}),
    }
    onConfirm(payload)
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      setRefundStatus(null)
      setRefundMethod(null)
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md neo-brutal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Annuler ce tableau
          </DialogTitle>
          <DialogDescription>
            Annulation de <strong>{tableName}</strong>. Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="text-sm font-bold uppercase text-muted-foreground tracking-wide">
              Remboursement
            </Label>
            <div className="space-y-2">
              {REFUND_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-3 p-3 border-2 cursor-pointer hover:border-foreground transition-colors"
                  style={{ borderColor: refundStatus === opt.value ? 'hsl(var(--foreground))' : undefined }}
                >
                  <input
                    type="radio"
                    name="refundStatus"
                    value={opt.value}
                    checked={refundStatus === opt.value}
                    onChange={() => {
                      setRefundStatus(opt.value)
                      setRefundMethod(null)
                    }}
                    className="accent-foreground"
                  />
                  <span className="text-sm font-medium">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {refundStatus === 'done' && (
            <div className="space-y-2">
              <Label className="text-sm font-bold uppercase text-muted-foreground tracking-wide">
                Méthode de remboursement
              </Label>
              <div className="space-y-2">
                {REFUND_METHODS.map((m) => (
                  <label
                    key={m.value}
                    className="flex items-center gap-3 p-3 border-2 cursor-pointer hover:border-foreground transition-colors"
                    style={{ borderColor: refundMethod === m.value ? 'hsl(var(--foreground))' : undefined }}
                  >
                    <input
                      type="radio"
                      name="refundMethod"
                      value={m.value}
                      checked={refundMethod === m.value}
                      onChange={() => setRefundMethod(m.value)}
                      className="accent-foreground"
                    />
                    <span className="text-sm font-medium">{m.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!canConfirm || isPending}
          >
            {isPending ? 'Annulation...' : 'Confirmer l\'annulation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2 : Vérifier le typecheck**

```bash
cd web && pnpm typecheck
```

Expected: no new errors from this file.

- [ ] **Step 3 : Commit**

```bash
git add web/src/features/registrations/components/admin/AdminCancelRegistrationModal.tsx
git commit -m "feat: add AdminCancelRegistrationModal component"
```

---

## Task 11 : `AdminCancelPlayerModal` – annulation complète d'un joueur

**Files:**
- Create: `web/src/features/registrations/components/admin/AdminCancelPlayerModal.tsx`

- [ ] **Step 1 : Créer le composant**

```typescript
// web/src/features/registrations/components/admin/AdminCancelPlayerModal.tsx
import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { Label } from '@components/ui/label'
import type { AggregatedPlayerRow } from '../../types'
import type { AdminCancelPayload } from '../../api/adminApi'

interface AdminCancelPlayerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  player: AggregatedPlayerRow | null
  onConfirm: (payload: AdminCancelPayload) => void
  isPending: boolean
}

const REFUND_OPTIONS = [
  { value: 'none', label: 'Pas de remboursement' },
  { value: 'requested', label: 'Remboursement à traiter (apparaîtra dans la queue paiements)' },
  { value: 'done', label: 'Remboursement déjà effectué' },
] as const

const REFUND_METHODS = [
  { value: 'cash', label: 'Espèces' },
  { value: 'check', label: 'Chèque' },
  { value: 'bank_transfer', label: 'Virement' },
] as const

export function AdminCancelPlayerModal({
  open,
  onOpenChange,
  player,
  onConfirm,
  isPending,
}: AdminCancelPlayerModalProps) {
  const [refundStatus, setRefundStatus] = useState<'none' | 'requested' | 'done' | null>(null)
  const [refundMethod, setRefundMethod] = useState<'cash' | 'check' | 'bank_transfer' | null>(null)

  if (!player) return null

  const activeTables = player.tables.filter((t) => {
    const status = player.registrationStatuses[t.id]
    return ['paid', 'pending_payment', 'waitlist'].includes(status)
  })

  const canConfirm =
    refundStatus !== null &&
    (refundStatus !== 'done' || refundMethod !== null)

  function handleConfirm() {
    if (!refundStatus) return
    const payload: AdminCancelPayload = {
      refundStatus,
      ...(refundStatus === 'done' && refundMethod ? { refundMethod } : {}),
    }
    onConfirm(payload)
  }

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      setRefundStatus(null)
      setRefundMethod(null)
    }
    onOpenChange(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md neo-brutal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Désinscrire le joueur
          </DialogTitle>
          <DialogDescription>
            Annulation de toutes les inscriptions de{' '}
            <strong>
              {player.firstName} {player.lastName.toUpperCase()}
            </strong>
            . Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase text-muted-foreground tracking-wide">
              Tableaux concernés ({activeTables.length})
            </p>
            <ul className="space-y-1">
              {activeTables.map((t) => (
                <li key={t.id} className="text-sm px-2 py-1 bg-muted/30 border border-foreground/10">
                  {t.name}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold uppercase text-muted-foreground tracking-wide">
              Remboursement
            </Label>
            <div className="space-y-2">
              {REFUND_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-3 p-3 border-2 cursor-pointer hover:border-foreground transition-colors"
                  style={{ borderColor: refundStatus === opt.value ? 'hsl(var(--foreground))' : undefined }}
                >
                  <input
                    type="radio"
                    name="refundStatus"
                    value={opt.value}
                    checked={refundStatus === opt.value}
                    onChange={() => {
                      setRefundStatus(opt.value)
                      setRefundMethod(null)
                    }}
                    className="accent-foreground"
                  />
                  <span className="text-sm font-medium">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {refundStatus === 'done' && (
            <div className="space-y-2">
              <Label className="text-sm font-bold uppercase text-muted-foreground tracking-wide">
                Méthode de remboursement
              </Label>
              <div className="space-y-2">
                {REFUND_METHODS.map((m) => (
                  <label
                    key={m.value}
                    className="flex items-center gap-3 p-3 border-2 cursor-pointer hover:border-foreground transition-colors"
                    style={{ borderColor: refundMethod === m.value ? 'hsl(var(--foreground))' : undefined }}
                  >
                    <input
                      type="radio"
                      name="refundMethod"
                      value={m.value}
                      checked={refundMethod === m.value}
                      onChange={() => setRefundMethod(m.value)}
                      className="accent-foreground"
                    />
                    <span className="text-sm font-medium">{m.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
            Fermer
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!canConfirm || isPending}
          >
            {isPending ? 'Annulation...' : `Désinscrire de ${activeTables.length} tableau(x)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2 : Vérifier le typecheck**

```bash
cd web && pnpm typecheck
```

Expected: no new errors from this file.

- [ ] **Step 3 : Commit**

```bash
git add web/src/features/registrations/components/admin/AdminCancelPlayerModal.tsx
git commit -m "feat: add AdminCancelPlayerModal component"
```

---

## Task 12 : `adminColumns.tsx` – colonne "Désinscrire"

**Files:**
- Modify: `web/src/features/registrations/components/admin/adminColumns.tsx`

- [ ] **Step 1 : Ajouter l'import `UserX` et la fonction `createActionsColumn`**

En haut du fichier, ajouter `UserX` à l'import de lucide-react :

```typescript
import { CheckCircle, CreditCard, Clock, ShieldCheck, UserCheck, ArrowUp, Link2, UserX } from 'lucide-react'
```

Ajouter avant la fonction `createAllPlayersColumns` :

```typescript
interface ActionsColumnOptions {
  onCancelAllClick?: (player: AggregatedPlayerRow) => void
}

/**
 * Colonne d'actions pour la vue "Tous les joueurs".
 * Affiche un bouton "Désinscrire" si le joueur a au moins une inscription active.
 */
export function createActionsColumn(options: ActionsColumnOptions = {}): PlayerTableColumn<AggregatedPlayerRow> {
  const { onCancelAllClick } = options

  return {
    key: 'actions',
    header: '',
    sortable: false,
    render: (player) => {
      const hasActiveRegistration = Object.values(player.registrationStatuses).some(
        (s) => ['paid', 'pending_payment', 'waitlist'].includes(s)
      )

      if (!hasActiveRegistration || !onCancelAllClick) return null

      return (
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation()
            onCancelAllClick(player)
          }}
          className="h-6 px-2 text-xs border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          title="Désinscrire ce joueur de tous ses tableaux actifs"
        >
          <UserX className="w-3 h-3 mr-1" />
          Désinscrire
        </Button>
      )
    },
  }
}
```

- [ ] **Step 2 : Mettre à jour `createAllPlayersColumns` pour inclure la colonne d'actions**

```typescript
// Avant :
export function createAllPlayersColumns(): PlayerTableColumn<AggregatedPlayerRow>[] {
  return [...createAdminBaseColumns(), createTablesColumn(), createDateColumn()]
}

// Après :
export function createAllPlayersColumns(options: ActionsColumnOptions = {}): PlayerTableColumn<AggregatedPlayerRow>[] {
  return [...createAdminBaseColumns(), createTablesColumn(), createDateColumn(), createActionsColumn(options)]
}
```

- [ ] **Step 3 : Vérifier le typecheck**

```bash
cd web && pnpm typecheck
```

Expected: erreur dans `AdminRegistrationsPage.tsx` car la signature de `createAllPlayersColumns` a changé. Correction dans Task 14.

- [ ] **Step 4 : Commit**

```bash
git add web/src/features/registrations/components/admin/adminColumns.tsx
git commit -m "feat: add Désinscrire action column to admin player table"
```

---

## Task 13 : `PlayerDetailsModal.tsx` – bouton annulation + affichage statut

**Files:**
- Modify: `web/src/features/registrations/components/admin/PlayerDetailsModal.tsx`

- [ ] **Step 1 : Ajouter les imports nécessaires**

En haut du fichier, ajouter :

```typescript
import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { AdminCancelRegistrationModal } from './AdminCancelRegistrationModal'
import { useAdminCancelRegistration } from '../../hooks/adminHooks'
import type { AdminCancelPayload } from '../../api/adminApi'
import { REFUND_METHOD_LABELS } from '@constants/status-mappings'
import { formatDateTimeLong } from '@lib/formatting-helpers'
```

Remplacer la ligne `import { User, Mail, Phone, CreditCard, LayoutList, ShieldCheck, Banknote } from 'lucide-react'` par :

```typescript
import { User, Mail, Phone, CreditCard, LayoutList, ShieldCheck, Banknote, Trash2 } from 'lucide-react'
```

- [ ] **Step 2 : Ajouter l'état et la logique d'annulation dans `PlayerDetailsModal`**

Dans la fonction `PlayerDetailsModal`, après `const groups = player.registrationGroups`, ajouter :

```typescript
  const [cancelTarget, setCancelTarget] = useState<{
    registrationId: number
    tableName: string
  } | null>(null)

  const { mutate: cancelRegistration, isPending: isCancelling } = useAdminCancelRegistration()

  function handleCancelConfirm(payload: AdminCancelPayload) {
    if (!cancelTarget) return
    cancelRegistration(
      { registrationId: cancelTarget.registrationId, payload },
      {
        onSuccess: () => {
          toast.success(`Inscription annulée`)
          setCancelTarget(null)
          onOpenChange(false)
        },
        onError: (err) => {
          toast.error(`Erreur : ${err.message}`)
        },
      }
    )
  }
```

- [ ] **Step 3 : Ajouter la modale et passer la callback aux cartes de groupe**

À la fin du JSX de `PlayerDetailsModal`, avant la fermeture du `<Dialog>`, ajouter :

```tsx
        {cancelTarget && (
          <AdminCancelRegistrationModal
            open={cancelTarget !== null}
            onOpenChange={(open) => { if (!open) setCancelTarget(null) }}
            tableName={cancelTarget.tableName}
            registrationId={cancelTarget.registrationId}
            onConfirm={handleCancelConfirm}
            isPending={isCancelling}
          />
        )}
```

Dans le `groups.map()`, passer la callback au composant `RegistrationGroupCard` :

```tsx
{groups.map((group, index) => (
  <RegistrationGroupCard
    key={group.groupId}
    group={group}
    index={index + 1}
    onCancelTable={(registrationId, tableName) => setCancelTarget({ registrationId, tableName })}
  />
))}
```

- [ ] **Step 4 : Mettre à jour `RegistrationGroupCard` pour afficher le bouton et le statut d'annulation**

Modifier l'interface `RegistrationGroupCardProps` :

```typescript
interface RegistrationGroupCardProps {
  group: RegistrationGroup
  index: number
  onCancelTable: (registrationId: number, tableName: string) => void
}
```

Dans `RegistrationGroupCard`, modifier le `.map()` des tables pour ajouter le bouton "Annuler ce tableau" et l'affichage du statut d'annulation :

```tsx
{group.tables
  .sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date)
    if (dateCompare !== 0) return dateCompare
    return a.startTime.localeCompare(b.startTime)
  })
  .map((table) => {
    const statusInfo = getRegistrationStatusText(table.status)
    const isActive = ['paid', 'pending_payment', 'waitlist'].includes(table.status)
    const adminCancelled = table.adminCancellation

    return (
      <div
        key={table.id}
        className="flex items-center justify-between p-2 border-2 border-foreground/5 bg-background hover:border-foreground/20 transition-colors"
      >
        <div className="flex flex-col gap-1 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col">
              <span className="font-bold text-sm">{table.name}</span>
              <span className="text-xs text-muted-foreground">
                {formatDateShort(table.date)} • {table.startTime}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={(STATUS_BADGE_VARIANTS[table.status] as BadgeVariant) ?? 'neutral'}>
                {statusInfo.label}
              </Badge>
              {adminCancelled && (
                <Badge variant="neutral" className="text-xs">
                  Annulé par admin
                </Badge>
              )}
              {isActive && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onCancelTable(table.registrationId, table.name)}
                  className="h-6 px-2 text-xs border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  title="Annuler ce tableau"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Annuler
                </Button>
              )}
            </div>
          </div>
          {adminCancelled && (
            <p className="text-xs text-muted-foreground mt-1">
              {adminCancelled.refundStatus === 'none' && 'Sans remboursement'}
              {adminCancelled.refundStatus === 'requested' && 'Remboursement à traiter'}
              {adminCancelled.refundStatus === 'done' &&
                `Remboursé${adminCancelled.refundedAt ? ` le ${formatDateTimeLong(adminCancelled.refundedAt)}` : ''}${adminCancelled.refundMethod ? ` par ${REFUND_METHOD_LABELS[adminCancelled.refundMethod] ?? adminCancelled.refundMethod}` : ''}`}
            </p>
          )}
        </div>
      </div>
    )
  })}
```

- [ ] **Step 5 : Vérifier le typecheck**

```bash
cd web && pnpm typecheck
```

Expected: aucune erreur sur ces fichiers (peut rester des erreurs dans `AdminRegistrationsPage` — corrigées en Task 14).

- [ ] **Step 6 : Commit**

```bash
git add web/src/features/registrations/components/admin/PlayerDetailsModal.tsx
git commit -m "feat: add cancel table button and admin cancellation status to PlayerDetailsModal"
```

---

## Task 14 : `AdminRegistrationsPage.tsx` – câblage `AdminCancelPlayerModal`

**Files:**
- Modify: `web/src/features/registrations/pages/AdminRegistrationsPage.tsx`

- [ ] **Step 1 : Ajouter les imports**

Ajouter dans les imports existants :

```typescript
import { AdminCancelPlayerModal } from '../components/admin/AdminCancelPlayerModal'
import { useAdminCancelAllRegistrations } from '../hooks'
import { createAllPlayersColumns } from '../components/admin/adminColumns'
import type { AdminCancelPayload } from '../api/adminApi'
import { toast } from 'sonner'
```

- [ ] **Step 2 : Ajouter l'état et la logique de cancel player**

Dans `AdminRegistrationsPage`, après les états existants (`selectedPlayer`, etc.), ajouter :

```typescript
  const [cancelPlayerTarget, setCancelPlayerTarget] = useState<AggregatedPlayerRow | null>(null)
  const { mutate: cancelAllRegistrations, isPending: isCancellingAll } = useAdminCancelAllRegistrations()

  function handleCancelAllConfirm(payload: AdminCancelPayload) {
    if (!cancelPlayerTarget) return
    cancelAllRegistrations(
      { playerId: cancelPlayerTarget.playerId, payload },
      {
        onSuccess: () => {
          toast.success(`Inscriptions de ${cancelPlayerTarget.firstName} ${cancelPlayerTarget.lastName} annulées`)
          setCancelPlayerTarget(null)
        },
        onError: (err) => {
          toast.error(`Erreur : ${err.message}`)
        },
      }
    )
  }
```

- [ ] **Step 3 : Passer `onCancelAllClick` à `createAllPlayersColumns` et ajouter la modale**

Trouver l'utilisation de `createAllPlayersColumns()` dans le composant et la remplacer par :

```typescript
columns={createAllPlayersColumns({ onCancelAllClick: setCancelPlayerTarget })}
```

Ajouter la modale avant la fermeture du `return` JSX principal :

```tsx
      <AdminCancelPlayerModal
        open={cancelPlayerTarget !== null}
        onOpenChange={(open) => { if (!open) setCancelPlayerTarget(null) }}
        player={cancelPlayerTarget}
        onConfirm={handleCancelAllConfirm}
        isPending={isCancellingAll}
      />
```

- [ ] **Step 4 : Vérifier le typecheck complet**

```bash
cd web && pnpm typecheck
```

Expected: no errors.

- [ ] **Step 5 : Vérifier les tests web**

```bash
cd web && pnpm test
```

Expected: all tests pass.

- [ ] **Step 6 : Vérifier les tests backend**

```bash
cd api && node ace test
```

Expected: all tests pass.

- [ ] **Step 7 : Commit final**

```bash
git add web/src/features/registrations/pages/AdminRegistrationsPage.tsx
git commit -m "feat: wire AdminCancelPlayerModal to AdminRegistrationsPage"
```

---

## Self-Review – Couverture du spec

| Spec requirement | Task |
|---|---|
| Migration 4 colonnes `registrations` | Task 1 |
| Modèle Lucid Registration | Task 2 |
| Validator refundStatus/refundMethod | Task 3 |
| `adminCancelRegistration()` service | Task 4 |
| `adminCancelAllRegistrations()` service | Task 5 |
| `DELETE /admin/registrations/:id` | Task 6 |
| `DELETE /admin/registrations/player/:playerId` | Task 6 |
| Ordre des routes (player avant :id) | Task 6 |
| Inscriptions annulées par admin visibles dans l'index | Task 6 |
| `useAdminCancelRegistration` hook | Task 9 |
| `useAdminCancelAllRegistrations` hook | Task 9 |
| Bouton "Désinscrire" dans colonne actions (vue tous les joueurs) | Task 12 |
| Bouton "Annuler ce tableau" dans `PlayerDetailsModal` | Task 13 |
| Badge "Annulé par admin" + détail refund dans `PlayerDetailsModal` | Task 13 |
| Invalidation query `adminRegistrations` après succès | Task 9 |
| Gestion d'erreurs : 400 INVALID_STATUS, 404, 422, NO_ACTIVE_REGISTRATIONS | Tasks 6 + 7 |
| Paiements non modifiés pour annulation unitaire | Task 4 + test Task 7 |
| Paiements mis à jour pour annulation complète | Task 5 + test Task 7 |
| Paiements déjà remboursés non remodifiés | Task 5 + test Task 7 |
| Recalcul waitlist après annulation | Tasks 4 + 5 |
