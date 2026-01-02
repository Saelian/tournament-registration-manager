## ADDED Requirements

### Requirement: Attribution du numéro de dossard
Le système MUST attribuer automatiquement un numéro de dossard unique à chaque joueur lors de sa première inscription à un tournoi.

#### Scenario: Première inscription d'un joueur au tournoi
- **WHEN** un joueur s'inscrit pour la première fois à un tableau d'un tournoi
- **THEN** un numéro de dossard lui est attribué (égal au plus grand numéro existant + 1, ou 1 si aucun joueur inscrit)

#### Scenario: Inscriptions multiples au même tournoi
- **WHEN** un joueur déjà inscrit à un tableau s'inscrit à un autre tableau du même tournoi
- **THEN** il conserve son numéro de dossard existant

#### Scenario: Unicité du dossard par tournoi
- **WHEN** deux joueurs s'inscrivent au même tournoi
- **THEN** chacun reçoit un numéro de dossard différent

#### Scenario: Persistance multi-jours
- **WHEN** un tournoi se déroule sur plusieurs jours et un joueur s'inscrit à des tableaux de jours différents
- **THEN** le joueur conserve le même numéro de dossard sur tous les jours

### Requirement: Non-réutilisation des numéros de dossard
Le système MUST conserver les numéros de dossard attribués, même après désinscription, pour simplifier la gestion le jour du tournoi.

#### Scenario: Désinscription d'un joueur
- **WHEN** un joueur se désinscrit de toutes ses inscriptions à un tournoi
- **THEN** son numéro de dossard reste attribué et n'est pas réutilisé pour un autre joueur

#### Scenario: Nouvelle inscription après désinscription complète
- **WHEN** un joueur se réinscrit après s'être complètement désinscrit
- **THEN** il récupère son numéro de dossard précédent (pas de nouveau numéro)

### Requirement: Affichage du numéro de dossard
Le système MUST afficher le numéro de dossard dans les interfaces utilisateur et administrateur.

#### Scenario: Affichage sur le dashboard utilisateur
- **WHEN** un utilisateur consulte son dashboard avec ses inscriptions
- **THEN** le numéro de dossard est affiché pour chaque inscription confirmée

#### Scenario: Affichage dans l'interface admin
- **WHEN** un administrateur consulte la liste des inscriptions
- **THEN** le numéro de dossard de chaque joueur est visible

#### Scenario: Retour API
- **WHEN** l'API retourne les données d'une inscription
- **THEN** le champ `bibNumber` est inclus dans la réponse
