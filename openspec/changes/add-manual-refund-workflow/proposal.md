# Change: Workflow de remboursement manuel par l'administrateur

## Why

L'API HelloAsso présente actuellement un bug confirmé par leur support : les appels API de remboursement échouent systématiquement. La date de résolution est inconnue. Pour débloquer les remboursements, il est nécessaire de passer à un workflow manuel où l'administrateur effectue le remboursement en dehors de l'application (via HelloAsso manuellement, virement ou espèces) puis valide dans le système.

De plus, les administrateurs n'ont pas de vue globalisée des paiements : ils ne peuvent voir les paiements qu'individuellement via les détails d'un joueur.

## What Changes

### Nouvelle page de suivi des paiements (Admin)
- Nouvelle route `/admin/payments` avec DataTable listant tous les paiements
- Colonnes : Inscripteur (nom/email), Montant, Date de paiement, Statut (payé, remboursé, en attente de remboursement)
- Filtres par statut, recherche par nom d'inscripteur
- Tri par date, montant, statut

### Nouveau workflow de remboursement
1. **Demande utilisateur** : L'inscrit demande un remboursement depuis son dashboard
2. **Notification admin** : Un email est envoyé aux administrateurs pour les informer de la demande
3. **Nouveau statut** : Le paiement passe en `refund_requested` (au lieu de tenter l'API HelloAsso)
4. **Traitement admin** : Dans la page de suivi des paiements, l'admin peut traiter le remboursement
   - Bouton "Traiter le remboursement" visible sur les paiements en `refund_requested`
   - Modale de confirmation explicite : "Voulez-vous traiter ce remboursement ? En validant, cela confirme que le remboursement a été fait en amont."
   - Choix du mode de remboursement : HelloAsso (manuel), Virement, Espèces
   - Stockage de la date de remboursement et du mode en base

### Modifications du modèle Payment
- Nouveau statut : `refund_requested`
- Nouvelles colonnes : `refunded_at` (DateTime), `refund_method` (enum: helloasso_manual, bank_transfer, cash)

## Impact

- Affected specs: `payment` (modified), `admin-ui` (modified)
- Affected code:
  - `api/app/models/payment.ts` - Ajout colonnes et statut
  - `api/database/migrations/` - Migration pour nouvelles colonnes
  - `api/app/services/cancellation_service.ts` - Modification workflow
  - `api/app/services/notification_service.ts` - Nouveau service pour emails admin
  - `api/app/controllers/admin_payments_controller.ts` - Nouveau controller admin
  - `api/start/routes.ts` - Nouvelles routes admin
  - `web/src/features/admin/payments/` - Nouvelle feature frontend
