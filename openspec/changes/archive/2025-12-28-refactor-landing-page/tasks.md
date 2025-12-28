# Tasks: Refactorisation de la page d'accueil

## 1. Composant DataTable
- [x] 1.1 Créer le composant `DataTable` dans `web/src/components/ui/data-table.tsx` avec le style neobrutalism
- [x] 1.2 Le composant doit supporter les colonnes configurables et l'affichage responsive

## 2. Mise à jour du header public
- [x] 2.1 Modifier `PublicLayout.tsx` pour supprimer le bouton "Admin"
- [x] 2.2 Ajouter l'intégration du `UserAuthContext` dans le header
- [x] 2.3 Afficher l'email ou le nom de l'utilisateur connecté dans le header
- [x] 2.4 Ajouter un bouton/lien "Mon espace" vers `/dashboard` si l'utilisateur est connecté
- [x] 2.5 Ajouter un bouton "Se connecter" si l'utilisateur n'est pas connecté

## 3. Page d'accueil du tournoi
- [x] 3.1 Créer `LandingPage.tsx` pour remplacer `TournamentListPage.tsx`
- [x] 3.2 Utiliser le hook existant `usePublicTournaments()` et prendre le premier tournoi
- [x] 3.3 Afficher les informations principales du tournoi (nom, dates, lieu, description courte)
- [x] 3.4 Afficher la description longue (markdown rendu en HTML) si disponible
- [x] 3.5 Intégrer le DataTable avec la liste des tableaux du tournoi
- [x] 3.6 Chaque ligne du DataTable affiche : nom du tableau, date/horaire, points min/max, places restantes
- [x] 3.7 Ajouter un bouton "S'inscrire" sur chaque ligne du tableau menant au flux d'inscription
- [x] 3.8 Gérer l'état "Aucun tournoi en cours" avec un message approprié

## 4. Backend (si nécessaire)
- [x] 4.1 Vérifier l'existence d'un endpoint pour récupérer le tournoi actif unique
  - Note: Utilisation de l'endpoint existant `GET /tournaments` (premier élément)
- [x] 4.2 L'endpoint existant `GET /tournaments/:id/tables` retourne déjà `registeredCount`

## 5. Nettoyage et routes
- [x] 5.1 Mettre à jour `App.tsx` pour utiliser `LandingPage` sur la route `/`
- [x] 5.2 Supprimer `TournamentListPage.tsx`
- [x] 5.3 Mettre à jour les exports dans `index.ts`

## 6. Tests et validation
- [x] 6.1 Typecheck passé (npx tsc --noEmit)
- [x] 6.2 Build passé (pnpm build)
