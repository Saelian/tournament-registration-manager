# Design: Fix Payment Retry Duplication

## Context

Le flux actuel de `createIntent` crée systématiquement un nouveau Payment, sans vérifier si un Payment existe déjà pour les registrations demandées. Cela fonctionne bien pour la première inscription, mais pose problème lors d'un retry.

**Flux problématique actuel :**
1. User clique "Valider l'inscription" -> Payment#1 créé (pending)
2. User abandonne HelloAsso, revient au dashboard
3. User clique "Payer" -> Payment#2 créé (nouveau, doublon)
4. Webhook HelloAsso arrive -> Payment#2 passe à succeeded
5. Payment#1 reste orphelin en pending

## Goals / Non-Goals

**Goals :**
- Réutiliser le Payment existant lors d'un retry
- Gérer le cas où le checkout HelloAsso a expiré (créer un nouveau checkout mais garder le même Payment)
- Aucune modification frontend requise

**Non-Goals :**
- Modifier le frontend (le fix est entièrement backend)
- Gérer la fusion de plusieurs Payments existants
- Nettoyer les Payments orphelins existants (sera fait par le cleanup job existant)

## Decisions

### Decision 1: Recherche du Payment existant

**Approche choisie :** Chercher un Payment `pending` qui partage au moins une Registration avec les `registrationIds` demandés.

```typescript
const existingPayment = await Payment.query()
    .where('user_id', user.id)
    .where('status', 'pending')
    .whereHas('registrations', (query) => {
        query.whereIn('id', registrationIds)
    })
    .first()
```

**Alternatives considérées :**
- Chercher un Payment exact (mêmes registrations) : Trop restrictif, ne gère pas le cas où l'utilisateur ajoute/retire des tables entre temps
- Passer le `paymentId` depuis le frontend : Nécessite une modification frontend, moins robuste

### Decision 2: Gestion des checkouts expirés

**Approche choisie :** Tenter de récupérer le checkout existant via `getCheckoutIntent()`. Si ça échoue (checkout expiré), créer un nouveau checkout mais mettre à jour le Payment existant.

**Raison :** HelloAsso ne documente pas explicitement la durée de vie des checkout intents, mais ils peuvent expirer. Cette approche est résiliente à ce cas.

### Decision 3: Mise à jour du Payment existant

**Approche choisie :** Quand un nouveau checkout est créé pour un Payment existant :
- Mettre à jour `helloassoCheckoutIntentId` avec le nouvel ID
- Vérifier que les registrations sont toujours liées (ne pas re-attacher si déjà liées)
- Mettre à jour le montant si nécessaire (cas où les prix ont changé)

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Checkout HelloAsso expiré non détecté | Catch l'erreur de `getCheckoutIntent()` et créer un nouveau checkout |
| Plusieurs Payments pending pour les mêmes registrations | Prendre le plus récent (ORDER BY created_at DESC) |
| Montant différent entre Payment existant et nouveau calcul | Mettre à jour le montant du Payment existant |

## Migration Plan

Pas de migration nécessaire. Le fix est rétrocompatible :
- Les nouveaux paiements fonctionnent comme avant
- Les retries réutilisent désormais le Payment existant
- Les Payments orphelins existants seront nettoyés par le cleanup job (30 min expiration)

## Open Questions

Aucune - la solution est claire et ne nécessite pas de clarification supplémentaire.
