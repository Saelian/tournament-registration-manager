# Change : Amélioration de la barre de navigation publique

## Why

La navigation actuelle dans l'app bar publique est limitée aux utilisateurs connectés uniquement. Les visiteurs non connectés ne voient pas de menu de navigation, ce qui appauvrit l'expérience utilisateur et la découvrabilité du contenu. De plus, des fonctionnalités demandées ne sont pas encore disponibles :

- Pas de lien direct vers les inscriptions depuis la navigation
- Pas de page dédiée pour visualiser les inscrits par tableau avec interface accordéon
- Pas de section FAQ dynamique configurable par l'administrateur
- Pas de lien vers le règlement directement dans la navigation

## What Changes

Cette proposition enrichit la barre de navigation publique avec 5 nouveaux liens/sections :

### 1. Navigation universelle (connectés et non-connectés)

L'app bar affichera désormais les liens de navigation même pour les visiteurs non authentifiés :
- **Accueil** → `/` (Landing page)
- **Inscription** → `/tournaments/:id/tables` (Page de sélection des tableaux)
- **Joueurs inscrits** → `/players` (Liste globale des inscrits)
- **Inscrits par tableau** → `/players/by-table` (Nouvelle page avec vue en accordéon)
- **FAQ** → `/faq` (Nouvelle page dynamique)
- **Règlement** → Lien externe vers le document de règlement du tournoi (si configuré)

### 2. Nouvelle page "Inscrits par tableau" (`/players/by-table`)

Une nouvelle page avec tous les tableaux en accordéon :
- Chaque tableau dans un item d'accordéon
- Header : Nom du tableau + progress bar du remplissage (ex: 24/32 inscrits)
- Contenu déplié : Tableau des joueurs inscrits à ce tableau spécifique
- Réutilisation du composant `PublicPlayerTable` existant

### 3. Nouvelle page FAQ dynamique (`/faq`)

- Section FAQ configurable via l'administration du tournoi
- Stockage en base de données dans les options du tournoi (`options.faqItems`)
- Affichage en accordéon avec le composant FAQ existant

### 4. Administration de la FAQ

- Nouveau champ dans le formulaire de configuration du tournoi
- Interface d'édition des questions/réponses (ajout, modification, suppression, réordonnancement)
- Stockage JSON dans la colonne `options` du tournoi

### 5. Lien vers le règlement dans la navigation

- Si `rulesLink` est configuré, affichage d'un lien direct dans la navigation
- Ouverture dans un nouvel onglet

## Impact

- **Specs affectées** :
  - `public-landing` : Modification de la navigation
  - `tournament-config` : Ajout des items FAQ dans les options
  - `admin-ui` : Formulaire d'édition de la FAQ

- **Fichiers affectés** :
  - `web/src/components/layout/PublicLayout.tsx` : Refonte de la navigation
  - `web/src/App.tsx` : Nouvelles routes
  - `web/src/features/public/` : Nouvelles pages (`PlayersTablePage.tsx`, `FAQPage.tsx`)
  - `api/app/models/tournament.ts` : Extension de `TournamentOptions` avec `faqItems`
  - `api/app/validators/` : Validation des items FAQ
  - `web/src/features/tournament/` : Formulaire d'édition FAQ dans la config admin
