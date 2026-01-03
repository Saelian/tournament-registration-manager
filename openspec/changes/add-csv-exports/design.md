# Design: Exports CSV Administrateur

## Context
Les administrateurs ont besoin d'exporter les données du tournoi pour diverses raisons : import dans des logiciels tiers (SPID/GIRPE), suivi comptable, et analyse des inscriptions.

Le projet dispose déjà d'une fonctionnalité d'import CSV pour les tableaux qui peut servir de référence pour le format d'export.

## Goals
- Permettre l'export des tableaux, inscriptions et paiements en CSV
- Offrir une configuration flexible (colonnes, séparateur, noms)
- Assurer la compatibilité avec Excel (UTF-8 BOM)
- Garantir la compatibilité import/export pour les tableaux

## Non-Goals
- Export en d'autres formats (Excel natif, JSON, PDF)
- Export automatisé/programmé
- Export côté utilisateur (non-admin)

## Decisions

### Architecture Backend

**Service d'export centralisé** : `CsvExportService`
- Accepte une configuration (colonnes, séparateur, mapping de noms)
- Génère le fichier CSV avec BOM UTF-8
- Réutilisable pour différents types d'exports

```typescript
interface ExportConfig {
  columns: {
    key: string           // Clé du champ dans les données
    label: string         // Nom de l'en-tête (personnalisable)
    included: boolean     // Inclus dans l'export
  }[]
  separator: ';' | ',' | '\t'
}
```

**Controller dédié** : `AdminExportsController`
- Routes POST pour recevoir la configuration d'export
- Retourne directement le fichier CSV (Content-Disposition: attachment)

### Architecture Frontend

**Composant modal réutilisable** : `CsvExportModal`
- Props : colonnes disponibles, fonction d'export, titre
- State : colonnes sélectionnées, noms personnalisés, séparateur
- Appelle l'API avec la configuration au téléchargement

### Format d'export Tableaux

Pour garantir la compatibilité avec l'import existant, le format CSV des tableaux suivra exactement le template d'import :
- Mêmes noms de colonnes par défaut
- Même format de date (YYYY-MM-DD)
- Même format d'heure (HH:mm)
- Catégories séparées par virgule

### Gestion des filtres

Les filtres actifs sont passés à l'API :
- Inscriptions : tableId, day, sortBy, sortOrder
- Paiements : status, search

L'API applique les mêmes filtres que le listing.

## Risks / Trade-offs

| Risque | Mitigation |
|--------|------------|
| Fichier CSV trop volumineux | Export avec pagination côté serveur si nécessaire (futur) |
| Caractères spéciaux dans les données | Échappement correct des guillemets et séparateurs |
| Perte de la configuration de colonnes | Configuration non sauvegardée pour l'instant (choix de simplicité) |

## Open Questions

1. Faut-il sauvegarder les préférences d'export de l'utilisateur pour réutilisation ?
   - **Décision temporaire** : Non, pour garder la simplicité initiale
