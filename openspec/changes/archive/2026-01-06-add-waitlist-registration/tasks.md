# Tasks: add-waitlist-registration

## 1. Backend Service - WaitlistService
- [x] 1.1 Create `api/app/services/waitlist_service.ts`
- [x] 1.2 Implement `recalculateRanks(tableId)` - reorders ranks sequentially after removal
- [x] 1.3 Implement `promoteToPayment(registrationId)` - changes status, clears rank, triggers recalculation
- [x] 1.4 Implement `getWaitlistCount(tableId)` - returns count of waitlist registrations

## 2. Backend - Waitlist Protection
- [x] 2.1 Modify `RegistrationRulesService.validateSelection()` to check for waitlist existence
- [x] 2.2 Add validation error `WAITLIST_PRIORITY` when trying to register on a table with waitlist
- [x] 2.3 Add helper `hasWaitlist(tableId)` to check if table has waitlist entries

## 3. Backend - Rank Recalculation on Withdrawal
- [x] 3.1 Modify `CancellationService.unregisterWithoutRefund()` to call `recalculateRanks()` when cancelling a waitlist registration

## 4. Backend API - Admin Promotion
- [x] 4.1 Add `POST /api/admin/registrations/:id/promote` endpoint
- [x] 4.2 Validate registration is in waitlist status
- [x] 4.3 Call `WaitlistService.promoteToPayment()`
- [x] 4.4 Send notification email to user

## 5. Backend - Email Notification
- [x] 5.1 Create email template for waitlist promotion notification
- [x] 5.2 Include: table info, payment deadline, link to dashboard
- [x] 5.3 Integrate with existing mail service

## 6. Frontend - Table Selection
- [x] 6.1 Display "Full - Join Waitlist" for full tables
- [x] 6.2 Display "Reserved for waitlist" message when table has waitlist but spots available
- [x] 6.3 Disable registration button when waitlist protection applies

## 7. Frontend - Dashboard
- [x] 7.1 Display badge "Waitlist - Position X/Y" for waitlist registrations
- [x] 7.2 Add "Withdraw" button for waitlist registrations
- [x] 7.3 Confirmation dialog before withdrawal

## 8. Frontend - Admin Panel
- [x] 8.1 Show waitlist registrations in admin registrations list
- [x] 8.2 Add "Promote" action button for waitlist registrations
- [x] 8.3 Confirmation dialog showing user will be notified

## 9. Tests
- [x] 9.1 Test rank recalculation after withdrawal
- [x] 9.2 Test waitlist protection blocking direct registration
- [x] 9.3 Test admin promotion flow
- [x] 9.4 Test email notification sent on promotion
- [x] 9.5 Test promoted registration expires if not paid (existing cleanup job)

## Dependencies
- Tasks 1.x must be completed before 2.x, 3.x, 4.x
- Task 5.x can be done in parallel with 2.x, 3.x
- Frontend tasks (6.x, 7.x, 8.x) can start after corresponding backend tasks
