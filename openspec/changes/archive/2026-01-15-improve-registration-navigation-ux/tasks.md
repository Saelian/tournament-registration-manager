# Tâches - Améliorer la navigation vers les inscriptions

## Phase 1 : Préparation des composants

- [x] **1.1** Extraire le contenu de `UserDashboardPage` en `RegistrationsTabContent.tsx`
  - Créer le composant dans `src/features/user-space/components/`
  - Déplacer toute la logique métier (hooks, filtres, tri)
  - Garder `UserDashboardPage` comme wrapper temporaire

- [x] **1.2** Extraire le formulaire de profil en `ProfileTabContent.tsx`
  - Créer le composant dans `src/features/user-space/components/`
  - Adapter pour rester sur la même page après sauvegarde

## Phase 2 : Nouvelle page Mon espace

- [x] **2.1** Créer la feature `user-space`
  - Créer le dossier `src/features/user-space/`
  - Structure : `pages/`, `components/`, `index.ts`

- [x] **2.2** Créer `MySpacePage.tsx`
  - Implémenter les onglets avec composant Shadcn `Tabs`
  - Gérer le paramètre URL `?tab=` pour navigation directe
  - Intégrer `RegistrationsTabContent` et `ProfileTabContent`

- [x] **2.3** Configurer les routes
  - Ajouter route `/profile`
  - Rediriger `/dashboard` → `/profile`
  - Rediriger `/profile` → `/profile?tab=infos`

## Phase 3 : Mise à jour de la navigation

- [x] **3.1** Modifier `PublicLayout.tsx`
  - Ajouter bouton `NavItem` "Mon espace" pour utilisateurs connectés
  - Simplifier le menu avatar (déconnexion uniquement)
  - Adapter version mobile dans le menu burger

## Phase 4 : Nettoyage

- [x] **4.1** Supprimer les anciennes pages
  - Supprimer `UserDashboardPage.tsx` (après confirmation que tout fonctionne)
  - Supprimer `ProfilePage.tsx`
  - Mettre à jour les exports de features


