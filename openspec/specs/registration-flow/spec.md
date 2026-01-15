# registration-flow Specification

## Purpose
TBD - created by archiving change add-registration-flow. Update Purpose after archive.
## Requirements
### Requirement: Table Selection
The system MUST allow selecting desired tables with filtering options.

#### Scenario: Simple Selection
- **WHEN** a user selects an eligible table
- **THEN** it is added to the cart with its price

#### Scenario: Multiple Selection
- **WHEN** a user selects multiple tables
- **THEN** all are added to the cart and the total is calculated

#### Scenario: Deselection
- **WHEN** a user deselects a table
- **THEN** it is removed from the cart and the total is recalculated

#### Scenario: Filter by Eligibility
- **WHEN** the "Show only eligible tables" filter is checked
- **THEN** only tables where the player is eligible are displayed

#### Scenario: Filter Already Registered
- **WHEN** the "Show already registered tables" filter is unchecked
- **THEN** tables where the player is already registered are hidden

#### Scenario: Default Filter State
- **WHEN** a user opens the table selection page
- **THEN** both filters are checked by default

#### Scenario: Filter Combination
- **WHEN** multiple filters are applied
- **THEN** only tables matching all active filters are displayed

### Requirement: Cart Summary
The system MUST display a cart summary before payment, including clear information about the payment process and expiration rules.

#### Scenario: Cart Display
- **WHEN** a user has selected tables
- **THEN** the summary shows each table, its price, and the total

#### Scenario: Registration/Waitlist Distinction
- **WHEN** the cart contains full tables
- **THEN** they are marked "Waitlist" and excluded from the total to pay

#### Scenario: Payment Information Display
- **WHEN** le panier contient au moins un tableau sélectionné
- **THEN** un message indique que la validation redirige vers Hello Asso pour le paiement
- **AND** un message indique que les inscriptions non payées sont automatiquement annulées après 30 minutes

---

### Requirement: Registration Creation
The system MUST create registrations with the correct status.

#### Scenario: Direct Registration
- **WHEN** a table has available places and payment is made
- **THEN** the registration is created with status = paid

#### Scenario: Pending Payment Registration
- **WHEN** tables are selected but not paid
- **THEN** registrations are created with status = pending_payment

#### Scenario: Waitlist Registration
- **WHEN** a table is full
- **THEN** the registration is created with status = waitlist and a rank assigned

### Requirement: Waitlist Ranking
The system MUST calculate and store the waitlist rank.

#### Scenario: First on Waitlist
- **WHEN** a player registers for a full table without a queue
- **THEN** their rank is 1

#### Scenario: Next Rank
- **WHEN** a player registers for a table with 3 people already waiting
- **THEN** their rank is 4

#### Scenario: Rank Display
- **WHEN** a player views their waitlist registration
- **THEN** their current rank is displayed

### Requirement: Registration Validation
The system MUST validate rules before creating the registration.

#### Scenario: Successful Validation
- **WHEN** all rules are respected
- **THEN** registrations are created

#### Scenario: Failed Validation
- **WHEN** a rule is not respected
- **THEN** an error is returned and no registration is created

### Requirement: Vérification de la période d'inscription
Le système MUST bloquer toute tentative d'inscription en dehors de la période configurée.

#### Scenario: Inscription avant ouverture
- **WHEN** un utilisateur tente de créer une inscription avant la date d'ouverture
- **THEN** l'API retourne une erreur avec code `REGISTRATION_NOT_OPEN` et message indiquant la date d'ouverture

#### Scenario: Inscription après fermeture
- **WHEN** un utilisateur tente de créer une inscription après la date de fermeture
- **THEN** l'API retourne une erreur avec code `REGISTRATION_CLOSED` et message indiquant la date de fermeture

#### Scenario: Inscription pendant la période
- **WHEN** un utilisateur tente de créer une inscription pendant la période d'inscription active
- **THEN** la création suit le flux normal de validation

#### Scenario: Inscription sans période configurée
- **WHEN** aucune période n'est configurée sur le tournoi et un utilisateur tente de s'inscrire
- **THEN** la création suit le flux normal de validation (pas de blocage)

#### Scenario: Protection API
- **WHEN** un appel direct à POST /api/registrations est effectué hors période
- **THEN** l'API refuse la création avec le code d'erreur approprié

### Requirement: Attribution du numéro de dossard
Le système MUST attribuer automatiquement un numéro de dossard unique à chaque joueur lors de sa première inscription à un tournoi.

#### Scenario: Première inscription d'un joueur au tournoi
- **WHEN** un joueur s'inscrit pour la première fois à un tableau d'un tournoi
- **THEN** un numéro de dossard lui est attribué (égal au plus grand numéro existant + 1, ou 1 si aucun joueur inscrit)

#### Scenario: Inscriptions multiples au même tournoi
- **WHEN** un joueur déjà inscrit à un tableau s'inscrit à un autre tableau du même tournoi
- **THEN** il conserve son numéro de dossard existant

