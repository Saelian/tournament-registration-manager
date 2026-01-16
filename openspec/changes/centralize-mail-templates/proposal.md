# Change: Centraliser les templates de mails

## Why

Actuellement, les contenus HTML des emails sont écrits en dur dans 3 fichiers différents :
- `api/app/services/otp_service.ts:43-51` (code de connexion OTP)
- `api/app/services/admin_notification_service.ts:24-37` (notification de remboursement aux admins)
- `api/app/controllers/admin_registrations_controller.ts:268-280` (notification place libérée)

Cette dispersion rend difficile :
1. La maintenance : pour modifier un template, il faut chercher dans tout le code
2. L'évolution future vers une IHM d'administration pour personnaliser les templates
3. La cohérence visuelle entre les différents emails

## What Changes

- Création d'un dossier centralisé `api/resources/views/emails/` contenant tous les templates Edge
- Chaque type d'email aura son propre fichier `.edge`
- Un service `MailService` unifié pour l'envoi des emails
- Refactoring des services existants pour utiliser le nouveau système

**Structure proposée :**
```
api/resources/views/emails/
├── otp_login.edge              # Code de connexion
├── admin_refund_request.edge   # Notification remboursement (admins)
└── waitlist_promoted.edge      # Place libérée (utilisateur)

api/app/services/
└── mail_service.ts             # Service centralisé d'envoi
```

## Impact

- Affected specs: Nouvelle capability `mail-templates`
- Affected code:
  - `api/app/services/otp_service.ts`
  - `api/app/services/admin_notification_service.ts`
  - `api/app/controllers/admin_registrations_controller.ts`
- Pas de changement de comportement visible pour les utilisateurs
- Facilite l'ajout futur d'une IHM d'administration pour les templates (fichiers `.edge` faciles à stocker en DB)
