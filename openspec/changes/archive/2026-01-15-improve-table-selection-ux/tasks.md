# Tâches : Améliorer l'expérience d'inscription dans les tableaux

---

## Tâches

### 1. Améliorer l'indicateur de sélection dans TableCard

**Fichier** : `web/src/features/tables/components/TableCard.tsx`

- [x] 1.1 Retirer l'icône `CheckCircle` du header (ligne 98)
- [x] 1.2 Ajouter un div overlay en position absolute dans le coin supérieur droit
- [x] 1.3 Vérifier que la card parente a well `relative` dans ses classes

**Validation** : Visuellement, l'icône doit apparaître en haut à droite au clic sur un tableau

---

### 2. Ajouter les indications dans le panier

**Fichier** : `web/src/features/registrations/components/public/CartSummary.tsx`

- [x] 2.1 Importer l'icône `Info` depuis lucide-react
- [x] 2.2 Ajouter le bloc d'information au-dessus de la zone bouton/total
- [x] 2.3 S'assurer que le texte est lisible sur tous les thèmes (light/dark)

**Validation** : Le message doit être visible dans le panier lorsqu'au moins un tableau est sélectionné


