# Design: Centralisation des templates de mails

## Context

L'application envoie actuellement 3 types d'emails :
1. **OTP Login** : Code de connexion pour l'authentification passwordless
2. **Admin Refund Request** : Notification aux admins lors d'une demande de remboursement
3. **Waitlist Promoted** : Notification à l'utilisateur quand une place se libère

Chaque email est codé en dur dans son fichier source respectif avec du HTML inline.

## Goals / Non-Goals

### Goals
- Centraliser tous les templates dans `api/resources/views/emails/`
- Utiliser Edge, le moteur de templating natif d'AdonisJS
- Permettre une modification facile des templates sans toucher au code métier
- Préparer le terrain pour une future IHM d'administration (hors scope)

### Non-Goals
- Créer une IHM d'administration pour les templates
- Stocker les templates en base de données (préparation seulement)
- Ajouter de nouveaux types d'emails

## Decisions

### Decision 1: Utiliser Edge (moteur natif AdonisJS)

**Choix** : Chaque template sera un fichier `.edge` dans `api/resources/views/emails/`.

**Rationale** :
- Moteur natif d'AdonisJS, intégration native avec `@adonisjs/mail`
- Séparation claire entre logique métier et présentation
- Fichiers textuels faciles à stocker en DB pour une future IHM admin
- Syntaxe accessible pour des non-développeurs (modification du HTML)
- Pattern standard de l'industrie (comparable à Blade/Laravel, Jinja/Python)

**Alternatives considérées** :
- Fonctions TypeScript : Typage fort mais moins adapté pour une future édition via IHM
- Handlebars/Mustache : Dépendance externe non nécessaire vu qu'Edge est déjà disponible

### Decision 2: Structure dans resources/views/emails

**Choix** : Placer les templates dans `api/resources/views/emails/` (convention AdonisJS).

**Rationale** :
- Respecte les conventions AdonisJS
- Séparé du code applicatif (`app/`)
- Facile à identifier pour un développeur AdonisJS

### Decision 3: Service centralisé MailService

**Choix** : Créer un service `MailService` qui expose des méthodes typées pour chaque type d'email.

**Rationale** :
- API claire et typée pour les consommateurs
- Encapsule la logique d'envoi et le choix du template
- Point unique d'entrée pour l'envoi des emails
- Les paramètres de chaque méthode sont typés (typage conservé côté appelant)

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Perte du typage dans les templates Edge | Typage conservé dans le MailService, erreurs détectées à l'appel |
| Syntaxe Edge à apprendre | Syntaxe simple, documentation AdonisJS complète |

## Migration Plan

1. Configurer Edge dans AdonisJS (si pas déjà fait)
2. Créer le dossier `api/resources/views/emails/`
3. Créer les 3 templates `.edge` avec le contenu HTML existant
4. Créer le `MailService` avec les méthodes d'envoi typées
5. Refactorer `OtpService` pour utiliser `MailService`
6. Refactorer `AdminNotificationService` pour utiliser `MailService`
7. Refactorer `AdminRegistrationsController` pour utiliser `MailService`
8. Supprimer les imports `mail` directs des fichiers refactorés
9. Vérifier que les tests existants passent

## Open Questions

Aucune question ouverte.
