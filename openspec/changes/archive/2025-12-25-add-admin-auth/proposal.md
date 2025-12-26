# Change: Administrator Authentication

## Why
Tournament organizers must be able to access a secure area to configure and manage the tournament. This authentication is distinct from public user OTP authentication.

## What Changes
- Addition of a login/logout system for administrators
- Secure session management via httpOnly cookies
- Middleware protection for admin routes
- Default administrator seed

## Impact
- Affected specs: `admin-auth` (new capability)
- Affected code: `api/app/controllers/`, `api/app/middleware/`, `api/database/seeders/`