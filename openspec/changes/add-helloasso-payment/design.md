# Design: add-helloasso-payment

## Context
HelloAsso is a French payment platform for associations. API V5 allows creating payment sessions and receiving notifications via webhook.

## Goals / Non-Goals
**Goals:**
- Secure and compliant payment
- Automatic reconciliation via webhook
- Refund support

**Non-Goals:**
- Recurring payment
- Multi-currency (EUR only)

## Decisions

### Payment Flow
```
1. User clicks "Pay"
2. API creates HelloAsso checkout with metadata (registration_ids)
3. User is redirected to HelloAsso
4. User pays
5. HelloAsso sends webhook to our API
6. API updates registrations (status = paid)
7. User returns to our site (success page)
```

### Metadata Structure
```json
{
  "registration_ids": "123,456,789",
  "user_email": "user@example.com"
}
```

### Webhook Security
- HMAC signature verification
- Origin validation (HelloAsso IP)
- Idempotency (ignore duplicates)

### Payment Model
```typescript
interface Payment {
  id: number;
  registration_id: number;
  helloasso_payment_id: string;
  amount: number; // in cents
  status: 'pending' | 'completed' | 'refunded' | 'failed';
  created_at: DateTime;
  updated_at: DateTime;
}
```

### Error Management
- If webhook fails → automatic retry by HelloAsso
- If payment without webhook → manual verification possible via API
- Detailed log of all events

## Risks / Trade-offs
- **HelloAsso Dependency** → No alternative planned (client choice)
- **Webhook rate limit** → Unlikely given expected volume

## Open Questions
- Exact format of HelloAsso V5 webhook signature