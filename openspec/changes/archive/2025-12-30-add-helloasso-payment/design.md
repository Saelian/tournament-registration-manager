# Design: add-helloasso-payment

## Context
HelloAsso is the chosen payment platform. We will use the **API V5 Checkout Intent** flow.
This allows us to create a "cart" (intent) dynamically on our backend with multiple items (registrations) and redirect the user to a secure HelloAsso payment page.

**Note:** The association is NOT a HelloAsso partner, so webhook signature verification (`x-ha-signature`) is not available. We use the Double Check pattern instead.

## Goals
1.  **Single Payment:** A user pays for multiple table registrations in one transaction (no installments).
2.  **Dynamic Pricing:** The total amount is calculated by the backend based on the selected tables (prices stored in euros, converted to cents for API).
3.  **Automatic Validation:** Registrations are marked as `paid` only upon successful payment confirmation via Webhook (Order notification).

## Architecture & Data Flow

### 1. Payment Initialization (User Action)
- **Actor:** User (Frontend)
- **Action:** Selects tables -> Clicks "Confirm & Pay"
- **Backend Logic:**
    1.  `RegistrationsController.store`: Creates registrations with status `pending_payment`.
    2.  Calculates total amount: Sum of `table.price` (euros) × 100 → cents.
    3.  Calls `HelloAssoService.initCheckout(registrations, user)`.
    4.  **API Call:** `POST /organizations/{slug}/checkout-intents` (HelloAsso V5)
        -   `totalAmount`: Integer (cents) - total price.
        -   `initialAmount`: Integer (cents) - same as totalAmount (no installments).
        -   `itemName`: "Inscription Tournoi - {User Name}"
        -   `backUrl`: `https://our-app.com/registration` (return to modify cart)
        -   `returnUrl`: `https://our-app.com/payment/callback?status=success`
        -   `errorUrl`: `https://our-app.com/payment/callback?status=error`
        -   `containsDonation`: `false`
    5.  Creates `Payment` record (status `pending`) with link to registrations via `payment_registrations` pivot table.
    6.  Returns the `redirectUrl` to the Frontend.

### 2. User Payment (HelloAsso)
- User is redirected to HelloAsso.
- Enters credit card details.
- Validates payment.
- Redirected back to `returnUrl`.

### 3. Payment Confirmation (Webhook)
- **Actor:** HelloAsso Server
- **Trigger:** Payment successful (Order notification, not Payment - we don't use installments).
- **Action:** Sends `POST` to `https://webhook-castt.saelian.com` (forwarded to `POST /webhooks/helloasso`).
- **Payload:** `Order` object containing `id`, `formSlug`, `formType`, `items[]`, and `payments[]`.
- **Backend Logic:**
    1.  **Double Check Security:** Calls `GET /organizations/{slug}/checkout-intents/{checkoutIntentId}` to verify payment status (no signature available for non-partners).
    2.  Finds local `Payment` record via `checkoutIntentId` stored during initialization.
    3.  Updates `Payment.helloasso_order_id` with the received order ID.
    4.  Updates local `Payment` status to `succeeded`.
    5.  Updates linked `Registration` records (via pivot table): status `pending_payment` -> `paid`.

## Data Model Changes

### New Model: `Payment`
Links a HelloAsso transaction to our system.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | Integer | PK |
| `user_id` | Integer | FK → User who made the payment |
| `helloasso_checkout_intent_id` | String | ID returned by InitCheckout |
| `helloasso_order_id` | String | (Nullable) Order ID received from webhook |
| `amount` | Integer | Amount in cents (for HelloAsso compatibility) |
| `status` | String | `pending`, `succeeded`, `failed`, `expired`, `refunded` |
| `created_at` | DateTime | |
| `updated_at` | DateTime | |

### New Pivot Table: `payment_registrations`
Links payments to registrations (many-to-many for production robustness).

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | Integer | PK |
| `payment_id` | Integer | FK → Payment |
| `registration_id` | Integer | FK → Registration |
| `created_at` | DateTime | |

*This pivot table ensures referential integrity and allows direct SQL queries for reconciliation.*

### Configuration (.env)
```env
HELLOASSO_CLIENT_ID=...
HELLOASSO_CLIENT_SECRET=...
HELLOASSO_ORGANIZATION_SLUG=...
HELLOASSO_SANDBOX=true
# Webhook URL is configured in HelloAsso admin panel, not passed dynamically usually, 
# but returnUrl IS passed dynamically.
```

## Security
- **CSRF:** Standard AdonisJS protection for frontend routes.
- **Webhook Authentication:** HelloAsso provides HMAC-SHA256 signature via `x-ha-signature` header, but this is **only available for HelloAsso partners**. Since we are a regular association (not a partner), we cannot use signature verification.
- **Double Check Pattern (Required):** Upon receiving a webhook notification, the service MUST call `GET /organizations/{slug}/checkout-intents/{checkoutIntentId}` to verify the payment status before processing. This prevents spoofed webhook attacks.
- **Webhook Endpoint:** The `/webhooks/helloasso` route must be excluded from CSRF protection (external caller).

## Edge Cases
- **User cancels payment:** Returns to `errorUrl`. Registrations remain `pending_payment`. Expiration system handles cleanup (see below).
- **Payment fails:** Same as cancel.
- **Partial payment:** Not possible with Checkout Intent (all or nothing).
- **User abandons (closes browser):** No return URL called, no webhook. Expiration system handles cleanup.

## Expiration & Cleanup System

### Problem
When a user starts payment but abandons (closes browser, network issue, etc.), registrations stay in `pending_payment` status, blocking table slots indefinitely.

### Solution: Two-layer protection

#### Layer 1: Smart Quota Calculation (Immediate)
When calculating table availability, exclude `pending_payment` registrations older than **30 minutes**:
```sql
WHERE status IN ('paid', 'pending_payment')
AND (status = 'paid' OR created_at > NOW() - INTERVAL '30 minutes')
```
This ensures slots are freed even if the cleanup job hasn't run yet.

#### Layer 2: Scheduled Cleanup Job (Periodic)
A background job runs every **5 minutes** to:
1. Find `pending_payment` registrations older than 30 minutes
2. Update their status to `cancelled`
3. Update associated `Payment` records to `expired`
4. Log the cleanup for audit

### Technical Implementation

**Scheduler:** `node-cron` (runs in-process with AdonisJS)
- Lightweight, no external dependencies
- If app restarts, cron restarts automatically
- Layer 1 provides protection even if cron is temporarily down

**Why not BullMQ/Redis?**
- Overkill for a simple periodic cleanup
- `node-cron` is sufficient since:
  - Job is idempotent (safe to run multiple times)
  - Layer 1 provides immediate protection
  - No need for job persistence or retry logic

### Configuration
```env
# Payment expiration timeout in minutes (default: 30)
PAYMENT_EXPIRATION_MINUTES=30
# Cleanup job interval in minutes (default: 5)
PAYMENT_CLEANUP_INTERVAL_MINUTES=5
```

### Timing Rationale
- **HelloAsso checkout URL:** Valid 15 minutes
- **Our expiration:** 30 minutes (allows margin for webhook delivery delays)
- **Cleanup interval:** 5 minutes (balance between responsiveness and resource usage)