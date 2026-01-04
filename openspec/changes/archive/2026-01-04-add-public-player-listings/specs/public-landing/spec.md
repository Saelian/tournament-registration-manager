## ADDED Requirements

### Requirement: Liste publique des joueurs inscrits
Le système MUST afficher une page publique listant tous les joueurs inscrits au tournoi avec leurs informations non-confidentielles.

#### Scenario: Affichage de la liste globale
- **WHEN** un visiteur accède à la page `/players`
- **THEN** un DataTable affiche tous les joueurs inscrits avec : numéro de licence, nom, prénom, classement, catégorie, club, tableaux inscrits
- **AND** les lignes ne sont PAS cliquables (pas d'accès aux détails privés)

#### Scenario: Tri et recherche
- **WHEN** un visiteur utilise la barre de recherche ou clique sur un header de colonne
- **THEN** les joueurs sont filtrés/triés en temps réel

#### Scenario: Filtrage par jour
- **WHEN** le tournoi a plusieurs jours et le visiteur sélectionne un jour
- **THEN** seuls les joueurs inscrits à au moins un tableau ce jour-là sont affichés

#### Scenario: Compteur de joueurs
- **WHEN** la liste est affichée
- **THEN** un compteur indique le nombre total de joueurs correspondant aux filtres

#### Scenario: Données confidentielles masquées
- **WHEN** un visiteur consulte la liste publique
- **THEN** les informations suivantes ne sont JAMAIS affichées : email, téléphone, dossard, informations de paiement, date d'inscription

### Requirement: Liste des inscrits par tableau
Le système MUST permettre de consulter les joueurs inscrits à un tableau spécifique depuis la page d'accueil.

#### Scenario: Bouton voir inscrits
- **WHEN** un visiteur consulte la liste des tableaux sur la page d'accueil
- **THEN** chaque ligne de tableau affiche un bouton ou lien "Voir les inscrits"

#### Scenario: Nombre d'inscrits visible
- **WHEN** un visiteur consulte la liste des tableaux
- **THEN** le nombre de joueurs inscrits est affiché pour chaque tableau

#### Scenario: Modale liste par tableau
- **WHEN** un visiteur clique sur "Voir les inscrits" d'un tableau
- **THEN** une modale s'ouvre avec la liste des joueurs inscrits à ce tableau uniquement
- **AND** les colonnes affichées sont : licence, nom, prénom, classement, catégorie, club

### Requirement: Lien vers la liste publique depuis l'accueil
La page d'accueil MUST proposer un accès rapide à la liste complète des joueurs inscrits.

#### Scenario: Lien vers liste globale
- **WHEN** un visiteur consulte la page d'accueil avec un tournoi actif
- **THEN** un lien "Voir tous les inscrits" ou équivalent est visible
- **AND** ce lien mène vers la page `/players`

#### Scenario: Compteur dans le Hero ou stats
- **WHEN** un visiteur consulte la page d'accueil avec un tournoi actif
- **THEN** le nombre total de joueurs inscrits est affiché (Hero ou section statistiques)

### Requirement: API publique des inscriptions
Le système MUST exposer un endpoint API public pour récupérer les inscriptions sans données sensibles.

#### Scenario: Endpoint public accessible
- **WHEN** un client appelle `GET /api/registrations/public`
- **THEN** la liste des inscriptions est retournée sans authentification requise

#### Scenario: Données retournées
- **WHEN** l'endpoint est appelé
- **THEN** chaque inscription contient : licence, nom, prénom, points, catégorie, club, tableaux inscrits

#### Scenario: Données exclues
- **WHEN** l'endpoint est appelé
- **THEN** les données suivantes ne sont JAMAIS incluses : email, téléphone, dossard, paiement, subscriber info

#### Scenario: Filtrage par tableau
- **WHEN** un client appelle `GET /api/registrations/public?tableId=123`
- **THEN** seules les inscriptions pour ce tableau sont retournées
