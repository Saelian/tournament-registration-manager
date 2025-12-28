# user-profile Specification

## Purpose
TBD - created by archiving change add-user-profile. Update Purpose after archive.
## Requirements
### Requirement: Informations de profil utilisateur
Le système MUST stocker les informations de contact de chaque utilisateur.

#### Scenario: Champs obligatoires
- **WHEN** un utilisateur complète son profil
- **THEN** les champs prénom, nom et téléphone sont obligatoires

#### Scenario: Validation du prénom
- **WHEN** un utilisateur saisit un prénom
- **THEN** il doit contenir entre 2 et 50 caractères alphanumériques (lettres, espaces, tirets, apostrophes)

#### Scenario: Validation du nom
- **WHEN** un utilisateur saisit un nom
- **THEN** il doit contenir entre 2 et 50 caractères alphanumériques (lettres, espaces, tirets, apostrophes)

#### Scenario: Validation du téléphone
- **WHEN** un utilisateur saisit un numéro de téléphone
- **THEN** il doit être au format français (10 chiffres commençant par 0)

#### Scenario: Erreur de validation
- **WHEN** un champ ne respecte pas les règles de validation
- **THEN** un message d'erreur explicite est affiché sous le champ concerné

### Requirement: Complétion obligatoire du profil
Le système MUST afficher une modale de complétion de profil lors de la première connexion.

#### Scenario: Profil incomplet détecté
- **WHEN** un utilisateur se connecte et son profil est incomplet (prénom, nom ou téléphone manquant)
- **THEN** une modale de complétion de profil est affichée automatiquement

#### Scenario: Modale non fermable sans complétion
- **WHEN** la modale de complétion est affichée
- **THEN** l'utilisateur ne peut pas la fermer sans avoir rempli tous les champs obligatoires

#### Scenario: Validation des données dans la modale
- **WHEN** l'utilisateur soumet le formulaire de complétion
- **THEN** les données sont validées côté frontend ET côté backend

#### Scenario: Profil complet
- **WHEN** un utilisateur avec un profil complet se connecte
- **THEN** aucune modale n'est affichée

### Requirement: Modification du profil
Le système MUST permettre à l'utilisateur de modifier ses informations de profil.

#### Scenario: Accès à la page de profil
- **WHEN** un utilisateur connecté accède à /profile
- **THEN** un formulaire prérempli avec ses informations actuelles est affiché

#### Scenario: Modification des informations
- **WHEN** un utilisateur modifie ses informations et soumet le formulaire
- **THEN** les données sont mises à jour après validation

#### Scenario: Confirmation de modification
- **WHEN** les informations sont mises à jour avec succès
- **THEN** un message de confirmation est affiché

#### Scenario: Erreur de modification
- **WHEN** la mise à jour échoue (erreur serveur)
- **THEN** un message d'erreur est affiché et les données ne sont pas perdues

### Requirement: API de mise à jour du profil
Le système MUST exposer un endpoint pour mettre à jour le profil utilisateur.

#### Scenario: Mise à jour réussie
- **WHEN** une requête PATCH /auth/user/profile est envoyée avec des données valides
- **THEN** le profil de l'utilisateur authentifié est mis à jour et les nouvelles données sont retournées

#### Scenario: Données invalides
- **WHEN** une requête PATCH /auth/user/profile est envoyée avec des données invalides
- **THEN** une erreur de validation avec code `VALIDATION_ERROR` est retournée

#### Scenario: Utilisateur non authentifié
- **WHEN** une requête PATCH /auth/user/profile est envoyée sans session valide
- **THEN** une erreur `UNAUTHORIZED` est retournée

### Requirement: Protection des données de profil
Le système MUST garantir l'isolation des données de profil entre utilisateurs.

#### Scenario: Identification par session uniquement
- **WHEN** l'endpoint PATCH /auth/user/profile est appelé
- **THEN** l'utilisateur cible est déterminé exclusivement par la session authentifiée (pas de paramètre userId dans l'URL ou le body)

#### Scenario: Accès limité à son propre profil
- **WHEN** un utilisateur authentifié appelle GET /auth/me ou PATCH /auth/user/profile
- **THEN** seules SES propres informations sont retournées ou modifiées

#### Scenario: Pas d'énumération des profils
- **WHEN** un attaquant tente d'accéder aux profils d'autres utilisateurs
- **THEN** aucun endpoint ne permet de lister ou d'accéder aux profils d'autres utilisateurs

#### Scenario: Données sensibles non exposées publiquement
- **WHEN** les endpoints publics retournent des données utilisateur (ex: inscriptions)
- **THEN** les informations sensibles (téléphone) ne sont pas incluses dans les réponses publiques

### Requirement: Avatar utilisateur
Le système MUST afficher un avatar avec les initiales de l'utilisateur.

#### Scenario: Avatar avec initiales
- **WHEN** un utilisateur a un profil complet (prénom et nom renseignés)
- **THEN** un avatar affiche la première lettre du prénom et la première lettre du nom en majuscules

#### Scenario: Avatar sans initiales
- **WHEN** un utilisateur n'a pas de profil complet
- **THEN** l'avatar affiche une icône générique utilisateur

### Requirement: Menu déroulant utilisateur
Le système MUST afficher un menu déroulant depuis l'avatar dans le header.

#### Scenario: Ouverture du menu
- **WHEN** un utilisateur clique sur son avatar
- **THEN** un menu déroulant s'affiche avec les options disponibles

#### Scenario: Option Mon profil
- **WHEN** le menu est ouvert
- **THEN** une option "Mon profil" est disponible et mène vers /profile

#### Scenario: Option Mes inscriptions
- **WHEN** le menu est ouvert
- **THEN** une option "Mes inscriptions" est disponible et mène vers /dashboard

#### Scenario: Option Déconnexion
- **WHEN** le menu est ouvert
- **THEN** une option "Déconnexion" est disponible et déconnecte l'utilisateur

#### Scenario: Fermeture du menu
- **WHEN** l'utilisateur clique en dehors du menu ou sélectionne une option
- **THEN** le menu se ferme

