# Change: Prix des tableaux en float (euros)

## Why
Le prix des tableaux est stocké en centimes (integer), ce qui complexifie les vues métiers où il faut constamment diviser par 100.

## What Changes
- **BREAKING** : La colonne `price` passe de `integer` (centimes) à `decimal` (euros)
- Migration des données existantes : division par 100
- Mise à jour des API et des vues frontend

## Impact
- Affected specs: `table-management`
- Affected code:
  - Migration de base de données
  - `api/app/models/table.ts`
  - `api/app/controllers/tables_controller.ts`
  - `api/app/validators/table.ts`
  - `web/src/features/tables/types.ts`
  - Vues frontend utilisant `formatPrice`
  - Tests existants
