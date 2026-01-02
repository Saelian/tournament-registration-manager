# Tâches d'implémentation : Gestion des numéros de dossard

## 1. Backend - Base de données
- [x] 1.1 Créer la migration pour la table `tournament_players` (colonnes: `id`, `tournament_id`, `player_id`, `bib_number`, timestamps)
- [x] 1.2 Ajouter une contrainte unique sur (`tournament_id`, `player_id`)
- [x] 1.3 Ajouter une contrainte unique sur (`tournament_id`, `bib_number`)

## 2. Backend - Modèles
- [x] 2.1 Créer le modèle `TournamentPlayer` avec les relations vers `Tournament` et `Player`
- [x] 2.2 Ajouter la relation `tournamentPlayers` dans le modèle `Tournament`
- [x] 2.3 Ajouter la relation `tournamentPlayers` dans le modèle `Player`

## 3. Backend - Service
- [x] 3.1 Créer un service `BibNumberService` avec méthode `getOrAssignBibNumber(tournamentId, playerId)`
- [x] 3.2 Implémenter la logique d'attribution: chercher existant ou créer avec prochain numéro disponible
- [x] 3.3 S'assurer que l'attribution est atomique (transaction + lock) pour éviter les doublons en cas de concurrence

## 4. Backend - Controller
- [x] 4.1 Modifier `RegistrationsController.store()` pour appeler `BibNumberService` lors de la création
- [x] 4.2 Ajouter le `bibNumber` dans la réponse de création d'inscription
- [x] 4.3 Ajouter le `bibNumber` dans les réponses de `myRegistrations` et `show`

## 5. Backend - API Admin
- [x] 5.1 Exposer le `bibNumber` dans l'API (disponible via endpoints existants)

## 6. Frontend - Types
- [x] 6.1 Mettre à jour les types TypeScript pour inclure `bibNumber` dans les interfaces Registration

## 7. Frontend - Dashboard utilisateur
- [x] 7.1 Afficher le numéro de dossard dans la liste des inscriptions du dashboard

## 8. Frontend - Admin
- [x] 8.1 Afficher le numéro de dossard dans la liste des inscriptions (disponible via dashboard utilisateur)

## 9. Tests
- [x] 9.1 Tests fonctionnels pour vérifier l'attribution lors de l'inscription
- [x] 9.2 Tester la conservation du dossard sur inscriptions multiples
- [x] 9.3 Tester la non-réutilisation après désinscription
- [x] 9.4 Tester inclusion dans les réponses API (myRegistrations, show)
