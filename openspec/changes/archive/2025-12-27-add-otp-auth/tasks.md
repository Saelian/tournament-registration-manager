# Tasks: add-otp-auth

## 1. Data Model
- [x] 1.1 Create User model (email only)
- [x] 1.2 Create OtpToken model (user_id, code, expires_at)
- [x] 1.3 Create migrations

## 2. OTP Service
- [x] 2.1 Create OtpService
- [x] 2.2 Implement generateOtp() - 6 digit code
- [x] 2.3 Implement sendOtp(email) - storage + email sending
- [x] 2.4 Implement verifyOtp(email, code) - validation + session creation
- [x] 2.5 Configure expiration (default 10 minutes)

## 3. Email Sending
- [x] 3.1 Configure email provider (SMTP or service)
- [x] 3.2 Create OTP email template
- [x] 3.3 Handle sending errors

## 4. Backend API
- [x] 4.1 POST /auth/request-otp - Request a code
- [x] 4.2 POST /auth/verify-otp - Validate the code
- [x] 4.3 POST /auth/logout - Logout
- [x] 4.4 GET /auth/me - Logged-in user
- [x] 4.5 Create UserAuthMiddleware

## 5. Frontend
- [x] 5.1 Create login page (email input)
- [x] 5.2 Create OTP entry page (6 inputs)
- [x] 5.3 Handle resend timer
- [x] 5.4 Redirection after login

## 6. Tests
- [x] 6.1 Test complete flow request → verify
- [x] 6.2 Test code expiration
- [x] 6.3 Test multiple attempts
