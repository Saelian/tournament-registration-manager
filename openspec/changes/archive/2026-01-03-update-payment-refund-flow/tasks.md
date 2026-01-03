# Tasks: update-payment-refund-flow

## 1. Modèle de données

- [x] 1.1 Ajouter les statuts `refund_pending` et `refund_failed` au type Payment.status
- [x] 1.2 Ajouter `helloasso_payment_id` sur Payment (récupéré via webhook Order)
- [x] 1.3 Ajouter validation dans TournamentValidator : `refundDeadline` <= `startDate`

## 2. HelloAsso Service - Refund

- [x] 2.1 Implémenter `refundPayment(helloAssoPaymentId: number)` dans HelloAssoService
- [x] 2.2 Gérer les erreurs HelloAsso (déjà remboursé, non autorisé, etc.)
- [x] 2.3 Ajouter tests unitaires pour le refund

## 3. Cancellation Service

- [x] 3.1 Créer `CancellationService` avec méthode `unregisterWithoutRefund(registrationId)`
- [x] 3.2 Implémenter `requestFullRefund(paymentId)` dans CancellationService
- [x] 3.3 Vérifier la propriété du paiement (userId)
- [x] 3.4 Vérifier la deadline de remboursement
- [x] 3.5 Appeler HelloAssoService.refundPayment()
- [x] 3.6 Mettre à jour les statuts (Payment + Registrations)
- [x] 3.7 Libérer les places (mise à jour quota)

## 4. API Endpoints

- [x] 4.1 `POST /api/payments/:id/refund` - Demander remboursement total
- [x] 4.2 `DELETE /api/registrations/:id` - Désinscription (avec query param `?refund=false`)
- [x] 4.3 Valider les permissions et les statuts
- [x] 4.4 Retourner des messages d'erreur explicites

## 5. Référence de paiement

- [x] 5.1 Créer helper `generatePaymentReference(registrations)`
- [x] 5.2 Format: "NOM Prénom - Tableau1, Tableau2" (max 250 chars)
- [x] 5.3 Gérer plusieurs joueurs dans un même paiement
- [x] 5.4 Intégrer dans PaymentsController.createIntent()

## 6. Frontend - Dashboard refonte

- [x] 6.1 Créer hook `useMyPaymentsWithRegistrations()` pour récupérer paiements groupés
- [x] 6.2 Créer composant `PaymentGroup` pour afficher un bloc paiement
- [x] 6.3 Afficher les inscriptions dans chaque PaymentGroup
- [x] 6.4 Gérer le groupe spécial "pending_payment" (sans paiement)
- [x] 6.5 Adapter les filtres et la recherche au nouveau format groupé
- [x] 6.6 Conserver le tri (par date de paiement)

## 7. Frontend - Modal de désinscription

- [x] 7.1 Créer composant `UnregistrationChoiceModal`
- [x] 7.2 Afficher les deux options avec explications claires
- [x] 7.3 Option 1: Remboursement total (liste tableaux + montant)
- [x] 7.4 Option 2: Désinscription seule (pas de remboursement)
- [x] 7.5 Bouton de confirmation selon l'option choisie

## 8. Frontend - Modal de remboursement

- [x] 8.1 Créer composant `RefundRequestModal`
- [x] 8.2 Afficher récapitulatif (tableaux, montant)
- [x] 8.3 Avertissement action irréversible
- [x] 8.4 Gestion du loading pendant l'appel API
- [x] 8.5 Afficher succès ou erreur

## 9. Frontend - Hooks mutations

- [x] 9.1 Créer `useRequestRefund(paymentId)` mutation
- [x] 9.2 Mettre à jour `useCancelRegistration` pour supporter le choix refund/no-refund
- [x] 9.3 Invalider les queries après mutation

## 10. Tests

- [x] 10.1 Test fonctionnel: remboursement réussi
- [x] 10.2 Test fonctionnel: remboursement après deadline (refusé)
- [x] 10.3 Test fonctionnel: désinscription sans remboursement
- [x] 10.4 Test fonctionnel: remboursement paiement non-succeeded (refusé)
- [x] 10.5 Test fonctionnel: vérification propriétaire paiement

## 11. Cleanup

- [x] 11.1 Supprimer ou archiver le change `add-cancellation-refund` (obsolète) - N/A (n'existait pas)
- [x] 11.2 Mettre à jour la documentation si nécessaire
