## ADDED Requirements

### Requirement: Période d'inscription
Le système MUST permettre de configurer une période d'inscription optionnelle avec une date de début et/ou une date de fin.

#### Scenario: Configuration de la date d'ouverture
- **WHEN** un admin configure une date d'ouverture des inscriptions (`registrationStartDate`)
- **THEN** cette date est stockée dans l'objet `options` du tournoi

#### Scenario: Configuration de la date de fermeture
- **WHEN** un admin configure une date de fermeture des inscriptions (`registrationEndDate`)
- **THEN** cette date est stockée dans l'objet `options` du tournoi

#### Scenario: Dates optionnelles
- **WHEN** aucune date de période n'est configurée
- **THEN** les inscriptions sont considérées comme ouvertes (comportement par défaut)

#### Scenario: Validation des dates
- **WHEN** un admin configure une date de fin antérieure à la date de début
- **THEN** une erreur de validation `INVALID_REGISTRATION_PERIOD` est retournée

## MODIFIED Requirements

### Requirement: Tournament Options Structure
Le système MUST stocker les paramètres configurables du tournoi dans un objet options extensible.

#### Scenario: Options Storage
- **WHEN** un admin met à jour la configuration du tournoi
- **THEN** `refundDeadline`, `waitlistTimerHours`, `registrationStartDate` et `registrationEndDate` sont stockés dans la colonne JSONB `options`

#### Scenario: Options Retrieval
- **WHEN** la configuration du tournoi est récupérée via GET /admin/tournament
- **THEN** l'objet options est retourné avec tous les paramètres configurés, incluant les dates de période d'inscription

#### Scenario: Options Validation
- **WHEN** un admin soumet des options invalides (ex: timer négatif, dates de période incohérentes)
- **THEN** une erreur de validation est retournée

## ADDED Requirements

### Requirement: État de la période d'inscription
Le système MUST calculer et retourner l'état courant de la période d'inscription.

#### Scenario: État - Avant ouverture
- **WHEN** la date courante est antérieure à `registrationStartDate`
- **THEN** le statut retourné est `not_started` avec la date d'ouverture

#### Scenario: État - Inscriptions ouvertes
- **WHEN** la date courante est entre `registrationStartDate` et `registrationEndDate` (ou dates non définies)
- **THEN** le statut retourné est `open` avec la date de fermeture si définie

#### Scenario: État - Inscriptions terminées
- **WHEN** la date courante est postérieure à `registrationEndDate`
- **THEN** le statut retourné est `closed` avec la date de fermeture

#### Scenario: Période non configurée
- **WHEN** aucune date de période n'est configurée
- **THEN** le statut retourné est `open` sans date
