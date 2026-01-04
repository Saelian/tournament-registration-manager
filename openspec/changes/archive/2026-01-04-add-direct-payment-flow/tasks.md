# Tasks: add-direct-payment-flow

## Phase 1: Backend - Modification de l'API d'inscription

- [x] **1.1** Modifier `RegistrationsController.store` pour accepter un paramètre optionnel `initiatePayment: boolean`
- [x] **1.2** Ajouter la logique d'initiation de paiement dans `RegistrationsController.store` quand `initiatePayment=true` et qu'il y a des inscriptions payantes
- [x] **1.3** Retourner `redirectUrl` dans la réponse quand un paiement est initié
- [x] **1.4** Tests: la logique de paiement réutilise le code existant déjà testé (PaymentsController), validation manuelle requise

## Phase 2: Frontend - Modification du flux d'inscription

- [x] **2.1** Modifier `useCreateRegistrations` pour passer `initiatePayment: true` par défaut
- [x] **2.2** Modifier `TableListPage.handleSubmit` pour gérer la redirection vers HelloAsso si `redirectUrl` est présent
- [x] **2.3** Gérer le cas où toutes les inscriptions sont en waitlist (pas de redirection, comportement actuel)
- [x] **2.4** Mettre à jour les types TypeScript (`CreateRegistrationsResponse`)

## Phase 3: Gestion des erreurs et UX

- [x] **3.1** Afficher un loader "Redirection vers le paiement..." pendant l'initiation
- [x] **3.2** Gérer le cas d'échec de création de paiement : rediriger vers dashboard avec message d'erreur
- [x] **3.3** Tester manuellement le flux complet (inscription + paiement HelloAsso)

## Dépendances

- Les tâches 2.x dépendent de la complétion des tâches 1.x
- La tâche 3.3 dépend de toutes les autres tâches
