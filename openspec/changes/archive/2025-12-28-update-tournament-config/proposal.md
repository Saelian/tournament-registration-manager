# Change: Restructure Tournament Configuration with Options and Content Fields

## Why

The current `tournaments` table stores `refund_deadline` and `waitlist_timer_hours` directly as columns. As the application evolves, adding more configuration options will clutter the table schema. Additionally, tournaments need descriptive content (descriptions, rules, FFTT homologation link) to provide participants with essential information.

## What Changes

- **BREAKING**: Move `refund_deadline` and `waitlist_timer_hours` into a JSONB `options` column for extensibility
- Add `short_description` field (plain text, max 500 chars) for brief tournament summary
- Add `long_description` field (markdown, TEXT) for detailed tournament information
- Add `rules_link` field (URL) for external rules document
- Add `rules_content` field (markdown, TEXT) for inline rules content
- Add `fftt_homologation_link` field (URL) for FFTT tournament homologation page
- Add `react-markdown` dependency for frontend markdown rendering

## Impact

- Affected specs: `tournament-config`
- Affected code:
  - `api/app/models/tournament.ts` - Model restructuring
  - `api/database/migrations/` - New migration for schema changes
  - `api/app/controllers/admin/tournament_controller.ts` - API handling
  - `web/src/features/tournament/` - Form and display components
  - `web/src/features/tournament/types.ts` - TypeScript types
