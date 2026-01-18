# admin-registration Specification

## Purpose
TBD - created by archiving change add-admin-registration. Update Purpose after archive.
## Requirements
### Requirement: Admin Registration Form
Le système MUST fournir un formulaire permettant à un administrateur de créer une inscription pour le compte d'un joueur.

#### Scenario: Accès au formulaire
- **WHEN** un admin clique sur "Nouvelle inscription" dans `/admin/registrations`
- **THEN** un formulaire de création d'inscription s'ouvre (modale ou page dédiée)

#### Scenario: Recherche joueur
- **WHEN** l'admin saisit un numéro de licence
- **THEN** les informations du joueur sont récupérées via FFTT
- **AND** le composant PlayerSearch existant est réutilisé

#### Scenario: Sélection de tableaux
- **WHEN** l'admin sélectionne un ou plusieurs tableaux
- **THEN** les règles d'éligibilité sont vérifiées
- **AND** les conflits éventuels sont affichés

### Requirement: Rule Bypass
Le système MUST permettre à un administrateur de bypasser les règles d'éligibilité.

#### Scenario: Joueur éligible
- **WHEN** l'admin inscrit un joueur éligible au tableau
- **THEN** l'inscription est créée normalement sans avertissement

#### Scenario: Activation du bypass
- **WHEN** l'admin coche "Ignorer les règles" pour un joueur non-éligible
- **THEN** l'inscription est créée malgré les conflits
- **AND** un avertissement est affiché avant confirmation

#### Scenario: Avertissement affiché
- **WHEN** des règles sont violées (points, horaires, quota)
- **THEN** un avertissement détaillé liste les conflits avant confirmation

### Requirement: Payment Method Selection
Le système MUST permettre de choisir le mode de paiement lors d'une inscription admin.

#### Scenario: Paiement HelloAsso
- **WHEN** l'admin sélectionne "HelloAsso"
- **THEN** un lien de paiement est généré
- **AND** l'inscription est créée avec status = pending_payment
- **AND** le lien est affiché pour copie manuelle

#### Scenario: Paiement Cash
- **WHEN** l'admin sélectionne "Espèces"
- **THEN** l'admin peut indiquer si c'est encaissé ou non
- **AND** un Payment est créé avec payment_method = cash

#### Scenario: Paiement Chèque
- **WHEN** l'admin sélectionne "Chèque"
- **THEN** l'admin peut indiquer si c'est encaissé ou non
- **AND** un Payment est créé avec payment_method = check

#### Scenario: Paiement Carte bancaire
- **WHEN** l'admin sélectionne "Carte bancaire"
- **THEN** l'admin peut indiquer si c'est encaissé ou non
- **AND** un Payment est créé avec payment_method = card

### Requirement: Collection Status
Le système MUST permettre d'indiquer si un paiement cash/chèque/carte a été encaissé.

#### Scenario: Paiement encaissé
- **WHEN** l'admin indique "Encaissé"
- **THEN** le Payment est créé avec status = succeeded
- **AND** l'inscription passe à status = paid

#### Scenario: Paiement non-encaissé
- **WHEN** l'admin indique "Non encaissé"
- **THEN** le Payment est créé avec status = pending
- **AND** l'inscription reste à status = pending_payment

#### Scenario: Encaissement ultérieur
- **WHEN** un admin marque un paiement pending comme encaissé
- **THEN** le Payment passe à status = succeeded
- **AND** l'inscription passe à status = paid

### Requirement: HelloAsso Payment Link Generation
Le système MUST permettre de générer un lien de paiement HelloAsso pour envoi ultérieur.

#### Scenario: Génération du lien
- **WHEN** l'admin choisit "HelloAsso" comme mode de paiement
- **THEN** un checkout HelloAsso est créé
- **AND** l'URL de paiement est affichée dans un champ copiable

#### Scenario: Copie du lien
- **WHEN** l'admin clique sur "Copier le lien"
- **THEN** l'URL est copiée dans le presse-papier
- **AND** une confirmation visuelle est affichée

#### Scenario: Génération depuis une inscription existante
- **WHEN** l'admin clique sur "Générer lien de paiement" sur une inscription pending_payment
- **THEN** un nouveau checkout HelloAsso est créé si aucun n'existe
- **AND** l'URL de paiement est affichée

### Requirement: Admin Created Flag

Le système MUST identifier les inscriptions créées par un administrateur et conserver une référence vers cet administrateur.

#### Scenario: Marquage automatique

- **WHEN** une inscription est créée via le formulaire admin
- **THEN** elle est marquée avec `is_admin_created = true`
- **AND** l'id de l'admin connecté est stocké dans `admin_id`

#### Scenario: Affichage du créateur

- **WHEN** une inscription admin est affichée dans l'interface
- **THEN** le nom et l'email de l'admin créateur sont affichés
- **AND** ils remplacent l'affichage du "Système Tournament"

#### Scenario: Inscriptions sans admin_id (rétro-compatibilité)

- **WHEN** une inscription a `is_admin_created = true` mais `admin_id = null`
- **THEN** l'interface affiche "Admin (non tracé)" comme indicateur visuel

#### Scenario: Filtrage admin

- **WHEN** l'admin consulte la liste des inscriptions
- **THEN** il peut filtrer les inscriptions créées par admin

#### Scenario: Affichage distinctif

- **WHEN** une inscription admin est affichée dans une liste
- **THEN** un indicateur visuel la distingue des inscriptions classiques

---

### Requirement: System User for Admin Registrations

Le système MUST conserver le User système pour les inscriptions admin comme référence de `userId`, tout en stockant l'admin créateur séparément.

#### Scenario: Création du User système

- **WHEN** l'application démarre
- **THEN** un User système avec email "system@tournament.local" existe
- **AND** ce User ne peut pas se connecter (pas d'OTP possible)

#### Scenario: Rattachement des inscriptions admin

- **WHEN** l'admin crée une inscription sans compte utilisateur associé
- **THEN** l'inscription est rattachée au User système (`user_id`)
- **AND** l'id de l'admin créateur est stocké dans `admin_id`

#### Scenario: API Response

- **WHEN** l'API retourne une inscription admin
- **THEN** la réponse contient `createdByAdmin` avec les infos de l'admin (nom, email)
- **AND** si `admin_id` est null, `createdByAdmin` est null

---

### Requirement: Admin Registration API
Le système MUST exposer un endpoint pour créer des inscriptions admin.

#### Scenario: Création réussie
- **WHEN** POST /admin/registrations avec player_id, table_ids, payment_method, bypass_rules, collected
- **THEN** les inscriptions sont créées
- **AND** le Payment associé est créé selon le mode choisi

#### Scenario: Réponse avec lien HelloAsso
- **WHEN** payment_method = helloasso
- **THEN** la réponse contient checkout_url avec le lien de paiement

#### Scenario: Validation des paramètres
- **WHEN** des paramètres obligatoires manquent
- **THEN** une erreur 400 est retournée avec les détails

