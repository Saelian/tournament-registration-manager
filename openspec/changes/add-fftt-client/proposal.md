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

## Documentation
- Official documentation of FFTT API is available in the specs/fftt-client folder
- This repository contains a php integration of the API and can help for integration : https://github.com/alamirault/fftt-api
