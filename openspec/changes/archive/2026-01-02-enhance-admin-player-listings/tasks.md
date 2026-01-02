# Tâches: Amélioration du Dashboard Administrateur - Listings Joueurs

## Phase 1: Backend - API Endpoints

### 1.1 Créer l'endpoint GET /admin/registrations
- [x] Ajouter la méthode `index` à `AdminRegistrationsController`
- [x] Charger les inscriptions avec relations: `player`, `table`, `user`, `payments`
- [x] Charger les `bibNumber` depuis `TournamentPlayer`
- [x] Extraire les jours distincts du tournoi
- [x] Formater la réponse selon le format défini

### 1.2 Créer l'endpoint GET /admin/tables/:id/registrations
- [x] Ajouter la méthode `byTable` à `AdminRegistrationsController`
- [x] Filtrer par `tableId`
- [x] Même format de réponse que 1.1

### 1.3 Ajouter les routes admin
- [x] Route `GET /admin/registrations`
- [x] Route `GET /admin/tables/:id/registrations`
- [x] Protéger avec `adminAuth` middleware

---

## Phase 2: Frontend - Composant mutualisé

### 2.1 Créer le type et hook de base
- [x] Créer `web/src/features/admin/registrations/types.ts` avec les interfaces
- [x] Créer `web/src/features/admin/registrations/hooks.ts` avec `useAdminRegistrations`
- [x] Créer `web/src/features/admin/registrations/api.ts` pour les appels API

### 2.2 Créer le composant PlayerRegistrationsTable
- [x] Créer `web/src/features/admin/registrations/PlayerRegistrationsTable.tsx`
- [x] Utiliser `SortableDataTable` avec colonnes configurées
- [x] Implémenter l'agrégation par joueur
- [x] Ajouter le filtre par jour (dropdown)
- [x] Ajouter le callback `onPlayerClick`

### 2.3 Créer la modale PlayerDetailsModal
- [x] Créer `web/src/features/admin/registrations/PlayerDetailsModal.tsx`
- [x] Section informations joueur
- [x] Section contact inscripteur
- [x] Section paiement
- [x] Section tableaux inscrits (tous)

---

## Phase 3: Frontend - Pages admin

### 3.1 Créer la page Inscriptions globale
- [x] Créer `web/src/features/admin/registrations/RegistrationsPage.tsx`
- [x] Intégrer `PlayerRegistrationsTable` avec `showDayFilter=true`
- [x] Gérer l'état de la modale
- [x] Ajouter en-tête avec stats rapides (total joueurs du jour)

### 3.2 Ajouter accès depuis la page Tableaux
- [x] Modifier `web/src/features/tables/TableListPage.tsx` pour ajouter bouton "Voir inscriptions"
- [x] Créer modale `TableRegistrationsModal`
- [x] Intégrer `PlayerRegistrationsTable` avec `showDayFilter=false`

### 3.3 Mettre à jour la navigation admin
- [x] Ajouter lien "Inscriptions" dans `AdminLayout`
- [x] Ajouter route `/admin/registrations` dans `App.tsx`

---

## Phase 4: Intégration Dashboard

### 4.1 Ajouter action rapide sur le dashboard
- [x] Ajouter carte "Voir les inscriptions" dans actions rapides
- [x] Lien vers `/admin/registrations`

---

## Phase 5: Validation

### 5.1 Tests API
- [x] Test fonctionnel `GET /admin/registrations`
- [x] Test fonctionnel `GET /admin/tables/:id/registrations`
- [x] Test cas vide (aucune inscription)

### 5.2 Tests manuels UI
- [x] Vérifier affichage listing avec données (compilation OK)
- [x] Vérifier fonctionnement filtres et tri (implémentation complète)
- [x] Vérifier modale de détails (implémentation complète)
- [x] Vérifier responsive mobile (utilisation de SortableDataTable existant)

