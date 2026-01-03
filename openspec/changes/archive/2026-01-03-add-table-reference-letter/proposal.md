# Change: Ajout d'une lettre de référence pour les tableaux

## Why

Dans les tournois de tennis de table, les tableaux sont généralement identifiés par une lettre de référence (ex: "A", "B", "C") en plus de leur nom descriptif (ex: "Tableau A - 700 points"). Cette lettre permet une identification rapide et universelle, particulièrement utile pour :
- Les exports CSV et les états administratifs
- Les recherches rapides lors des pointages le jour J
- L'intégration avec les logiciels tiers (SPID/GIRPE)
- La communication avec les joueurs et organisateurs

## What Changes

- Ajout d'un nouveau champ optionnel `referenceLetter` au modèle Table
- Migration de base de données pour ajouter la colonne `reference_letter`
- Mise à jour des validateurs pour accepter ce champ
- Mise à jour de la sérialisation API pour retourner ce champ
- Support de ce champ dans l'import CSV

## Impact

- **Affected specs**: table-management
- **Affected code**:
  - `api/app/models/table.ts` - Ajout propriété
  - `api/database/migrations/` - Nouvelle migration
  - `api/app/validators/table.ts` - Validation du champ
  - `api/app/controllers/tables_controller.ts` - Sérialisation et CRUD
  - `api/app/services/csv_import_service.ts` - Support import CSV
  - `web/` - Formulaires et affichage (frontend)
