# Tasks: add-otp-auth

## 1. Data Model
- [ ] 1.1 Create User model (email only)
- [ ] 1.2 Create OtpToken model (user_id, code, expires_at)
- [ ] 1.3 Create migrations

## 2. OTP Service
- [ ] 2.1 Create OtpService
- [ ] 2.2 Implement generateOtp() - 6 digit code
- [ ] 2.3 Implement sendOtp(email) - storage + email sending
- [ ] 2.4 Implement verifyOtp(email, code) - validation + session creation
- [ ] 2.5 Configure expiration (default 10 minutes)

## 3. Email Sending
- [ ] 3.1 Configure email provider (SMTP or service)
- [ ] 3.2 Create OTP email template
- [ ] 3.3 Handle sending errors

## 4. Backend API
- [ ] 4.1 POST /auth/request-otp - Request a code
- [ ] 4.2 POST /auth/verify-otp - Validate the code
- [ ] 4.3 POST /auth/logout - Logout
- [ ] 4.4 GET /auth/me - Logged-in user
- [ ] 4.5 Create UserAuthMiddleware

## 5. Frontend
- [ ] 5.1 Create login page (email input)
- [ ] 5.2 Create OTP entry page (6 inputs)
- [ ] 5.3 Handle resend timer
- [ ] 5.4 Redirection after login

## 6. Tests
- [ ] 6.1 Test complete flow request → verify
- [ ] 6.2 Test code expiration
- [ ] 6.3 Test multiple attempts