# Change: Rendre l'interface utilisateur production-ready

## Why

L'application est fonctionnellement presque complète mais nécessite une refonte UX pour être prête pour la production. Les trois contextes utilisateur (visiteur, utilisateur inscrit, administrateur) ont des besoins différents qui ne sont pas encore optimisés :

- **Visiteurs** : La landing page actuelle est fonctionnelle mais manque d'impact visuel et de guidage (pas de hero section, pas d'étapes d'inscription claires, pas de FAQ)
- **Utilisateurs inscrits** : Le dashboard et les tableaux manquent de fonctionnalités de tri/filtre pour naviguer efficacement dans les données
- **Administrateurs** : Pas de vue synthétique des KPIs, trop de clics nécessaires pour accéder aux informations critiques

## What Changes

### Landing Page (Visiteurs non connectés)
- **Hero Section** : Section d'accroche visuelle avec informations clés du tournoi et CTA d'inscription
- **Section "Comment s'inscrire"** : Étapes visuelles guidant le processus (1. Rechercher licence → 2. Choisir tableaux → 3. Payer)
- **FAQ** : Questions/réponses fréquentes (remboursement, liste d'attente, pointage...)
- Conservation du DataTable des tableaux avec amélioration du design

### DataTable Amélioré (Tri + Filtres avancés)
- Colonnes triables (clic sur header pour trier asc/desc)
- Barre de recherche globale
- Filtres par critères (statut, date, fourchette de points...)
- Persistance des filtres dans l'URL (partage de vues filtrées)
- Pagination optionnelle pour les grandes listes

### Dashboard Utilisateur
- Ajout de fonctionnalités de tri/filtre sur les inscriptions
- Amélioration visuelle avec le style neo-brutalism cohérent

### Interface Admin
- **Nouveau Dashboard Admin** avec KPIs :
  - Nombre total d'inscrits
  - Revenus totaux et par tableau
  - Taux de remplissage global
  - Alertes (tableaux presque complets, paiements en attente)
- **DataTable amélioré** pour la liste des tableaux avec tri/filtres
- Réduction du nombre de clics pour les actions fréquentes

### Style Général
- Maintien strict du style Neo-Brutalism (neobrutalism.dev/shadcnui)
- Cohérence visuelle entre les trois contextes utilisateur
- Composants réutilisables (SortableDataTable, StatCard, StepIndicator...)

## Impact

- **Affected specs** :
  - `public-landing` : Nouvelles sections hero, steps, FAQ
  - `admin-ui` : Dashboard KPIs, DataTable amélioré
  - `user-dashboard` : Tri/filtres sur les inscriptions
  - Nouvelle spec `data-table` : Composant DataTable avancé réutilisable

- **Affected code** :
  - `web/src/features/public/LandingPage.tsx` : Refonte majeure
  - `web/src/components/ui/data-table.tsx` : Évolution vers SortableDataTable
  - `web/src/features/dashboard/DashboardPage.tsx` : Ajout tri/filtres
  - `web/src/features/tournament/TournamentConfigPage.tsx` : Intégration KPIs
  - `web/src/components/layout/AdminLayout.tsx` : Ajout lien Dashboard
  - Nouveaux composants : `Hero.tsx`, `StepIndicator.tsx`, `FAQ.tsx`, `StatCard.tsx`

- **No breaking changes** : Toutes les modifications sont des améliorations UX sans impact sur l'API backend
