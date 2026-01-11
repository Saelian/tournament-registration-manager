# Change: Ajout du statut explicite "Absent" pour le pointage

## Why

Actuellement, le système de pointage ne permet que deux états : "non pointé" (inconnu) et "présent" (pointé). Les administrateurs n'ont aucun moyen d'indiquer explicitement qu'un joueur a prévenu de son absence. Cette information est cruciale pour :
- Savoir quels joueurs ne viendront définitivement pas
- Différencier les "non pointés" (on ne sait pas encore) des "absents" (ils ont prévenu)
- Permettre de libérer des places ou d'ajuster l'organisation

## What Changes

- **Ajout d'un statut de présence explicite** avec 3 états possibles :
  - `unknown` (par défaut) : non pointé, on ne sait pas s'ils viendront
  - `present` : le joueur s'est présenté (conserve l'heure de pointage)
  - `absent` : le joueur a prévenu qu'il ne viendra pas

- **Modification de l'interface de pointage** :
  - Carte joueur avec 3 états visuels distincts
  - Boutons pour basculer entre les états
  - Statistiques mises à jour (Total / Présents / Absents / Inconnus)
  - Nouveaux filtres pour chaque statut

- **Migration de données** : les inscriptions avec `checkedInAt` non-null deviennent `present`, les autres restent `unknown`

## Impact

- **Affected specs**: `checkin`
- **Affected code**:
  - `api/database/migrations/` - nouvelle migration pour `presence_status`
  - `api/app/models/registration.ts` - ajout du champ `presenceStatus`
  - `api/app/controllers/admin_checkin_controller.ts` - nouvelle logique de statut
  - `web/src/features/admin/checkin/` - refonte des composants UI
  - `api/app/controllers/admin_exports_controller.ts` - export CSV avec nouveau statut
