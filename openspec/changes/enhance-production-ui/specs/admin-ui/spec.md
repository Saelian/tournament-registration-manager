## ADDED Requirements

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

#### Scenario: Lien vers details
- **WHEN** un admin clique sur une carte KPI ou une alerte
- **THEN** il est redirige vers la page de detail correspondante (tableaux, inscriptions)

### Requirement: Navigation Admin avec Dashboard
La navigation admin MUST inclure un lien vers le dashboard comme page d'accueil.

#### Scenario: Lien Dashboard dans navigation
- **WHEN** un admin consulte le header admin
- **THEN** un lien "Accueil" ou icone maison mene vers /admin/dashboard

#### Scenario: Dashboard comme page par defaut
- **WHEN** un admin accede a /admin
- **THEN** il est redirige vers /admin/dashboard

## MODIFIED Requirements

### Requirement: Unified Tournament Management Page
L'interface admin MUST afficher la gestion du tournoi avec les tableaux dans un DataTable triable et filtrable.

#### Scenario: Page Structure
- **WHEN** an admin navigates to /admin/tournament
- **THEN** the page displays tournament config at the top and tables list below in a sortable DataTable

#### Scenario: Tri des tableaux
- **WHEN** un admin clique sur un header de colonne du DataTable
- **THEN** les tableaux sont tries selon cette colonne

#### Scenario: Filtres des tableaux
- **WHEN** un admin utilise les filtres
- **THEN** les tableaux sont filtres par date, taux de remplissage, ou fourchette de points

#### Scenario: Recherche de tableau
- **WHEN** un admin tape dans la barre de recherche
- **THEN** les tableaux sont filtres en temps reel

#### Scenario: Actions rapides
- **WHEN** un admin survole une ligne du tableau
- **THEN** des boutons d'action rapide (editer, supprimer) sont visibles sans navigation

#### Scenario: Tournament Not Configured
- **WHEN** no tournament is configured
- **THEN** the configuration form is displayed without the tables section

#### Scenario: Tournament Configured
- **WHEN** a tournament is configured
- **THEN** the tournament summary cards are displayed followed by the sortable tables DataTable
