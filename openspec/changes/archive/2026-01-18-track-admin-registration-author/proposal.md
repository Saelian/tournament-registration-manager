# Proposition : Suivi de l'administrateur créateur d'inscription

## Résumé

Actuellement, lorsqu'un administrateur crée une inscription via `/admin/registrations`, le système utilise un utilisateur système (`system@tournament.local`) comme "subscriber". Cela affiche "Système Tournament" dans l'interface d'administration, ce qui ne permet pas de savoir quel administrateur a effectivement créé l'inscription.

Cette proposition vise à :
1. Stocker une référence vers l'administrateur qui a créé l'inscription
2. Afficher le nom et l'email de l'administrateur dans l'interface au lieu de "Système Tournament"

## Contexte

### Comportement actuel

- Les inscriptions créées par un admin ont `is_admin_created = true`
- Elles sont rattachées à un `User` système (email: `system@tournament.local`)
- L'affichage montre "Système Tournament" / `system@tournament.local` comme contact de l'inscription

### Comportement souhaité

- Conserver le `User` système pour la cohérence du modèle de données
- Ajouter un champ optionnel `admin_id` sur `Registration` pointant vers le modèle `Admin`
- Afficher le nom/email de l'admin créateur à la place du contact système dans l'interface

## Impact

| Zone          | Impact                                                          |
| ------------- | --------------------------------------------------------------- |
| Base de données | Ajout d'une colonne `admin_id` (FK nullable) sur `registrations` |
| Backend (API) | Modification du controller et des réponses API                   |
| Frontend      | Modification de l'affichage dans les composants admin            |

## Considérations de rétro-compatibilité

- Les inscriptions existantes auront `admin_id = null`
- Si `is_admin_created = true` mais `admin_id = null`, on affiche "Admin (non tracé)" ou similaire
- Les nouvelles inscriptions admin auront l'id de l'admin courant

## Specs impactées

- `admin-registration` : Modification du requirement "Admin Created Flag" et "System User for Admin Registrations"
