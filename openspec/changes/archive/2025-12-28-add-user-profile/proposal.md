# Proposal: add-user-profile

## Summary
Ajouter un système de profil utilisateur complet : collecte obligatoire des informations de contact (nom, prénom, téléphone) lors de la première connexion via une modale, page de modification du profil, et menu dropdown avec avatar dans le header.

## Motivation
Actuellement, les utilisateurs se connectent uniquement avec leur email via OTP. Le système ne dispose d'aucune information de contact supplémentaire. Pour améliorer la communication avec les participants et permettre aux organisateurs de les contacter en cas de besoin, il est nécessaire de collecter et stocker ces informations.

## Scope

### In Scope
- Ajout des champs `firstName`, `lastName`, `phone` au modèle User
- Modale de complétion de profil affichée automatiquement à la première connexion
- Validation frontend (Zod) et backend (VineJS) de tous les champs
- Avatar avec initiales (première lettre du prénom + première lettre du nom)
- Menu dropdown remplaçant les boutons actuels du header
- Page "Mon profil" pour modifier les informations
- Lien "Mes inscriptions" pointant vers le dashboard

### Out of Scope
- Upload de photo de profil
- Informations supplémentaires (adresse, etc.)
- Préférences utilisateur
- Notifications

## Approach
1. **Backend** : Migration pour ajouter les colonnes, mise à jour du modèle User, nouvel endpoint PATCH /auth/user/profile
2. **Frontend** : Modale de complétion de profil avec détection automatique du profil incomplet, composant Avatar, DropdownMenu dans le header, page /profile

## Affected Specs
- `otp-auth` (MODIFIED) : Ajout du requirement sur le profil incomplet
- `public-landing` (MODIFIED) : Modification du requirement sur l'affichage de l'état de connexion
- `user-profile` (NEW) : Nouvelle spec pour la gestion du profil utilisateur

## Risks & Mitigations
| Risk | Mitigation |
|------|------------|
| Migration sur base existante | Les nouveaux champs sont nullables, la modale force la complétion |
| UX intrusive | La modale n'apparaît qu'une seule fois à la première connexion |

## Open Questions
Aucune question ouverte - les requirements sont clairs.
