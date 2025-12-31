## Context

L'application utilise actuellement :
- React + TypeScript avec Vite
- Tailwind CSS avec le skin Neo-Brutalism (via Shadcn UI)
- TanStack Query pour le state serveur
- Un composant DataTable basique sans tri/filtre

Le défi est d'ajouter des fonctionnalités avancées (tri, filtres, KPIs) tout en maintenant la cohérence du style neo-brutalism et en gardant le code simple et maintenable.

## Goals / Non-Goals

### Goals
- Landing page attractive avec structure Hero → Steps → Tableaux → FAQ
- DataTable avec tri colonnes + filtres avancés + persistance URL
- Dashboard admin avec KPIs temps réel
- Cohérence visuelle Neo-Brutalism sur toutes les vues
- Composants réutilisables et typés

### Non-Goals
- Pas d'internationalisation (français uniquement)
- Pas de mode sombre (hors scope)
- Pas de modification de l'API backend
- Pas d'analytics/tracking (hors scope)

## Decisions

### 1. Architecture DataTable

**Decision** : Créer un nouveau composant `SortableDataTable` qui étend le DataTable existant plutôt que de le remplacer.

**Rationale** :
- Le DataTable actuel est simple et convient aux cas sans interactivité
- SortableDataTable ajoutera tri, filtres, recherche de manière opt-in
- Évite de complexifier les usages simples existants

**Structure** :
```typescript
interface SortableDataTableProps<T> extends DataTableProps<T> {
  sortable?: boolean                    // Active le tri sur colonnes
  searchable?: boolean                  // Active la barre de recherche
  filters?: FilterConfig[]              // Configuration des filtres
  persistToUrl?: boolean                // Persiste l'état dans l'URL
  pagination?: PaginationConfig | false // Pagination optionnelle
}
```

### 2. Gestion des filtres avec URL

**Decision** : Utiliser `useSearchParams` de React Router pour persister l'état des filtres.

**Rationale** :
- Permet de partager des URLs avec filtres appliqués
- Conserve l'état lors du rafraîchissement
- Pattern standard dans les applications React modernes

**Format URL** : `?sort=name:asc&search=veteran&filter.status=paid&filter.points=500-1000`

### 3. Composants Landing Page

**Decision** : Créer des composants atomiques réutilisables dans `components/ui/`.

**Composants** :
- `Hero.tsx` : Section d'accroche avec titre, description, CTA
- `StepIndicator.tsx` : Étape numérotée avec icône et description
- `FAQ.tsx` : Accordéon de questions/réponses (utilise Radix Accordion)
- `StatCard.tsx` : Carte de statistique avec label, valeur, trend optionnel

### 4. Dashboard Admin KPIs

**Decision** : Ajouter une nouvelle route `/admin` qui affiche un dashboard synthétique avant `/admin/tournament`.

**KPIs affichés** :
- Total inscrits (confirmés)
- Total revenus (paiements reçus)
- Taux de remplissage moyen
- Alertes : tableaux >80% remplis, paiements en attente >24h

**API** : Utiliser les endpoints existants (`/admin/tables`, `/admin/registrations`) et agréger côté frontend pour éviter de modifier le backend.

### 5. Style Neo-Brutalism

**Decision** : Maintenir le design system actuel et l'appliquer systématiquement aux nouveaux composants.

**Tokens clés** :
- Borders : `border-2 border-foreground`
- Shadows : `shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`
- Cards : `bg-card` + borders + shadow
- Hover states : `hover:bg-secondary/50` ou `hover:translate-x-[2px] hover:translate-y-[2px]`
- Focus : Ring visible avec offset

## Risks / Trade-offs

### Risk 1 : Performance avec filtres côté client
- **Impact** : Avec beaucoup de données, le filtrage client peut ralentir
- **Mitigation** : Acceptable pour <500 items (cas d'usage tournoi). Si besoin futur, migrer vers filtrage serveur.

### Risk 2 : Complexité du SortableDataTable
- **Impact** : Composant plus complexe à maintenir
- **Mitigation** : Tests unitaires, props bien typées, documentation inline.

### Risk 3 : Agrégation KPIs côté frontend
- **Impact** : Multiples requêtes API pour construire le dashboard
- **Mitigation** : Utiliser TanStack Query pour le cache. Acceptable pour MVP, endpoint dédié si nécessaire plus tard.

## Migration Plan

1. **Phase 1** : Créer les nouveaux composants UI (Hero, StepIndicator, FAQ, StatCard, SortableDataTable)
2. **Phase 2** : Implémenter la nouvelle landing page
3. **Phase 3** : Ajouter le dashboard admin avec KPIs
4. **Phase 4** : Migrer les DataTables existants vers SortableDataTable où pertinent
5. **Phase 5** : Améliorer le dashboard utilisateur

Pas de migration de données nécessaire. Déploiement en une fois possible.

## Open Questions

1. **FAQ** : Le contenu de la FAQ doit-il être configurable par l'admin ou hardcodé ? → Proposition : hardcodé pour MVP, évolution future possible.

2. **Seuils alertes admin** : Quels seuils pour les alertes (80% remplissage, 24h paiement) ? → À confirmer avec l'utilisateur ou configurable dans tournament.options.
