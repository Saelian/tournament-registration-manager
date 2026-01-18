# Delta Spec : admin-registration

## Purpose

Ce delta modifie la spécification `admin-registration` pour ajouter le suivi de l'administrateur qui a créé une inscription.

---

## MODIFIED Requirements

### Requirement: Admin Created Flag

Le système MUST identifier les inscriptions créées par un administrateur et conserver une référence vers cet administrateur.

#### Scenario: Marquage automatique

- **WHEN** une inscription est créée via le formulaire admin
- **THEN** elle est marquée avec `is_admin_created = true`
- **AND** l'id de l'admin connecté est stocké dans `admin_id`

#### Scenario: Affichage du créateur

- **WHEN** une inscription admin est affichée dans l'interface
- **THEN** le nom et l'email de l'admin créateur sont affichés
- **AND** ils remplacent l'affichage du "Système Tournament"

#### Scenario: Inscriptions sans admin_id (rétro-compatibilité)

- **WHEN** une inscription a `is_admin_created = true` mais `admin_id = null`
- **THEN** l'interface affiche "Admin (non tracé)" comme indicateur visuel

#### Scenario: Filtrage admin

- **WHEN** l'admin consulte la liste des inscriptions
- **THEN** il peut filtrer les inscriptions créées par admin

#### Scenario: Affichage distinctif

- **WHEN** une inscription admin est affichée dans une liste
- **THEN** un indicateur visuel la distingue des inscriptions classiques

---

### Requirement: System User for Admin Registrations

Le système MUST conserver le User système pour les inscriptions admin comme référence de `userId`, tout en stockant l'admin créateur séparément.

#### Scenario: Création du User système

- **WHEN** l'application démarre
- **THEN** un User système avec email "system@tournament.local" existe
- **AND** ce User ne peut pas se connecter (pas d'OTP possible)

#### Scenario: Rattachement des inscriptions admin

- **WHEN** l'admin crée une inscription sans compte utilisateur associé
- **THEN** l'inscription est rattachée au User système (`user_id`)
- **AND** l'id de l'admin créateur est stocké dans `admin_id`

#### Scenario: API Response

- **WHEN** l'API retourne une inscription admin
- **THEN** la réponse contient `createdByAdmin` avec les infos de l'admin (nom, email)
- **AND** si `admin_id` est null, `createdByAdmin` est null

---

## MODIFIED Requirements (API)

### Requirement: Admin Registration API

Le système MUST exposer un endpoint pour créer des inscriptions admin.

#### Scenario: Création réussie

- **WHEN** POST /admin/registrations avec player_id, table_ids, payment_method, bypass_rules, collected
- **THEN** les inscriptions sont créées avec `admin_id` = admin courant

#### Scenario: Réponse avec infos admin

- **WHEN** GET /admin/registrations ou GET /admin/tables/:id/registrations
- **THEN** la réponse contient pour chaque inscription `createdByAdmin: { id, fullName, email } | null`
