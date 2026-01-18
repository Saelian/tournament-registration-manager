# Tâches : Suivi de l'administrateur créateur d'inscription

## Phase 1 : Backend - Base de données et modèle

- [x] 1.1 Créer la migration pour ajouter `admin_id` sur la table `registrations`
- [x] 1.2 Ajouter la relation `belongsTo Admin` sur le modèle `Registration`
- [x] 1.3 Mettre à jour la sérialisation pour inclure les infos de l'admin créateur

## Phase 2 : Backend - Controller

- [x] 2.1 Modifier `AdminRegistrationsController.store()` pour récupérer l'admin connecté
- [x] 2.2 Stocker `admin_id` lors de la création de l'inscription
- [x] 2.3 Modifier `AdminRegistrationsController.index()` pour inclure `createdByAdmin` dans la réponse
- [x] 2.4 Modifier `AdminRegistrationsController.byTable()` de la même manière

## Phase 3 : Frontend - Types et affichage

- [x] 3.1 Mettre à jour les types `RegistrationData` et `RegistrationGroup` pour inclure `createdByAdmin`
- [x] 3.2 Modifier `PlayerDetailsModal` pour afficher l'admin créateur au lieu du subscriber système
- [x] 3.3 Ajouter une logique de fallback pour les inscriptions sans `admin_id`

## Phase 4 : Tests

- [x] 4.1 Ajouter des tests unitaires pour la nouvelle logique backend
- [x] 4.2 Mettre à jour les tests existants si nécessaire

## Phase 5 : Validation

- [x] 5.1 Tester manuellement la création d'une inscription admin
- [x] 5.2 Vérifier l'affichage dans le modal de détails joueur
- [x] 5.3 Vérifier la rétro-compatibilité avec les inscriptions existantes
