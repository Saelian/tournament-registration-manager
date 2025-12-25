# Tasks: add-registration-flow

## 1. Data Model
- [ ] 1.1 Create Registration model
- [ ] 1.2 Fields: user_id, player_id, table_id, status, waitlist_rank, created_at
- [ ] 1.3 Create registrations table migration
- [ ] 1.4 Relations (belongsTo User, Player, Table)

## 2. Backend API
- [ ] 2.1 POST /api/registrations - Create a registration
- [ ] 2.2 GET /api/registrations/:id - Registration detail
- [ ] 2.3 DELETE /api/registrations/:id - Cancel a registration
- [ ] 2.4 Status logic: pending_payment, paid, waitlist, cancelled

## 3. Frontend - Table Selection
- [ ] 3.1 Create table selection page
- [ ] 3.2 Display tables grouped by day
- [ ] 3.3 Checkboxes with state (eligible, ineligible, full)
- [ ] 3.4 Integrate real-time validation rules
- [ ] 3.5 Display total price

## 4. Frontend - Cart
- [ ] 4.1 Create CartSummary component
- [ ] 4.2 List of selected tables
- [ ] 4.3 Direct registration vs waitlist distinction
- [ ] 4.4 Total to pay (excluding waitlist)
- [ ] 4.5 "Proceed to payment" button

## 5. Saturation Management
- [ ] 5.1 Detect if table full
- [ ] 5.2 Propose "Add to waitlist"
- [ ] 5.3 Create registration with status = waitlist
- [ ] 5.4 Calculate and store rank

## 6. Tests
- [ ] 6.1 Test normal registration
- [ ] 6.2 Test waitlist registration
- [ ] 6.3 Test rank calculation