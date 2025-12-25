# Tasks: add-helloasso-payment

## 1. HelloAsso Configuration
- [ ] 1.1 Create HelloAsso organization account
- [ ] 1.2 Configure API V5 credentials
- [ ] 1.3 Store secrets in environment variables

## 2. HelloAsso Service
- [ ] 2.1 Create HelloAssoService
- [ ] 2.2 Implement createCheckout(registrations, returnUrl)
- [ ] 2.3 Pass metadata (registration_ids)
- [ ] 2.4 Implement getPaymentStatus(paymentId)
- [ ] 2.5 Implement createRefund(paymentId, amount)

## 3. Data Model
- [ ] 3.1 Create Payment model
- [ ] 3.2 Fields: registration_id, helloasso_payment_id, amount, status, created_at
- [ ] 3.3 Payments table migration

## 4. Backend API - Checkout
- [ ] 4.1 POST /api/checkout - Create a payment session
- [ ] 4.2 Return HelloAsso redirection URL
- [ ] 4.3 Handle creation errors

## 5. Webhook
- [ ] 5.1 POST /webhooks/helloasso - Receive notifications
- [ ] 5.2 Verify webhook signature
- [ ] 5.3 Extract registration_ids from metadata
- [ ] 5.4 Update status = paid for concerned registrations
- [ ] 5.5 Log events for audit

## 6. Frontend
- [ ] 6.1 "Pay" button redirecting to HelloAsso
- [ ] 6.2 Return page after payment (success/cancel)
- [ ] 6.3 Display payment confirmation

## 7. Tests
- [ ] 7.1 Test checkout creation (mock API)
- [ ] 7.2 Test webhook with valid payload
- [ ] 7.3 Test signature verification
- [ ] 7.4 Test fallback if webhook fails