# Améliorer la navigation vers les inscriptions

## Contexte

Retour utilisateur lors des premiers tests : **"Je ne sais pas où retrouver mes inscriptions"**.

Les fonctionnalités personnelles (profil et inscriptions) sont cachées derrière un menu déroulant accessible uniquement en cliquant sur l'avatar utilisateur. Ce pattern n'est pas intuitif pour des **utilisateurs non avertis en informatique**.

## Solution validée

**Page unifiée "Mon espace" avec onglets** :

1. Un seul bouton **"Mon espace"** visible dans la barre de navigation
2. Une nouvelle page `/mon-espace` avec deux onglets :
   - **"Mes inscriptions"** (onglet par défaut)
   - **"Mes informations de contact"**
3. L'avatar reste présent mais ne contient plus que la déconnexion

```
Navigation :
[Accueil] [Inscription] [Joueurs] [FAQ]  [Mon espace 👤] [Avatar ▾]
                                              ↑ Nouveau        ↑ Déconnexion seulement

Page Mon espace :
┌─────────────────────────────────────────┐
│ Mon espace                              │
├─────────────────────────────────────────┤
│ [📋 Mes inscriptions] | [� Mes infos]  │  ← Onglets
├─────────────────────────────────────────┤
│ Contenu de l'onglet actif               │
└─────────────────────────────────────────┘
```

## Modifications nécessaires

### Frontend

1. **Nouvelle page** : `MonEspacePage.tsx` avec composant `Tabs`
2. **Refactoring** : Extraire le contenu de `UserDashboardPage` en composant réutilisable
3. **Refactoring** : Extraire le formulaire de `ProfilePage` en composant réutilisable  
4. **Navigation** : Remplacer le dropdown avatar par un bouton "Mon espace" + avatar simplifié
5. **Routes** : Nouvelle route `/mon-espace`, rediriger `/dashboard` et `/profile` vers `/mon-espace`

### Specs à modifier

- `user-profile` : Supprimer le requirement "Menu déroulant utilisateur"
- Nouvelle capability `user-space` pour la page unifiée

## Statut

- [x] Analyse du problème
- [x] Validation de l'approche par l'utilisateur
- [ ] Rédaction des specs détaillées
- [ ] Plan des tâches
- [ ] Implémentation
