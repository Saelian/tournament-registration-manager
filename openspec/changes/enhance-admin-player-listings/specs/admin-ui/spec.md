# admin-ui Spec Delta

## ADDED Requirements

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
