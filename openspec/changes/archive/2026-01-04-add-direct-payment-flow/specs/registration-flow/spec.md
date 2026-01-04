# registration-flow Specification Delta

## ADDED Requirements

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
