# Design: add-user-profile

## Overview
Ce changement introduit un système de profil utilisateur avec collecte obligatoire des informations de contact et un nouveau menu de navigation utilisateur dans le header.

## Architecture

### Data Model Changes

```
User (modified)
├── id: number (existing)
├── email: string (existing)
├── fullName: string | null (DEPRECATED - keep for backward compat)
├── firstName: string | null (NEW)
├── lastName: string | null (NEW)
├── phone: string | null (NEW)
├── createdAt: DateTime (existing)
└── updatedAt: DateTime (existing)
```

Le champ `fullName` existant est conservé pour compatibilité mais devient déprécié. Les nouveaux champs `firstName` et `lastName` le remplacent.

### API Changes

#### PATCH /auth/user/profile
Met à jour les informations de profil de l'utilisateur connecté.

**Request:**
```json
{
  "firstName": "Jean",
  "lastName": "Dupont",
  "phone": "0612345678"
}
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "email": "jean@example.com",
    "firstName": "Jean",
    "lastName": "Dupont",
    "phone": "0612345678"
  }
}
```

**Validation Rules:**
- `firstName`: string, 2-50 caractères, lettres/espaces/tirets/apostrophes uniquement
- `lastName`: string, 2-50 caractères, lettres/espaces/tirets/apostrophes uniquement
- `phone`: string, format français (10 chiffres commençant par 0)

#### GET /auth/user/me (modified)
La réponse inclut maintenant les nouveaux champs et un indicateur `isProfileComplete`.

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "email": "jean@example.com",
    "firstName": "Jean",
    "lastName": "Dupont",
    "phone": "0612345678",
    "isProfileComplete": true
  }
}
```

### Frontend Components

```
src/features/auth/
├── ProfileCompletionModal.tsx (NEW) - Modale de complétion
├── types.ts (MODIFIED) - Ajout des types profil
└── userHooks.ts (MODIFIED) - Hook useUpdateProfile

src/features/profile/
├── ProfilePage.tsx (NEW) - Page de modification du profil
├── ProfileForm.tsx (NEW) - Formulaire réutilisable
└── index.ts (NEW) - Exports

src/components/layout/
├── PublicLayout.tsx (MODIFIED) - Intégration UserMenu
└── UserMenu.tsx (NEW) - Avatar + Dropdown

src/components/ui/
├── avatar.tsx (NEW) - Composant Avatar shadcn
└── dropdown-menu.tsx (NEW) - Composant DropdownMenu shadcn
```

### User Flow

```
┌──────────────────┐
│  Login via OTP   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐    No     ┌─────────────────────┐
│ isProfileComplete?├─────────►│ ProfileCompletionModal│
└────────┬─────────┘           └──────────┬──────────┘
         │ Yes                            │
         │                                │ Submit
         ▼                                ▼
┌──────────────────┐           ┌─────────────────────┐
│   Normal Flow    │◄──────────│   Profile Updated   │
└──────────────────┘           └─────────────────────┘
```

### Header Layout

```
┌─────────────────────────────────────────────────────────┐
│ [Tournoi]                                    [JD ▼]    │
│                                              ┌──────┐  │
│                                              │Mon    │ │
│                                              │profil │ │
│                                              ├───────┤ │
│                                              │Mes     │ │
│                                              │inscrip.│ │
│                                              ├───────┤ │
│                                              │Déconn.│ │
│                                              └───────┘ │
└─────────────────────────────────────────────────────────┘
```

L'avatar affiche les initiales (première lettre du prénom + première lettre du nom). Si le profil n'est pas complet, l'email est affiché à la place.

## Validation Rules

### Frontend (Zod)
```typescript
const profileSchema = z.object({
  firstName: z.string()
    .min(2, 'Le prénom doit faire au moins 2 caractères')
    .max(50, 'Le prénom ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Le prénom contient des caractères invalides'),
  lastName: z.string()
    .min(2, 'Le nom doit faire au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Le nom contient des caractères invalides'),
  phone: z.string()
    .regex(/^0[1-9][0-9]{8}$/, 'Format de téléphone invalide (ex: 0612345678)'),
})
```

### Backend (VineJS)
```typescript
const updateProfileValidator = vine.compile(
  vine.object({
    firstName: vine.string().minLength(2).maxLength(50).regex(/^[a-zA-ZÀ-ÿ\s'-]+$/),
    lastName: vine.string().minLength(2).maxLength(50).regex(/^[a-zA-ZÀ-ÿ\s'-]+$/),
    phone: vine.string().regex(/^0[1-9][0-9]{8}$/),
  })
)
```

## Security Considerations

### Isolation des données par session

L'architecture de sécurité repose sur le principe que **l'utilisateur est identifié exclusivement par sa session**, jamais par un paramètre URL ou body :

```typescript
// CORRECT - Utilisateur déterminé par la session
async updateProfile({ auth, request, response }: HttpContext) {
  await auth.use('web').authenticate()
  const user = auth.use('web').user!  // ← Utilisateur de LA session
  // ... mise à jour de user
}

// INCORRECT - Ne jamais faire cela
async updateProfile({ request, response }: HttpContext) {
  const { userId, ...data } = request.all()
  const user = await User.find(userId)  // ← DANGER : userId manipulable
}
```

### Endpoints et accès

| Endpoint | Méthode | Données accessibles |
|----------|---------|---------------------|
| `/auth/me` | GET | Propres données uniquement |
| `/auth/user/profile` | PATCH | Modification de SON profil uniquement |

**Aucun endpoint ne permet :**
- De lister tous les utilisateurs
- D'accéder au profil d'un autre utilisateur
- De modifier le profil d'un autre utilisateur

### Données sensibles

Le champ `phone` est considéré comme donnée sensible :
- Retourné uniquement via les endpoints authentifiés `/auth/me` et `/auth/user/profile`
- **Jamais** inclus dans les réponses publiques (ex: liste des inscriptions à un tableau)

### Middleware de protection

Tous les endpoints de profil utilisent le middleware `auth({ guards: ['web'] })` qui :
1. Vérifie la présence d'une session valide
2. Rejette avec `401 UNAUTHORIZED` si session absente/expirée
3. Injecte l'utilisateur authentifié dans `auth.use('web').user`

## Trade-offs

### Décision : Champs séparés vs fullName
**Choix** : Champs séparés (firstName, lastName)
**Raison** : Permet de générer les initiales pour l'avatar et offre plus de flexibilité pour les communications futures.

### Décision : Modale obligatoire vs optionnelle
**Choix** : Modale obligatoire à la première connexion
**Raison** : Garantit que tous les utilisateurs ont des informations de contact complètes, essentiel pour les organisateurs de tournois.

### Décision : Format téléphone
**Choix** : Format français uniquement (10 chiffres commençant par 0)
**Raison** : Le projet est ciblé France métropolitaine (cf. project.md), pas besoin de support international.
