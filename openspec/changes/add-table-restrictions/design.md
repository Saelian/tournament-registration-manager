## Context

Tables need additional eligibility restrictions beyond points range. FFTT tournaments commonly have women-only tables and youth-category tables. Check-in time management is critical for tournament day operations.

**Stakeholders**: Admins configuring tables, players registering, check-in staff on tournament day.

## Goals / Non-Goals

**Goals**:
- Allow gender-based table restrictions (women-only, men-only, or open)
- Allow age category restrictions using official FFTT categories
- Configure maximum check-in time per table
- Enforce restrictions during registration

**Non-Goals**:
- Automatic category detection from birth date (FFTT provides this)
- Complex combination rules (e.g., "women OR juniors")

## Decisions

### Decision 1: Gender restriction as nullable enum
- **What**: `gender_restriction` column with values NULL, 'M', 'F'
- **Why**: Simple, maps directly to FFTT `sex` field ('M' | 'F')
- **Alternatives considered**:
  - Boolean `women_only`: Doesn't allow men-only tables
  - JSONB: Overkill for 3 states

### Decision 2: Categories as JSONB array
- **What**: `allowed_categories` as JSONB array of category strings
- **Why**: Flexible selection of multiple categories, easy to query with PostgreSQL `?|` operator
- **Alternatives considered**:
  - Bitmask integer: Less readable, harder to extend
  - Separate join table: Overkill for simple list

### Decision 3: Official FFTT categories
- **What**: Use standard FFTT age categories as constants

```typescript
const FFTT_CATEGORIES = [
  'Poussin',    // < 9 years
  'Benjamin',   // < 11 years
  'Minime',     // < 13 years
  'Cadet',      // < 15 years
  'Junior',     // < 18 years
  'Senior',     // 18-39 years
  'Vétéran 1',  // 40-44 years
  'Vétéran 2',  // 45-49 years
  'Vétéran 3',  // 50-54 years
  'Vétéran 4',  // 55-59 years
  'Vétéran 5',  // 60+ years
] as const
```

### Decision 4: Check-in time with calculated default
- **What**: `max_checkin_time` as TIME column, nullable
- **Why**: When NULL, default is calculated as `start_time - 30 minutes`
- **Display**: Show calculated time in UI when field is empty

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Category names may vary from FFTT API | Normalize on storage, use fuzzy matching if needed |
| NULL allowed_categories = all categories | Document clearly, validate in registration service |
| Time calculation edge case (midnight) | Handle in service layer, rare for tournaments |

## Migration Plan

1. Add nullable columns to `tables` table
2. Existing tables get NULL values (no restrictions, default check-in)
3. Update model and controller
4. Add UI form fields
5. Update registration eligibility checks

**Rollback**: Drop new columns (no data loss, restrictions removed)

## Open Questions

None - requirements are clear.
