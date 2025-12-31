## MODIFIED Requirements

### Requirement: Registration List
Le système MUST afficher les inscriptions de l'utilisateur connecté, regroupées par paiement.

#### Scenario: Affichage groupé par paiement
- **WHEN** un utilisateur connecté accède à son dashboard
- **THEN** les inscriptions sont regroupées par Payment
- **AND** chaque groupe affiche le montant total, la date du paiement et le statut
- **AND** les inscriptions individuelles sont listées dans chaque groupe

#### Scenario: Inscriptions pending_payment sans paiement
- **WHEN** des inscriptions sont en `pending_payment` sans Payment associé
- **THEN** elles sont affichées dans un groupe spécial "En attente de paiement"
- **AND** un bouton "Payer" est disponible pour l'ensemble

#### Scenario: Tri des groupes
- **WHEN** l'utilisateur visualise ses inscriptions
- **THEN** les groupes sont triés par date de paiement décroissante (plus récent en premier)
- **AND** les inscriptions dans un groupe sont triées par date de tableau

#### Scenario: Recherche d'inscription
- **WHEN** un utilisateur tape dans la barre de recherche
- **THEN** les inscriptions sont filtrées en temps réel selon le nom du tableau ou du joueur
- **AND** seuls les groupes contenant des résultats sont affichés

#### Scenario: Filtres de statut
- **WHEN** un utilisateur filtre par statut (payé, annulé, etc.)
- **THEN** seules les inscriptions correspondantes sont affichées
- **AND** les groupes vides sont masqués

#### Scenario: User without registration
- **WHEN** a user without registration accesses their dashboard
- **THEN** a "No registration" message and a link to registrations are displayed

### Requirement: Registration Status Display
Each registration MUST display its status visually within its payment group.

#### Scenario: Validated Status (Paid)
- **WHEN** a registration is paid
- **THEN** a green "Validated" badge is displayed

#### Scenario: Pending Payment Status
- **WHEN** a registration is not yet paid
- **THEN** an orange "Pending Payment" badge is displayed

#### Scenario: Waitlist Status
- **WHEN** a registration is on the waitlist
- **THEN** a blue "Waitlist" badge with the rank is displayed

#### Scenario: Cancelled Status
- **WHEN** a registration has been cancelled
- **THEN** a grey "Cancelled" badge is displayed

#### Scenario: Refunded Status
- **WHEN** le paiement associé a été remboursé
- **THEN** un badge violet "Remboursé" est affiché sur le groupe

## ADDED Requirements

### Requirement: Payment Group Display
Le système MUST afficher un bloc visuel par paiement avec les informations clés.

#### Scenario: Informations du groupe
- **WHEN** un groupe de paiement est affiché
- **THEN** il contient : date du paiement, montant total, statut du paiement
- **AND** la liste des inscriptions liées avec leurs détails (tableau, joueur, date/heure)

#### Scenario: Actions sur un groupe payé
- **WHEN** un groupe a le statut `succeeded`
- **THEN** un bouton "Demander un remboursement total" est disponible

#### Scenario: Actions sur un groupe remboursé
- **WHEN** un groupe a le statut `refunded`
- **THEN** aucune action n'est disponible
- **AND** un message "Remboursé le XX/XX/XXXX" est affiché

### Requirement: Unregistration Choice Modal
Le système MUST afficher un modal explicite lors d'une demande de désinscription.

#### Scenario: Désinscription d'un tableau payé
- **WHEN** l'utilisateur clique sur "Se désinscrire" d'un tableau payé
- **THEN** un modal s'affiche avec deux options clairement expliquées :
  - Option 1 : "Remboursement total" - texte explicatif des conséquences
  - Option 2 : "Désinscription seule" - texte explicatif des conséquences

#### Scenario: Explication option remboursement
- **WHEN** le modal de choix s'affiche
- **THEN** l'option "Remboursement total" indique :
  - "Toutes vos inscriptions de ce paiement seront annulées"
  - Liste des tableaux qui seront annulés
  - "Vous serez remboursé de XX,XX €"
  - "Vous devrez vous réinscrire aux tableaux que vous souhaitez garder"

#### Scenario: Explication option désinscription seule
- **WHEN** le modal de choix s'affiche
- **THEN** l'option "Désinscription seule" indique :
  - "Seul ce tableau sera annulé"
  - "Vous ne serez PAS remboursé"
  - "Votre place sera libérée pour un autre joueur"

#### Scenario: Confirmation de l'action
- **WHEN** l'utilisateur choisit une option
- **THEN** un bouton de confirmation spécifique à l'option est affiché
- **AND** l'action n'est exécutée qu'après confirmation

### Requirement: Refund Request Modal
Le système MUST afficher un modal de confirmation pour les demandes de remboursement.

#### Scenario: Demande de remboursement depuis le groupe
- **WHEN** l'utilisateur clique sur "Demander un remboursement total" sur un groupe
- **THEN** un modal récapitulatif s'affiche avec :
  - La liste de tous les tableaux qui seront annulés
  - Le montant qui sera remboursé
  - Un avertissement que l'action est irréversible

#### Scenario: Confirmation du remboursement
- **WHEN** l'utilisateur confirme le remboursement
- **THEN** l'API est appelée
- **AND** un loader est affiché pendant le traitement
- **AND** un message de succès confirme le remboursement

#### Scenario: Erreur de remboursement
- **WHEN** le remboursement échoue
- **THEN** un message d'erreur explicite est affiché
- **AND** l'utilisateur est invité à contacter l'organisateur si le problème persiste
