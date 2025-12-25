# Change: "Last Minute" Registration

## Why
On the tournament day, players may show up to fill withdrawals. The admin must be able to register them quickly with different payment methods (cash, check, QR code).

## What Changes
- Simplified on-site registration form
- Player search via FFTT
- Possible rule bypass (admin)
- Payment method choice

## Impact
- Affected specs: `last-minute-registration` (new capability)
- Affected code: `web/src/features/checkin/`, `api/app/controllers/admin/`