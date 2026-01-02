# Tâches : add-public-player-listings

## 1. Backend - API publique

- [x] 1.1 Créer l'endpoint `GET /api/registrations/public` dans `routes.ts`
- [x] 1.2 Implémenter la méthode `publicList` dans `RegistrationsController`
- [x] 1.3 Créer le validateur optionnel pour les filtres (par tableau, par jour)
- [x] 1.4 Écrire les tests fonctionnels pour l'endpoint public

## 2. Frontend - Types et API

- [x] 2.1 Créer les types `PublicPlayerInfo` et `PublicRegistrationData` dans `web/src/features/public/types.ts`
- [x] 2.2 Créer le client API `fetchPublicRegistrations` dans `web/src/features/public/api.ts`
- [x] 2.3 Créer le hook `usePublicRegistrations` avec TanStack Query

## 3. Frontend - Composant de tableau réutilisable

- [x] 3.1 Créer `PublicPlayerTable.tsx` basé sur `PlayerRegistrationsTable` (mode lecture seule)
- [x] 3.2 Supprimer les colonnes avec données privées (dossard, actions cliquables)
- [x] 3.3 Ajouter les colonnes : Licence, Nom, Prénom, Classement, Catégorie, Club, Tableaux
- [x] 3.4 Désactiver le `onRowClick` (pas d'accès aux détails privés)

## 4. Frontend - Page liste globale

- [x] 4.1 Créer `PublicPlayersPage.tsx` sur la route `/players`
- [x] 4.2 Afficher un titre et compteur total d'inscrits
- [x] 4.3 Intégrer `PublicPlayerTable` avec filtrage par jour
- [x] 4.4 Ajouter la route dans le router React

## 5. Frontend - Liste par tableau

- [x] 5.1 Créer `TablePlayersModal.tsx` pour afficher les inscrits d'un tableau spécifique
- [x] 5.2 Ajouter un bouton "Voir les inscrits" sur chaque ligne de tableau dans `LandingPage`
- [x] 5.3 Afficher le nombre d'inscrits comme badge sur chaque tableau

## 6. Frontend - Intégration Landing Page

- [x] 6.1 Ajouter un lien "Voir tous les inscrits" dans la section tableau ou navigation
- [x] 6.2 Afficher le nombre total d'inscrits dans la section Hero ou stats

## 7. Tests et validation

- [x] 7.1 Tester l'affichage de la liste publique avec plusieurs joueurs
- [x] 7.2 Vérifier qu'aucune donnée sensible n'est exposée (inspection réseau)
- [x] 7.3 Tester le tri et la recherche dans le tableau public
- [x] 7.4 Tester l'affichage par tableau
- [ ] 7.5 Tests end-to-end avec le browser tool

