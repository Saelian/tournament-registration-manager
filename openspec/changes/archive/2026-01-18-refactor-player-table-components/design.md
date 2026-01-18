# Design: Mutualisation des composants d'affichage joueurs

## Context

L'application affiche les listes de joueurs inscrits dans deux contextes :
- **Admin** : accès complet (dossard, email, téléphone, paiements, actions comme promouvoir, générer lien de paiement)
- **Public** : accès restreint (pas de données sensibles, lecture seule)

Les deux contextes utilisent la même structure visuelle (tableau triable, filtres, pagination, accordion par tableau) mais avec des colonnes et actions différentes.

### Contraintes

- Les types de données sont différents : `RegistrationData` (admin) vs `PublicRegistrationData` (public)
- La sécurité des données doit être garantie côté API (le frontend reçoit des données déjà filtrées)
- Le design Neo-Brutalism doit être cohérent entre admin et public

## Goals / Non-Goals

### Goals
- Un seul composant à maintenir pour le tableau de joueurs
- Un seul composant pour l'accordion par tableau
- Changement de design appliqué automatiquement aux deux contextes
- Configuration via props pour les colonnes, actions, et données affichées

### Non-Goals
- Modifier les types de données côté API (les endpoints restent séparés)
- Fusionner complètement les pages admin/public (elles gardent leurs spécificités)
- Créer un système de permissions frontend (la sécurité reste côté API)

## Decisions

### 1. Architecture des composants partagés

```
web/src/features/registrations/components/
├── shared/
│   ├── PlayerTable.tsx           # Tableau générique configurable
│   ├── TableAccordion.tsx        # Accordion par tableau générique
│   ├── WaitlistDisplay.tsx       # Affichage liste d'attente
│   ├── MobilePlayerCard.tsx      # Carte mobile (existait dans public)
│   └── types.ts                  # Types partagés pour les props
├── admin/
│   ├── AdminPlayerTableConfig.ts # Configuration colonnes/actions admin
│   ├── PlayerDetailsModal.tsx    # Modal détails (reste admin-only)
│   ├── AdminRegistrationForm.tsx # Formulaire inscription (reste admin-only)
│   └── PaymentLinkModal.tsx      # Modal lien paiement (reste admin-only)
└── public/
    └── (vide après refactorisation)
```

**Rationale**: Les composants partagés vivent dans `shared/`. Les configurations spécifiques (colonnes, rendu, actions) restent dans `admin/` ou sont passées en props depuis les pages.

### 2. API du composant PlayerTable

```typescript
interface PlayerTableProps<T extends BasePlayer> {
  // Données
  data: T[]
  keyExtractor: (player: T) => string | number

  // Colonnes configurables
  columns: PlayerTableColumn<T>[]

  // Filtres
  showDayFilter?: boolean
  tournamentDays?: string[]
  showSearch?: boolean

  // Pagination
  pageSize?: number

  // Vue mobile
  mobileCardRender?: (player: T) => React.ReactNode

  // Interactions
  onRowClick?: (player: T) => void
}

interface PlayerTableColumn<T> {
  key: string
  header: string
  sortable?: boolean
  render?: (player: T) => React.ReactNode
  className?: string
}
```

**Rationale**: Le composant est générique sur le type `T` pour supporter `AggregatedPlayerRow` (admin) et `AggregatedPublicPlayer` (public). Les colonnes sont entièrement configurables.

### 3. Hook d'agrégation unifié

```typescript
function useAggregatedPlayers<TReg, TPlayer>(
  registrations: TReg[],
  options: {
    dayFilter?: string
    aggregator: (registrations: TReg[]) => TPlayer[]
  }
): TPlayer[]
```

**Rationale**: La logique d'agrégation est similaire mais les types diffèrent. Un hook générique avec un aggregator injecté permet la réutilisation.

### 4. Composant TableAccordion partagé

```typescript
interface TableAccordionProps<TReg, TPlayer> {
  registrations: TReg[]
  tables: TableInfo[]

  // Rendu du contenu
  renderPlayerTable: (regs: TReg[]) => React.ReactNode
  renderWaitlist?: (regs: TReg[]) => React.ReactNode

  // Actions admin optionnelles
  renderHeaderActions?: (tableId: number, tableName: string) => React.ReactNode
  showPresenceCount?: boolean
}
```

**Rationale**: L'accordion utilise le pattern "render props" pour permettre à l'admin d'injecter le tableau avec ses colonnes spécifiques et les actions (export CSV).

## Risks / Trade-offs

| Risk | Impact | Mitigation |
|------|--------|------------|
| Complexité accrue des props | Moyen | Documentation claire, props par défaut sensées |
| Breaking changes visuels | Faible | Tests visuels avant/après |
| Performance (re-renders) | Faible | Memoization des colonnes et callbacks |

## Migration Plan

1. Créer les composants partagés en parallèle (ne pas casser l'existant)
2. Migrer la page publique en premier (plus simple)
3. Migrer la page admin
4. Supprimer les anciens composants
5. Nettoyer les imports/exports

## Open Questions

- Faut-il garder la vue mobile (cartes) pour le contexte admin aussi ?
