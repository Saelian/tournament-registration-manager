# Change : Ajouter les listes de joueurs inscrits pour le public

## Why

Les joueurs souhaitent pouvoir consulter qui est déjà inscrit à un tournoi avant de s'inscrire eux-mêmes. Cette information influence leur décision de participation : recherche de challenge, vérification de la présence d'adversaires spécifiques, ou évaluation du niveau général des tableaux.

## What Changes

- **Nouvel endpoint API public** : `GET /api/registrations/public` qui retourne la liste des joueurs inscrits (sans informations privées)
- **Nouvelle page publique** : Liste globale de tous les joueurs inscrits accessibles via `/players`
- **Extension de la page d'accueil** : Ajout d'un lien vers la liste des joueurs et d'un compteur d'inscrits
- **Liste par tableau** : Chaque tableau affiche le nombre d'inscrits avec possibilité de voir le détail
- **Réutilisation des composants** : Adaptation du `PlayerRegistrationsTable` pour un mode lecture seule sans détails privés

### Données publiques exposées

Pour chaque joueur inscrit :
- Numéro de licence FFTT
- Nom et prénom
- Classement (points officiels)
- Catégorie d'âge
- Club
- Tableaux inscrits

### Données **NON** exposées (confidentialité)

- Email / téléphone du joueur ou de l'inscripteur
- Numéro de dossard (visible seulement le jour J)
- Informations de paiement
- Date d'inscription

## Impact

- **Specs affectées** : `public-landing`
- **Code affecté** :
  - `api/start/routes.ts` : Nouveau endpoint public
  - `api/app/controllers/registrations_controller.ts` : Nouvelle méthode `publicList`
  - `web/src/features/public/` : Nouvelle page `PublicPlayersPage.tsx`
  - `web/src/features/public/components/` : Nouveau composant `PublicPlayerTable.tsx`
  - `web/src/features/public/LandingPage.tsx` : Ajout lien vers liste joueurs
  - Réutilisation de `SortableDataTable` et des hooks d'agrégation
