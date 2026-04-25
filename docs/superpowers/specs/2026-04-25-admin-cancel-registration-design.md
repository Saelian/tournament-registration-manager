# Design : Désinscription admin avec suivi du remboursement

**Date** : 2026-04-25
**Statut** : Approuvé

## Contexte et problème

Actuellement, un joueur peut se désinscrire depuis son profil (désinscription seule ou remboursement total). Certains joueurs contactent l'organisation par téléphone ou mail pour demander une désinscription ou un remboursement. L'admin les rembourse manuellement par un autre canal, mais le joueur reste inscrit sur le site — ce qui invalide la liste des inscrits.

**Besoin** : permettre à un admin de désinscrire un joueur (d'un ou tous les tableaux) depuis le back-office, en conservant un suivi du remboursement cohérent avec le flux existant.

## Décisions de conception

- **Granularité** : deux modes — annulation d'une inscription unique (par tableau) et annulation complète de toutes les inscriptions d'un joueur.
- **Suivi du remboursement** : porté au niveau de chaque inscription (et non uniquement au niveau du paiement), afin de couvrir les annulations partielles.
- **Cohérence** : réutilise les statuts de paiement existants (`refund_requested`, `refunded`) pour l'annulation complète, de sorte que ces paiements apparaissent dans la queue admin existante.

## Modèle de données

### Migration : table `registrations`

Ajout de 4 colonnes nullables :

```sql
cancelled_by_admin_id  INTEGER    NULL  REFERENCES admins(id)
refund_status          VARCHAR    NULL  -- 'none' | 'requested' | 'done'
refund_method          VARCHAR    NULL  -- 'cash' | 'check' | 'bank_transfer'
refunded_at            TIMESTAMP  NULL
```

**Règle** : ces champs ne sont renseignés que lors d'une annulation initiée par un admin. Les annulations joueur laissent ces champs à `NULL`, ce qui permet de distinguer l'origine de chaque cancellation.

### Mise à jour du modèle Lucid `Registration`

Ajout des 4 attributs correspondants avec types TypeScript stricts :

```typescript
cancelledByAdminId: number | null
refundStatus: 'none' | 'requested' | 'done' | null
refundMethod: 'cash' | 'check' | 'bank_transfer' | null
refundedAt: DateTime | null
```

## API Backend

### Nouveaux endpoints dans `AdminRegistrationsController`

**`DELETE /admin/registrations/:id`** — Annulation d'une inscription unique

Payload :
```typescript
{
  refundStatus: 'none' | 'requested' | 'done'
  refundMethod?: 'cash' | 'check' | 'bank_transfer'  // requis si refundStatus = 'done'
}
```

Comportement :
1. Vérifie que l'inscription existe et que son statut est `paid`, `pending_payment` ou `waitlist`.
2. Passe l'inscription à `cancelled`, renseigne `cancelled_by_admin_id`, `refund_status`, `refund_method`, `refunded_at`.
3. Si l'inscription était en `waitlist` : recalcule les rangs via `waitlistService.recalculateRanks`.
4. Les paiements liés **ne sont pas modifiés** (annulation partielle : le paiement peut couvrir d'autres inscriptions encore actives).

---

**`DELETE /admin/registrations/player/:playerId`** — Annulation complète de toutes les inscriptions actives d'un joueur

Payload : identique au endpoint ci-dessus.

Comportement :
1. Récupère toutes les inscriptions actives (`paid`, `pending_payment`, `waitlist`) du joueur.
2. Annule chaque inscription et renseigne les champs de suivi.
3. Recalcule les rangs de liste d'attente pour les tableaux concernés.
4. Mise à jour des paiements selon `refundStatus` :
   - `'requested'` → paiements liés passent à `refund_requested` (apparaissent dans la queue paiements existante)
   - `'done'` → paiements liés passent à `refunded` avec `refundedAt = now()` et `refundMethod`
   - `'none'` → paiements non modifiés

### CancellationService

Deux nouvelles méthodes publiques :

```typescript
adminCancelRegistration(registrationId: number, adminId: number, refundPayload): Promise<CancellationResult>
adminCancelAllRegistrations(playerId: number, adminId: number, refundPayload): Promise<CancellationResult>
```

Les erreurs possibles reprennent le type `CancellationError` existant, augmenté de `'NO_ACTIVE_REGISTRATIONS'`.

### Routes

```typescript
router.delete('/registrations/:id', [AdminRegistrationsController, 'cancelOne'])
router.delete('/registrations/player/:playerId', [AdminRegistrationsController, 'cancelAll'])
```

> **Attention à l'ordre** : la route `/player/:playerId` doit être déclarée **avant** `/:id` pour éviter que `:id` ne capture le segment `player`.

## Interface utilisateur

### Point d'entrée 1 : Annulation complète (tableau des inscriptions)

**Fichier** : `web/src/features/registrations/components/admin/adminColumns.tsx`

Ajout d'un bouton "Désinscrire" dans la colonne d'actions de chaque ligne joueur agrégée (visible uniquement si le joueur a au moins une inscription active).

Au clic, ouverture de `AdminCancelPlayerModal` :
- Affiche la liste des tableaux actifs du joueur
- 3 options radio pour le remboursement :
  - **Pas de remboursement** (`refundStatus = 'none'`)
  - **Remboursement à traiter** (`refundStatus = 'requested'`) → le paiement apparaîtra dans la queue admin
  - **Remboursement déjà effectué** (`refundStatus = 'done'`) → sélecteur de méthode : espèces / chèque / virement
- Bouton de confirmation destructif, désactivé tant qu'aucun choix n'est fait

### Point d'entrée 2 : Annulation par tableau (PlayerDetailsModal)

**Fichier** : `web/src/features/registrations/components/admin/PlayerDetailsModal.tsx`

Sur chaque carte de tableau dans la `RegistrationGroupCard`, ajout d'un bouton "Annuler ce tableau" visible uniquement si le statut de l'inscription est `paid`, `pending_payment` ou `waitlist`.

Au clic, ouverture de `AdminCancelRegistrationModal` avec les mêmes 3 options, limitée à ce tableau.

### Affichage du statut post-annulation

Dans la `PlayerDetailsModal`, les inscriptions annulées par admin affichent :
- Badge "Annulé par admin" (en plus du badge statut existant)
- Ligne de détail selon `refundStatus` :
  - `'none'` → "Sans remboursement"
  - `'requested'` → "Remboursement à traiter"
  - `'done'` → "Remboursé le [date] par [méthode]"

### Hooks TanStack Query

Dans `web/src/features/registrations/hooks/adminHooks.ts` :

```typescript
useAdminCancelRegistration()   // mutation DELETE /admin/registrations/:id
useAdminCancelAllRegistrations() // mutation DELETE /admin/registrations/player/:playerId
```

Les deux mutations invalident la query `adminRegistrations` après succès.

## Gestion des erreurs

| Cas | Comportement |
|-----|-------------|
| Inscription déjà annulée | Erreur 400 `INVALID_STATUS` |
| Inscription introuvable | Erreur 404 |
| `refundStatus = 'done'` sans `refundMethod` | Erreur 400 de validation VineJS |
| Aucune inscription active pour un joueur | Erreur 400 `NO_ACTIVE_REGISTRATIONS` |
| Annulation complète : certains paiements déjà remboursés | On ignore ces paiements, on ne les re-modifie pas |

## Limitations connues

- **Annulation partielle sans mise à jour du paiement** : si un joueur n'a qu'un seul tableau dans son paiement et qu'on l'annule via "annulation par tableau", le paiement reste à son statut actuel (non modifié). Le suivi du remboursement est visible sur l'inscription elle-même. Ce comportement est intentionnel pour éviter de modifier un paiement potentiellement lié à d'autres inscriptions encore actives.

## Ce qui n'est pas dans le scope

- Envoi d'un email de notification au joueur lors de l'annulation admin (peut être ajouté ultérieurement)
- Calcul du montant partiel à rembourser (la fonctionnalité de suivi indique qui/comment, pas les montants exacts pour les annulations partielles)
- Annulation depuis la page de check-in
