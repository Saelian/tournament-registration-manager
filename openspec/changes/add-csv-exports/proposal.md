# Change: Exports CSV Administrateur

## Why
Les administrateurs ont besoin d'exporter les données du tournoi pour :
- Importer les tableaux dans un logiciel tiers (SPID/GIRPE)
- Avoir une vue d'ensemble des inscriptions
- Gérer la comptabilité des paiements

## What Changes

### Export des Tableaux
- Export CSV des tableaux avec leur configuration complète
- Compatible avec le format d'import existant (réimportable)
- Disponible sur `/admin/tables`

### Export des Inscriptions
- Export CSV de toutes les inscriptions ou par tableau
- Les filtres/tris actifs au moment de l'export sont pris en compte
- Disponible sur `/admin/registrations`

### Export des Paiements
- Export CSV de tous les paiements avec toutes les informations
- Les filtres actifs au moment de l'export sont pris en compte
- Disponible sur `/admin/payments`

### Modale de Configuration d'Export
Pour chaque export, une modale permet de configurer :
- Les colonnes à exporter (sélection par checkbox)
- Le nom personnalisé des colonnes (par défaut : nom du modèle)
- Le séparateur (`;`, `,`, `\t`)
- Encodage UTF-8 avec BOM pour Excel

## Impact
- Affected specs: `exports` (nouvelle capability)
- Affected code:
  - `api/app/controllers/admin_exports_controller.ts` [NEW]
  - `api/app/services/csv_export_service.ts` [NEW]
  - `api/start/routes.ts` (nouvelles routes)
  - `web/src/features/tables/TableListPage.tsx`
  - `web/src/features/admin/registrations/RegistrationsPage.tsx`
  - `web/src/features/admin/payments/PaymentsPage.tsx`
  - `web/src/components/export/CsvExportModal.tsx` [NEW]