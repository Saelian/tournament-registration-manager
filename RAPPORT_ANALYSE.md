# Rapport d'Analyse du Projet Tournament Registration Manager

## 1. Vue d'ensemble

Le projet est un monorepo bien structuré utilisant des technologies modernes et robustes (AdonisJS v6 pour le backend, React + Vite pour le frontend). L'architecture générale est saine et suit les standards de l'industrie. Le code est typé (TypeScript) et des tests fonctionnels sont présents, ce qui est un excellent point de départ.

Cependant, plusieurs points d'amélioration ont été identifiés pour garantir la maintenabilité à long terme et la qualité du code.

## 2. Structure et Architecture

### Points Forts

- **Organisation Monorepo** : La séparation claire entre `api`, `web` et `packages` (via pnpm workspaces) est excellente.
- **Backend (AdonisJS)** : Structure standard respectée (`app/controllers`, `app/models`, `start/routes`). L'injection de dépendances et l'utilisation des Services sont visibles.
- **Frontend (React)** : Architecture orientée fonctionnalités (`features/`), ce qui est beaucoup plus scalable qu'une structure par type technique.

### Points Faibles / Incohérences

- **Gestionnaire de paquets** : Présence incohérente de fichiers `bun.lock` dans `api/` et `web/` alors que la racine utilise `pnpm-lock.yaml` et que `package.json` force `pnpm`. Cela peut entraîner des différences d'installation en CI/CD.
- **Dénomination des migrations** : Les fichiers de migration ont des noms parfois redondants (ex: `create_create_payments_table`), signe de générations automatiques non nettoyées.

## 3. Qualité du Code Backend (API)

### Points Forts

- **Typage** : Utilisation stricte de TypeScript.
- **Transactions** : Bonne gestion des transactions de base de données (ex: `db.transaction` dans `RegistrationsController`), essentielle pour l'intégrité des données financières/inscriptions.
- **Services** : La logique métier complexe est déportée dans des services (`RegistrationRulesService`).

### Critiques et Améliorations

- **Validation Manuelle** : Le `RegistrationsController` effectue beaucoup de validations manuelles (`if (!playerId)...`) au lieu d'utiliser les Validateurs dédies (VineJS ou Adonis Validators). Cela alourdit le contrôleur.
- **Contrôleurs Volumineux** : La méthode `store` de `RegistrationsController` fait près de 200 lignes. Elle mélange orchestration, appels de services, et réponse HTTP.
- **Logging Inconsistant** : Mélange de `logger.info` (bon) et `console.error` (à éviter en prod) dans le même fichier ou entre contrôleurs.
- **Performance (N+1)** : Dans `RegistrationRulesService.getEligibleTables`, l'appel à `waitlistService.hasWaitlist` est fait à l'intérieur d'un `map` pour chaque table, ce qui peut générer un grand nombre de requêtes SQL si le nombre de tables est important.
- **Duplication de logique** : Les méthodes `checkDailyLimit` et `checkTimeConflicts` du service de règles partagent une logique très similaire de regroupement par jour.

## 4. Qualité du Code Frontend (Web)

### Points Forts

- **Composants Fonctionnels** : Code React moderne avec Hooks propre.
- **Design System** : Utilisation cohérente (Neo-Brutalism) via Tailwind.
- **Gestion des appels API** : `lib/api.ts` centralise la gestion des erreurs et le "unwrapping" des réponses, ce qui simplifie les composants.

### Critiques et Améliorations

- **Styles Hardcodés** : La classe d'ombre spécifique au design (`shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`) est répétée partout. Elle devrait être extraite dans la configuration `tailwind.config.ts` (ex: `shadow-neo`) pour faciliter la maintenance et les changements de design.
- **Logique Métier dupliquée** : La logique pour déterminer si une table est pleine ("effectively full") est recodée dans le frontend (`CartSummary.tsx`). Si la règle change côté backend (ex: gestion différente de la liste d'attente), le frontend risque d'être incohérent.

## 5. Tests et Qualité

### Points Forts

- **Exhaustivité** : Les tests fonctionnels couvrent les cas nominaux, les erreurs, et les règles métier complexes (fichiers `api/tests/functional`).
- **Isolation** : Utilisation correcte du nettoyage de base de données avant chaque test.

### Critiques

- **Verbosité** : Les tests sont extrêmement verbeux. Chaque test réécrit manuellement la création de User, Tournament, Table, Player, etc. (environ 20-30 lignes de setup pour 3 lignes d'assertion).
- **Manque de Factories** : L'absence de Model Factories (fonctionnalité native d'Adonis) rend l'écriture de nouveaux tests pénible et la lecture difficile.

## 6. Recommandations Prioritaires

1.  **Uniformiser l'environnement** : Supprimer les fichiers `bun.lock` et forcer l'usage de `pnpm` partout.
2.  **Refactoriser les Tests** : Introduire des **Model Factories** pour réduire le code de setup des tests de 80%.
3.  **Nettoyer les Contrôleurs** : Déplacer la validation des requêtes (`store`, `validate`) vers des validateurs VineJS dédiés.
4.  **Optimiser le Service de Règles** : Résoudre le problème de N+1 sur la vérification de liste d'attente et factoriser la logique de vérification de conflits.
5.  **Design System Frontend** : Extraire les ombres et couleurs "Neo-Brutalism" vers la config Tailwind.
