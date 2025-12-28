# Change: Ajout de filtres pour la sélection des tableaux

## Why
L'interface de sélection des tableaux affiche tous les tableaux sans distinction. Les utilisateurs doivent parcourir toute la liste pour trouver les tableaux auxquels ils peuvent s'inscrire, ce qui nuit à l'expérience utilisateur.

## What Changes
- Ajout de deux cases à cocher pour filtrer l'affichage des tableaux :
  - "Afficher les tableaux déjà inscrits" (cochée par défaut)
  - "Afficher uniquement les tableaux éligibles" (cochée par défaut)
- Les filtres s'appliquent en temps réel à la liste des tableaux
- Les préférences sont locales à la session (pas de persistance)

## Impact
- Affected specs: registration-flow
- Affected code: `web/src/features/registration/TableSelectionPage.tsx`, `web/src/features/public/PublicTableListPage.tsx`
