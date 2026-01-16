# Tasks: Centralisation des templates de mails

## 1. Configuration Edge

- [x] 1.1 Vérifier/configurer Edge dans AdonisJS (`edge.js` ajouté comme dépendance directe)
- [x] 1.2 Créer le dossier `api/resources/views/emails/`

## 2. Création des templates Edge

- [x] 2.1 Créer `otp_login.edge` avec le contenu HTML du code de connexion
- [x] 2.2 Créer `admin_refund_request.edge` avec le contenu HTML de notification remboursement
- [x] 2.3 Créer `waitlist_promoted.edge` avec le contenu HTML de place libérée

## 3. Service centralisé

- [x] 3.1 Créer `api/app/services/mail_service.ts` avec les méthodes typées pour chaque email

## 4. Refactoring des services existants

- [x] 4.1 Modifier `OtpService` pour utiliser `MailService.sendOtpLogin()`
- [x] 4.2 Modifier `AdminNotificationService` pour utiliser `MailService.sendRefundRequest()`
- [x] 4.3 Modifier `AdminRegistrationsController.promote()` pour utiliser `MailService.sendWaitlistPromoted()`

## 5. Validation

- [x] 5.1 Exécuter les tests existants (`node ace test`) pour valider le comportement (222 tests passés)
- [x] 5.2 Vérifier le typecheck (`pnpm typecheck`)

## 6. Tests unitaires MailService

- [x] 6.1 Créer `tests/unit/mail_service.spec.ts` avec 7 tests :
  - `sendOtpLogin` : vérifie destinataire, sujet et contenu HTML (code OTP, validité 10 min)
  - `sendRefundRequest` : vérifie destinataire, sujet et contenu HTML (infos remboursement)
  - `sendWaitlistPromoted` : vérifie destinataire, sujet, contenu HTML et avertissement deadline
