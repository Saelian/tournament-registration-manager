# Design : Inscriptions admin sans délai d'expiration + encaissement différé

**Date :** 2026-05-14  
**Statut :** Approuvé

## Contexte

Quand un administrateur inscrit un joueur sans encaisser immédiatement (paiement offline avec `collected: false`), la registration passe en `pending_payment`. Le job de nettoyage `PaymentCleanupJob` annule silencieusement ces inscriptions après 30 minutes — le même délai que pour les inscriptions joueurs — rendant l'encaissement différé impossible.

Ce comportement est incorrect : les inscriptions admin n'ont pas vocation à être validées par un paiement immédiat (le joueur peut régler plus tard dans la journée, ou le lendemain du tournoi).

## Objectif

- Les inscriptions créées par un admin (`isAdminCreated = true`) ne doivent jamais expirer automatiquement.
- L'admin peut encaisser le paiement ultérieurement depuis la liste des paiements.

## Scénarios couverts

- Inscription le jour J : le joueur arrive au tournoi, l'admin l'inscrit, il paie plus tard dans la journée.
- Pré-inscription : l'admin inscrit un joueur plusieurs jours avant le tournoi, le paiement se fait le jour J.

## Solution retenue

### Backend — `api/app/jobs/payment_cleanup_job.ts`

Ajouter `.where('is_admin_created', false)` aux deux requêtes du job :

**Requête 1 — inscriptions standard (non promues) :**
```typescript
const standardExpiredRegistrations = await Registration.query({ client: trx })
  .where('status', 'pending_payment')
  .where('is_admin_created', false)   // ← ajout
  .whereNull('promoted_at')
  .where('updated_at', '<', expirationThreshold.toSQL()!)
  .preload('user')
  .preload('player')
  .preload('table')
```

**Requête 2 — inscriptions promues depuis la liste d'attente :**
```typescript
const promotedRegistrations = await Registration.query({ client: trx })
  .where('status', 'pending_payment')
  .where('is_admin_created', false)   // ← ajout
  .whereNotNull('promoted_at')
  .preload('table', (q) => q.preload('tournament'))
  .preload('user')
  .preload('player')
```

**Effets :**
- Les registrations admin en `pending_payment` restent indéfiniment jusqu'à encaissement ou annulation manuelle.
- Le paiement associé n'expire pas non plus (son expiration est dérivée des IDs de registrations trouvées).
- Les inscriptions joueurs sont inchangées (expirent à 30 min comme avant).

### Frontend — aucun changement

`AdminPaymentsPage.tsx` affiche déjà un bouton "Encaisser" pour tout paiement `pending` non-HelloAsso. Le backend fix suffit à rendre ce bouton fonctionnel pour les paiements admin différés.

**Workflow complet :**
1. Admin crée une inscription avec `collected: false` → registration `pending_payment`, payment `pending`
2. Admin va dans Paiements → voit le paiement avec le bouton "Encaisser"
3. Admin clique "Encaisser" → `PATCH /admin/payments/:id/collect` → registration `paid`, payment `succeeded`

## Ce qui ne change pas

- Modèle de données (aucune migration)
- Statuts visibles dans l'UI
- Emails d'expiration (les inscriptions admin n'en envoient déjà pas)
- Comportement pour les inscriptions joueurs

## Périmètre d'implémentation

| Fichier | Changement |
|---------|-----------|
| `api/app/jobs/payment_cleanup_job.ts` | Ajouter `.where('is_admin_created', false)` × 2 |

2 lignes de code. Aucune migration. Aucun changement frontend.
