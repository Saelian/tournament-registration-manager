# Change: Mutualiser les composants d'affichage des joueurs (admin/public)

## Why

Actuellement, les pages admin et public d'affichage des inscriptions dupliquent une grande partie de leur code :
- `PlayerRegistrationsTable` (admin, 349 lignes) vs `PublicPlayerTable` (public, 310 lignes)
- Accordion par tableau : code inline dans `PublicPlayersPage.tsx` (~115 lignes) vs `TableAccordion.tsx` (admin)
- Affichage liste d'attente : code inline public (~30 lignes) vs `WaitlistSection` (admin)
- Logique d'agrégation : `useAggregatedPlayers` hook (admin) vs `aggregateByPlayer` fonction inline (public)

Cette duplication rend la maintenance difficile : tout changement de design doit être fait deux fois, avec risque d'incohérence.

## What Changes

- Créer un composant `PlayerTable` partagé configurable via props
- Créer un composant `TableAccordionSection` partagé pour l'affichage par tableau
- Créer un composant `WaitlistDisplay` partagé avec option pour les actions admin
- Unifier la logique d'agrégation dans un hook partagé
- Supprimer les composants dupliqués (`PublicPlayerTable`, code inline dans `PublicPlayersPage`)
- Adapter les pages admin et public pour utiliser les composants partagés

## Impact

- Affected specs: Nouvelle spec `player-list-ui` pour les composants partagés
- Affected code:
  - `web/src/features/registrations/components/shared/` (nouveau dossier)
  - `web/src/features/registrations/components/admin/PlayerRegistrationsTable.tsx` (supprimé, remplacé)
  - `web/src/features/registrations/components/public/PublicPlayerTable.tsx` (supprimé)
  - `web/src/features/registrations/pages/AdminRegistrationsPage.tsx` (utilise les nouveaux composants)
  - `web/src/features/registrations/pages/PublicPlayersPage.tsx` (utilise les nouveaux composants)
  - `web/src/features/registrations/hooks/` (hook d'agrégation partagé)
