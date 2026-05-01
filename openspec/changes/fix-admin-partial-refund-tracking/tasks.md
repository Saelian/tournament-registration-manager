## 1. Correction du validateur et du modèle (backend)

- [x] 1.1 Dans `api/app/validators/admin_registration.ts` : remplacer `['cash', 'check', 'bank_transfer']` par `['helloasso_manual', 'bank_transfer', 'cash']` dans `adminCancelRegistrationValidator`
- [x] 1.2 Dans `api/app/models/registration.ts` : remplacer `refundMethod: 'cash' | 'check' | 'bank_transfer' | null` par `'helloasso_manual' | 'bank_transfer' | 'cash' | null`
- [x] 1.3 Dans `api/app/services/cancellation_service.ts` : corriger `CancellationRefundPayload.refundMethod` et le mapping payment dans `adminCancelAllRegistrations` pour supporter `helloasso_manual`
- [x] 1.4 Vérifier le typecheck : `node ace typecheck`

## 2. Contrainte partiel : interdire helloasso_manual pour cancelOne

- [x] 2.1 Dans `AdminRegistrationsController.cancelOne` : si `refundStatus = 'done'` et `refundMethod = 'helloasso_manual'`, retourner 400 `INVALID_REFUND_METHOD`
- [x] 2.2 Ajouter le test : `cancelOne` avec `refundMethod = 'helloasso_manual'` retourne 400
- [x] 2.3 Lancer les tests : `node ace test --files=admin_cancel_registration`

## 3. Nouveau endpoint PATCH /admin/registrations/:id/refund

- [x] 3.1 Créer le validator `adminProcessPartialRefundValidator` : `{ refundMethod: vine.enum(['bank_transfer', 'cash']) }`
- [x] 3.2 Ajouter la méthode `processPartialRefund` dans `AdminRegistrationsController`
- [x] 3.3 Ajouter `processPartialRefund` dans `CancellationService` avec logique auto-solde
- [x] 3.4 Ajouter la route : `router.patch('/registrations/:id/refund', ...)` dans le groupe admin
- [x] 3.5 Écrire les tests fonctionnels pour ce endpoint (succès, inscription non éligible, auto-solde)
- [x] 3.6 Lancer les tests

## 4. Enrichir GET /admin/payments avec pendingPartialRefunds

- [x] 4.1 Dans `AdminPaymentsController.index` : requêter les inscriptions avec `cancelled_by_admin_id IS NOT NULL AND refund_status = 'requested'`
- [x] 4.2 Construire le tableau `pendingPartialRefunds` dans la réponse
- [x] 4.3 Mettre à jour le compteur `pendingRefunds` pour inclure `pendingPartialRefunds.length`
- [x] 4.4 Vérifier le typecheck

## 5. Frontend — Corrections des modales d'annulation admin

- [x] 5.1 `AdminCancelRegistrationModal.tsx` : `REFUND_METHODS` = `[bank_transfer, cash]` (retrait check, pas de helloasso_manual)
- [x] 5.2 `AdminCancelPlayerModal.tsx` : `REFUND_METHODS` = `[helloasso_manual, bank_transfer, cash]` (retrait check, ajout helloasso)
- [x] 5.3 Mettre à jour `AdminCancelPayload` dans `adminApi.ts` : `refundMethod?: 'helloasso_manual' | 'bank_transfer' | 'cash'`
- [x] 5.4 Vérifier le typecheck frontend : `pnpm typecheck`

## 6. Frontend — Section remboursements partiels dans AdminPaymentsPage

- [x] 6.1 Mettre à jour `AdminPaymentsResponse` dans `web/src/features/payments/types/adminTypes.ts` pour inclure `pendingPartialRefunds`
- [x] 6.2 `fetchAdminPayments` expose `pendingPartialRefunds` (pas de changement nécessaire — type mis à jour)
- [x] 6.3 Ajouter la fonction `processPartialRefund(registrationId, { refundMethod })` dans `adminApi.ts`
- [x] 6.4 Ajouter le hook `useProcessPartialRefund()` dans `adminHooks.ts`
- [x] 6.5 Dans `AdminPaymentsPage.tsx` : section "Remboursements partiels à traiter" conditionnelle
- [x] 6.6 Créer `ProcessPartialRefundModal.tsx` : modale avec sélecteur `bank_transfer | cash`
- [x] 6.7 Mettre à jour l'alerte `pendingRefunds` pour inclure les remboursements partiels dans le message
- [x] 6.8 Vérifier le typecheck frontend

## 7. Tests et validation finale

- [x] 7.1 Lancer tous les tests backend : `node ace test` → 266/266 PASSED
- [x] 7.2 Vérifier le typecheck frontend : `pnpm typecheck` → aucune erreur
