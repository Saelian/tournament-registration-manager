# admin-ui Specification Delta

## ADDED Requirements

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
