## ADDED Requirements

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
