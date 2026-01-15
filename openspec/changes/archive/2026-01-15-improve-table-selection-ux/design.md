# Design : Améliorer l'expérience d'inscription dans les tableaux

## Vue d'ensemble

Amélioration UX pure de deux composants existants pour clarifier le processus d'inscription.

---

## 1. Indicateur de sélection visible sur TableCard

### État actuel

L'icône `CheckCircle` est placée dans le header de la card (ligne 98 de `TableCard.tsx`), alignée avec la lettre de référence et le titre. Cette position la rend peu visible car elle se fond dans la ligne d'éléments.

### Solution proposée

Ajouter un overlay visible en position `absolute` dans le coin supérieur droit de la card :

```tsx
{isSelected && (
  <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1 shadow-sm">
    <CheckCircle className="w-6 h-6" />
  </div>
)}
```

**Caractéristiques** :
- Position : coin supérieur droit (`top-2 right-2`)
- Taille : icône 24px (`w-6 h-6`) au lieu de 20px actuel
- Style : fond `primary`, icône blanche, cercle plein avec ombre
- L'icône existante dans le header est retirée

### Impact visuel

- Visible immédiatement sans chercher
- Ne chevauche pas les éléments existants (le header a assez de padding)
- Cohérent avec les patterns UX courants (sélection de photos, etc.)

---

## 2. Indications claires dans le panier (CartSummary)

### État actuel

Le bouton affiche "Valider l'inscription" sans expliquer les conséquences :
- Redirection vers Hello Asso
- Expiration automatique après 30 minutes si non payé

### Solution proposée

Ajouter un bloc d'information au-dessus du bouton :

```tsx
<div className="bg-muted/50 border border-border rounded-lg p-3 mb-4 text-sm">
  <p className="flex items-center gap-2 font-medium">
    <InfoIcon className="w-4 h-4 text-blue-500 shrink-0" />
    En cliquant sur "Valider l'inscription", vous serez redirigé vers Hello Asso pour procéder au paiement.
  </p>
  <p className="mt-2 text-muted-foreground flex items-center gap-2">
    <Clock className="w-4 h-4 text-amber-500 shrink-0" />
    <span>
      <strong>Important :</strong> Si vous ne finalisez pas le paiement, vos inscriptions seront automatiquement annulées après 30 minutes.<br/>
      En cas de difficulté rencontrée lors du paiement, vous pouvez de nouveau procéder au paiement depuis votre espace utilisateur.
    </span>
  </p>
</div>
```

### Choix de design

- **Style "info box"** : fond neutre, bordure légère, texte lisible
- **Icône Info** : bleu pour la redirection (informatif)
- **Icône Clock** : ambre pour le délai (avertissement)
- **Texte "Important" en gras** : attire l'attention sur le délai

---

## Composants modifiés

| Fichier | Modification |
|---------|-------------|
| `web/src/features/tables/components/TableCard.tsx` | Déplacement de l'indicateur de sélection |
| `web/src/features/registrations/components/public/CartSummary.tsx` | Ajout du bloc informatif |

---

## Pas d'impact backend

Ces changements sont purement frontend/UX :
- Pas de nouvelle route API
- Pas de modification de modèle
- Pas de changement de comportement métier
