# Plan d'implémentation - Page Mon espace

## Objectif

Créer une page unifiée "Mon espace" accessible par un bouton visible dans la navigation principale, regroupant les inscriptions et le profil utilisateur sous forme d'onglets.

## Changements proposés

### Feature user-space (NOUVELLE)

#### [NEW] `src/features/user-space/index.ts`
Export de la feature

---

#### [NEW] `src/features/user-space/components/RegistrationsTabContent.tsx`
Extrait de `UserDashboardPage.tsx` - contient :
- Hooks : `useMyRegistrations`, `useMyPaymentsWithRegistrations`, `useCreatePaymentIntent`
- État local : search, filters, sort
- Rendu : sections pending payment, waitlist, payments list

---

#### [NEW] `src/features/user-space/components/ProfileTabContent.tsx`
Extrait de `ProfilePage.tsx` - contient :
- Hook : `useCurrentUser`, `useUpdateProfile`
- Formulaire `ProfileForm`
- Modification : après sauvegarde, rester sur la page (pas de navigation)

---

#### [NEW] `src/features/user-space/pages/MySpacePage.tsx`
Page principale avec :
- Composant `Tabs` de Shadcn (déjà disponible)
- Deux onglets : "Mes inscriptions" (défaut), "Mes informations"
- Gestion du paramètre URL `?tab=` via `useSearchParams`
- Wrapper d'authentification requis

---

### Modifications de routes

#### [MODIFY] `src/App.tsx` ou routes.tsx
- Ajouter route `/profile` → `MySpacePage`
- Ajouter redirections `/dashboard` → `/profile` et `/profile` → `/profile?tab=infos`

---

### Modifications de navigation

#### [MODIFY] `src/components/layout/PublicLayout.tsx`
- Desktop : Ajouter `NavItem` "Mon espace" avant l'avatar (lignes ~167-207)
- Desktop : Simplifier le dropdown avatar (lignes 171-207) → déconnexion uniquement
- Mobile : Ajouter lien "Mon espace" dans le menu burger (lignes ~130-151)
- Mobile : Simplifier les options utilisateur dans le burger

---

### Nettoyage (après validation)

#### [DELETE] `src/features/dashboard/pages/UserDashboardPage.tsx`
#### [DELETE] `src/features/profile/pages/ProfilePage.tsx`

---

## Plan de vérification

### Tests manuels (Desktop)

1. **Navigation**
   - Lancer `pnpm dev:web` depuis `/web`
   - Se connecter avec un compte utilisateur
   - Vérifier que le bouton "Mon espace" est visible dans la nav bar
   - Cliquer dessus → doit arriver sur `/profile`

2. **Onglets**
   - Sur `/profile`, vérifier que l'onglet "Mes inscriptions" est actif par défaut
   - Cliquer sur "Mes informations" → le contenu change, l'URL devient `/profile?tab=infos`
   - Rafraîchir la page → l'onglet "Mes informations" reste actif

3. **Redirections**
   - Accéder à `/dashboard` → redirection vers `/profile`
   - Accéder à `/profile` → redirection vers `/profile?tab=infos`

4. **Avatar simplifié**
   - Cliquer sur l'avatar → seul "Déconnexion" est affiché
   - Cliquer sur Déconnexion → l'utilisateur est déconnecté

### Tests manuels (Mobile)

1. **Menu burger**
   - Réduire la fenêtre < 768px ou utiliser devtools mobile
   - Ouvrir le menu burger
   - Vérifier que "Mon espace" est visible pour utilisateur connecté
   - Vérifier que les anciennes options (Mon profil, Mes inscriptions séparées) sont absentes

### Tests automatisés

Aucun test automatisé frontend existant pour ces pages. Vérification manuelle recommandée.
