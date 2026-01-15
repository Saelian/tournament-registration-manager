# TODO - Analyse et Plan d'Action

> Rapport d'analyse complète du projet Tournament Registration Manager
> Date : 11 janvier 2026

---

## Résumé Exécutif

Le projet est une application de gestion des inscriptions pour tournois de tennis de table, construite avec une architecture monorepo moderne (AdonisJS v6 + React 19 + TailwindCSS v4). L'architecture générale est **solide** avec une bonne séparation des responsabilités, mais présente **plusieurs vulnérabilités critiques** et **incohérences** qui doivent être corrigées avant une mise en production.

| Aspect                 | Score | Commentaire                                    |
| ---------------------- | ----- | ---------------------------------------------- |
| Architecture Backend   | 4/5   | Bonne structure AdonisJS, services bien isolés |
| Architecture Frontend  | 4/5   | Feature-based, TanStack Query bien utilisé     |
| Sécurité               | 2/5   | Plusieurs vulnérabilités critiques             |
| Tests                  | 3/5   | API bien testée, frontend très insuffisant     |
| Cohérence API/Frontend | 3/5   | Duplication de types, formats incohérents      |
| Maintenabilité         | 3/5   | Quelques duplications à refactoriser           |

---

## Phase 1 : Sécurité (CRITIQUE - Avant Production)

### SEC-01 : Rate limiting sur OTP

- [ ] Créer middleware `rate_limit_middleware.ts`
- [ ] Appliquer sur `/auth/request-otp` (max 3/email/heure)
- [ ] Fichier : `api/app/middleware/rate_limit_middleware.ts`
- [ ] Fichier : `api/start/routes.ts`

### SEC-02 : Rate limiting sur login admin

- [ ] Appliquer rate limiting sur `/admin/auth/login` (max 5/IP/minute)
- [ ] Fichier : `api/start/routes.ts`

### SEC-03 : Vérification signature webhook HelloAsso

- [ ] Implémenter vérification de signature dans le controller
- [ ] Consulter doc HelloAsso API V5 pour le format de signature
- [ ] Fichier : `api/app/controllers/webhooks_controller.ts`

### SEC-04 : Corriger race condition token HelloAsso

- [ ] Implémenter Promise caching pour éviter appels concurrents
- [ ] Fichier : `api/app/services/hello_asso_service.ts` (lignes 72-100)

```typescript
// Solution proposée
private authPromise: Promise<string> | null = null

async authenticate(): Promise<string> {
  if (this.accessToken && this.tokenExpiresAt && this.tokenExpiresAt > new Date()) {
    return this.accessToken
  }
  if (!this.authPromise) {
    this.authPromise = this.doAuthenticate().finally(() => {
      this.authPromise = null
    })
  }
  return this.authPromise
}
```

### SEC-05 : Corriger configuration cookies

- [ ] Changer `COOKIE_SAME_SITE=none` → `COOKIE_SAME_SITE=lax`
- [ ] Fichier : `.env`

### SEC-06 : Ajouter headers de sécurité

- [ ] Créer middleware pour headers HTTP sécurisés
- [ ] Headers : `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Strict-Transport-Security`
- [ ] Fichier : `api/app/middleware/security_headers_middleware.ts`

---

## Phase 2 : Standardisation API

### API-01 : Standardiser les réponses HTTP

- [ ] Remplacer `response.badRequest()` par `error()` helper partout
- [ ] Remplacer `response.notFound()` par `notFound()` helper partout
- [ ] Fichiers concernés :
    - [ ] `api/app/controllers/registrations_controller.ts`
    - [ ] `api/app/controllers/auth_controller.ts`
    - [ ] `api/app/controllers/admin_registrations_controller.ts`
    - [ ] `api/app/controllers/payments_controller.ts`

### API-02 : Refactoriser duplication controllers

- [ ] Extraire méthode commune `formatRegistrations()` dans `admin_registrations_controller.ts`
- [ ] Lignes 68-141 et 148-231 sont quasi-identiques
- [ ] Fichier : `api/app/controllers/admin_registrations_controller.ts`

### API-03 : Créer validators VineJS manquants

- [ ] Validator pour `createRegistration` (playerId, tableIds)
- [ ] Validator pour `tableIds` avec validation positive numbers
- [ ] Fichier : `api/app/validators/registration.ts`

