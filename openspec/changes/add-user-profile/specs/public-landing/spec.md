# public-landing Specification Delta

## MODIFIED Requirements

### Requirement: Affichage de l'etat de connexion utilisateur
Le header public MUST afficher l'etat de connexion de l'utilisateur inscrit via un avatar et menu déroulant.

#### Scenario: Utilisateur connecte avec profil complet
- **WHEN** un utilisateur avec profil complet est connecte (session active)
- **THEN** un avatar avec ses initiales (premiere lettre prenom + premiere lettre nom) est affiche dans le header

#### Scenario: Utilisateur connecte avec profil incomplet
- **WHEN** un utilisateur avec profil incomplet est connecte
- **THEN** un avatar avec une icone generique est affiche dans le header

#### Scenario: Utilisateur non connecte
- **WHEN** aucun utilisateur n'est connecte
- **THEN** un bouton "Se connecter" est affiche dans le header

### Requirement: Acces au dashboard utilisateur
Le header public MUST permettre a un utilisateur connecte d'acceder facilement a son dashboard via le menu deroulant.

#### Scenario: Lien vers le dashboard
- **WHEN** un utilisateur est connecte et ouvre le menu deroulant
- **THEN** une option "Mes inscriptions" mene vers /dashboard

#### Scenario: Dashboard non accessible si deconnecte
- **WHEN** un utilisateur n'est pas connecte
- **THEN** le menu deroulant n'est pas affiche

## ADDED Requirements

### Requirement: Acces au profil utilisateur
Le header public MUST permettre a un utilisateur connecte d'acceder a son profil.

#### Scenario: Lien vers le profil
- **WHEN** un utilisateur est connecte et ouvre le menu deroulant
- **THEN** une option "Mon profil" mene vers /profile

### Requirement: Deconnexion depuis le menu
Le header public MUST permettre a un utilisateur de se deconnecter depuis le menu deroulant.

#### Scenario: Option deconnexion
- **WHEN** un utilisateur est connecte et ouvre le menu deroulant
- **THEN** une option "Deconnexion" est disponible et deconnecte l'utilisateur
