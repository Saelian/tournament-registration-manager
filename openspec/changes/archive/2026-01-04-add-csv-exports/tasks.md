# Tasks: add-csv-exports

## 1. Backend - Service d'export CSV
- [x] 1.1 Créer `api/app/services/csv_export_service.ts`
- [x] 1.2 Implémenter la génération CSV avec encoding UTF-8 BOM
- [x] 1.3 Supporter les séparateurs configurables (`;`, `,`, `\t`)
- [x] 1.4 Supporter le renommage des colonnes

## 2. Backend - Controller d'export
- [x] 2.1 Créer `api/app/controllers/admin_exports_controller.ts`
- [x] 2.2 Route POST `/admin/exports/tables` - Export des tableaux
- [x] 2.3 Route POST `/admin/exports/registrations` - Export des inscriptions
- [x] 2.4 Route POST `/admin/exports/payments` - Export des paiements
- [x] 2.5 Ajouter les routes dans `start/routes.ts` avec middleware admin

## 3. Backend - Export Tableaux
- [x] 3.1 Implémenter l'export des tableaux compatible avec l'import existant
- [x] 3.2 Colonnes : referenceLetter, name, date, startTime, pointsMin, pointsMax, quota, price, isSpecial, genderRestriction, allowedCategories, maxCheckinTime, nonNumberedOnly
- [x] 3.3 Vérifier la compatibilité avec l'import CSV existant

## 4. Backend - Export Inscriptions
- [x] 4.1 Implémenter l'export des inscriptions
- [x] 4.2 Colonnes : bibNumber, license, lastName, firstName, points, category, club, sex, tables, status, createdAt, email, phone
- [x] 4.3 Supporter le filtre par tableau
- [x] 4.4 Supporter le filtre par jour
- [x] 4.5 Supporter le tri par colonne

## 5. Backend - Export Paiements
- [x] 5.1 Implémenter l'export des paiements
- [x] 5.2 Colonnes : createdAt, subscriberFirstName, subscriberLastName, subscriberEmail, amount, status, refundMethod, refundedAt, players, tables
- [x] 5.3 Supporter le filtre par statut
- [x] 5.4 Supporter la recherche par nom/email

## 6. Frontend - Composant de modale d'export
- [x] 6.1 Créer `web/src/components/export/CsvExportModal.tsx`
- [x] 6.2 Liste des colonnes avec checkbox de sélection
- [x] 6.3 Champ texte pour renommer chaque colonne
- [x] 6.4 Sélecteur de séparateur
- [x] 6.5 Bouton de téléchargement
- [x] 6.6 Créer le hook `useExportCsv` générique

## 7. Frontend - Intégration TableListPage
- [x] 7.1 Ajouter bouton "Exporter CSV" dans `/admin/tables`
- [x] 7.2 Intégrer la modale d'export
- [x] 7.3 Définir les colonnes disponibles pour les tableaux

## 8. Frontend - Intégration RegistrationsPage
- [x] 8.1 Ajouter bouton "Exporter CSV" dans `/admin/registrations`
- [x] 8.2 Intégrer la modale d'export
- [x] 8.3 Passer les filtres/tris actifs à l'export

## 9. Frontend - Intégration PaymentsPage
- [x] 9.1 Ajouter bouton "Exporter CSV" dans `/admin/payments`
- [x] 9.2 Intégrer la modale d'export
- [x] 9.3 Passer les filtres actifs à l'export