#### Scenario: Unicité du dossard par tournoi
- **WHEN** deux joueurs s'inscrivent au même tournoi
- **THEN** chacun reçoit un numéro de dossard différent

#### Scenario: Persistance multi-jours
- **WHEN** un tournoi se déroule sur plusieurs jours et un joueur s'inscrit à des tableaux de jours différents
- **THEN** le joueur conserve le même numéro de dossard sur tous les jours

### Requirement: Non-réutilisation des numéros de dossard
Le système MUST conserver les numéros de dossard attribués, même après désinscription, pour simplifier la gestion le jour du tournoi.

#### Scenario: Désinscription d'un joueur
- **WHEN** un joueur se désinscrit de toutes ses inscriptions à un tournoi
- **THEN** son numéro de dossard reste attribué et n'est pas réutilisé pour un autre joueur

#### Scenario: Nouvelle inscription après désinscription complète
- **WHEN** un joueur se réinscrit après s'être complètement désinscrit
- **THEN** il récupère son numéro de dossard précédent (pas de nouveau numéro)

### Requirement: Affichage du numéro de dossard
Le système MUST afficher le numéro de dossard dans les interfaces utilisateur et administrateur.

#### Scenario: Affichage sur le dashboard utilisateur
- **WHEN** un utilisateur consulte son dashboard avec ses inscriptions
- **THEN** le numéro de dossard est affiché pour chaque inscription confirmée

#### Scenario: Affichage dans l'interface admin
- **WHEN** un administrateur consulte la liste des inscriptions
- **THEN** le numéro de dossard de chaque joueur est visible

#### Scenario: Retour API
- **WHEN** l'API retourne les données d'une inscription
- **THEN** le champ `bibNumber` est inclus dans la réponse

### Requirement: Paiement automatique à l'inscription
Le système MUST initier automatiquement le paiement HelloAsso après création des inscriptions payantes.

#### Scenario: Inscription avec paiement direct
- **WHEN** un utilisateur valide son panier avec des tableaux disponibles (non complets)
- **THEN** les inscriptions sont créées avec status = pending_payment
- **AND** un paiement HelloAsso est automatiquement initié
- **AND** l'utilisateur est redirigé vers la page de paiement HelloAsso

#### Scenario: Inscription liste d'attente uniquement
- **WHEN** un utilisateur valide son panier avec uniquement des tableaux complets (waitlist)
- **THEN** les inscriptions sont créées avec status = waitlist
- **AND** aucun paiement n'est initié
- **AND** l'utilisateur est redirigé vers le dashboard avec un message confirmant l'ajout en liste d'attente

#### Scenario: Inscription mixte (payant + waitlist)
- **WHEN** un utilisateur valide son panier avec un mix de tableaux disponibles et complets
- **THEN** les inscriptions payantes sont créées avec status = pending_payment
- **AND** les inscriptions waitlist sont créées avec status = waitlist
- **AND** l'utilisateur est explicitement informé qu'il ne va payer que les tableaux non complets et qu'il faudra payer les tableaux en liste d'attente uniquement si une place se libère
- **AND** un paiement HelloAsso est initié uniquement pour les inscriptions payantes
- **AND** l'utilisateur est redirigé vers HelloAsso

#### Scenario: Échec de création du paiement
- **WHEN** la création du paiement HelloAsso échoue après création des inscriptions
- **THEN** les inscriptions restent avec status = pending_payment
- **AND** l'utilisateur est redirigé vers le dashboard
- **AND** un message d'erreur indique qu'il peut réessayer le paiement depuis le dashboard

### Requirement: Réponse API enrichie
Le système MUST retourner l'URL de redirection HelloAsso dans la réponse de création d'inscription.

#### Scenario: Réponse avec redirection paiement
- **WHEN** POST /api/registrations est appelé avec des inscriptions payantes
- **THEN** la réponse inclut `redirectUrl` pointant vers HelloAsso
- **AND** la réponse inclut `paymentId` pour le suivi

#### Scenario: Réponse sans redirection
- **WHEN** POST /api/registrations est appelé avec uniquement des inscriptions waitlist
- **THEN** la réponse n'inclut pas `redirectUrl`
- **AND** la réponse n'inclut pas `paymentId`

### Requirement: Table Selection Visual Feedback
The system MUST provide clear visual feedback when a table is selected, with a prominent indicator in the top-right corner.

#### Scenario: Selection Indicator Position
- **WHEN** un utilisateur sélectionne un tableau éligible
- **THEN** une icône de validation (check) apparaît en position proéminente dans le coin supérieur droit de la card

#### Scenario: Selection Indicator Visibility
- **WHEN** un tableau est sélectionné
- **THEN** l'indicateur de sélection est visuellement distinct et immédiatement perceptible (fond coloré, taille suffisante)

#### Scenario: Deselection Indicator
- **WHEN** un utilisateur désélectionne un tableau
- **THEN** l'icône de validation disparaît immédiatement

