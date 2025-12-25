# Tasks: add-cancellation-refund

## 1. Backend Service
- [ ] 1.1 Create CancellationService
- [ ] 1.2 Implement cancelRegistration(registrationId)
- [ ] 1.3 Verify deadline
- [ ] 1.4 Call HelloAsso for refund if applicable
- [ ] 1.5 Update registration status = cancelled
- [ ] 1.6 Trigger "place freed" event

## 2. Backend API
- [ ] 2.1 DELETE /api/registrations/:id - Cancel a registration
- [ ] 2.2 Return refund info (yes/no, amount)
- [ ] 2.3 Handle errors (registration already cancelled, etc.)

## 3. Frontend
- [ ] 3.1 "Unregister" button on each registration
- [ ] 3.2 Confirmation modal with refund message
- [ ] 3.3 Display "Refund possible" or "No refund" according to date
- [ ] 3.4 Cancellation confirmation

## 4. HelloAsso Integration
- [ ] 4.1 Use HelloAssoService.createRefund()
- [ ] 4.2 Handle cases where refund fails
- [ ] 4.3 Log refund result

## 5. Tests
- [ ] 5.1 Test cancellation before deadline (with refund)
- [ ] 5.2 Test cancellation after deadline (without refund)
- [ ] 5.3 Test "place freed" event