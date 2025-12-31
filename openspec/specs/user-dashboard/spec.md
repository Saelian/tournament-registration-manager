# user-dashboard Specification

## Purpose
TBD - created by archiving change add-user-dashboard. Update Purpose after archive.
## Requirements
### Requirement: Registration List
Le systeme MUST afficher la liste des inscriptions de l'utilisateur connecte dans un DataTable triable et filtrable.

#### Scenario: User with registrations
- **WHEN** a logged-in user accesses their dashboard
- **THEN** all their registrations are listed with details in a sortable DataTable

#### Scenario: Tri des inscriptions
- **WHEN** un utilisateur clique sur un header de colonne
- **THEN** les inscriptions sont triees selon cette colonne (date, nom tableau, statut)

#### Scenario: Filtres des inscriptions
- **WHEN** un utilisateur utilise les filtres de statut
- **THEN** seules les inscriptions correspondant au statut selectionne sont affichees

#### Scenario: Recherche d'inscription
- **WHEN** un utilisateur tape dans la barre de recherche
- **THEN** les inscriptions sont filtrees en temps reel selon le nom du tableau ou du joueur

#### Scenario: User without registration
- **WHEN** a user without registration accesses their dashboard
- **THEN** a "No registration" message and a link to registrations are displayed

#### Scenario: Persistance des filtres
- **WHEN** un utilisateur applique des filtres et rafraichit la page
- **THEN** les filtres sont conserves via l'URL

### Requirement: Registration Status Display
Each registration MUST display its status visually.

#### Scenario: Validated Status (Paid)
- **WHEN** a registration is paid
- **THEN** a green "Validated" badge is displayed

#### Scenario: Pending Payment Status
- **WHEN** a registration is not yet paid
- **THEN** an orange "Pending Payment" badge and a "Pay" button are displayed

#### Scenario: Waitlist Status
- **WHEN** a registration is on the waitlist
- **THEN** a blue "Waitlist" badge with the rank is displayed

#### Scenario: Cancelled Status
- **WHEN** a registration has been cancelled
- **THEN** a grey "Cancelled" badge is displayed

### Requirement: Registration Details
Each registration MUST display essential information.

#### Scenario: Displayed Information
- **WHEN** a registration is displayed
- **THEN** the table name, player name, date/time, and price are visible

### Requirement: Dashboard Navigation
The dashboard MUST allow accessing available actions.

#### Scenario: New Registration
- **WHEN** a user wants to register for a new table
- **THEN** a button/link to the registration form is available

#### Scenario: Unregistration Action
- **WHEN** a registration is active (paid or pending)
- **THEN** an "Unregister" button is available

