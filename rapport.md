# Rapport d'Analyse du Projet Tournament Registration Manager

**Date :** Dimanche 11 janvier 2026

Ce document présente une analyse critique de l'architecture, de la qualité du code et des pratiques de développement du projet `tournament-registration-manager`.

## 1. Architecture Générale (Monorepo)

**Points Forts :**

- **Structure Claire :** La séparation entre `api` (Backend), `web` (Frontend), et `packages` (Librairies partagées) est propre et respecte les standards des monorepos modernes.
- **Outillage :** La configuration `pnpm` avec les workspaces est correcte et permet une gestion efficace des dépendances.
- **Isolation du Client Externe :** Le client FFTT (`packages/fftt-client`) est correctement isolé. C'est une excellente pratique favorisant la réutilisabilité et la testabilité indépendante.

**Critique & Améliorations Potentielles :**

- **Duplication des Types (Manque de Shared DTOs) :** C'est le point faible structurel principal. Les types (ex: `Player`, `Registration`) sont définis indépendamment côté Frontend (`web/src/features/.../types.ts`) et Backend (`api/app/models/...`).
  - _Risque :_ Divergence silencieuse entre l'API et le client, causant des bugs au runtime.
  - _Recommandation :_ Créer un package `packages/shared-types` contenant les interfaces TypeScript partagées.

## 2. Backend (AdonisJS v6)

**Points Forts :**

- **Pattern MVC :** Adhésion correcte aux conventions du framework AdonisJS.
- **Service Layer :** L'extraction de la logique métier (ex: `RegistrationRulesService`) est présente, évitant les "Fat Controllers".
- **Validation :** Utilisation standardisée de VineJS (`app/validators/`).
- **Standardisation des Réponses :** L'utilisation de helpers (`#helpers/api_response`) pour structurer les réponses JSON (`status`, `data`) facilite grandement l'intégration frontend.

**Critique & Refactoring :**

- **Complexité de certains Contrôleurs :** `RegistrationsController.store` semble accumuler trop de responsabilités : gestion des transactions SGBD, appels API externes (HelloAsso), formatage de réponse.
  - _Refactoring suggéré :_ Déplacer l'orchestration complète vers un `RegistrationService` dédié ou un pattern "Action".
- **Gestion des Erreurs :** S'assurer que les exceptions métier (ex: Tournoi complet) remontent des codes d'erreurs précis et non des 500 génériques.

## 3. Frontend (React + Vite)

**Points Forts :**

- **Architecture "Feature-based" :** Le découpage par domaine fonctionnel (`src/features/`) est supérieur à un découpage technique classique. Il améliore la maintenabilité et la navigation dans le code.
- **State Management :** L'utilisation de `TanStack Query` pour l'état serveur est optimale.
- **Stack UI :** TailwindCSS et Shadcn UI offrent une base solide et moderne.

**Critique & Améliorations Potentielles :**

- **Typage Local :** La redéfinition locale des types dans chaque feature peut mener à des incohérences internes.
- **Validation des Données API :** Il manque une validation "runtime" (avec Zod par exemple) des données reçues de l'API. Se fier uniquement aux interfaces TypeScript ne protège pas contre des changements inattendus de l'API.

## 4. Documentation & Process (`openspec`)

**Points Forts :**

- **Specs as Code :** La présence du dossier `openspec/` est excellente. Traiter la documentation et les spécifications comme du code source garantit qu'elles restent pertinentes et suivies.
- **Context Files :** `CLAUDE.md` et `GEMINI.md` fournissent un contexte essentiel pour l'onboarding (humain ou IA).

## 5. Synthèse des Actions Prioritaires

1.  **Créer un package `shared`** : Centraliser les types TypeScript communs pour garantir la cohérence API/Web.
2.  **Refactoring Backend** : Alléger les contrôleurs critiques en déléguant l'orchestration aux Services.
3.  **Sécurité des Types Frontend** : Implémenter une validation Zod pour les réponses API critiques.
