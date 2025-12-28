# Tasks: add-registration-flow

## 1. Data Model
- [x] 1.1 Create Registration model
- [x] 1.2 Fields: user_id, player_id, table_id, status, waitlist_rank, created_at
- [x] 1.3 Create registrations table migration
- [x] 1.4 Relations (belongsTo User, Player, Table)

## 2. Backend API
- [x] 2.1 POST /api/registrations - Create a registration
- [x] 2.2 GET /api/registrations/:id - Registration detail
- [x] 2.3 DELETE /api/registrations/:id - Cancel a registration
- [x] 2.4 Status logic: pending_payment, paid, waitlist, cancelled

## 3. Frontend - Table Selection
- [x] 3.1 Create table selection page
- [x] 3.2 Display tables grouped by day
- [x] 3.3 Checkboxes with state (eligible, ineligible, full)
- [x] 3.4 Integrate real-time validation rules
- [x] 3.5 Display total price

## 4. Frontend - Cart
- [x] 4.1 Create CartSummary component
- [x] 4.2 List of selected tables
- [x] 4.3 Direct registration vs waitlist distinction
- [x] 4.4 Total to pay (excluding waitlist)
- [x] 4.5 "Proceed to payment" button

## 5. Saturation Management
- [x] 5.1 Detect if table full
- [x] 5.2 Propose "Add to waitlist"
- [x] 5.3 Create registration with status = waitlist
- [x] 5.4 Calculate and store rank

## 6. Tests
- [x] 6.1 Test normal registration
- [x] 6.2 Test waitlist registration
- [x] 6.3 Test rank calculation
