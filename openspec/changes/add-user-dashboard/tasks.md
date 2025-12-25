# Tasks: add-user-dashboard

## 1. Backend API
- [ ] 1.1 GET /api/me/registrations - List of user's registrations
- [ ] 1.2 Include relations (table, player, payment)
- [ ] 1.3 Add calculated status (pending, paid, waitlist, cancelled)

## 2. Frontend
- [ ] 2.1 Create Dashboard page
- [ ] 2.2 Create RegistrationCard component
- [ ] 2.3 Add status badges (distinct colors)
- [ ] 2.4 Display details (table, player, date, price)
- [ ] 2.5 Add "Unregister" button (conditional)
- [ ] 2.6 Add "Pay" button if pending payment

## 3. UX
- [ ] 3.1 Empty state (no registration yet)
- [ ] 3.2 Loader during loading
- [ ] 3.3 Sort by date (most recent first)
- [ ] 3.4 Filter by status (optional)

## 4. Tests
- [ ] 4.1 Test display without registrations
- [ ] 4.2 Test display with different statuses
- [ ] 4.3 Test actions (unregister)