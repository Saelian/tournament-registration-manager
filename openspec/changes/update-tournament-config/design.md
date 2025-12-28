## Context

The tournament configuration needs to be extended with new fields and restructured for future extensibility. Current implementation has options (`refund_deadline`, `waitlist_timer_hours`) as direct columns, which doesn't scale well.

**Stakeholders**: Admin users who configure tournaments, participants who view tournament information.

## Goals / Non-Goals

**Goals**:
- Create an extensible options system using JSONB
- Add descriptive content fields (descriptions, rules, FFTT link)
- Render markdown content safely on frontend
- Maintain backward compatibility during migration

**Non-Goals**:
- Full WYSIWYG editor (simple textarea with markdown preview is sufficient)
- Rich media embedding in markdown (only basic formatting)
- Multi-language support for descriptions

## Decisions

### Decision 1: Use JSONB column for options
- **What**: Store `refund_deadline` and `waitlist_timer_hours` in a `options` JSONB column
- **Why**: JSONB allows adding new options without migrations, supports indexing, and PostgreSQL handles it natively
- **Alternatives considered**:
  - Separate `tournament_options` table with key-value: More complex queries, harder typing
  - Keep adding columns: Doesn't scale, clutters schema

### Decision 2: Keep content fields as separate columns
- **What**: `short_description`, `long_description`, `rules_content`, `rules_link`, `fftt_homologation_link` as dedicated TEXT/VARCHAR columns
- **Why**: These are core content fields, not optional settings. Dedicated columns provide better type safety and query performance
- **Alternatives considered**:
  - Store in options JSONB: Loses benefits of dedicated typing and makes queries harder

### Decision 3: Use react-markdown for rendering
- **What**: Add `react-markdown` with `remark-gfm` for GitHub-flavored markdown
- **Why**: Industry standard, good security defaults (sanitizes HTML), supports GFM tables and task lists
- **Alternatives considered**:
  - marked.js: Requires manual sanitization
  - MDX: Overkill for simple content display

### Decision 4: Options TypeScript interface
- **What**: Define `TournamentOptions` interface with all option fields typed
- **Why**: Type safety in both backend (VineJS) and frontend (Zod)

```typescript
interface TournamentOptions {
  refundDeadline: string | null  // ISO date string
  waitlistTimerHours: number     // Default: 4
}
```

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Migration breaks existing data | Migration script converts existing columns to JSONB structure |
| JSONB validation less strict | VineJS validates options shape on write |
| Markdown XSS | react-markdown sanitizes by default, no `dangerouslySetInnerHTML` |

## Migration Plan

1. Create migration adding new columns (`options` JSONB, content fields)
2. Populate `options` from existing `refund_deadline` and `waitlist_timer_hours` values
3. Drop old columns in same migration (single transaction)
4. Update model, controller, and frontend types
5. Add markdown rendering component

**Rollback**: Revert migration (PostgreSQL transaction ensures atomicity)

## Open Questions

None - requirements are clear.
