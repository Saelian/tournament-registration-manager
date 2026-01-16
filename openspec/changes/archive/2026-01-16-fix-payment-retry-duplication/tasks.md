# Tasks: Fix Payment Retry Duplication

## 1. Backend Implementation

- [x] 1.1 Modifier `PaymentsController.createIntent()` pour chercher un Payment existant
- [x] 1.2 Ajouter la logique de récupération du checkout HelloAsso existant via `getCheckoutIntent()`
- [x] 1.3 Ajouter la logique de fallback (nouveau checkout si l'existant a expiré)
- [x] 1.4 Mettre à jour le Payment existant au lieu d'en créer un nouveau lors du retry

## 2. Testing

- [x] 2.1 Tester le scénario de retry avec Payment existant et checkout valide
- [x] 2.2 Tester le scénario de retry avec Payment existant mais checkout expiré
- [x] 2.3 Tester le scénario sans Payment existant (comportement inchangé)
- [x] 2.4 Vérifier qu'aucune duplication n'est créée dans `payment_registrations`

## 3. Validation

- [x] 3.1 Vérifier le comportement end-to-end en environnement de développement
- [x] 3.2 Vérifier que le webhook HelloAsso fonctionne correctement avec le Payment réutilisé
