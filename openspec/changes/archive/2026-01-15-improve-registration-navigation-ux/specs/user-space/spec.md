# user-space Specification

## Purpose
Page unifiée "Mon espace" permettant aux utilisateurs de gérer leurs inscriptions et informations de contact depuis un seul point d'entrée visible dans la navigation principale.

## ADDED Requirements

### Requirement: Page Mon espace avec onglets
Le système MUST afficher une page unifiée avec deux onglets pour les utilisateurs connectés.

#### Scenario: Structure de la page
- **WHEN** un utilisateur connecté accède à `/profile`
- **THEN** une page avec deux onglets est affichée : "Mes inscriptions" et "Mes informations"
- **AND** l'onglet "Mes inscriptions" est sélectionné par défaut

#### Scenario: Navigation par onglets
- **WHEN** un utilisateur clique sur un onglet
- **THEN** le contenu correspondant est affiché
- **AND** l'URL est mise à jour avec un paramètre (ex: `/profile?tab=infos`)

#### Scenario: Accès direct à un onglet
- **WHEN** un utilisateur accède à `/profile?tab=infos`
- **THEN** l'onglet "Mes informations" est sélectionné directement

#### Scenario: État de l'onglet actif
- **WHEN** un onglet est actif
- **THEN** il est visuellement mis en évidence (style différent)

---

### Requirement: Contenu onglet Mes inscriptions
L'onglet "Mes inscriptions" MUST afficher le contenu actuel du dashboard.

#### Scenario: Affichage des inscriptions
- **WHEN** l'onglet "Mes inscriptions" est actif
- **THEN** les inscriptions groupées par paiement sont affichées
- **AND** les inscriptions en attente de paiement sont affichées
- **AND** les inscriptions en liste d'attente sont affichées

#### Scenario: Actions disponibles
- **WHEN** l'onglet "Mes inscriptions" est actif
- **THEN** la recherche, les filtres et le tri sont disponibles
- **AND** les actions de désinscription/remboursement sont accessibles

---

### Requirement: Contenu onglet Mes informations
L'onglet "Mes informations" MUST afficher le formulaire de profil.

#### Scenario: Affichage du formulaire
- **WHEN** l'onglet "Mes informations" est actif
- **THEN** le formulaire de modification du profil est affiché
- **AND** les champs sont préremplis avec les données actuelles

#### Scenario: Sauvegarde du profil
- **WHEN** l'utilisateur modifie ses informations et valide
- **THEN** les données sont sauvegardées
- **AND** l'utilisateur reste sur la page Mon espace (même onglet)
- **AND** un message de confirmation est affiché

---

### Requirement: Bouton Mon espace dans la navigation
La navigation principale MUST afficher un bouton "Mon espace" visible pour les utilisateurs connectés.

#### Scenario: Affichage du bouton
- **WHEN** un utilisateur est connecté
- **THEN** un bouton "Mon espace" est visible dans la barre de navigation principale
- **AND** le bouton est positionné avant l'avatar utilisateur

#### Scenario: Clic sur le bouton
- **WHEN** un utilisateur clique sur "Mon espace"
- **THEN** il est redirigé vers `/profile`

#### Scenario: État actif du bouton
- **WHEN** l'utilisateur est sur la page `/profile`
- **THEN** le bouton "Mon espace" a un style "actif" (similaire aux autres NavItems)

---

### Requirement: Redirections de compatibilité
Le système MUST rediriger les anciennes URLs vers la nouvelle page.

#### Scenario: Redirection dashboard
- **WHEN** un utilisateur accède à `/dashboard`
- **THEN** il est redirigé vers `/profile`

#### Scenario: Redirection profile
- **WHEN** un utilisateur accède à `/profile`
- **THEN** il est redirigé vers `/profile?tab=infos`

---

### Requirement: Menu avatar simplifié
Le menu déroulant de l'avatar MUST être simplifié pour ne contenir que la déconnexion.

#### Scenario: Contenu du menu avatar
- **WHEN** un utilisateur connecté clique sur son avatar
- **THEN** un menu avec uniquement l'option "Déconnexion" est affiché

#### Scenario: Affichage de l'avatar
- **WHEN** un utilisateur est connecté
- **THEN** l'avatar avec ses initiales reste visible à côté du bouton "Mon espace"
