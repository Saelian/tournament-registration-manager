# payment Specification

## Purpose
TBD - created by archiving change add-helloasso-payment. Update Purpose after archive.
## Requirements
### Requirement: Payment Checkout Creation
The system MUST create a HelloAsso payment session for registrations.

#### Scenario: Successful Creation
- **WHEN** a user clicks on "Pay" with valid registrations
- **THEN** a local Payment record is created (status=pending)
- **AND** registrations are linked via the `payment_registrations` pivot table
- **AND** a HelloAsso checkout URL is generated and the user is redirected

#### Scenario: Amount Calculation
- **WHEN** a checkout is created for multiple registrations
- **THEN** the total amount is the sum of table prices (euros × 100 = cents)

#### Scenario: Item Name Generation
- **WHEN** a checkout is created
- **THEN** l'itemName suit le format "NOM Prénom - Tableau1, Tableau2" (max 250 chars)
- **AND** les joueurs uniques sont listés en premier
- **AND** les noms de tableaux suivent

### Requirement: Payment Webhook
The system MUST process HelloAsso Order webhooks to confirm payments.

#### Scenario: Payment Confirmed
- **WHEN** HelloAsso sends a successful Order webhook
- **THEN** concerned registrations (via pivot table) pass to status = paid
- **AND** the local Payment record is updated to status = succeeded
- **AND** the helloasso_order_id is stored

#### Scenario: Security Verification (Double Check)
- **WHEN** a webhook is received
- **THEN** the system MUST call `GET /organizations/{slug}/checkout-intents/{checkoutIntentId}` to verify payment status
- **AND** only process if the API confirms the payment is authorized

#### Scenario: Invalid Webhook
- **WHEN** the Double Check verification fails (API returns non-authorized status)
- **THEN** the webhook is rejected and logged

#### Scenario: Idempotency
- **WHEN** the same webhook is received twice
- **THEN** the second one is ignored without error (Payment already succeeded)

### Requirement: Payment Record
The system MUST record payments for tracking.

#### Scenario: Recording
- **WHEN** a checkout is initiated
- **THEN** a Payment record is created with the HelloAsso checkout intent ID (if applicable)
- **AND** the amount is stored in cents
- **AND** the payment_method is stored

#### Scenario: Registration-Payment Link
- **WHEN** a payment is recorded
- **THEN** it is linked to concerned registrations via the `payment_registrations` pivot table
- **AND** referential integrity is enforced by foreign keys

#### Scenario: Refund Tracking
- **WHEN** a refund is processed by an administrator
- **THEN** the `refunded_at` timestamp is recorded
- **AND** the `refund_method` is stored (helloasso_manual, bank_transfer, or cash)

#### Scenario: Offline Payment Recording
- **WHEN** an admin creates a payment with cash, check, or card
- **THEN** a Payment record is created with payment_method set accordingly
- **AND** helloasso_checkout_intent_id is null

### Requirement: Payment Return Pages
The system MUST handle return pages after payment.

#### Scenario: Success Return
- **WHEN** the user returns after successful payment
- **THEN** a confirmation page is displayed

#### Scenario: Cancellation Return
- **WHEN** the user cancels payment
- **THEN** they are redirected to their cart and Payment record remains pending/failed

### Requirement: Trust Webhook Only
The system MUST NOT trust the redirect alone.

#### Scenario: Redirect without Webhook
- **WHEN** the user returns to the success page but the webhook is not received
- **THEN** status remains pending_payment until webhook confirmation

#### Scenario: Waiting Message
- **WHEN** payment is being confirmed
- **THEN** a "Confirmation in progress..." message is displayed

### Requirement: Pending Payment Expiration
The system MUST automatically free table slots when payment is abandoned.

#### Scenario: Slot Reservation During Payment
- **WHEN** a user initiates payment for a table
- **THEN** the slot is reserved (counted in quota) immediately
- **AND** other users cannot take that slot

#### Scenario: Smart Quota Calculation
- **WHEN** calculating table availability
- **THEN** `pending_payment` registrations older than 30 minutes are NOT counted
- **AND** slots are immediately available for other users

