# mail-templates Specification

## Purpose
TBD - created by archiving change centralize-mail-templates. Update Purpose after archive.
## Requirements
### Requirement: Centralisation des templates de mails

The system SHALL centralize all email templates in `api/resources/views/emails/` using Edge templating engine.

#### Scenario: Structure du dossier emails
- **WHEN** un développeur consulte les templates d'emails
- **THEN** tous les templates sont disponibles dans `api/resources/views/emails/`
- **AND** chaque type d'email a son propre fichier `.edge`

### Requirement: Template OTP Login

The system SHALL provide a template `otp_login.edge` for login code emails.

#### Scenario: Génération du contenu OTP
- **WHEN** le système envoie un code OTP
- **THEN** le template Edge génère un HTML contenant le code de 6 chiffres
- **AND** le HTML indique la durée de validité (10 minutes)

### Requirement: Template Admin Refund Request

The system SHALL provide a template `admin_refund_request.edge` for refund request notifications.

#### Scenario: Génération du contenu de notification remboursement
- **WHEN** un utilisateur demande un remboursement
- **THEN** le template Edge génère un HTML contenant les informations du demandeur
- **AND** le HTML contient le montant et l'ID du paiement

### Requirement: Template Waitlist Promoted

The system SHALL provide a template `waitlist_promoted.edge` for slot availability notifications.

#### Scenario: Génération du contenu de promotion liste d'attente
- **WHEN** une inscription est promue depuis la liste d'attente
- **THEN** le template Edge génère un HTML contenant le nom du tableau
- **AND** le HTML contient le délai de paiement autorisé
- **AND** le HTML contient un lien vers le tableau de bord

### Requirement: Service Mail centralisé

The system SHALL provide a `MailService` exposing typed methods for each email type.

#### Scenario: API du MailService
- **WHEN** un service ou controller doit envoyer un email
- **THEN** il utilise une méthode spécifique du MailService (ex: `sendOtpLogin()`)
- **AND** les paramètres sont typés selon le type d'email

#### Scenario: Envoi via MailService avec template Edge
- **WHEN** une méthode du MailService est appelée
- **THEN** le template Edge correspondant est utilisé pour générer le contenu
- **AND** l'email est envoyé via le mailer AdonisJS configuré

