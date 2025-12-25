# Tasks: add-last-minute-registration

## 1. Backend API
- [ ] 1.1 POST /admin/registrations/last-minute - Quick registration
- [ ] 1.2 Parameters: player_id, table_id, payment_method, bypass_rules
- [ ] 1.3 Validate or bypass rules according to flag
- [ ] 1.4 Create registration with appropriate status

## 2. Frontend - Form
- [ ] 2.1 "Last Minute Registration" button in check-in interface
- [ ] 2.2 Modal or dedicated page
- [ ] 2.3 Player search (reuse PlayerSearch)
- [ ] 2.4 Table selection
- [ ] 2.5 Checkbox "Ignore rules" (if conflicts)

## 3. Frontend - Payment
- [ ] 3.1 Payment method selector
- [ ] 3.2 "Cash" option - marks as paid
- [ ] 3.3 "Check" option - marks as paid + note
- [ ] 3.4 "QR Code" option - generates online payment link

## 4. Data Model
- [ ] 4.1 Add payment_method field to Registration/Payment
- [ ] 4.2 Values: online, cash, check
- [ ] 4.3 Migration

## 5. Tests
- [ ] 5.1 Test standard last-minute registration
- [ ] 5.2 Test with rule bypass
- [ ] 5.3 Test different payment methods