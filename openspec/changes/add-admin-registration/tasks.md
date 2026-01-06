# Tasks: add-admin-registration

## 1. Data Model

- [ ] 1.1 Migration: ajouter `payment_method` sur la table `payments` (enum: helloasso, cash, check, card)
- [ ] 1.2 Migration: ajouter `is_admin_created` sur la table `registrations` (boolean, default false)
- [ ] 1.3 Mettre à jour le modèle `Payment` avec le champ `payment_method`
- [ ] 1.4 Mettre à jour le modèle `Registration` avec le champ `isAdminCreated`
- [ ] 1.5 Créer un seeder pour le User système (email: system@tournament.local)

## 2. Backend API

- [ ] 2.1 POST `/admin/registrations` - Créer inscription(s) admin
  - Paramètres: player_id, table_ids[], payment_method, bypass_rules, collected
  - Retourne checkout_url si payment_method = helloasso
- [ ] 2.2 PATCH `/admin/payments/:id/collect` - Marquer un paiement comme encaissé
- [ ] 2.3 POST `/admin/registrations/:id/generate-payment-link` - Générer lien HelloAsso pour inscription existante
- [ ] 2.4 Adapter `HelloAssoService` pour générer des checkouts standalone (sans redirect automatique)
- [ ] 2.5 Ajouter validation VineJS pour les nouveaux endpoints
- [ ] 2.6 Gérer le rattachement au User système quand pas de compte utilisateur

## 3. Frontend - Formulaire d'inscription admin

- [ ] 3.1 Créer composant `AdminRegistrationForm` (modale ou page)
- [ ] 3.2 Intégrer `PlayerSearch` pour la recherche de joueur
- [ ] 3.3 Créer sélecteur de tableaux avec affichage des conflits
- [ ] 3.4 Créer checkbox "Ignorer les règles" avec avertissement
- [ ] 3.5 Créer sélecteur de mode de paiement (HelloAsso, Espèces, Chèque, Carte)
- [ ] 3.6 Créer toggle "Encaissé / Non encaissé" (visible si cash/check/card)
- [ ] 3.7 Afficher le lien de paiement HelloAsso avec bouton "Copier"
- [ ] 3.8 Ajouter bouton "Nouvelle inscription" dans `/admin/registrations`

## 4. Frontend - Page des paiements

- [ ] 4.1 Ajouter colonne "Mode de paiement" dans la table des paiements
- [ ] 4.2 Ajouter bouton "Marquer comme encaissé" pour paiements pending offline
- [ ] 4.3 Créer modale de confirmation pour l'encaissement
- [ ] 4.4 Ajouter filtre par mode de paiement
- [ ] 4.5 Mettre à jour l'export CSV avec le mode de paiement

## 5. Frontend - Liste des inscriptions

- [ ] 5.1 Ajouter indicateur visuel pour inscriptions admin (badge ou icône)
- [ ] 5.2 Ajouter filtre "Inscriptions admin"
- [ ] 5.3 Ajouter bouton "Générer lien de paiement" pour inscriptions pending_payment
- [ ] 5.4 Afficher modale avec lien copiable après génération

## 6. Tests

- [ ] 6.1 Test création inscription admin avec paiement cash encaissé
- [ ] 6.2 Test création inscription admin avec paiement non-encaissé
- [ ] 6.3 Test création inscription admin avec génération lien HelloAsso
- [ ] 6.4 Test bypass des règles d'éligibilité
- [ ] 6.5 Test marquage paiement comme encaissé
- [ ] 6.6 Test User système créé au démarrage
- [ ] 6.7 Test génération lien paiement pour inscription existante
