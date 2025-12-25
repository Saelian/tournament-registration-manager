# Change: FFTT API Client

## Why
Player identification relies on official data from the French Table Tennis Federation (FFTT). A dedicated API client allows retrieving player information from their license number.

## What Changes
- Creation of a standalone module `packages/fftt-client`
- Agnostic interface (pure TypeScript/Axios)
- MockFFTTClient for local development
- Manual entry fallback with "To Verify" flag

## Impact
- Affected specs: `fftt-client` (new capability)
- Affected code: `packages/fftt-client/`