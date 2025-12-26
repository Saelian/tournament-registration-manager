# Change: Tournament Configuration

## Why
The organizer must be able to configure global tournament parameters before opening registrations. These parameters affect the behavior of the entire system (refunds, waitlist).

## What Changes
- CRUD for tournament configuration
- Parameters: name, dates, location, refund deadline, waitlist timer duration
- Admin interface to manage these parameters

## Impact
- Affected specs: `tournament-config` (new capability)
- Affected code: `api/app/models/`, `api/app/controllers/admin/`