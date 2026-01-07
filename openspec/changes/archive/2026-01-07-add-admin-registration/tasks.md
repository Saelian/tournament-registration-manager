# Tasks: add-admin-registration

## 1. Data Model

- [x] 1.1 Migration: ajouter `payment_method` sur la table `payments` (enum: helloasso, cash, check, card)
- [x] 1.2 Migration: ajouter `is_admin_created` sur la table `registrations` (boolean, default false)
- [x] 1.3 Mettre à jour le modèle `Payment` avec le champ `payment_method`
- [x] 1.4 Mettre à jour le modèle `Registration` avec le champ `isAdminCreated`
- [x] 1.5 Créer un seeder pour le User système (email: system@tournament.local)

## 2. Backend API

- [x] 2.1 POST `/admin/registrations` - Créer inscription(s) admin
  - Paramètres: player_id, table_ids[], payment_method, bypass_rules, collected
  - Retourne checkout_url si payment_method = helloasso
- [x] 2.2 PATCH `/admin/payments/:id/collect` - Marquer un paiement comme encaissé
- [x] 2.3 POST `/admin/registrations/:id/generate-payment-link` - Générer lien HelloAsso pour inscription existante
- [x] 2.4 Adapter `HelloAssoService` pour générer des checkouts standalone (sans redirect automatique)
- [x] 2.5 Ajouter validation VineJS pour les nouveaux endpoints
- [x] 2.6 Gérer le rattachement au User système quand pas de compte utilisateur

## 3. Frontend - Formulaire d'inscription admin

- [x] 3.1 Créer composant `AdminRegistrationForm` (modale ou page)
- [x] 3.2 Intégrer `PlayerSearch` pour la recherche de joueur
- [x] 3.3 Créer sélecteur de tableaux avec affichage des conflits
- [x] 3.4 Créer checkbox "Ignorer les règles" avec avertissement
- [x] 3.5 Créer sélecteur de mode de paiement (HelloAsso, Espèces, Chèque, Carte)
- [x] 3.6 Créer toggle "Encaissé / Non encaissé" (visible si cash/check/card)
- [x] 3.7 Afficher le lien de paiement HelloAsso avec bouton "Copier"
- [x] 3.8 Ajouter bouton "Nouvelle inscription" dans `/admin/registrations`

## 4. Frontend - Page des paiements

- [x] 4.1 Ajouter colonne "Mode de paiement" dans la table des paiements
- [x] 4.2 Ajouter bouton "Marquer comme encaissé" pour paiements pending offline
- [x] 4.3 Créer modale de confirmation pour l'encaissement
- [x] 4.4 Ajouter filtre par mode de paiement
- [x] 4.5 Mettre à jour l'export CSV avec le mode de paiement

## 5. Frontend - Liste des inscriptions

- [x] 5.1 Ajouter indicateur visuel pour inscriptions admin (badge ou icône)
- [x] 5.2 Ajouter filtre "Inscriptions admin"
- [x] 5.3 Ajouter bouton "Générer lien de paiement" pour inscriptions pending_payment
- [x] 5.4 Afficher modale avec lien copiable après génération

## 6. Tests

- [x] 6.1 Test création inscription admin avec paiement cash encaissé
- [x] 6.2 Test affectation dossard pour un joueur dont l'inscription est faite par un admin
- [x] 6.3 Test création inscription admin avec paiement non-encaissé
- [x] 6.4 Test création inscription admin avec génération lien HelloAsso
- [x] 6.5 Test bypass des règles d'éligibilité
- [x] 6.6 Test marquage paiement comme encaissé
- [x] 6.7 Test génération lien paiement pour inscription existante
- [x] 6.8 Test interdiction inscription double sur même tableau (ne peut pas être bypass)
- [x] 6.9 Test inscription admin avec HelloAsso pour plusieurs tableaux
- [x] 6.10 Test conservation du même numéro de dossard pour plusieurs inscriptions admin du même joueur