#### Scenario: Automatic Cleanup
- **WHEN** a `pending_payment` registration is older than 30 minutes
- **THEN** a scheduled job sets its status to `cancelled`
- **AND** the associated Payment status is set to `expired`
- **AND** the cleanup is logged for audit

#### Scenario: Cleanup Idempotency
- **WHEN** the cleanup job runs multiple times
- **THEN** already cancelled/expired records are not modified again

### Requirement: Scheduled Cleanup Job
The system MUST run periodic cleanup using `node-cron`.

#### Scenario: Job Execution
- **WHEN** the application starts
- **THEN** a cleanup job is scheduled to run every 5 minutes

#### Scenario: Job Resilience
- **WHEN** the application restarts
- **THEN** the cleanup job automatically resumes
- **AND** Layer 1 (smart quota) provides protection during downtime

### Requirement: Refund Request
The system MUST allow users to request a refund for their payment.

#### Scenario: User Requests Refund
- **WHEN** a user requests a refund for a succeeded payment before the refund deadline
- **THEN** the payment status changes to `refund_requested`
- **AND** an email notification is sent to all administrators
- **AND** the payment remains visible in the user's dashboard with "Refund Requested" status

#### Scenario: Refund Deadline Passed
- **WHEN** a user tries to request a refund after the refund deadline
- **THEN** the request is rejected with an appropriate error message
- **AND** the payment status remains unchanged

#### Scenario: Admin Notification Email
- **WHEN** a refund is requested
- **THEN** all administrators receive an email containing:
  - The subscriber's name and email
  - The payment amount
  - The list of tables concerned
  - A link to the admin payments page

### Requirement: Admin Refund Processing
The system MUST allow administrators to process refund requests manually.

#### Scenario: Admin Views Pending Refunds
- **WHEN** an administrator accesses the payments page
- **THEN** payments with `refund_requested` status are clearly highlighted
- **AND** a "Process Refund" action is available for each

#### Scenario: Admin Processes Refund
- **WHEN** an administrator clicks "Process Refund"
- **THEN** a confirmation modal is displayed with the warning: "En validant, cela confirme que le remboursement a été fait en amont (à la main sur HelloAsso, par virement, en espèces...)"
- **AND** the administrator must select the refund method

#### Scenario: Refund Method Selection
- **WHEN** processing a refund
- **THEN** the administrator must choose one of: "Remboursement depuis la plateforme HelloAsso", "Virement", "Espèces"

#### Scenario: Refund Confirmation
- **WHEN** an administrator confirms the refund processing
- **THEN** the payment status changes to `refunded`
- **AND** the `refunded_at` timestamp is set to the current date/time
- **AND** the selected `refund_method` is stored
- **AND** all linked registrations are cancelled

### Requirement: Payment Status Values
The system MUST support the following payment statuses.

#### Scenario: Status Enum
- **WHEN** a payment is created or updated
- **THEN** its status must be one of: `pending`, `succeeded`, `failed`, `expired`, `refund_requested`, `refunded`, `refund_pending` (legacy), `refund_failed` (legacy)

### Requirement: Payment Reference Format
Le système MUST générer une référence de paiement lisible pour HelloAsso.

#### Scenario: Référence avec un joueur et plusieurs tableaux
- **WHEN** un paiement est créé pour Jean DUPONT avec les tableaux "Senior H 1000pts" et "Vétérans"
- **THEN** l'itemName HelloAsso est "DUPONT Jean - Senior H 1000pts, Vétérans"

#### Scenario: Référence tronquée si trop longue
- **WHEN** la référence dépasse 250 caractères
- **THEN** elle est tronquée avec "..." à la fin
- **AND** les tableaux sont listés dans l'ordre d'inscription

#### Scenario: Plusieurs joueurs dans un même paiement
- **WHEN** un paiement concerne plusieurs joueurs (ex: parent inscrivant ses enfants)
- **THEN** les noms sont listés : "DUPONT Jean, DUPONT Marie - TableauA, TableauB"

