## ADDED Requirements

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

## MODIFIED Requirements

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
