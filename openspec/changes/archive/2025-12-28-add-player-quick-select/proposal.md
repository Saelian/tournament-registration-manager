# Change: Add Quick Player Selection from Previous Registrations

## Why
Currently, logged-in users must search for a player by license number every time they want to register, even for players they have already registered in the past. This creates unnecessary friction and slows down the registration process for returning users.

## What Changes
- Add a "My Players" section showing players from previous registrations
- Allow quick selection of a previously registered player
- Keep license search available for registering new players
- Display player info (name, club, points) in the selection list

## Impact
- Affected specs: `player-search`
- Affected code:
  - `api/app/controllers/registrations_controller.ts` - Add endpoint to get user's players
  - `web/src/features/registration/PlayerSearch.tsx` - Add player selection UI
  - `web/src/features/registration/RegistrationFlowContext.tsx` - Handle player selection state
