# Change: Ajouter la gestion automatique des numéros de dossard

## Why

Lors du check-in le jour du tournoi, chaque joueur doit avoir un numéro de dossard unique pour faciliter l'identification et la gestion logistique. Ce numéro doit être attribué automatiquement à la première inscription et conservé pour toutes les inscriptions du joueur sur l'ensemble du tournoi.

## What Changes

- **Nouvelle table `tournament_players`** : liaison entre un tournoi et un joueur, avec le numéro de dossard assigné
- **Attribution automatique du dossard** : lors de la première inscription d'un joueur à un tableau d'un tournoi, un numéro de dossard est attribué (incrémental à partir de 1)
- **Conservation du numéro** : si le joueur s'inscrit à d'autres tableaux du même tournoi, il garde le même dossard
- **Pas de réutilisation** : si un joueur se désinscrit, son numéro n'est pas réattribué (trous acceptés)
- **Affichage dans le backend** : le numéro de dossard est exposé via l'API pour chaque inscription
- **Affichage dans l'admin** : le numéro de dossard est visible dans la liste des inscriptions

## Impact

- Specs affectées:
  - `registration-flow` (création d'inscription avec attribution du dossard)
- Code affecté:
  - `api/database/migrations/` (nouvelle migration pour `tournament_players`)
  - `api/app/models/` (nouveau modèle `TournamentPlayer`, mise à jour de `Registration`)
  - `api/app/controllers/registrations_controller.ts` (logique d'attribution)
  - `web/src/features/admin/` (affichage du numéro de dossard)
  - `web/src/features/dashboard/` (affichage du numéro de dossard pour l'utilisateur)