```typescript
// Exemple de validator à créer
export const createRegistrationValidator = vine.compile(
    vine.object({
        playerId: vine.number().positive(),
        tableIds: vine.array(vine.number().positive()).minLength(1).maxLength(20),
        initiatePayment: vine.boolean().optional(),
    })
)
```

### API-04 : Classes d'erreur custom

- [ ] Créer classe `BusinessError` avec code et message
- [ ] Utiliser dans les services pour erreurs métier
- [ ] Fichier : `api/app/exceptions/business_error.ts`

---

## Phase 3 : Tests Frontend (CRITIQUE)

### TEST-01 : Configurer Vitest

- [ ] Créer `vitest.config.ts` avec jsdom environment
- [ ] Ajouter setup files pour tests
- [ ] Fichier : `web/vitest.config.ts`

```typescript
// Configuration recommandée
import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        environment: 'jsdom',
        setupFiles: ['./src/test/setup.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
        },
    },
})
```

### TEST-02 : Tests contextes Auth

- [ ] Tests pour `AuthContext.tsx`
- [ ] Tests pour `UserAuthContext.tsx`
- [ ] Fichiers : `web/src/features/auth/__tests__/`

### TEST-03 : Tests hooks principaux

- [ ] Tests pour `useMyRegistrations`
- [ ] Tests pour `useCreateRegistrations`
- [ ] Tests pour `useTableFilters`
- [ ] Fichiers : `web/src/features/*/__tests__/`

### TEST-04 : Tests composants formulaires

- [ ] Tests pour `PlayerSearch.tsx`
- [ ] Tests pour `AdminRegistrationForm.tsx`
- [ ] Tests pour `TableForm.tsx`

### TEST-05 : Tests intégration API avec MSW

- [ ] Configurer MSW pour mock API
- [ ] Tests de flux complets (inscription, paiement)

---

## Phase 4 : Refactoring Frontend

### FRONT-01 : Fusionner contextes Auth

- [ ] Créer un seul `AuthContext` paramétrable
- [ ] Supprimer la duplication (~43 lignes identiques)
- [ ] Fichiers :
    - [ ] `web/src/features/auth/AuthContext.tsx`
    - [ ] `web/src/features/auth/UserAuthContext.tsx`

### FRONT-02 : Centraliser query keys

- [ ] Créer fichier `query-keys.ts` centralisé
- [ ] Remplacer strings magiques partout
- [ ] Fichier : `web/src/lib/query-keys.ts`

```typescript
// Structure recommandée
export const queryKeys = {
    auth: {
        all: ['auth'] as const,
        admin: () => [...queryKeys.auth.all, 'admin'] as const,
        user: () => [...queryKeys.auth.all, 'user'] as const,
        me: () => [...queryKeys.auth.user(), 'me'] as const,
        players: () => [...queryKeys.auth.me(), 'players'] as const,
    },
    tables: {
        all: ['tables'] as const,
        list: () => [...queryKeys.tables.all, 'list'] as const,
        eligible: (playerId: number) => [...queryKeys.tables.all, 'eligible', playerId] as const,
    },
    // ... autres domaines
}
```

### FRONT-03 : Validation Zod des réponses API

- [ ] Créer schémas Zod pour toutes les réponses API
- [ ] Valider dans l'interceptor axios
- [ ] Fichier : `web/src/lib/api-schemas.ts`

### FRONT-04 : Refactoriser composants complexes

- [ ] Extraire `ManualEntryForm` de `PlayerSearch.tsx`
- [ ] Découper `AdminRegistrationForm` en sous-composants par étape
- [ ] Réduire le nombre d'états locaux

---

## Phase 5 : Cohérence API/Frontend

### ARCH-01 : Package types partagés

- [ ] Créer `packages/shared-types`
- [ ] Déplacer interfaces communes (Player, Registration, Table, etc.)
- [ ] Configurer imports dans api et web

### ARCH-02 : Synchroniser validations

- [ ] Aligner VineJS (backend) et Zod (frontend)
- [ ] Même format pour les dates (ISO strings)
- [ ] Mêmes valeurs par défaut

### ARCH-03 : Documentation API

- [ ] Générer spec OpenAPI depuis les routes
- [ ] Ou créer documentation manuelle des endpoints

---

