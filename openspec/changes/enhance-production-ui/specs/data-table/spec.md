## ADDED Requirements

### Requirement: Composant SortableDataTable
Le systeme MUST fournir un composant DataTable avance avec tri, recherche et filtres.

#### Scenario: Tri par colonne
- **WHEN** un utilisateur clique sur un header de colonne triable
- **THEN** les donnees sont triees par cette colonne en ordre ascendant, puis descendant au clic suivant

#### Scenario: Indicateur de tri
- **WHEN** une colonne est triee
- **THEN** une icone (fleche haut/bas) indique la direction du tri actif

#### Scenario: Recherche globale
- **WHEN** un utilisateur tape dans la barre de recherche
- **THEN** toutes les colonnes textuelles sont filtrees en temps reel

#### Scenario: Debounce recherche
- **WHEN** un utilisateur tape rapidement
- **THEN** le filtrage est applique avec un debounce de 300ms pour eviter les recalculs excessifs

### Requirement: Filtres avances
Le SortableDataTable MUST supporter des filtres configurables par colonne.

#### Scenario: Filtre dropdown
- **WHEN** une colonne a un filtre de type dropdown configure
- **THEN** un selecteur permet de filtrer par valeur specifique

#### Scenario: Filtre plage numerique
- **WHEN** une colonne a un filtre de type range configure
- **THEN** deux inputs permettent de definir une plage min-max

#### Scenario: Filtres combines
- **WHEN** plusieurs filtres sont actifs
- **THEN** ils s'appliquent en combinaison (ET logique)

#### Scenario: Reset des filtres
- **WHEN** un utilisateur clique sur "Reinitialiser les filtres"
- **THEN** tous les filtres sont remis a leur valeur par defaut

### Requirement: Persistance URL des filtres
Le SortableDataTable MUST persister l'etat des tri et filtres dans l'URL.

#### Scenario: Synchronisation URL
- **WHEN** un utilisateur applique un tri ou filtre
- **THEN** l'URL est mise a jour avec les parametres correspondants

#### Scenario: Restauration depuis URL
- **WHEN** un utilisateur accede a une URL avec parametres de tri/filtre
- **THEN** le DataTable affiche les donnees avec ces tri/filtres appliques

#### Scenario: Partage d'URL
- **WHEN** un utilisateur partage une URL avec filtres
- **THEN** le destinataire voit les memes filtres appliques

### Requirement: Style Neo-Brutalism DataTable
Le SortableDataTable MUST respecter le design system Neo-Brutalism.

#### Scenario: Style des headers
- **WHEN** le DataTable est affiche
- **THEN** les headers ont le style neo-brutal (border-2, bg-secondary, font-bold)

#### Scenario: Style hover
- **WHEN** un utilisateur survole une ligne
- **THEN** un effet hover neo-brutal est applique (bg-secondary/50)

#### Scenario: Style des filtres
- **WHEN** les controles de filtre sont affiches
- **THEN** ils respectent le style neo-brutal (borders, shadows)

### Requirement: Pagination optionnelle
Le SortableDataTable MUST supporter une pagination optionnelle pour les grandes listes.

#### Scenario: Pagination activee
- **WHEN** la pagination est configuree avec pageSize
- **THEN** les donnees sont paginées et des controles de navigation sont affiches

#### Scenario: Changement de page
- **WHEN** un utilisateur clique sur une page ou les fleches de navigation
- **THEN** les donnees de la page correspondante sont affichees

#### Scenario: Info pagination
- **WHEN** la pagination est active
- **THEN** un indicateur affiche "Page X sur Y" et le nombre total d'elements
