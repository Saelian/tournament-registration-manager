# Tasks: add-waitlist-automation

## 1. Events
- [ ] 1.1 Create PlaceFreed(tableId) event
- [ ] 1.2 Emit event on cancellation
- [ ] 1.3 Emit event on admin deletion

## 2. Automation Service
- [ ] 2.1 Create WaitlistAutomationService
- [ ] 2.2 Implement notifyNextInLine(tableId)
- [ ] 2.3 Generate unique payment link (token)
- [ ] 2.4 Implement checkExpiredNotifications()
- [ ] 2.5 Implement moveToEndOfList(registrationId)

## 3. CRON Jobs
- [ ] 3.1 Configure Bull/Redis for jobs
- [ ] 3.2 Job "check-waitlist-expirations" every 5 minutes
- [ ] 3.3 Handle retries and errors

## 4. Emails
- [ ] 4.1 "Place available" template
- [ ] 4.2 Include unique payment link
- [ ] 4.3 Display remaining time
- [ ] 4.4 "Your deadline has expired" template

## 5. Backend API
- [ ] 5.1 GET /api/waitlist/claim/:token - Payment page from link
- [ ] 5.2 Validate token and deadline
- [ ] 5.3 Redirect to checkout if valid

## 6. Frontend
- [ ] 6.1 Claim page with summary
- [ ] 6.2 Display remaining time
- [ ] 6.3 "Confirm and Pay" button

## 7. Tests
- [ ] 7.1 Test notification to rank 1
- [ ] 7.2 Test timer expiration
- [ ] 7.3 Test list rotation
- [ ] 7.4 Test payment via unique link