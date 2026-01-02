# admin-ui Specification

## Purpose
TBD - created by archiving change update-admin-ui. Update Purpose after archive.
## Requirements
### Requirement: Reusable Card Component
The system MUST provide a reusable Card component with neo-brutalist styling.

#### Scenario: Card with Header and Content
- **WHEN** a developer uses Card with CardHeader and CardContent
- **THEN** the card displays with border-2, shadow offset, and proper spacing

#### Scenario: Card Variants
- **WHEN** a Card component is rendered
- **THEN** it applies the neo-brutal style: `border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`

#### Scenario: Card Composition
- **WHEN** using Card sub-components (CardHeader, CardTitle, CardDescription, CardContent, CardFooter)
- **THEN** each sub-component renders with appropriate typography and spacing

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

### Requirement: Simplified Admin Navigation
The admin navigation MUST have a single entry point for tournament management.

#### Scenario: Navigation Links
- **WHEN** an admin views the admin header
- **THEN** only "Tournoi" (or "Gestion") link is visible, not separate "Tableaux" link

#### Scenario: Direct URL Access
- **WHEN** a user navigates to /admin/tables directly
- **THEN** they are redirected to /admin/tournament

### Requirement: Tournament Edit Form in Card
The tournament edit form MUST be wrapped in a Card component for visual consistency.

#### Scenario: Edit Mode Display
- **WHEN** an admin clicks "Modifier la configuration"
- **THEN** the edit form is displayed inside a Card component

#### Scenario: Create Mode Display
- **WHEN** no tournament exists and the form is shown
- **THEN** the create form is displayed inside a Card component

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

### Requirement: Listing Admin des Inscriptions
Le dashboard admin MUST permettre de lister et filtrer les inscriptions des joueurs.

#### Scenario: Listing Global
- **WHEN** un admin navigue vers `/admin/registrations`
- **THEN** un tableau listant tous les joueurs inscrits est affiché
- **AND** le tableau affiche : Dossard, Nom, Prénom, Licence, Classement

#### Scenario: Filtrage par Jour
- **WHEN** un admin sélectionne un jour spécifique dans le filtre
- **THEN** seuls les joueurs inscrits à au moins un tableau ce jour-là sont affichés

#### Scenario: Listing par Tableau
- **WHEN** un admin consulte les inscriptions d'un tableau spécifique
- **THEN** seules les inscriptions valides pour ce tableau sont listées

### Requirement: Détails Joueur Admin
Le système MUST permettre de consulter les détails complets d'un joueur et de son inscription.

#### Scenario: Ouverture Modale Détails
- **WHEN** un admin clique sur un joueur dans un listing
- **THEN** une modale s'ouvre avec les détails du joueur, de l'inscripteur, et des paiements

#### Scenario: Contenu Détails
- **WHEN** la modale détails est affichée
- **THEN** elle contient : infos joueur (nom, licence, dossard), contact (email, héléphone), liste de tous les tableaux inscrits, et statut paiement

### Requirement: Administration de la FAQ
L'interface admin MUST permettre de gérer les questions/réponses de la FAQ du tournoi.

#### Scenario: Section FAQ dans la configuration
- **WHEN** un admin accède à la page de configuration du tournoi (`/admin/tournament`)
- **THEN** une section "FAQ" est visible sous les autres paramètres de configuration

#### Scenario: Affichage de la liste des questions
- **WHEN** la section FAQ est affichée
- **THEN** toutes les questions existantes sont listées avec leur réponse (tronquée si longue)

#### Scenario: Ajout d'une question
- **WHEN** un admin clique sur "Ajouter une question"
- **THEN** un dialogue s'ouvre avec des champs pour la question et la réponse

#### Scenario: Validation à l'ajout
- **WHEN** un admin soumet une question avec moins de 5 caractères ou une réponse avec moins de 10 caractères
- **THEN** un message d'erreur de validation s'affiche

#### Scenario: Modification d'une question
- **WHEN** un admin clique sur le bouton "Modifier" d'une question
- **THEN** un dialogue pré-rempli s'ouvre pour modifier la question et la réponse

#### Scenario: Suppression d'une question
- **WHEN** un admin clique sur le bouton "Supprimer" d'une question
- **THEN** une confirmation est demandée, puis la question est supprimée

#### Scenario: Réordonnancement des questions
- **WHEN** un admin utilise les boutons ↑/↓ sur une question
- **THEN** l'ordre d'affichage de la question est modifié

#### Scenario: Sauvegarde des modifications
- **WHEN** un admin modifie la FAQ (ajout, édition, suppression, réordonnancement)
- **THEN** les modifications sont sauvegardées lors de la soumission globale du formulaire de configuration

