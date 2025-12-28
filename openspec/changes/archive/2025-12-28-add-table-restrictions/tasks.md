## 1. Database Schema

- [x] 1.1 Create migration adding `gender_restriction` column (VARCHAR nullable, check constraint for 'M'/'F'/NULL)
- [x] 1.2 Create migration adding `allowed_categories` column (JSONB nullable, default NULL)
- [x] 1.3 Create migration adding `max_checkin_time` column (TIME nullable)

## 2. Backend Constants & Types

- [x] 2.1 Create `FFTT_CATEGORIES` constant array with all official categories
- [x] 2.2 Create `GenderRestriction` type ('M' | 'F' | null)
- [x] 2.3 Update `Table` model with new columns

## 3. Backend Validation

- [x] 3.1 Update VineJS table validator with gender_restriction (enum)
- [x] 3.2 Update VineJS table validator with allowed_categories (array of valid categories)
- [x] 3.3 Update VineJS table validator with max_checkin_time (time format)
- [x] 3.4 Add validation rule: allowed_categories values must be in FFTT_CATEGORIES

## 4. Backend Controller

- [x] 4.1 Update tables controller to handle new fields on create
- [x] 4.2 Update tables controller to handle new fields on update
- [x] 4.3 Return effective_checkin_time in API response (calculated if null)

## 5. Registration Eligibility

- [x] 5.1 Add gender check in registration eligibility logic
- [x] 5.2 Add category check in registration eligibility logic
- [x] 5.3 Return specific error codes: `GENDER_RESTRICTED`, `CATEGORY_RESTRICTED`

## 6. Frontend Types

- [x] 6.1 Add FFTT_CATEGORIES constant to frontend
- [x] 6.2 Update Zod schema for table with new fields
- [x] 6.3 Update TypeScript types for TableFormData

## 7. Frontend Form

- [x] 7.1 Add gender restriction select (Tous / Féminin uniquement / Masculin uniquement)
- [x] 7.2 Add category checkboxes group with all FFTT categories
- [x] 7.3 Add max check-in time input with placeholder showing default
- [x] 7.4 Style category checkboxes in a grid layout

## 8. Frontend Display

- [x] 8.1 Show gender restriction badge on table cards
- [x] 8.2 Show allowed categories as tags on table cards
- [x] 8.3 Show effective check-in time in table details

## 9. Testing

- [x] 9.1 Test migration runs successfully
- [x] 9.2 Test gender restriction validation
- [x] 9.3 Test category restriction validation
- [x] 9.4 Test registration blocked for wrong gender
- [x] 9.5 Test registration blocked for wrong category
