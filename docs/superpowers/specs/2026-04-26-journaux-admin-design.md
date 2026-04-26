# Design — Section "Journaux" dans Suivi tournoi

**Date :** 2026-04-26  
**Statut :** approuvé

## Objectif

Ajouter une page "Journaux" dans le menu "Suivi tournoi" de l'interface admin. Elle affiche une timeline chronologique de tous les événements importants du tournoi (inscriptions, paiements, annulations, pointages), avec filtres par type d'événement et recherche par joueur.

## Contrainte principale

Aucun nouvel événement instrumenté : on ne reconstruit que ce qui existe déjà en base. Aucune nouvelle table de base de données.

---

## Événements reconstruits

| Type | Source | Timestamp utilisé |
|---|---|---|
| `inscription_utilisateur` | `registrations` où `is_admin_created = false` | `created_at` |
| `inscription_admin` | `registrations` où `is_admin_created = true` | `created_at` |
| `promotion_liste_attente` | `registrations` où `promoted_at != null` | `promoted_at` |
| `paiement_confirme` | `payments` où `status = 'succeeded'` | `updated_at` |
| `remboursement` | `payments` où `refunded_at != null` | `refunded_at` |
| `annulation_admin` | `registrations` où `cancelled_by_admin_id != null` | `updated_at` |
| `pointage` | `registrations` où `checked_in_at != null` | `checked_in_at` |

> Pour `annulation_admin` et `paiement_confirme`, `updated_at` est utilisé faute de timestamp dédié. C'est fiable car ces enregistrements ne sont pas modifiés après l'événement.

---

## Backend

### Endpoint

```
GET /admin/audit-log
Query params: playerId (optionnel, number)
Auth: admin_auth_middleware
```

### Structure de réponse

```typescript
interface AuditEvent {
  id: string           // ex: "reg-42-created", "pay-7-succeeded", "reg-42-checkin"
  type: 'inscription_utilisateur' | 'inscription_admin' | 'promotion_liste_attente'
       | 'paiement_confirme' | 'remboursement' | 'annulation_admin' | 'pointage'
  timestamp: string    // ISO 8601
  playerName: string
  playerId: number
  playerLicence: string
  tableName: string | null  // null pour les événements paiement multi-tableau
  actor: string | null      // nom admin, email user, "HelloAsso", "Espèces", "Chèque", "CB"
  details: string           // phrase lisible, ex: "Tableau A – Paiement en espèces (12,00 €)"
}
```

### Logique de construction

Deux requêtes en parallèle :

1. **Registrations** — preload `player`, `table`, `user`, `createdByAdmin`, `cancelledByAdmin`  
   - Si `playerId` fourni : `where('player_id', playerId)`  
   - Par registration, émet 1 à 3 événements selon les champs renseignés :
     - Toujours : `inscription_utilisateur` ou `inscription_admin` à `created_at`
     - Si `promoted_at != null` : `promotion_liste_attente` à `promoted_at`
     - Si `cancelled_by_admin_id != null` : `annulation_admin` à `updated_at`
     - Si `checked_in_at != null` : `pointage` à `checked_in_at`

2. **Payments** — `where status = 'succeeded' or refunded_at is not null`, preload `user`, `registrations → player`  
   - Si `playerId` fourni : `whereHas('registrations', q => q.where('player_id', playerId))`
   - Par payment :
     - Si `status = 'succeeded'` : `paiement_confirme` à `updated_at`
     - Si `refunded_at != null` : `remboursement` à `refunded_at`
   - `tableName` = noms des tableaux joints par `" / "` (un paiement peut couvrir plusieurs tableaux)
   - `actor` = méthode de paiement lisible ("HelloAsso", "Espèces", "Chèque", "CB")

Fusion et tri par `timestamp desc` avant retour.

### Fichiers backend

- `api/app/controllers/admin_audit_log_controller.ts` — nouveau contrôleur
- `api/start/routes.ts` — ajout de la route sous `admin_auth_middleware`

---

## Frontend

### Route et navigation

- Route : `/admin/logs`
- Ajout dans le dropdown "Suivi tournoi" de `AdminLayout` : entrée "Journaux" avec icône `ScrollText` (desktop + mobile)

### Hook

`web/src/features/admin/hooks/useAdminAuditLog.ts` — TanStack Query, appelle `GET /admin/audit-log`.

### Page

`web/src/features/admin/pages/AdminLogsPage.tsx`

`SortableDataTable<AuditEvent>` configuré :

| Propriété | Valeur |
|---|---|
| Tri par défaut | `timestamp` desc |
| Recherche texte | `searchKeys: ['playerName', 'playerLicence']` |
| Filtre | Dropdown "Type d'événement" (7 valeurs) |
| Pagination | 50 lignes par page |

**Colonnes :**

| Clé | En-tête | Rendu |
|---|---|---|
| `timestamp` | Horodatage | Date + heure formatées (`dd/MM/yyyy HH:mm`) |
| `type` | Type | Badge coloré par type |
| `playerName` | Joueur | Nom + licence en sous-texte |
| `tableName` | Tableau | Nom du tableau ou `—` |
| `actor` | Acteur | Nom/email de qui a déclenché l'action |
| `details` | Détails | Phrase descriptive |

**Couleurs des badges par type :**
- `inscription_utilisateur` → bleu
- `inscription_admin` → violet
- `promotion_liste_attente` → orange
- `paiement_confirme` → vert
- `remboursement` → jaune
- `annulation_admin` → rouge
- `pointage` → vert foncé

### Fichiers frontend

- `web/src/features/admin/pages/AdminLogsPage.tsx`
- `web/src/features/admin/hooks/useAdminAuditLog.ts`
- `web/src/components/layout/AdminLayout.tsx` — ajout entrée nav
- `web/src/App.tsx` (ou fichier de routes) — ajout route `/admin/logs`
