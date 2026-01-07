# Tasks: add-admin-registration

## 1. Data Model

- [x] 1.1 Migration: ajouter `payment_method` sur la table `payments` (enum: helloasso, cash, check, card)
- [x] 1.2 Migration: ajouter `is_admin_created` sur la table `registrations` (boolean, default false)
- [x] 1.3 Mettre à jour le modèle `Payment` avec le champ `payment_method`
- [x] 1.4 Mettre à jour le modèle `Registration` avec le champ `isAdminCreated`
- [x] 1.5 User système créé dynamiquement via `firstOrCreate` dans le controller

## 2. Backend API

- [x] 2.1 POST `/admin/registrations` - Créer inscription(s) admin
  - Paramètres: licence, table_ids[], payment_method, bypass_rules, collected
  - Retourne checkout_url si payment_method = helloasso
- [x] 2.2 PATCH `/admin/payments/:id/collect` - Marquer un paiement comme encaissé
- [x] 2.3 POST `/admin/registrations/:id/generate-payment-link` - Générer lien HelloAsso pour inscription existante
- [x] 2.4 HelloAssoService réutilisé avec `initCheckout` existant
- [x] 2.5 Validation VineJS pour les endpoints (`createAdminRegistrationValidator`, `generatePaymentLinkValidator`)
- [x] 2.6 Rattachement au User système (system@tournament.local) via `firstOrCreate`

## 3. Frontend - Formulaire d'inscription admin

- [x] 3.1 Composant `AdminRegistrationForm` (modale)
- [x] 3.2 Recherche joueur par licence intégrée
- [x] 3.3 Sélecteur de tableaux avec affichage des conflits (horaires, limite quotidienne, quota)
- [x] 3.4 Checkbox "Ignorer certaines règles" avec avertissement
- [x] 3.5 Sélecteur mode de paiement (Espèces, Chèque, Carte, HelloAsso)
- [x] 3.6 Toggle "Encaissé / Non encaissé" (visible si cash/check/card)
- [x] 3.7 Affichage lien HelloAsso avec bouton "Copier"
- [x] 3.8 Bouton "Nouvelle inscription" dans `/admin/registrations`
- [x] 3.9 **AJOUT**: Vérification des restrictions de genre et catégorie (non-bypassable)

## 4. Frontend - Page des paiements

- [x] 4.1 Colonne "Mode de paiement" dans la table des paiements
- [x] 4.2 Bouton "Encaisser" pour paiements pending offline
- [x] 4.3 Modale de confirmation pour l'encaissement (`CollectPaymentModal`)
- [x] 4.4 Filtre par mode de paiement (frontend + backend)
- [x] 4.5 Export CSV avec le mode de paiement

## 5. Frontend - Liste des inscriptions

- [x] 5.1 Badge "Admin" pour inscriptions admin (icône ShieldCheck violette)
- [x] 5.2 Filtre "Inscriptions admin uniquement"
- [x] 5.3 Bouton "Lien paiement" pour inscriptions pending_payment
- [x] 5.4 `PaymentLinkModal` avec lien copiable après génération

## 6. Tests

- [ ] 6.1 Test création inscription admin avec paiement cash encaissé
- [ ] 6.2 Test création inscription admin avec paiement non-encaissé
- [ ] 6.3 Test création inscription admin avec génération lien HelloAsso
- [ ] 6.4 Test bypass des règles d'éligibilité (limite quotidienne, quota seulement)
- [ ] 6.5 Test marquage paiement comme encaissé
- [ ] 6.6 Test User système créé dynamiquement
- [ ] 6.7 Test génération lien paiement pour inscription existante
