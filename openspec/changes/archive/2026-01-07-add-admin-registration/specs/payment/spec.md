## ADDED Requirements

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

## MODIFIED Requirements

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
