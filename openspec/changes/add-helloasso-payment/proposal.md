# Change: HelloAsso Payment Integration

## Why
Registrations must be validated by a payment to ensure commitment and manage tournament revenue. HelloAsso is the chosen provider (low fees for non-profits).

## What Changes
1.  **New Service:** `HelloAssoService` to handle OAuth2 and API V5 calls (Checkout Intents).
2.  **New Models:**
    -   `Payment` to track transaction state.
    -   `payment_registrations` pivot table to link Payments and Registrations (many-to-many).
3.  **Controller Updates:**
    -   `RegistrationsController` leaves registrations as `pending_payment`.
    -   New `PaymentsController` handles the transition to HelloAsso (checkout intent creation).
    -   New `WebhooksController` handles the asynchronous Order notification.
4.  **Security:** Double Check pattern - verify payment status via API callback (`GET /checkout-intents/{id}`) since webhook signature is not available for non-partner associations.

## Impact
-   **Database:** New `payments` table + `payment_registrations` pivot table.
-   **UX:** Redirect flow for payment, confirmation page.
-   **Ops:** Requires `HELLOASSO_*` env vars, webhook URL configured in HelloAsso admin.