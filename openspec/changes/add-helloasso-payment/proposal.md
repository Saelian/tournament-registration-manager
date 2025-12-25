# Change: HelloAsso Payment Integration

## Why
Registrations are only validated after payment. HelloAsso is the chosen payment platform to manage transactions and potential refunds.

## What Changes
- HelloAsso checkout creation (API V5)
- Passing registration_id in metadata for reconciliation
- Payment confirmation webhook
- Automatic update of registration status

## Impact
- Affected specs: `payment` (new capability)
- Affected code: `api/app/services/HelloAssoService.ts`, `api/app/controllers/WebhooksController.ts`