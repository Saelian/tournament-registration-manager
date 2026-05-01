## MODIFIED Requirements

### Requirement: Process Refund Modal
The admin interface MUST display a confirmation modal when processing refunds, with two variants: full payment refund and partial registration refund.

#### Scenario: Modal Content — Remboursement total
- **WHEN** an administrator clicks "Traiter le remboursement" on a payment in `refund_requested` status
- **THEN** a modal displays with:
  - Payment details (subscriber, amount, tables)
  - Warning message explaining that validation confirms the refund was done externally
  - Refund method selector with options: "Remboursement depuis la plateforme HelloAsso", "Virement", "Espèces"
  - Confirm and Cancel buttons

#### Scenario: Modal Content — Remboursement partiel
- **WHEN** an administrator clicks "Traiter" on a pending partial refund entry
- **THEN** a modal displays with:
  - Player name, table name, amount to refund
  - Refund method selector with options: "Virement", "Espèces" only (HelloAsso absent car remboursement partiel impossible)
  - Confirm and Cancel buttons

#### Scenario: Refund Method Required
- **WHEN** an administrator tries to confirm without selecting a refund method
- **THEN** an error message is displayed and submission is prevented

#### Scenario: Processing State
- **WHEN** the refund processing request is in progress
- **THEN** the confirm button shows a loading state
- **AND** the modal cannot be closed

#### Scenario: Success Feedback
- **WHEN** the refund is successfully processed
- **THEN** the modal closes
- **AND** a success toast notification is displayed
- **AND** the payments list is refreshed

## ADDED Requirements

### Requirement: Partial Refunds Pending Section
La page `/admin/payments` MUST afficher une section dédiée aux remboursements partiels en attente.

#### Scenario: Section visible si des remboursements partiels sont en attente
- **WHEN** un admin accède à `/admin/payments`
- **AND** au moins une inscription a `cancelled_by_admin_id IS NOT NULL AND refund_status = 'requested'`
- **THEN** une section "Remboursements partiels à traiter" est affichée
- **AND** chaque ligne affiche : joueur, tableau, montant à rembourser, date d'annulation
- **AND** un bouton "Traiter" est disponible sur chaque ligne

#### Scenario: Section absente si aucun remboursement partiel en attente
- **WHEN** aucune inscription n'a de remboursement partiel en attente
- **THEN** la section "Remboursements partiels à traiter" n'est pas affichée

#### Scenario: Compteur dans l'alerte globale
- **WHEN** des remboursements partiels sont en attente
- **THEN** le compteur global de remboursements à traiter inclut ces entrées
