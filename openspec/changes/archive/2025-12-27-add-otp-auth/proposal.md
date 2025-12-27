# Change: OTP Authentication (Passwordless)

## Why
"Zero friction" philosophy: public users should not have to create an account or memorize a password. Authentication via OTP code sent by email is simple and secure.

## What Changes
- Email entry form
- 6-digit OTP code sent by email
- Code validation and session creation
- Session duration management

## Impact
- Affected specs: `otp-auth` (new capability)
- Affected code: `api/app/controllers/AuthController.ts`, `api/app/services/OtpService.ts`