# Tasks: Workflow de remboursement manuel

## 1. Backend - Modèle et migration

- [x] 1.1 Créer la migration pour ajouter `refunded_at` (DateTime nullable) à la table `payments`
- [x] 1.2 Créer la migration pour ajouter `refund_method` (string nullable: 'helloasso_manual', 'bank_transfer', 'cash') à la table `payments`
- [x] 1.3 Mettre à jour le modèle `Payment` avec les nouvelles colonnes et le statut `refund_requested`
- [x] 1.4 Exécuter les migrations et vérifier le schéma

## 2. Backend - Service de notification admin

- [x] 2.1 Créer `AdminNotificationService` dans `api/app/services/admin_notification_service.ts`
- [x] 2.2 Implémenter la méthode `notifyRefundRequest(payment, user)` qui envoie un email à tous les admins
- [x] 2.3 Récupérer la liste des emails admin depuis la table `admins`
- [x] 2.4 Écrire un test unitaire pour le service de notification

## 3. Backend - Modification du workflow de remboursement

- [x] 3.1 Modifier `CancellationService.requestFullRefund()` pour ne plus appeler l'API HelloAsso
- [x] 3.2 Le nouveau comportement : passer le paiement en `refund_requested` et envoyer la notification
- [x] 3.3 Mettre à jour les tests existants pour refléter le nouveau workflow
- [x] 3.4 Ajouter le validateur pour les données de traitement de remboursement (refund_method)

## 4. Backend - Controller admin pour les paiements

- [x] 4.1 Créer `AdminPaymentsController` dans `api/app/controllers/admin_payments_controller.ts`
- [x] 4.2 Implémenter `index()` : lister tous les paiements avec pagination, filtres et tri
- [x] 4.3 Implémenter `processRefund(id)` : traiter un remboursement (valider le statut, enregistrer method et date)
- [x] 4.4 Ajouter les routes admin dans `start/routes.ts` : `GET /admin/payments`, `POST /admin/payments/:id/process-refund`
- [x] 4.5 Écrire des tests fonctionnels pour les endpoints admin

## 5. Frontend - Page de suivi des paiements

- [x] 5.1 Créer le dossier `web/src/features/admin/payments/`
- [x] 5.2 Créer `PaymentsPage.tsx` avec le DataTable
- [x] 5.3 Implémenter les colonnes : Inscripteur, Montant, Date, Statut, Actions
- [x] 5.4 Ajouter les filtres (par statut) et la recherche (par inscripteur)
- [x] 5.5 Ajouter le tri sur les colonnes pertinentes
- [x] 5.6 Lors du clic sur une ligne, ajouter une modale avec les détails du paiement : quels tableaux, pour quel(s) joueur(s), inscriptions faites à quelle date...
- [x] 5.7 Créer le hook `useAdminPayments()` pour fetch les données

## 6. Frontend - Modale de traitement du remboursement

- [x] 6.1 Créer `ProcessRefundModal.tsx`
- [x] 6.2 Afficher le message d'avertissement : "Voulez-vous traiter ce remboursement ? En validant, cela confirme que le remboursement a été fait en amont (à la main sur HelloAsso, par virement, en espèces...)"
- [x] 6.3 Ajouter le sélecteur du mode de remboursement : "Remboursement depuis la plateforme HelloAsso", "Virement", "Espèces"
- [x] 6.4 Créer le hook `useProcessRefund()` pour la mutation
- [x] 6.5 Gérer les états de chargement et les erreurs

## 7. Frontend - Navigation et intégration

- [x] 7.1 Ajouter le lien "Paiements" dans la navigation admin
- [x] 7.2 Ajouter la route `/admin/payments` dans le router
- [x] 7.3 Mettre à jour le dashboard admin pour afficher une alerte si des remboursements sont en attente

## 8. Tests et validation

- [x] 8.1 Tester le workflow complet : demande utilisateur -> notification -> traitement admin
- [x] 8.2 Vérifier que les anciens paiements fonctionnent toujours (rétrocompatibilité)
- [x] 8.3 Vérifier l'affichage correct des différents statuts dans le dashboard utilisateur
- [x] 8.4 Lancer `pnpm typecheck` et `pnpm lint` pour valider le code
