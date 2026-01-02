## Why

Ajouter au dashboard administrateur la possibilité de consulter et gérer les listings de joueurs inscrits au tournoi. Le système doit permettre :
- **Listing global des joueurs** avec filtrage par jour du tournoi
- **Listing par tableau sportif** accessible depuis la gestion des tableaux
- **Modale de détails joueur** avec informations de contact, inscription et paiement
- **Composant mutualisé** utilisant le `SortableDataTable` existant

## Contexte

Actuellement, le dashboard admin (`/admin`) affiche :
- Les KPIs globaux (inscrits, revenus, taux de remplissage)
- Un aperçu rapide des tableaux
- Des alertes (tableaux pleins/vides)

Il manque l'accès aux **données de détail des inscriptions** pour la gestion opérationnelle :
- Qui est inscrit à quels tableaux ?
- Combien de joueurs le jour 1 vs jour 2 vs jour 3 ?
- Comment contacter un joueur/inscripteur ?
- Quel est le statut de paiement de chaque inscription ?

## Fonctionnalités demandées

### 1. Listing global des joueurs inscrits

**Route**: `/admin/registrations` (nouvelle page)

**Colonnes du tableau**:
| Colonne | Description | Triable | Filtrable |
|---------|-------------|---------|-----------|
| Numéro de dossard | `bibNumber` depuis `TournamentPlayer` | ✓ | - |
| Nom | `lastName` du joueur | ✓ | - |
| Prénom | `firstName` du joueur | ✓ | - |
| Licence | `licence` du joueur | ✓ | - |
| Classement | `points` du joueur | ✓ | Plage |
| Tableaux | Liste des tableaux inscrits pour le jour filtré | - | - |

**Fonctionnalités**:
- Filtrage par jour du tournoi (dropdown)
- Barre de recherche globale (nom, prénom, licence)
- Tri sur chaque colonne
- Pagination 
- Clic sur une ligne → modale de détails

### 2. Listing par tableau sportif

**Route**: `/admin/tables/:id/registrations` ou modale depuis `/admin/tables`

**Mêmes colonnes** que le listing global (sans la colonne "Tableaux")

**Fonctionnalités identiques** au listing global

### 3. Modale de détails joueur

**Informations affichées**:
- **Section Joueur**:
  - Nom complet, numéro de licence, classement
  - Club, catégorie, sexe
  - Numéro de dossard

- **Section Contact** (si disponible):
  - Email et téléphone du joueur (via `User` si lié)
  
- **Section Inscripteur**:
  - Nom de l'inscripteur (`User` ayant fait l'inscription)
  - Email de l'inscripteur
  - Téléphone de l'inscripteur

- **Section Paiement**:
  - Montant total réglé
  - Date du paiement
  - Statut du paiement
  - Référence HelloAsso (pour support)

- **Section Tableaux**:
  - Liste de tous les tableaux inscrits (pas seulement le jour filtré)
  - Statut de chaque inscription (confirmé/liste d'attente/annulé)

### 4. Composant mutualisé

Le composant `PlayerRegistrationsTable` sera réutilisé pour :
- Le listing global (avec filtre jour)
- Le listing par tableau (sans filtre jour, données pré-filtrées)
- Potentiellement l'export CSV (futur)

## Liens avec specs existantes

- **data-table**: Utilisation du `SortableDataTable` existant avec ses capacités de tri, filtre et pagination
- **admin-ui**: Extension du dashboard avec nouvelle navigation et pages

## Hors périmètre

- Modification/annulation d'inscription depuis l'admin (à traiter séparément)
- Check-in des joueurs (spec `add-checkin-interface` existante)
- Export CSV (spec `add-csv-exports` existante)
