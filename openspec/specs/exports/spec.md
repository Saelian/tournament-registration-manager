# exports Specification

## Purpose
TBD - created by archiving change add-csv-exports. Update Purpose after archive.
## Requirements
### Requirement: Export Tableaux CSV
Le système MUST permettre aux administrateurs d'exporter les tableaux en format CSV.

#### Scenario: Export complet
- **WHEN** l'administrateur clique sur "Exporter CSV" dans `/admin/tables`
- **THEN** une modale de configuration s'ouvre

#### Scenario: Compatibilité avec l'import
- **WHEN** le fichier CSV est généré
- **THEN** il MUST être réimportable via la fonction d'import existante

#### Scenario: Colonnes disponibles
- **WHEN** la modale s'ouvre
- **THEN** les colonnes proposées incluent : lettre de référence, nom, date, heure de début, points min, points max, quota, prix, spécial, restriction de genre, catégories autorisées, heure limite de pointage, non numéroté uniquement

### Requirement: Export Inscriptions CSV
Le système MUST permettre aux administrateurs d'exporter les inscriptions en format CSV avec des options de filtrage par présence.

#### Scenario: Export par tableau avec filtre de présence
- **WHEN** l'administrateur exporte un tableau en CSV
- **THEN** une option "Présents uniquement" est disponible dans la modale d'export

#### Scenario: Export présents uniquement activé
- **WHEN** l'option "Présents uniquement" est cochée lors de l'export
- **THEN** seuls les joueurs ayant un check-in enregistré sont exportés

#### Scenario: Export sans filtre de présence
- **WHEN** l'option "Présents uniquement" n'est pas cochée (par défaut)
- **THEN** tous les joueurs inscrits (payés ou en attente de paiement) sont exportés

#### Scenario: Colonnes disponibles enrichies
- **WHEN** la modale s'ouvre pour un export d'inscriptions
- **THEN** les colonnes proposées incluent une nouvelle colonne "Présence" (Oui/Non) et "Heure de pointage"

#### Scenario: Valeur de la colonne Présence
- **WHEN** la colonne "Présence" est incluse dans l'export
- **THEN** elle affiche "Oui" pour les joueurs pointés et "Non" pour les autres

#### Scenario: Valeur de la colonne Heure de pointage
- **WHEN** la colonne "Heure de pointage" est incluse dans l'export
- **THEN** elle affiche l'heure au format HH:mm pour les joueurs pointés, vide sinon

### Requirement: Export Paiements CSV
Le système MUST permettre aux administrateurs d'exporter les paiements en format CSV.

#### Scenario: Export complet
- **WHEN** l'administrateur clique sur "Exporter CSV" dans `/admin/payments`
- **THEN** une modale de configuration s'ouvre

#### Scenario: Respect des filtres
- **WHEN** des filtres sont actifs (statut, recherche) au moment de l'export
- **THEN** l'export reflète exactement les données filtrées

#### Scenario: Colonnes disponibles
- **WHEN** la modale s'ouvre
- **THEN** les colonnes proposées incluent : date, inscripteur (nom, prénom, email), montant, méthode de paiement, statut, méthode de remboursement, date de remboursement, joueurs concernés, tableaux concernés

### Requirement: Modale de Configuration d'Export
Le système MUST afficher une modale de configuration avant chaque export CSV.

#### Scenario: Sélection des colonnes
- **WHEN** la modale s'ouvre
- **THEN** l'administrateur peut cocher/décocher les colonnes à exporter

#### Scenario: Nom personnalisé des colonnes
- **WHEN** la modale s'ouvre
- **THEN** chaque colonne a un champ texte modifiable pour son nom d'en-tête
- **AND** par défaut, le nom est celui du modèle de données

#### Scenario: Choix du séparateur
- **WHEN** la modale s'ouvre
- **THEN** l'administrateur peut choisir entre point-virgule (;), virgule (,) et tabulation

#### Scenario: Nom du fichier
- **WHEN** l'export est lancé
- **THEN** le fichier est nommé avec le type d'export et la date (ex: `tableaux-2026-01-03.csv`)

### Requirement: Format CSV
Les exports CSV MUST être au format compatible Excel.

#### Scenario: Encodage
- **WHEN** un fichier CSV est généré
- **THEN** il utilise l'encodage UTF-8 avec BOM pour la compatibilité Excel

#### Scenario: Séparateur par défaut
- **WHEN** aucun séparateur n'est choisi
- **THEN** le séparateur par défaut est le point-virgule (;) (standard français)

### Requirement: Accès Administrateur Uniquement
Les exports CSV MUST être réservés aux administrateurs authentifiés.

#### Scenario: Protection des routes
- **WHEN** un utilisateur non-administrateur tente d'accéder aux endpoints d'export
- **THEN** une erreur 401/403 est retournée

#### Scenario: Absence d'export côté utilisateur
- **WHEN** un utilisateur standard utilise l'application
- **THEN** aucun bouton ou fonctionnalité d'export n'est visible

