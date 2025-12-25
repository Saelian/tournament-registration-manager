# Tasks: add-waitlist-registration

## 1. Data Model
- [ ] 1.1 Add fields to Registration: waitlist_rank, waitlist_notified_at, waitlist_expires_at
- [ ] 1.2 Migration for new fields

## 2. Backend Service
- [ ] 2.1 Create WaitlistService
- [ ] 2.2 Implement addToWaitlist(registrationId)
- [ ] 2.3 Implement getWaitlistRank(tableId, registrationId)
- [ ] 2.4 Implement getWaitlistForTable(tableId)

## 3. Backend API
- [ ] 3.1 POST /api/registrations - Handle full table case
- [ ] 3.2 GET /api/tables/:id/waitlist - Waitlist for a table
- [ ] 3.3 Return rank in registration response

## 4. Frontend
- [ ] 4.1 Detect full table during selection
- [ ] 4.2 Display "Full - Waitlist" instead of price
- [ ] 4.3 "Add me to waitlist" button
- [ ] 4.4 Confirmation without redirection to payment
- [ ] 4.5 Display rank in dashboard

## 5. Tests
- [ ] 5.1 Test adding to waitlist
- [ ] 5.2 Test rank calculation
- [ ] 5.3 Test display in dashboard