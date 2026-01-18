# player-list-ui Specification

## Purpose
TBD - created by archiving change refactor-player-table-components. Update Purpose after archive.
## Requirements
### Requirement: Composant PlayerTable partagé
Le système MUST fournir un composant `PlayerTable` configurable utilisable en contexte admin et public.

#### Scenario: Affichage avec colonnes configurables
- **WHEN** un développeur utilise `PlayerTable` avec un tableau de colonnes
- **THEN** le tableau affiche les colonnes spécifiées dans l'ordre donné
- **AND** chaque colonne peut avoir un rendu personnalisé via `render`

#### Scenario: Tri par colonne
- **WHEN** une colonne a `sortable: true`
- **THEN** un clic sur le header trie les données par cette colonne

#### Scenario: Filtre par jour
- **WHEN** `showDayFilter` est activé et `tournamentDays` est fourni
- **THEN** un sélecteur permet de filtrer les joueurs par jour de tournoi

#### Scenario: Recherche
- **WHEN** `showSearch` est activé (par défaut)
- **THEN** une barre de recherche filtre les joueurs par nom, prénom, licence

#### Scenario: Pagination
- **WHEN** `pageSize` est défini
- **THEN** les données sont paginées avec des contrôles de navigation

#### Scenario: Vue mobile responsive
- **WHEN** l'écran est en mode mobile (< md breakpoint)
- **AND** `mobileCardRender` est fourni
- **THEN** les joueurs sont affichés en cartes au lieu du tableau

#### Scenario: Clic sur une ligne
- **WHEN** `onRowClick` est défini et un utilisateur clique sur une ligne
- **THEN** le callback est appelé avec les données du joueur

### Requirement: Composant TableAccordion partagé
Le système MUST fournir un composant `TableAccordion` pour afficher les inscriptions groupées par tableau.

#### Scenario: Affichage des tableaux en accordion
- **WHEN** `TableAccordion` reçoit une liste de tableaux et d'inscriptions
- **THEN** chaque tableau est affiché comme un item d'accordion dépliable

#### Scenario: Header avec progress bar
- **WHEN** un item d'accordion est affiché
- **THEN** le header montre le nom du tableau, le taux de remplissage (progress bar), et le compteur inscrits/quota

#### Scenario: Contenu avec liste de joueurs
- **WHEN** un item d'accordion est déplié
- **THEN** le contenu affiche la liste des joueurs via `renderPlayerTable`

#### Scenario: Affichage de la liste d'attente
- **WHEN** des inscriptions ont le statut `waitlist` pour un tableau
- **AND** `renderWaitlist` est fourni
- **THEN** la liste d'attente est affichée sous les inscriptions confirmées

#### Scenario: Actions personnalisées dans le header
- **WHEN** `renderHeaderActions` est fourni
- **THEN** les actions sont affichées dans le header de chaque tableau (ex: bouton export CSV)

#### Scenario: Compteur de présence (admin)
- **WHEN** `showPresenceCount` est activé
- **THEN** un badge affiche le nombre de joueurs pointés sur le total confirmé

### Requirement: Composant WaitlistDisplay partagé
Le système MUST fournir un composant `WaitlistDisplay` pour afficher les joueurs en liste d'attente.

#### Scenario: Affichage de la liste d'attente
- **WHEN** `WaitlistDisplay` reçoit une liste d'inscriptions en attente
- **THEN** les joueurs sont affichés avec leur rang, nom, points et licence

#### Scenario: Tri par rang
- **WHEN** la liste d'attente est affichée
- **THEN** les joueurs sont triés par `waitlistRank` croissant

#### Scenario: Actions admin (promouvoir)
- **WHEN** `showAdminActions` est activé
- **AND** `onPromote` est fourni
- **THEN** un bouton "Promouvoir" est affiché pour chaque joueur

#### Scenario: Bouton promouvoir désactivé si quota atteint
- **WHEN** `showAdminActions` est activé
- **AND** le tableau a atteint son quota
- **THEN** le bouton "Promouvoir" est désactivé avec un tooltip explicatif

### Requirement: Hook useAggregatedPlayers générique
Le système MUST fournir un hook `useAggregatedPlayers` pour agréger les inscriptions par joueur.

#### Scenario: Agrégation des inscriptions
- **WHEN** le hook reçoit une liste d'inscriptions
- **THEN** il retourne une liste de joueurs uniques avec leurs tableaux agrégés

#### Scenario: Filtre par jour
- **WHEN** un `dayFilter` est passé en option
- **THEN** seules les inscriptions correspondant à ce jour sont incluses

#### Scenario: Support des types admin et public
- **WHEN** le hook est utilisé avec `RegistrationData` (admin)
- **THEN** l'agrégation inclut les données sensibles (dossard, statuts, paiements)
- **WHEN** le hook est utilisé avec `PublicRegistrationData` (public)
- **THEN** l'agrégation n'inclut que les données publiques

### Requirement: Vue mobile avec MobilePlayerCard
Le système MUST fournir un composant `MobilePlayerCard` pour l'affichage mobile des joueurs.

#### Scenario: Affichage des informations joueur
- **WHEN** une carte mobile est affichée
- **THEN** elle montre le nom (en majuscules), prénom, points, licence, catégorie et club

#### Scenario: Affichage des tableaux inscrits
- **WHEN** le joueur est inscrit à plusieurs tableaux
- **AND** `showTableColumn` est activé
- **THEN** les badges des tableaux sont affichés en bas de la carte

#### Scenario: Style Neo-Brutalism
- **WHEN** la carte est affichée
- **THEN** elle utilise le style Neo-Brutalism (border-2, shadow-offset)

