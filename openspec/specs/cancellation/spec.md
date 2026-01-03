# cancellation Specification

## Purpose
TBD - created by archiving change update-payment-refund-flow. Update Purpose after archive.
## Requirements
### Requirement: Unregistration Without Refund
Le système MUST permettre la désinscription d'un tableau sans remboursement.

#### Scenario: Désinscription simple
- **WHEN** un utilisateur demande la désinscription d'un tableau payé sans remboursement
- **THEN** la Registration passe au statut `cancelled`
- **AND** le Payment associé reste au statut `succeeded`
- **AND** la place est libérée (déclenche waitlist automation si applicable)

#### Scenario: Désinscription d'un tableau pending_payment
- **WHEN** un utilisateur se désinscrit d'un tableau en `pending_payment`
- **THEN** la Registration passe au statut `cancelled`
- **AND** aucune logique de remboursement n'est déclenchée

#### Scenario: Désinscription d'un tableau déjà annulé
- **WHEN** un utilisateur tente de se désinscrire d'un tableau déjà `cancelled`
- **THEN** une erreur est retournée "Cette inscription est déjà annulée"

### Requirement: Full Refund Request
Le système MUST permettre le remboursement total d'un paiement avec annulation de toutes les inscriptions liées.

#### Scenario: Demande de remboursement valide
- **WHEN** un utilisateur demande le remboursement d'un paiement `succeeded`
- **THEN** toutes les Registration liées au Payment passent à `cancelled`
- **AND** le Payment passe d'abord à `refund_pending` puis à `refunded` après confirmation HelloAsso
- **AND** les places sont libérées pour tous les tableaux

#### Scenario: Inscriptions déjà partiellement annulées
- **WHEN** un remboursement est demandé et certaines inscriptions sont déjà `cancelled`
- **THEN** seules les inscriptions encore actives sont annulées
- **AND** le remboursement total est quand même effectué (montant initial du paiement)

#### Scenario: Vérification propriétaire du paiement
- **WHEN** un utilisateur demande le remboursement d'un paiement qui ne lui appartient pas
- **THEN** une erreur 403 Forbidden est retournée

### Requirement: Refund Deadline
Le système MUST respecter la date limite de remboursement configurée sur le tournoi.

#### Scenario: Remboursement avant la deadline
- **WHEN** un remboursement est demandé avant la `refundDeadline` du tournoi
- **THEN** le remboursement est autorisé

#### Scenario: Remboursement après la deadline
- **WHEN** un remboursement est demandé après la `refundDeadline` du tournoi
- **THEN** une erreur est retournée "La date limite de remboursement est dépassée"
- **AND** l'utilisateur peut toujours se désinscrire sans remboursement

#### Scenario: Pas de deadline configurée (null)
- **WHEN** le tournoi n'a pas de `refundDeadline` configurée (null)
- **THEN** le remboursement est autorisé jusqu'au jour du tournoi (`startDate`)

#### Scenario: Validation de la deadline à la configuration
- **WHEN** un admin configure une `refundDeadline`
- **THEN** la date ne peut pas être supérieure à la `startDate` du tournoi
- **AND** une erreur de validation est retournée si la contrainte n'est pas respectée

### Requirement: Place Release on Cancellation
Le système MUST libérer la place lors d'une annulation.

#### Scenario: Place libérée
- **WHEN** une inscription est annulée (avec ou sans remboursement)
- **THEN** la place est libérée et redevient disponible pour d'autres inscriptions
- **AND** le quota du tableau est mis à jour en temps réel

### Requirement: Cancellation Audit Log
Le système MUST enregistrer les annulations et remboursements pour audit.

#### Scenario: Log d'annulation simple
- **WHEN** une inscription est annulée sans remboursement
- **THEN** un log est créé avec : registration_id, user_id, timestamp, type="unregistration"

#### Scenario: Log de remboursement
- **WHEN** un remboursement est effectué
- **THEN** un log est créé avec : payment_id, user_id, timestamp, type="refund", amount, helloasso_response

#### Scenario: Log d'échec de remboursement
- **WHEN** un remboursement échoue
- **THEN** un log est créé avec : payment_id, user_id, timestamp, type="refund_failed", error_details

