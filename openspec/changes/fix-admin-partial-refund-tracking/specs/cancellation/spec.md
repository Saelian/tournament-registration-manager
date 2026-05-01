## ADDED Requirements

### Requirement: Admin Cancellation Refund Method Constraints
Le système MUST contraindre les méthodes de remboursement disponibles selon le type d'annulation admin.

#### Scenario: Annulation partielle — méthodes disponibles
- **WHEN** un admin annule une seule inscription (un tableau)
- **THEN** seules les méthodes `bank_transfer` et `cash` sont disponibles pour le remboursement
- **AND** la méthode `helloasso_manual` est indisponible car HelloAsso ne supporte pas les remboursements partiels
- **AND** la méthode `check` n'est pas disponible

#### Scenario: Annulation complète — méthodes disponibles
- **WHEN** un admin annule toutes les inscriptions actives d'un joueur
- **THEN** les méthodes `helloasso_manual`, `bank_transfer` et `cash` sont toutes disponibles
- **AND** la méthode `check` n'est pas disponible

#### Scenario: Validation backend annulation partielle
- **WHEN** une requête `DELETE /admin/registrations/:id` reçoit `refundMethod = 'helloasso_manual'` avec `refundStatus = 'done'`
- **THEN** une erreur 400 est retournée
- **AND** l'inscription n'est pas modifiée

### Requirement: Admin Partial Refund Processing
Le système MUST permettre à un admin de marquer comme traité un remboursement partiel en attente.

#### Scenario: Traitement d'un remboursement partiel
- **WHEN** un admin appelle `PATCH /admin/registrations/:id/refund` avec une méthode valide
- **AND** l'inscription a `refund_status = 'requested'` et `cancelled_by_admin_id IS NOT NULL`
- **THEN** l'inscription passe à `refund_status = 'done'`
- **AND** `refunded_at` est posé à l'heure courante
- **AND** `refund_method` est enregistré

#### Scenario: Inscription non éligible au traitement
- **WHEN** un admin appelle `PATCH /admin/registrations/:id/refund`
- **AND** l'inscription n'a pas `refund_status = 'requested'` ou n'est pas annulée par un admin
- **THEN** une erreur 400 est retournée

#### Scenario: Auto-solde du paiement après traitement
- **WHEN** un remboursement partiel est marqué comme traité
- **AND** toutes les inscriptions liées au même paiement ont `status = 'cancelled'`
- **AND** aucune n'a `refund_status = 'requested'`
- **THEN** le paiement passe automatiquement à `status = 'refunded'`
- **AND** `refunded_at` est posé sur le paiement

#### Scenario: Paiement non soldé si inscriptions encore actives
- **WHEN** un remboursement partiel est marqué comme traité
- **AND** au moins une inscription liée au même paiement est encore active (`paid`, `pending_payment`, ou `waitlist`)
- **THEN** le statut du paiement n'est pas modifié
