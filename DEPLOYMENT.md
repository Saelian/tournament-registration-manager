# Guide de Déploiement - Dokploy

Ce guide explique comment déployer Tournament Registration Manager sur un VPS avec Dokploy.

## Prérequis

- VPS avec Dokploy installé
- Accès SSH au serveur
- Nom de domaine configuré (2 sous-domaines recommandés)
- Repo Git accessible (GitHub, GitLab, etc.)

## Architecture

```
app.votredomaine.com  → Frontend (React + Nginx)
api.votredomaine.com  → Backend (AdonisJS)
```

## Étape 1 : Configuration DNS

Créez deux enregistrements A pointant vers l'IP de votre VPS :

```
app.votredomaine.com  →  A  →  IP_VPS
api.votredomaine.com  →  A  →  IP_VPS
```

## Étape 2 : Créer le service PostgreSQL dans Dokploy

1. Dans Dokploy, allez dans **Services** → **Create Service** → **Database**
2. Sélectionnez **PostgreSQL**
3. Configurez :
   - **Name** : `trm-postgres`
   - **Database** : `tournament_registration`
   - **Username** : votre choix
   - **Password** : générez un mot de passe sécurisé
4. Notez les informations de connexion (host interne, user, password)

## Étape 3 : Générer la clé APP_KEY

Sur votre machine locale, dans le dossier `api/` :

```bash
node ace generate:key
```

Copiez la clé générée (format : `base64:xxxxxxx...`).

> ⚠️ **Important** : Cette clé est générée une seule fois et ne doit jamais changer après le déploiement initial.

## Étape 4 : Créer le service Docker Compose

1. Dans Dokploy, allez dans **Projects** → **Create Project**
2. Nommez votre projet (ex: `tournament-registration`)
3. Dans le projet, créez un nouveau service **Docker Compose**
4. Configurez le repository Git :
   - **Repository URL** : URL de votre repo
   - **Branch** : `main` (ou votre branche de production)
   - **Compose Path** : `compose.prod.yml`

## Étape 5 : Configurer les variables d'environnement

Dans l'onglet **Environment** du service, ajoutez toutes les variables :

```env
# Application
NODE_ENV=production
APP_KEY=<clé générée à l'étape 3>

# Base de données (utiliser le nom du service Dokploy)
DB_HOST=trm-postgres
DB_PORT=5432
DB_USER=<user configuré>
DB_PASSWORD=<password configuré>
DB_DATABASE=tournament_registration

# URLs (adapter avec vos domaines)
VITE_API_URL=https://api.votredomaine.com
FRONTEND_URL=https://app.votredomaine.com

# Cookies (obligatoire pour HTTPS cross-origin)
COOKIE_SECURE=true
COOKIE_SAME_SITE=none

# SMTP (votre serveur mail)
SMTP_HOST=smtp.votreserveur.com
SMTP_PORT=465
SMTP_TLS=true
SMTP_USERNAME=...
SMTP_PASSWORD=...

# HelloAsso
HELLOASSO_CLIENT_ID=...
HELLOASSO_CLIENT_SECRET=...
HELLOASSO_ORGANIZATION_SLUG=...
HELLOASSO_SANDBOX=false

# FFTT
FFTT_APP_ID=...
FFTT_PASSWORD=...
FFTT_MOCK=false

# Admin initial
ADMIN_EMAIL=admin@votredomaine.com
ADMIN_PASSWORD=<mot de passe sécurisé>
ADMIN_NAME=Admin

# Paiements
PAYMENT_EXPIRATION_MINUTES=30
PAYMENT_CLEANUP_INTERVAL_MINUTES=5
```

## Étape 6 : Configurer les domaines

Pour chaque service, configurez le domaine dans l'onglet **Domains** :

### Service API

- **Domain** : `api.votredomaine.com`
- **Port** : `3333`
- **HTTPS** : Activé (Let's Encrypt automatique)

### Service Web

- **Domain** : `app.votredomaine.com`
- **Port** : `80`
- **HTTPS** : Activé

## Étape 7 : Déployer

1. Cliquez sur **Deploy**
2. Suivez les logs de build
3. Les migrations s'exécutent automatiquement au démarrage

## Étape 8 : Créer le premier administrateur

Une fois l'application déployée, connectez-vous via le terminal Dokploy :

```bash
# Accédez au terminal du container API
node build/bin/console.js make:admin
```

Ou utilisez les credentials définis dans `ADMIN_EMAIL`/`ADMIN_PASSWORD` si le seed initial a été exécuté.

## Redéploiement automatique

### Configuration du Webhook

1. Dans Dokploy, copiez l'URL du webhook (visible dans les paramètres du service)
2. Dans votre repo Git :

**GitHub** : Settings → Webhooks → Add webhook

- Payload URL : URL copiée
- Content type : `application/json`
- Events : Just the push event

**GitLab** : Settings → Webhooks

- URL : URL copiée
- Trigger : Push events

### Problèmes courants

| Problème                     | Solution                                                         |
| ---------------------------- | ---------------------------------------------------------------- |
| Erreur de connexion DB       | Vérifiez que le nom du service PostgreSQL correspond à `DB_HOST` |
| Cookies ne fonctionnent pas  | Vérifiez `COOKIE_SECURE=true` et `COOKIE_SAME_SITE=none`         |
| Frontend ne trouve pas l'API | Vérifiez `VITE_API_URL` et le domaine configuré                  |
| Migrations échouent          | Consultez les logs et vérifiez la connexion DB                   |
