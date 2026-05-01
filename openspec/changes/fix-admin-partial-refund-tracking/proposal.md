# Change: Suivi et traitement des remboursements partiels admin

## Why

Lors d'une annulation admin d'un seul tableau (annulation partielle), l'admin peut choisir "Remboursement à traiter" mais il n'existe aucun endroit dans l'interface pour retrouver et traiter ce remboursement. Le paiement HelloAsso global n'est pas modifié (car il couvre potentiellement d'autres tableaux encore actifs), donc les paiements en `refund_requested` de la page `/admin/payments` ne capturent pas ce cas.

De plus, la méthode de remboursement `check` est proposée dans les modales d'annulation admin alors qu'elle n'existe pas dans le reste du système de remboursement (`helloasso_manual | bank_transfer | cash`). Et `helloasso_manual` est absent des modales alors que c'est l'option pertinente pour les annulations complètes (remboursement total possible via HelloAsso).

## What Changes

- **Correction des méthodes de remboursement** : Retrait de `check` des modales d'annulation admin et du validateur backend. Alignement sur `helloasso_manual | bank_transfer | cash`.
- **Contrainte partiel/total** : Pour une annulation d'un seul tableau, `helloasso_manual` est indisponible (remboursement partiel techniquement impossible via HelloAsso). Pour une annulation complète, les 3 méthodes sont disponibles.
- **Nouveau endpoint** `PATCH /admin/registrations/:id/refund` : permet à l'admin de marquer un remboursement partiel comme traité (méthode + horodatage).
- **Page `/admin/payments` enrichie** : affiche les remboursements partiels en attente (inscriptions annulées par admin avec `refund_status = 'requested'`) en plus des paiements `refund_requested`.
- **Auto-solde** : lorsque toutes les inscriptions liées à un paiement sont remboursées ou sans remboursement, le paiement passe automatiquement à `refunded`.

## Impact

- Affected specs: `payment` (modified), `cancellation` (added), `admin-ui` (modified)
- Affected code:
  - `api/app/validators/admin_registration.ts` — correction des méthodes de remboursement
  - `api/app/models/registration.ts` — correction du type `refundMethod`
  - `api/app/services/cancellation_service.ts` — correction des méthodes + logique auto-solde
  - `api/app/controllers/admin_payments_controller.ts` — inclure les remboursements partiels en attente
  - `api/app/controllers/admin_registrations_controller.ts` — nouveau endpoint PATCH refund
  - `api/start/routes.ts` — nouvelle route
  - `web/src/features/registrations/components/admin/AdminCancelRegistrationModal.tsx` — retrait check, ajout contrainte partiel
  - `web/src/features/registrations/components/admin/AdminCancelPlayerModal.tsx` — retrait check, ajout helloasso
  - `web/src/features/payments/pages/AdminPaymentsPage.tsx` — section remboursements partiels
  - `web/src/features/payments/api/adminApi.ts` — endpoint traitement remboursement partiel
  - `web/src/features/payments/hooks/adminHooks.ts` — hook mutation traitement partiel
