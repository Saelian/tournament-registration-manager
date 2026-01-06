# Change: Inscription par un administrateur

## Why
Un administrateur doit pouvoir créer des inscriptions pour le compte d'un joueur qui ne peut pas s'inscrire lui-même (inscription par téléphone, jour J, etc.). Cette fonctionnalité permet :
- L'encaissement direct le jour du tournoi (cash, chèque, carte bancaire)
- L'inscription anticipée pour un joueur sans accès internet
- La génération d'un lien de paiement HelloAsso à envoyer au joueur

## What Changes

### Nouvelle capability : admin-registration
- Formulaire de création d'inscription dans `/admin/registrations`
- Recherche joueur via FFTT (réutilisation du composant existant)
- Sélection de tableau(x)
- Bypass optionnel des règles d'éligibilité
- Choix du mode de paiement : HelloAsso, Cash, Chèque, Carte bancaire
- Statut "encaissé" ou "non-encaissé" pour cash/chèque/carte
- Génération de lien de paiement HelloAsso (copiable pour envoi manuel)
- Flag `is_admin_created` pour identifier ces inscriptions
- User système dédié pour rattacher les inscriptions admin

### Modification de payment
- Nouveau champ `payment_method` : `helloasso`, `cash`, `check`, `card`
- Affichage du mode de paiement dans la page admin des paiements
- Support des paiements cash/check/card sans `helloassoCheckoutIntentId`

## Impact
- Affected specs: `admin-registration` (new), `payment` (modified)
- Affected code:
  - `api/app/models/payment.ts` - ajout payment_method
  - `api/app/models/user.ts` - user système
  - `api/app/controllers/admin_registrations_controller.ts` - endpoint création
  - `api/app/services/hello_asso_service.ts` - génération lien standalone
  - `web/src/features/admin/registrations/` - formulaire et UI
  - `web/src/features/admin/payments/` - affichage payment_method
