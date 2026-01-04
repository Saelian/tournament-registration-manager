# Proposal: add-direct-payment-flow

## Summary

Améliorer le flux d'inscription en redirigeant automatiquement vers HelloAsso après validation du panier, au lieu de rediriger vers le dashboard où l'utilisateur doit cliquer sur "Payer".

## Problem

**Workflow actuel**:
1. L'utilisateur sélectionne des tableaux dans son panier
2. Il clique sur "Valider l'inscription"
3. Les inscriptions sont créées avec statut `pending_payment`
4. L'utilisateur est redirigé vers `/dashboard` avec un message
5. L'utilisateur doit cliquer sur "Payer" pour initier le paiement HelloAsso

**Problème**: Cette étape intermédiaire ajoute de la friction inutile. L'utilisateur a déjà exprimé son intention de s'inscrire (et donc de payer) en cliquant sur "Valider l'inscription". Le rediriger vers le dashboard pour qu'il clique à nouveau sur "Payer" crée une friction qui peut entraîner des abandons de paiement.

## Solution

Combiner la création d'inscriptions et l'initiation du paiement en une seule action :
1. L'utilisateur sélectionne des tableaux dans son panier
2. Il clique sur "Valider l'inscription"
3. Les inscriptions sont créées avec statut `pending_payment`
4. Le paiement HelloAsso est immédiatement initié
5. L'utilisateur est redirigé vers HelloAsso pour payer

**Cas spéciaux**:
- Si toutes les inscriptions sont en liste d'attente (waitlist) : pas de paiement immédiat, redirection vers dashboard comme actuellement
- Si certaines inscriptions sont en waitlist et d'autres payantes : seules les payantes déclenchent le paiement immédiat

## Scope

### In Scope
- Modification du bouton "Valider l'inscription" pour enchaîner création + paiement
- Nouvelle réponse API incluant l'URL de redirection HelloAsso
- Gestion du cas mixte (payant + waitlist)

### Out of Scope
- Modification de l'interface admin
- Modification des webhooks HelloAsso
- Modification du flow de remboursement

## Impacted Capabilities

| Capability         | Impact   | Description                                                    |
|--------------------|----------|----------------------------------------------------------------|
| registration-flow  | MODIFIED | Le flux inclut maintenant l'initiation automatique du paiement |

## Risks & Mitigations

| Risk                                           | Mitigation                                                      |
|------------------------------------------------|-----------------------------------------------------------------|
| Erreur lors de la création du paiement         | Créer les inscriptions d'abord, puis tenter le paiement. En cas d'échec, rediriger vers dashboard avec message d'erreur |
| Complexité accrue du endpoint                  | Réutiliser la logique existante de `PaymentsController.createIntent` |