## Phase 6 : Améliorations Base de Données

### DB-01 : Contraintes manquantes

- [ ] Ajouter `UNIQUE` sur `users.email`
- [ ] Ajouter `UNIQUE` sur `players.licence`
- [ ] Ajouter `CHECK` sur `tables.points_min < tables.points_max`
- [ ] Fichier : Nouvelle migration

### DB-02 : Optimiser stockage JSON

- [ ] Convertir `allowedCategories` JSON → PostgreSQL array
- [ ] Fichier : `api/app/models/table.ts`, nouvelle migration

---

## Phase 7 : Qualité de Code

### CLEAN-01 : Nettoyer console.log

- [ ] Supprimer 5 `console.log` dans API
- [ ] Supprimer 8 `console.log` dans web
- [ ] Remplacer par logger approprié si nécessaire

### CLEAN-02 : Configurer coverage

- [ ] Ajouter coverage pour Vitest (frontend)
- [ ] Ajouter coverage pour Japa (backend)
- [ ] Objectif : 50%+ frontend, maintenir 70%+ backend

### CLEAN-03 : Git hooks

- [ ] Installer husky
- [ ] Configurer lint-staged
- [ ] Pre-commit : lint + typecheck
- [ ] Fichiers : `.husky/`, `package.json`

### PERF-01 : Optimiser N+1 queries waitlist

- [ ] Remplacer boucle `save()` par batch update
- [ ] Fichier : `api/app/services/waitlist_service.ts` (lignes 9-23)

```typescript
// Solution proposée
const updates = waitlistRegistrations.map((reg, i) => ({
    id: reg.id,
    waitlistRank: i + 1,
}))

await db.rawQuery(
    `
  UPDATE registrations
  SET waitlist_rank = data.rank
  FROM (VALUES ${updates.map((u, i) => `($${i * 2 + 1}::int, $${i * 2 + 2}::int)`).join(',')})
  AS data(id, rank)
  WHERE registrations.id = data.id
`,
    updates.flatMap((u) => [u.id, u.waitlistRank])
)
```

---

## Fichiers Nécessitant Refactorisation

| Fichier                                                          | Raison                           | Priorité |
| ---------------------------------------------------------------- | -------------------------------- | -------- |
| `api/app/controllers/registrations_controller.ts`                | Réponses non standardisées       | Haute    |
| `api/app/controllers/admin_registrations_controller.ts`          | Duplication 150+ lignes          | Moyenne  |
| `api/app/services/hello_asso_service.ts`                         | Race condition, logging excessif | Critique |
| `api/app/services/waitlist_service.ts`                           | N+1 queries                      | Moyenne  |
| `api/app/controllers/webhooks_controller.ts`                     | Pas de vérification signature    | Critique |
| `web/src/features/auth/AuthContext.tsx`                          | Duplication avec UserAuthContext | Moyenne  |
| `web/src/features/auth/UserAuthContext.tsx`                      | À fusionner                      | Moyenne  |
| `web/src/features/registration/PlayerSearch.tsx`                 | Composant trop complexe          | Basse    |
| `web/src/features/admin/registrations/AdminRegistrationForm.tsx` | 7 états locaux                   | Basse    |
| `web/src/lib/api.ts`                                             | Validation réponses manquante    | Haute    |

---

## Estimation de Travail

| Phase                            | Durée Estimée   |
| -------------------------------- | --------------- |
| Phase 1 : Sécurité               | 2-3 jours       |
| Phase 2 : Standardisation API    | 1-2 jours       |
| Phase 3 : Tests Frontend         | 3-5 jours       |
| Phase 4 : Refactoring Frontend   | 2-3 jours       |
| Phase 5 : Cohérence API/Frontend | 2-3 jours       |
| Phase 6 : Base de Données        | 1 jour          |
| Phase 7 : Qualité de Code        | 1-2 jours       |
| **Total**                        | **12-19 jours** |

---

## Checklist Avant Production

- [ ] Toutes les tâches SEC-\* complétées
- [ ] Couverture tests frontend > 50%
- [ ] Aucun `console.log` en production
- [ ] Réponses API 100% standardisées
- [ ] Webhooks HelloAsso sécurisés
- [ ] Rate limiting actif
- [ ] Headers de sécurité configurés
- [ ] Contraintes DB en place
