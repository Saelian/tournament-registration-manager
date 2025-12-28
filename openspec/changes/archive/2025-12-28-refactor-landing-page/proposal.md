# Change: Refactorisation de la page d'accueil

## Why
La page d'accueil actuelle affiche une liste de tournois, laissant penser qu'il peut y en avoir plusieurs en cours. L'application étant dédiée à un club unique avec un seul tournoi actif à la fois, l'interface doit refléter cette réalité en présentant directement les informations du tournoi en cours.

## What Changes
- **BREAKING** : Remplacement de la page liste de tournois par une page d'accueil centrée sur le tournoi unique en cours
- Affichage des informations complètes du tournoi (nom, dates, lieu, description) directement sur la page d'accueil
- Intégration d'un DataTable (style neobrutalism.dev) pour afficher les tableaux disponibles avec leurs informations essentielles
- Suppression du bouton "Admin" du header public (accès uniquement via URL `/admin`)
- Ajout de l'affichage de l'état de connexion utilisateur dans le header
- Ajout d'un accès rapide au dashboard utilisateur depuis le header (si connecté)

## Impact
- Affected specs: Création d'une nouvelle spec `public-landing`
- Affected code:
  - `web/src/features/public/TournamentListPage.tsx` → remplacé par `LandingPage.tsx`
  - `web/src/components/layout/PublicLayout.tsx` → header modifié
  - `web/src/components/ui/` → ajout du composant DataTable
  - `web/src/App.tsx` → mise à jour des routes
