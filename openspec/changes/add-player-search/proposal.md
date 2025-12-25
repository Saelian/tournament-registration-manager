# Change: Player Search and Identification

## Why
Before registering, the user must identify the player (themselves or a third party) via their FFTT license number. This identification guarantees exact data and allows applying eligibility rules.

## What Changes
- License number entry form
- FFTT API call to retrieve profile
- Choice "Myself" or "A third party"
- Association between subscriber email and player

## Impact
- Affected specs: `player-search` (new capability)
- Affected code: `web/src/features/registration/`, `api/app/controllers/PlayersController.ts`