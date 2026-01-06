## ADDED Requirements

### Requirement: Admin CLI Creation
The system MUST provide a CLI command to create administrators.

#### Scenario: Création réussie
- **WHEN** un opérateur exécute `node ace admin:create` avec des données valides
- **THEN** un nouvel administrateur est créé en base de données
- **AND** un message de confirmation est affiché

#### Scenario: Email déjà utilisé
- **WHEN** un opérateur tente de créer un admin avec un email existant
- **THEN** une erreur est affichée indiquant que l'email est déjà utilisé
- **AND** aucun administrateur n'est créé

#### Scenario: Mot de passe invalide
- **WHEN** un opérateur fournit un mot de passe de moins de 8 caractères
- **THEN** une erreur est affichée indiquant les critères requis
- **AND** aucun administrateur n'est créé

#### Scenario: Mode interactif
- **WHEN** la commande est exécutée sans arguments
- **THEN** le système demande successivement l'email, le nom complet et le mot de passe
- **AND** le mot de passe n'est pas affiché lors de la saisie

#### Scenario: Aucune route API
- **WHEN** une requête HTTP tente de créer un administrateur
- **THEN** aucune route ne permet cette opération
- **AND** la seule méthode de création reste la commande CLI
