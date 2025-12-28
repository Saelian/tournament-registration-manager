# Change: Consolidate Admin UI and Add Reusable Card Component

## Why

The admin interface currently has two separate tabs ("Tournoi" and "Tableaux") which fragments the tournament management workflow. Additionally, the neo-brutalist card styling is duplicated across multiple components with hardcoded CSS classes (`bg-card p-6 border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`).

## What Changes

- Merge "Tournoi" and "Tableaux" tabs into a single unified admin page
- Display tables list directly below tournament configuration
- Add reusable `Card` component from neobrutalism.dev to `src/components/ui/`
- Refactor existing card styling to use the new component
- Update admin navigation to remove "Tableaux" tab
- Wrap tournament edit form in Card component

## Impact

- Affected specs: New `admin-ui` spec
- Affected code:
  - `web/src/components/ui/card.tsx` - New component
  - `web/src/components/layout/AdminLayout.tsx` - Remove Tableaux nav link
  - `web/src/features/tournament/TournamentConfigPage.tsx` - Integrate tables, use Card
  - `web/src/features/tables/TableListPage.tsx` - Extract reusable TableList component
  - `web/src/App.tsx` - Remove `/admin/tables` route
