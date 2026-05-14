# Admin Registration No-Expiry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Les inscriptions créées par un admin (`isAdminCreated = true`) ne doivent plus être annulées par le job de nettoyage automatique, quel que soit le temps écoulé.

**Architecture:** Un seul fichier backend modifié — `PaymentCleanupJob` — via l'ajout d'un filtre `.where('is_admin_created', false)` sur les deux requêtes qui cherchent les inscriptions expirées. Le frontend et le modèle de données restent inchangés.

**Tech Stack:** AdonisJS v6 / Lucid ORM, Japa (tests), PostgreSQL

---

## Fichiers touchés

| Fichier | Action |
|---------|--------|
| `api/tests/unit/payment_cleanup_job.spec.ts` | Modifier test existant + ajouter 1 nouveau test |
| `api/app/jobs/payment_cleanup_job.ts` | Modifier 2 requêtes |

---

### Task 1 : Ajouter le test qui documente le nouveau comportement

**Files:**
- Modify: `api/tests/unit/payment_cleanup_job.spec.ts`

- [ ] **Étape 1 : Mettre à jour le test existant `should not send email for admin-created registrations`**

Ce test vérifie actuellement uniquement qu'aucun email n'est envoyé. Il doit aussi vérifier que la registration reste en `pending_payment` (et non `cancelled`).

Dans `api/tests/unit/payment_cleanup_job.spec.ts`, remplacer la fin du test (après `await job.run()`) :

```typescript
  test('should not send email for admin-created registrations', async ({ assert }) => {
    const fakeMailer = mail.fake()

    const user = await User.create({ email: 'admin-created@example.com' })
    const tournament = await Tournament.create({
      name: 'Test Tournament',
      startDate: DateTime.now(),
      endDate: DateTime.now().plus({ days: 1 }),
      location: 'Test Location',
      options: {
        refundDeadline: null,
        waitlistTimerHours: 4,
        registrationStartDate: null,
        registrationEndDate: null,
      },
    })
    const table = await Table.create({
      tournamentId: tournament.id,
      name: 'Table A',
      date: DateTime.now(),
      startTime: '10:00',
      pointsMin: 500,
      pointsMax: 1000,
      quota: 32,
      price: 10,
      isSpecial: false,
    })
    const player = await Player.create({
      userId: user.id,
      licence: '123456',
      firstName: 'John',
      lastName: 'Doe',
      club: 'Test Club',
      points: 800,
    })

    const expiredRegistration = await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: table.id,
      status: 'pending_payment',
      isAdminCreated: true,
    })

    const expiredTime = DateTime.now().minus({ minutes: 60 }).toSQL()
    await db.rawQuery('UPDATE registrations SET updated_at = ? WHERE id = ?', [expiredTime, expiredRegistration.id])

    const job = new PaymentCleanupJob()
    await job.run()

    await expiredRegistration.refresh()
    assert.equal(expiredRegistration.status, 'pending_payment') // ← ajout : ne doit PAS être cancelled
    const sentMessages = fakeMailer.messages.sent()
    assert.equal(sentMessages.length, 0)
  })
```

- [ ] **Étape 2 : Ajouter un nouveau test explicite pour la non-expiration**

Ajouter ce test après le test précédent, avant la fermeture du `test.group` :

```typescript
  test('should not cancel admin-created registrations even when expired', async ({ assert }) => {
    const user = await User.create({ email: 'admin@example.com' })
    const tournament = await Tournament.create({
      name: 'Test Tournament',
      startDate: DateTime.now(),
      endDate: DateTime.now().plus({ days: 1 }),
      location: 'Test Location',
      options: {
        refundDeadline: null,
        waitlistTimerHours: 4,
        registrationStartDate: null,
        registrationEndDate: null,
      },
    })
    const table = await Table.create({
      tournamentId: tournament.id,
      name: 'Table A',
      date: DateTime.now(),
      startTime: '10:00',
      pointsMin: 500,
      pointsMax: 1000,
      quota: 32,
      price: 10,
      isSpecial: false,
    })
    const player = await Player.create({
      userId: user.id,
      licence: '123456',
      firstName: 'John',
      lastName: 'Doe',
      club: 'Test Club',
      points: 800,
    })

    // Inscription admin non encaissée, créée il y a 2 heures
    const adminRegistration = await Registration.create({
      userId: user.id,
      playerId: player.id,
      tableId: table.id,
      status: 'pending_payment',
      isAdminCreated: true,
    })

    const expiredTime = DateTime.now().minus({ hours: 2 }).toSQL()
    await db.rawQuery('UPDATE registrations SET updated_at = ? WHERE id = ?', [expiredTime, adminRegistration.id])

    const job = new PaymentCleanupJob()
    await job.run()

    await adminRegistration.refresh()
    assert.equal(adminRegistration.status, 'pending_payment')
  })
```

- [ ] **Étape 3 : Lancer les nouveaux tests pour vérifier qu'ils échouent**

```bash
cd api && node ace test tests/unit/payment_cleanup_job.spec.ts
```

Résultat attendu : le test `should not send email for admin-created registrations` échoue sur `assert.equal(expiredRegistration.status, 'pending_payment')` (la registration est encore `cancelled`), et `should not cancel admin-created registrations even when expired` échoue de même.

---

### Task 2 : Implémenter le fix dans PaymentCleanupJob

**Files:**
- Modify: `api/app/jobs/payment_cleanup_job.ts:28-51`

- [ ] **Étape 1 : Ajouter le filtre sur les deux requêtes**

Dans `api/app/jobs/payment_cleanup_job.ts`, modifier les deux requêtes :

**Requête 1 — inscriptions standard (ligne ~28), ajouter `.where('is_admin_created', false)` :**

```typescript
      const standardExpiredRegistrations = await Registration.query({ client: trx })
        .where('status', 'pending_payment')
        .where('is_admin_created', false)
        .whereNull('promoted_at')
        .where('updated_at', '<', expirationThreshold.toSQL()!)
        .preload('user')
        .preload('player')
        .preload('table')
```

**Requête 2 — inscriptions promues (ligne ~37), ajouter `.where('is_admin_created', false)` :**

```typescript
      const promotedRegistrations = await Registration.query({ client: trx })
        .where('status', 'pending_payment')
        .where('is_admin_created', false)
        .whereNotNull('promoted_at')
        .preload('table', (q) => q.preload('tournament'))
        .preload('user')
        .preload('player')
```

- [ ] **Étape 2 : Lancer tous les tests du fichier**

```bash
cd api && node ace test tests/unit/payment_cleanup_job.spec.ts
```

Résultat attendu : tous les tests passent (7 au total).

- [ ] **Étape 3 : Lancer la suite complète de tests**

```bash
cd api && node ace test
```

Résultat attendu : aucune régression.

- [ ] **Étape 4 : Commit**

```bash
git add api/app/jobs/payment_cleanup_job.ts api/tests/unit/payment_cleanup_job.spec.ts
git commit -m "fix: ne pas expirer les inscriptions admin en attente de paiement"
```
