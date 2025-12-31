# Change: Paiement groupé et remboursement HelloAsso

## Why

Actuellement, chaque inscription génère un paiement séparé. Les utilisateurs doivent payer N fois pour N tableaux. De plus, il n'existe pas de système de remboursement via HelloAsso ni de dissociation entre désinscription et remboursement.

## What Changes

### Paiement groupé
- Un seul paiement pour plusieurs inscriptions (déjà partiellement implémenté côté backend)
- Référence de paiement HelloAsso : "NOM Prénom - TableauA, TableauB" (max 250 caractères)
- Regroupement des inscriptions par paiement dans le dashboard

### Remboursement HelloAsso
- Intégration de l'endpoint `POST /payments/{paymentId}/refund`
- Pas de remboursement partiel : tout ou rien
- Statut `refunded` sur Payment et `cancelled` sur les registrations associées

### Dissociation désinscription/remboursement
- **Option 1 - Remboursement total** : L'utilisateur demande un remboursement, TOUTES les inscriptions liées au paiement sont annulées et le montant total est remboursé
- **Option 2 - Désinscription partielle** : L'utilisateur se désinscrit d'un ou plusieurs tableaux SANS remboursement (les places sont libérées)
- UX explicite : modal avec explication claire des conséquences de chaque choix

### Dashboard adapté
- Affichage groupé par paiement (un bloc = un paiement = N inscriptions)
- Visualisation claire du montant payé et des tableaux concernés
- Actions contextuelles selon le statut

## Impact

- Affected specs: `payment` (modified), `user-dashboard` (modified), `cancellation` (new)
- **Remplace** : `add-cancellation-refund` (obsolète, à supprimer)
- Affected code:
  - `api/app/services/hello_asso_service.ts` - ajout méthode refund
  - `api/app/services/cancellation_service.ts` - nouveau service
  - `api/app/controllers/payments_controller.ts` - endpoint remboursement
  - `api/app/controllers/registrations_controller.ts` - endpoint désinscription
  - `web/src/features/dashboard/` - refonte affichage groupé
  - `web/src/features/payment/` - hooks remboursement
