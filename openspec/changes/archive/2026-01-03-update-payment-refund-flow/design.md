# Design: Paiement groupé et remboursement

## Context

Le système actuel permet déjà de créer un paiement pour plusieurs inscriptions (table pivot `payment_registrations`). Cependant :
- Le frontend ne regroupe pas visuellement les inscriptions par paiement
- Il n'y a pas de fonctionnalité de remboursement
- La désinscription ne distingue pas remboursement vs simple annulation

HelloAsso impose une contrainte : le remboursement est total (pas de remboursement partiel d'une commande).

## Goals / Non-Goals

**Goals**:
- Permettre le remboursement total via HelloAsso API
- Dissocier clairement désinscription (libère la place) et remboursement (rend l'argent)
- Afficher les inscriptions groupées par paiement dans le dashboard
- Générer des références de paiement lisibles (nom + tableaux)

**Non-Goals**:
- Remboursement partiel (contrainte HelloAsso)
- Remboursement hors HelloAsso (virement manuel, etc.)
- Gestion des litiges

## Decisions

### 1. Référence de paiement HelloAsso

**Decision**: Format "NOM Prénom - T1, T2, T3" tronqué à 250 caractères (limite HelloAsso `itemName`)

**Rationale**:
- Le nom du joueur permet d'identifier rapidement le paiement dans l'interface HelloAsso
- Les noms de tableaux abrégés permettent de savoir quels tableaux sont concernés
- Si trop long, on tronque les tableaux avec "..." à la fin

**Exemple**:
```
DUPONT Jean - Senior H 1000pts, Senior H 1500pts, Vétérans
```

### 2. Workflow de remboursement

**Decision**: Le remboursement annule TOUTES les inscriptions liées au paiement

**Rationale**:
- HelloAsso ne permet pas le remboursement partiel
- Cohérence : si on rembourse, on annule tout ce qui était payé ensemble
- L'utilisateur peut se réinscrire aux tableaux qu'il souhaite garder

**Workflow**:
```
Utilisateur clique "Demander remboursement"
  → Modal explicatif (liste des tableaux qui seront annulés + montant remboursé)
  → Confirmation
  → API: POST /api/payments/:id/refund
    → Backend: POST HelloAsso /payments/{paymentId}/refund
    → Backend: Payment.status = 'refunded'
    → Backend: Toutes les Registration liées = 'cancelled'
    → Backend: Libération des places (waitlist automation)
  → Frontend: Affichage confirmation
```

### 3. Workflow de désinscription sans remboursement

**Decision**: Désinscription partielle possible mais sans aucun remboursement

**Rationale**:
- Permet de libérer des places pour d'autres joueurs
- Utile si l'utilisateur ne peut venir qu'un jour sur deux
- Pas de remboursement car cela impliquerait un remboursement partiel (non supporté)

**Workflow**:
```
Utilisateur clique "Se désinscrire" sur un tableau
  → Modal avec 2 options :
    1. "Remboursement total" → annule TOUS les tableaux du paiement, rembourse
    2. "Désinscription seule" → annule CE tableau seulement, PAS de remboursement
  → Si option 2 choisie :
    → API: DELETE /api/registrations/:id (sans refund)
    → Backend: Registration.status = 'cancelled'
    → Backend: Libération de la place
    → Payment reste 'succeeded' (pas de changement)
```

### 4. Structure du Dashboard

**Decision**: Affichage par paiement avec expansion des détails

**Composant PaymentGroup**:
```
┌─────────────────────────────────────────────────────┐
│ 🧾 Paiement du 15/01/2025 - 24,00 €                │
│ Statut: ✅ Payé                                     │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Senior H 1000pts - Samedi 10h - Jean DUPONT    │ │
│ │ [Se désinscrire]                                │ │
│ └─────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Senior H 1500pts - Samedi 14h - Jean DUPONT    │ │
│ │ [Se désinscrire]                                │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ [Demander un remboursement total]                   │
└─────────────────────────────────────────────────────┘
```

### 5. API HelloAsso Refund

**Endpoint**: `POST https://api.helloasso.com/v5/payments/{paymentId}/refund`

**Notes**:
- Nécessite le `helloasso_order_id` stocké dans Payment
- Le paymentId HelloAsso est dans l'order, pas le checkoutIntentId
- Permissions requises: `RefundManagement` + `OrganizationAdmin` ou `FormAdmin`

**Implémentation HelloAssoService**:
```typescript
async refundPayment(helloAssoPaymentId: number): Promise<void> {
  const token = await this.authenticate()
  await fetch(`${this.baseUrl}/v5/payments/${helloAssoPaymentId}/refund`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  })
}
```

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| HelloAsso refund échoue (déjà remboursé, etc.) | Log l'erreur, afficher message explicite, marquer comme "refund_failed" |
| Utilisateur veut remboursement partiel | UX claire : expliquer que c'est tout ou rien, proposer désinscription sans remboursement |
| Payment sans helloasso_order_id (paiement sandbox/test) | Vérifier présence avant appel, sinon erreur explicite |
| Race condition sur quota après annulation | Transaction DB |

## Migration Plan

1. Ajouter statut `refund_pending` et `refund_failed` au modèle Payment
2. Ajouter méthode `refundPayment()` à HelloAssoService
3. Créer CancellationService avec logique métier
4. Créer endpoints API (refund + unregister)
5. Refactorer le dashboard pour affichage groupé
6. Ajouter les modals de confirmation avec choix explicite

**Rollback**: Les données existantes restent compatibles. Le rollback consiste à redéployer l'ancienne version.

## Open Questions

Aucune question ouverte - les points ont été clarifiés :
- `refundDeadline` existe déjà dans `tournament.options`
- Si null → remboursement jusqu'au jour du tournoi (`startDate`)
- Si défini → ne peut pas dépasser `startDate`
