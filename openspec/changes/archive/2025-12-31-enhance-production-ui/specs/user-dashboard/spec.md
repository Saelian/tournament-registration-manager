## MODIFIED Requirements

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
