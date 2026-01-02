# tournament-config Specification

## Purpose
TBD - created by archiving change add-tournament-config. Update Purpose after archive.
## Requirements
### Requirement: Tournament Configuration
The system MUST allow configuring global tournament parameters.

#### Scenario: Configuration Retrieval
- **WHEN** an admin calls GET /admin/tournament
- **THEN** the current tournament configuration is returned

#### Scenario: Configuration Update
- **WHEN** an admin submits a valid update via PUT /admin/tournament
- **THEN** the configuration is updated and the new version is returned

### Requirement: Tournament Dates
The tournament MUST have a start date and an end date.

#### Scenario: Valid Dates
- **WHEN** an admin configures the tournament dates
- **THEN** the end date must be greater than or equal to the start date

#### Scenario: Invalid Dates
- **WHEN** an admin configures an end date prior to the start date
- **THEN** a validation error with code `INVALID_DATES` is returned

### Requirement: Refund Deadline
The system MUST allow configuring a refund deadline stored within tournament options.

#### Scenario: Deadline Configuration
- **WHEN** an admin configures the refund deadline in tournament options
- **THEN** this date is recorded in the options object and used for refund calculations

#### Scenario: Deadline Passed
- **WHEN** the current date is after the deadline stored in options
- **THEN** unregistration requests do not trigger a refund

### Requirement: Waitlist Timer Configuration
The system MUST allow configuring the waitlist timer duration stored within tournament options.

#### Scenario: Timer Configuration
- **WHEN** an admin configures the timer to X hours in tournament options
- **THEN** this duration is stored in the options object and used for released place notifications

#### Scenario: Default Value
- **WHEN** no timer is configured in options
- **THEN** a default value of 4 hours is applied

### Requirement: Tournament Options Structure
Le système MUST stocker les paramètres configurables du tournoi dans un objet options extensible.

#### Scenario: Options avec FAQ (ADDED)
- **WHEN** un admin configure des questions FAQ
- **THEN** les `faqItems` sont stockés dans la colonne JSONB `options`

#### Scenario: Validation des FAQ items (ADDED)
- **WHEN** un admin soumet des items FAQ invalides (question vide, réponse trop courte)
- **THEN** une erreur de validation est retournée

---

### Requirement: Tournament Short Description
The system MUST allow configuring a short description for the tournament.

#### Scenario: Short Description Input
- **WHEN** an admin enters a short description (max 500 characters)
- **THEN** the description is saved and returned in tournament data

#### Scenario: Short Description Display
- **WHEN** a participant views tournament information
- **THEN** the short description is displayed as plain text summary

### Requirement: Tournament Long Description
The system MUST allow configuring a detailed markdown description for the tournament.

#### Scenario: Long Description Input
- **WHEN** an admin enters a long description in markdown format
- **THEN** the markdown content is saved as-is

#### Scenario: Long Description Rendering
- **WHEN** a participant views the tournament details page
- **THEN** the long description is rendered as formatted HTML from markdown

### Requirement: Tournament Rules
The system MUST allow configuring tournament rules via link and/or inline content.

#### Scenario: Rules Link Configuration
- **WHEN** an admin provides an external URL for the rules document
- **THEN** the URL is validated and stored

#### Scenario: Rules Content Configuration
- **WHEN** an admin enters rules content in markdown format
- **THEN** the markdown content is saved (TEXT field, no size limit for multi-page rules)

#### Scenario: Rules Display
- **WHEN** a participant views the tournament rules
- **THEN** both the external link (if provided) and inline content (rendered markdown) are displayed

### Requirement: FFTT Homologation Link
The system MUST allow configuring a link to the FFTT tournament homologation page.

#### Scenario: Homologation Link Configuration
- **WHEN** an admin provides the FFTT homologation URL
- **THEN** the URL is validated and stored

#### Scenario: Homologation Link Display
- **WHEN** a participant views tournament information
- **THEN** the FFTT homologation link is displayed as a clickable link

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

### Requirement: Configuration FAQ du tournoi
Le système MUST permettre de configurer des questions/réponses FAQ pour le tournoi.

#### Scenario: Structure d'un item FAQ
- **WHEN** un item FAQ est créé
- **THEN** il contient : un identifiant unique (UUID), une question (5-500 caractères), une réponse (10-2000 caractères), un ordre d'affichage

#### Scenario: FAQ dans la réponse API publique
- **WHEN** les données du tournoi sont récupérées via `GET /api/tournaments`
- **THEN** les `faqItems` sont inclus dans la réponse, triés par ordre

#### Scenario: FAQ par défaut
- **WHEN** un tournoi est créé sans faqItems
- **THEN** le champ `faqItems` est un tableau vide `[]`

#### Scenario: Mise à jour des FAQ
- **WHEN** un admin met à jour le tournoi via `PUT /admin/tournament`
- **THEN** les `faqItems` sont mis à jour (ajout, modification, suppression, réordonnancement possible)

