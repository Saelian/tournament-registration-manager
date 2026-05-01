# Design : Suivi des remboursements partiels admin

## Contexte

Un paiement HelloAsso est toujours global : un seul enregistrement `Payment` couvre 1 à N inscriptions (`payment_registrations`). HelloAsso ne supporte pas les remboursements partiels — l'API rembourse uniquement le montant total du paiement. Par conséquent :

- **Annulation totale** (tous les tableaux d'un joueur) → le paiement peut être remboursé via HelloAsso ou manuellement. Le paiement passe en `refund_requested` ou `refunded`.
- **Annulation partielle** (un seul tableau) → le paiement reste actif (couvre les autres tableaux). Le remboursement est forcément manuel (virement/espèces) et doit être tracé au niveau de l'inscription, pas du paiement.

## Décisions

### Méthodes de remboursement disponibles

| Contexte | Méthodes disponibles |
|---|---|
| Annulation complète (cancelAll) | `helloasso_manual`, `bank_transfer`, `cash` |
| Annulation partielle (cancelOne) | `bank_transfer`, `cash` uniquement |

`check` est retiré : cette méthode n'a pas d'équivalent dans le système de remboursement existant.

### Nouveau endpoint de traitement des remboursements partiels

```
PATCH /admin/registrations/:id/refund
Auth: admin_auth_middleware
Body: { refundMethod: 'bank_transfer' | 'cash' }
```

Comportement :
1. Vérifie que l'inscription existe, est annulée par un admin, et a `refund_status = 'requested'`.
2. Passe `refund_status = 'done'`, pose `refunded_at = now()`, `refund_method = body.refundMethod`.
3. Vérifie si le paiement lié peut être soldé (voir ci-dessous).
4. Retourne l'inscription mise à jour.

### Logique d'auto-solde du paiement

Après traitement d'un remboursement partiel, pour chaque paiement lié à cette inscription :
- Charger toutes les inscriptions du paiement.
- Si toutes ont `status = 'cancelled'` **et** aucune n'a `refund_status = 'requested'` → passer le paiement à `refunded` avec `refunded_at = now()`.
- Cette logique est déclenchée uniquement depuis `PATCH /admin/registrations/:id/refund`.

### Visibilité dans la page paiements

`GET /admin/payments` renvoie en plus un champ `pendingPartialRefunds` : liste des inscriptions avec `cancelled_by_admin_id IS NOT NULL AND refund_status = 'requested'`, enrichies avec les infos joueur, tableau, montant (`table.price`) et subscriber.

La page affiche une section dédiée similaire à l'alerte `pendingRefunds` existante, avec un bouton "Traiter" par ligne.

### Montant du remboursement partiel

Le montant à rembourser pour une inscription annulée = `table.price` (prix unitaire du tableau). Ce champ est déjà disponible via la relation `registration → table`. Aucune nouvelle colonne n'est nécessaire.

## Ce qui n'est pas dans le scope

- Remboursement partiel via HelloAsso (techniquement impossible)
- Calcul d'un montant personnalisé différent du prix du tableau
- Notification email à l'admin pour les remboursements partiels en attente (peut être ajouté plus tard)
