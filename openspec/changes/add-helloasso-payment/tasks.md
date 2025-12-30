# Tasks: add-helloasso-payment

## 1. Setup & Configuration
- [ ] 1.1 Add env vars to `.env` and `config/helloasso.ts`:
    - `HELLOASSO_CLIENT_ID`, `HELLOASSO_CLIENT_SECRET`, `HELLOASSO_ORG_SLUG`, `HELLOASSO_SANDBOX`
    - `PAYMENT_EXPIRATION_MINUTES` (default: 30)
    - `PAYMENT_CLEANUP_INTERVAL_MINUTES` (default: 5)
- [ ] 1.2 Use Adonis HTTP client (no extra dependency needed).
- [ ] 1.3 Install `node-cron` for scheduled cleanup job.

## 2. Database
- [ ] 2.1 Create `payments` migration:
    - `id`, `user_id` (FK), `helloasso_checkout_intent_id`, `helloasso_order_id` (nullable), `amount` (cents), `status`, `created_at`, `updated_at`.
- [ ] 2.2 Create `payment_registrations` pivot table migration:
    - `id`, `payment_id` (FK), `registration_id` (FK), `created_at`.
- [ ] 2.3 Create `Payment` model with relationships:
    - `belongsTo` User
    - `manyToMany` Registration (via pivot table)
- [ ] 2.4 Update `Registration` model to add `manyToMany` Payment relationship.

## 3. HelloAsso Service
- [ ] 3.1 Create `app/services/hello_asso_service.ts`.
- [ ] 3.2 Implement `authenticate()` (Client Credentials Flow) with token caching.
- [ ] 3.3 Implement `initCheckout(amountCents, user, itemName, backUrl, returnUrl, errorUrl)` → calls `POST /organizations/{slug}/checkout-intents`.
- [ ] 3.4 Implement `getCheckoutIntent(checkoutIntentId)` → calls `GET /organizations/{slug}/checkout-intents/{id}` for Double Check verification.

## 4. Backend Logic (Checkout)
- [ ] 4.1 Verify `RegistrationsController.store` keeps status as `pending_payment` (already done).
- [ ] 4.2 **Update quota calculation** in `RegistrationsController.store`:
    - Exclude `pending_payment` registrations older than `PAYMENT_EXPIRATION_MINUTES`.
    - Query: `WHERE status IN ('paid', 'pending_payment') AND (status = 'paid' OR created_at > NOW() - INTERVAL)`.
- [ ] 4.3 Create `PaymentsController`.
- [ ] 4.4 Implement `PaymentsController.createIntent`:
    - Validates unpaid registrations for user.
    - Calculates total: sum of `table.price` (euros) × 100 → cents.
    - Calls `HelloAssoService.initCheckout`.
    - Creates local `Payment` record.
    - Links registrations via pivot table.
    - Returns redirect URL.
- [ ] 4.5 Add route `POST /api/payments/create-intent` (protected).

## 5. Backend Logic (Webhooks)
- [ ] 5.1 Create `WebhooksController.helloasso`.
- [ ] 5.2 Handle Order notification (not Payment - no installments).
- [ ] 5.3 **Double Check Security:** Call `HelloAssoService.getCheckoutIntent` to verify payment is authorized.
- [ ] 5.4 Find Payment by `helloasso_checkout_intent_id`, update `helloasso_order_id` and status to `succeeded`.
- [ ] 5.5 Update linked `Registration` records (via pivot) to `status` = `paid`.
- [ ] 5.6 Add route `POST /webhooks/helloasso` (excluded from CSRF).
- [ ] 5.7 Implement idempotency check (ignore if Payment already succeeded).

## 6. Frontend Integration
- [ ] 6.1 Create `PaymentReturn` page (route `/payment/callback`).
    - Handles `status=success` (show confirmation) and `status=error` (show failure message).
    - If success but webhook not yet received, show "Confirmation in progress...".
- [ ] 6.2 Add "Proceed to Payment" button in Registration summary.
- [ ] 6.3 Handle `backUrl` return (user wants to modify cart).

## 7. Testing
- [ ] 7.1 Unit test `HelloAssoService` (mocking external API).
- [ ] 7.2 Functional test `PaymentsController.createIntent`.
- [ ] 7.3 Functional test `WebhooksController.helloasso` (including Double Check mock).
- [ ] 7.4 Unit test `PaymentCleanupJob` (expiration logic).
- [ ] 7.5 Manual test using HelloAsso Sandbox & `https://webhook-castt.saelian.com`.

## 8. Expiration & Cleanup System
- [ ] 8.1 Create `app/jobs/payment_cleanup_job.ts`:
    - Find `pending_payment` registrations older than `PAYMENT_EXPIRATION_MINUTES`.
    - Update status to `cancelled`.
    - Find associated `Payment` records and update status to `expired`.
    - Log cleanup actions for audit.
- [ ] 8.2 Create `app/services/scheduler_service.ts`:
    - Initialize `node-cron` on app startup.
    - Schedule cleanup job every `PAYMENT_CLEANUP_INTERVAL_MINUTES`.
- [ ] 8.3 Register scheduler in AdonisJS boot sequence (`start/scheduler.ts` or provider).
- [ ] 8.4 Add logging for cleanup actions (count of expired registrations/payments).