### Requirement: Payment Refund via HelloAsso
Le système MUST permettre le remboursement total d'un paiement via HelloAsso.

#### Scenario: Remboursement réussi
- **WHEN** un utilisateur demande le remboursement d'un paiement succeeded
- **THEN** le système appelle `POST /payments/{paymentId}/refund` sur HelloAsso
- **AND** le statut du Payment passe à `refunded`
- **AND** toutes les Registration liées passent à `cancelled`
- **AND** les places sont libérées

#### Scenario: Remboursement avec helloasso_order_id manquant
- **WHEN** un remboursement est demandé mais helloasso_order_id est null
- **THEN** une erreur est retournée avec le message "Ce paiement ne peut pas être remboursé (paiement test ou incomplet)"

#### Scenario: Remboursement échoue côté HelloAsso
- **WHEN** l'appel HelloAsso retourne une erreur (déjà remboursé, délai dépassé, etc.)
- **THEN** le statut du Payment passe à `refund_failed`
- **AND** l'erreur est loggée avec les détails HelloAsso
- **AND** un message explicite est retourné à l'utilisateur

#### Scenario: Remboursement d'un paiement non-succeeded
- **WHEN** un remboursement est demandé pour un paiement pending/failed/expired
- **THEN** une erreur est retournée "Seuls les paiements confirmés peuvent être remboursés"

### Requirement: Payment Status Extended
Le modèle Payment MUST supporter les nouveaux statuts de remboursement.

#### Scenario: Statuts disponibles
- **WHEN** un Payment est créé ou mis à jour
- **THEN** le statut peut être : `pending`, `succeeded`, `failed`, `expired`, `refunded`, `refund_pending`, `refund_failed`

### Requirement: Payment Method Tracking
Le système MUST enregistrer le mode de paiement utilisé pour chaque Payment.

#### Scenario: Modes disponibles
- **WHEN** un Payment est créé
- **THEN** le champ payment_method peut être : `helloasso`, `cash`, `check`, `card`

#### Scenario: Paiement HelloAsso
- **WHEN** un paiement est effectué via HelloAsso (checkout classique ou admin)
- **THEN** payment_method = helloasso

#### Scenario: Paiement sur place
- **WHEN** un admin crée un paiement cash, chèque ou carte
- **THEN** payment_method reflète le mode choisi
- **AND** helloasso_checkout_intent_id est null

#### Scenario: Affichage dans la liste admin
- **WHEN** un admin consulte `/admin/payments`
- **THEN** une colonne "Mode de paiement" affiche le mode utilisé
- **AND** les labels sont : "HelloAsso", "Espèces", "Chèque", "Carte bancaire"

### Requirement: Offline Payment Support
Le système MUST supporter les paiements sans checkout HelloAsso.

#### Scenario: Création paiement offline
- **WHEN** un Payment est créé avec payment_method = cash | check | card
- **THEN** helloasso_checkout_intent_id peut être null
- **AND** le Payment est valide

#### Scenario: Paiement offline encaissé
- **WHEN** un Payment offline a status = succeeded
- **THEN** les inscriptions liées passent à status = paid

#### Scenario: Paiement offline en attente
- **WHEN** un Payment offline a status = pending
- **THEN** les inscriptions liées restent à status = pending_payment

### Requirement: Mark Payment as Collected
Le système MUST permettre de marquer un paiement en attente comme encaissé.

#### Scenario: Encaissement depuis la liste
- **WHEN** un admin clique sur "Marquer comme encaissé" sur un Payment pending offline
- **THEN** le Payment passe à status = succeeded
- **AND** les inscriptions liées passent à status = paid

#### Scenario: Bouton conditionnel
- **WHEN** un Payment est pending ET payment_method != helloasso
- **THEN** le bouton "Marquer comme encaissé" est visible

#### Scenario: Confirmation requise
- **WHEN** l'admin clique sur "Marquer comme encaissé"
- **THEN** une confirmation est demandée avant de valider

