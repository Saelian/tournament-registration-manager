# Améliorer l'expérience d'inscription dans les tableaux

## Résumé

Cette proposition améliore l'expérience utilisateur sur la page de sélection des tableaux (`/tournaments/:id/tables`) en rendant plus visible l'état de sélection des tableaux et en clarifiant le fonctionnement du panier.

## Motivation

Actuellement, deux problèmes impactent l'expérience d'inscription :

1. **Visibilité de la sélection** : Lorsqu'un tableau est sélectionné, une icône "check" apparaît dans le coin supérieur gauche, parmi d'autres éléments (lettre de référence, titre). Cette position est peu visible et l'utilisateur peut ne pas percevoir clairement sa sélection.

2. **Manque d'indications dans le panier** : Le panier ne précise pas :
   - Que la validation redirige vers Hello Asso pour le paiement
   - Que les inscriptions non payées sont automatiquement perdues après 30 minutes
   - Que si un souci survient pendant le paiement, l'utilisateur peut de nouveau procéder au paiement depuis son espace utilisateur

## Portée

- **Composants impactés** : `TableCard.tsx`, `CartSummary.tsx`
- **Type de changement** : UX/UI uniquement, pas d'impact backend

## Approche proposée

1. Déplacer l'icône de sélection vers le coin supérieur droit de la card avec un style plus visible
2. Ajouter un message informatif dans le panier concernant la perte d'inscription si le paiement n'est pas effectué dans les 30 minutes et la possibilité de nouveau procéder au paiement depuis son espace utilisateur

## Liens

- [Design](./design.md)
- [Tâches](./tasks.md)
- [Spec delta](./specs/registration-flow/spec.md)
