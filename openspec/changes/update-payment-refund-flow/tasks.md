# Tasks: update-payment-refund-flow

## 1. Modèle de données

- [ ] 1.1 Ajouter les statuts `refund_pending` et `refund_failed` au type Payment.status
- [ ] 1.2 Ajouter `helloasso_payment_id` sur Payment (récupéré via webhook Order)
- [ ] 1.3 Ajouter validation dans TournamentValidator : `refundDeadline` <= `startDate`

## 2. HelloAsso Service - Refund

- [ ] 2.1 Implémenter `refundPayment(helloAssoPaymentId: number)` dans HelloAssoService
- [ ] 2.2 Gérer les erreurs HelloAsso (déjà remboursé, non autorisé, etc.)
- [ ] 2.3 Ajouter tests unitaires pour le refund

## 3. Cancellation Service

- [ ] 3.1 Créer `CancellationService` avec méthode `unregisterWithoutRefund(registrationId)`
- [ ] 3.2 Implémenter `requestFullRefund(paymentId)` dans CancellationService
- [ ] 3.3 Vérifier la propriété du paiement (userId)
- [ ] 3.4 Vérifier la deadline de remboursement
- [ ] 3.5 Appeler HelloAssoService.refundPayment()
- [ ] 3.6 Mettre à jour les statuts (Payment + Registrations)
- [ ] 3.7 Libérer les places (mise à jour quota)

## 4. API Endpoints

- [ ] 4.1 `POST /api/payments/:id/refund` - Demander remboursement total
- [ ] 4.2 `DELETE /api/registrations/:id` - Désinscription (avec query param `?refund=false`)
- [ ] 4.3 Valider les permissions et les statuts
- [ ] 4.4 Retourner des messages d'erreur explicites

## 5. Référence de paiement

- [ ] 5.1 Créer helper `generatePaymentReference(registrations)`
- [ ] 5.2 Format: "NOM Prénom - Tableau1, Tableau2" (max 250 chars)
- [ ] 5.3 Gérer plusieurs joueurs dans un même paiement
- [ ] 5.4 Intégrer dans PaymentsController.createIntent()

## 6. Frontend - Dashboard refonte

- [ ] 6.1 Créer hook `useMyPaymentsWithRegistrations()` pour récupérer paiements groupés
- [ ] 6.2 Créer composant `PaymentGroup` pour afficher un bloc paiement
- [ ] 6.3 Afficher les inscriptions dans chaque PaymentGroup
- [ ] 6.4 Gérer le groupe spécial "pending_payment" (sans paiement)
- [ ] 6.5 Adapter les filtres et la recherche au nouveau format groupé
- [ ] 6.6 Conserver le tri (par date de paiement)

## 7. Frontend - Modal de désinscription

- [ ] 7.1 Créer composant `UnregistrationChoiceModal`
- [ ] 7.2 Afficher les deux options avec explications claires
- [ ] 7.3 Option 1: Remboursement total (liste tableaux + montant)
- [ ] 7.4 Option 2: Désinscription seule (pas de remboursement)
- [ ] 7.5 Bouton de confirmation selon l'option choisie

## 8. Frontend - Modal de remboursement

- [ ] 8.1 Créer composant `RefundRequestModal`
- [ ] 8.2 Afficher récapitulatif (tableaux, montant)
- [ ] 8.3 Avertissement action irréversible
- [ ] 8.4 Gestion du loading pendant l'appel API
- [ ] 8.5 Afficher succès ou erreur

## 9. Frontend - Hooks mutations

- [ ] 9.1 Créer `useRequestRefund(paymentId)` mutation
- [ ] 9.2 Mettre à jour `useCancelRegistration` pour supporter le choix refund/no-refund
- [ ] 9.3 Invalider les queries après mutation

## 10. Tests

- [ ] 10.1 Test fonctionnel: remboursement réussi
- [ ] 10.2 Test fonctionnel: remboursement après deadline (refusé)
- [ ] 10.3 Test fonctionnel: désinscription sans remboursement
- [ ] 10.4 Test fonctionnel: remboursement paiement non-succeeded (refusé)
- [ ] 10.5 Test fonctionnel: vérification propriétaire paiement

## 11. Cleanup

- [ ] 11.1 Supprimer ou archiver le change `add-cancellation-refund` (obsolète)
- [ ] 11.2 Mettre à jour la documentation si nécessaire
