## 1. Database Schema

- [ ] 1.1 Create migration adding `gender_restriction` column (VARCHAR nullable, check constraint for 'M'/'F'/NULL)
- [ ] 1.2 Create migration adding `allowed_categories` column (JSONB nullable, default NULL)
- [ ] 1.3 Create migration adding `max_checkin_time` column (TIME nullable)

## 2. Backend Constants & Types

- [ ] 2.1 Create `FFTT_CATEGORIES` constant array with all official categories
- [ ] 2.2 Create `GenderRestriction` type ('M' | 'F' | null)
- [ ] 2.3 Update `Table` model with new columns

## 3. Backend Validation

- [ ] 3.1 Update VineJS table validator with gender_restriction (enum)
- [ ] 3.2 Update VineJS table validator with allowed_categories (array of valid categories)
- [ ] 3.3 Update VineJS table validator with max_checkin_time (time format)
- [ ] 3.4 Add validation rule: allowed_categories values must be in FFTT_CATEGORIES

## 4. Backend Controller

- [ ] 4.1 Update tables controller to handle new fields on create
- [ ] 4.2 Update tables controller to handle new fields on update
- [ ] 4.3 Return effective_checkin_time in API response (calculated if null)

## 5. Registration Eligibility

- [ ] 5.1 Add gender check in registration eligibility logic
- [ ] 5.2 Add category check in registration eligibility logic
- [ ] 5.3 Return specific error codes: `GENDER_RESTRICTED`, `CATEGORY_RESTRICTED`

## 6. Frontend Types

- [ ] 6.1 Add FFTT_CATEGORIES constant to frontend
- [ ] 6.2 Update Zod schema for table with new fields
- [ ] 6.3 Update TypeScript types for TableFormData

## 7. Frontend Form

- [ ] 7.1 Add gender restriction select (Tous / Féminin uniquement / Masculin uniquement)
- [ ] 7.2 Add category checkboxes group with all FFTT categories
- [ ] 7.3 Add max check-in time input with placeholder showing default
- [ ] 7.4 Style category checkboxes in a grid layout

## 8. Frontend Display

- [ ] 8.1 Show gender restriction badge on table cards
- [ ] 8.2 Show allowed categories as tags on table cards
- [ ] 8.3 Show effective check-in time in table details

## 9. Testing

- [ ] 9.1 Test migration runs successfully
- [ ] 9.2 Test gender restriction validation
- [ ] 9.3 Test category restriction validation
- [ ] 9.4 Test registration blocked for wrong gender
- [ ] 9.5 Test registration blocked for wrong category
