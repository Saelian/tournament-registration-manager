## ADDED Requirements

### Requirement: Admin Payments Page
The admin interface MUST provide a dedicated page for payment management.

#### Scenario: Payments List Display
- **WHEN** an administrator navigates to `/admin/payments`
- **THEN** a DataTable displays all payments with columns: Inscripteur (name/email), Montant, Date de paiement, Statut, Actions

#### Scenario: Payments Sorting
- **WHEN** an administrator clicks on a column header
- **THEN** payments are sorted by that column (date, amount, status)

#### Scenario: Payments Filtering
- **WHEN** an administrator uses the status filter
- **THEN** only payments matching the selected status are displayed

#### Scenario: Payments Search
- **WHEN** an administrator types in the search bar
- **THEN** payments are filtered in real-time by subscriber name or email

#### Scenario: Refund Requested Highlight
- **WHEN** a payment has status `refund_requested`
- **THEN** it is visually highlighted (e.g., with a colored badge or row background)
- **AND** a "Traiter le remboursement" button is displayed

#### Scenario: Amount Display
- **WHEN** displaying payment amounts
- **THEN** amounts are shown in euros (converted from cents) with proper formatting

### Requirement: Process Refund Modal
The admin interface MUST display a confirmation modal when processing refunds.

#### Scenario: Modal Content
- **WHEN** an administrator clicks "Traiter le remboursement"
- **THEN** a modal displays with:
  - Payment details (subscriber, amount, tables)
  - Warning message explaining that validation confirms the refund was done externally
  - Refund method selector with options: "Remboursement depuis la plateforme HelloAsso", "Virement", "Espèces"
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

## MODIFIED Requirements

### Requirement: Navigation Admin avec Dashboard
La navigation admin MUST inclure un lien vers le dashboard comme page d'accueil.

#### Scenario: Lien Dashboard dans navigation
- **WHEN** un admin consulte le header admin
- **THEN** un lien "Accueil" ou icone maison mene vers /admin/dashboard

#### Scenario: Dashboard comme page par defaut
- **WHEN** un admin accede a /admin
- **THEN** il est redirige vers /admin/dashboard

#### Scenario: Lien Paiements dans navigation
- **WHEN** un admin consulte le header admin
- **THEN** un lien "Paiements" mene vers /admin/payments

## MODIFIED Requirements

### Requirement: Dashboard Admin avec KPIs
L'interface admin MUST afficher un dashboard avec les indicateurs cles de performance du tournoi.

#### Scenario: Affichage des KPIs
- **WHEN** un admin accede a /admin ou /admin/dashboard
- **THEN** une page dashboard affiche les KPIs : total inscrits, revenus totaux, taux de remplissage moyen

#### Scenario: KPI Total inscrits
- **WHEN** le dashboard est affiche
- **THEN** une carte affiche le nombre total d'inscriptions confirmees (statut paid)

#### Scenario: KPI Revenus
- **WHEN** le dashboard est affiche
- **THEN** une carte affiche le total des revenus en euros (somme des paiements recus)

#### Scenario: KPI Taux de remplissage
- **WHEN** le dashboard est affiche
- **THEN** une carte affiche le taux de remplissage moyen de tous les tableaux en pourcentage

#### Scenario: Alertes tableaux presque complets
- **WHEN** un tableau a plus de 80% de remplissage
- **THEN** une alerte est affichee dans la section alertes du dashboard

#### Scenario: Alertes paiements en attente
- **WHEN** des inscriptions sont en attente de paiement depuis plus de 24h
- **THEN** une alerte est affichee dans la section alertes du dashboard

#### Scenario: Alertes remboursements en attente
- **WHEN** des paiements ont le statut `refund_requested`
- **THEN** une alerte est affichée indiquant le nombre de remboursements à traiter
- **AND** un lien vers `/admin/payments` avec filtre sur ce statut est disponible

#### Scenario: Lien vers details
- **WHEN** un admin clique sur une carte KPI ou une alerte
- **THEN** il est redirige vers la page de detail correspondante (tableaux, inscriptions, paiements)
