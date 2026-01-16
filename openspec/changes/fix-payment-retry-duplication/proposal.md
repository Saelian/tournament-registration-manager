# Change: Fix Payment Retry Duplication

## Why

Quand un utilisateur abandonne HelloAsso lors du premier paiement, puis clique sur "Payer" depuis son dashboard, un **nouveau Payment est créé** au lieu de réutiliser le Payment existant. Cela crée une duplication dans la table pivot `payment_registrations` (une même Registration liée à plusieurs Payments) et laisse des Payments orphelins en statut `pending`.

Ce comportement provoque :
- Une incohérence de données (plusieurs Payments pour les mêmes inscriptions)
- Une confusion dans l'affichage côté admin et utilisateur
- Des Payments orphelins qui polluent la base de données

## What Changes

- **MODIFIED** : `PaymentsController.createIntent()` réutilise un Payment existant au lieu d'en créer un nouveau
- Avant de créer un nouveau Payment, le système vérifie s'il existe déjà un Payment `pending` lié aux registrations demandées
- Si le checkout HelloAsso existe encore, la `redirectUrl` existante est renvoyée
- Si le checkout HelloAsso a expiré, un nouveau checkout est créé mais le Payment existant est mis à jour

## Impact

- Affected specs: `payment`
- Affected code:
  - `api/app/controllers/payments_controller.ts` (méthode `createIntent`)
  - `api/app/services/hello_asso_service.ts` (utilisation de `getCheckoutIntent`)
