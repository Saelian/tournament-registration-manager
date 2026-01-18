# Tasks: Mutualisation des composants d'affichage joueurs

## 1. Préparation

- [x] 1.1 Créer le dossier `web/src/features/registrations/components/shared/`
- [x] 1.2 Créer les types partagés dans `shared/types.ts`

## 2. Composants de base

- [x] 2.1 Créer `MobilePlayerCard.tsx` (extraction depuis PublicPlayerTable)
- [x] 2.2 Créer `WaitlistDisplay.tsx` (extraction depuis TableAccordion admin, avec prop `showAdminActions`)
- [x] 2.3 Créer le hook `useAggregatedPlayers` générique (unification des deux logiques existantes)

## 3. Composant PlayerTable partagé

- [x] 3.1 Créer `PlayerTable.tsx` avec l'API générique (colonnes configurables)
- [x] 3.2 Intégrer le filtre par jour (existant dans les deux)
- [x] 3.3 Intégrer la recherche et pagination (via SortableDataTable)
- [x] 3.4 Intégrer la vue mobile responsive avec MobilePlayerCard

## 4. Composant TableAccordion partagé

- [x] 4.1 Créer `TableAccordion.tsx` partagé avec render props
- [x] 4.2 Intégrer la progress bar et les compteurs
- [x] 4.3 Intégrer WaitlistDisplay

## 5. Configuration admin

- [x] 5.1 Créer les colonnes admin dans `admin/columns.tsx` (dossard, badge admin, statuts, présence)
- [x] 5.2 Créer les actions admin (promouvoir, lien paiement) comme render props

## 6. Migration page publique

- [x] 6.1 Adapter `PublicPlayersPage.tsx` pour utiliser `PlayerTable` partagé
- [x] 6.2 Adapter l'onglet "Par tableau" pour utiliser `TableAccordion` partagé
- [x] 6.3 Vérifier le rendu visuel (avant/après identique)

## 7. Migration page admin

- [x] 7.1 Adapter `AdminRegistrationsPage.tsx` pour utiliser `PlayerTable` partagé avec config admin
- [x] 7.2 Adapter `TableAccordion` admin pour utiliser le composant partagé
- [x] 7.3 Vérifier les fonctionnalités admin (promouvoir, export CSV, lien paiement)

## 8. Nettoyage

- [x] 8.1 Supprimer `PublicPlayerTable.tsx`
- [x] 8.2 Supprimer l'ancien `PlayerRegistrationsTable.tsx` (si entièrement remplacé)
- [x] 8.3 Supprimer le code inline d'accordion dans `PublicPlayersPage.tsx`
- [x] 8.4 Mettre à jour les exports dans `index.ts`

## 9. Validation

- [x] 9.1 Tester la page publique (tableau, accordion, mobile)
- [x] 9.2 Tester la page admin (tableau, accordion, actions, modales)
- [x] 9.3 Vérifier le build (`pnpm build`)
- [x] 9.4 Vérifier le lint et typecheck (`pnpm lint && pnpm typecheck`)
