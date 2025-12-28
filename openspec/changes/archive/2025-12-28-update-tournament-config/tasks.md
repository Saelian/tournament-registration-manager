## 1. Database Schema

- [x] 1.1 Create migration to add `options` JSONB column with default `{}`
- [x] 1.2 Create migration to add content columns (`short_description`, `long_description`, `rules_link`, `rules_content`, `fftt_homologation_link`)
- [x] 1.3 Migrate existing `refund_deadline` and `waitlist_timer_hours` data into `options` JSONB
- [x] 1.4 Drop old `refund_deadline` and `waitlist_timer_hours` columns

## 2. Backend Model & Validation

- [x] 2.1 Update `Tournament` model with new columns and `options` JSONB typing
- [x] 2.2 Create `TournamentOptions` interface/type
- [x] 2.3 Update VineJS validator for tournament update with new fields and options structure
- [x] 2.4 Update tournament controller to handle options object

## 3. API Response

- [x] 3.1 Ensure GET /admin/tournament returns flattened options (backward compatible) or nested options object
- [x] 3.2 Ensure PUT /admin/tournament accepts new structure
- [x] 3.3 Add validation for URL fields (rules_link, fftt_homologation_link)

## 4. Frontend Types & API

- [x] 4.1 Update Zod schema for tournament with new fields
- [x] 4.2 Update TypeScript types for `TournamentFormData`
- [x] 4.3 Update API hooks if needed

## 5. Frontend Markdown Support

- [x] 5.1 Install `react-markdown` and `remark-gfm` packages
- [x] 5.2 Create `MarkdownRenderer` component in `src/components/ui/`
- [x] 5.3 Style markdown output with Tailwind prose classes

## 6. Tournament Form

- [x] 6.1 Add short description field (Input, max 500 chars with counter)
- [x] 6.2 Add long description field (Textarea with markdown preview)
- [x] 6.3 Add rules link field (Input type URL)
- [x] 6.4 Add rules content field (large Textarea with markdown preview)
- [x] 6.5 Add FFTT homologation link field (Input type URL)
- [x] 6.6 Group options fields (refund deadline, waitlist timer) in dedicated section

## 7. Tournament Display

- [x] 7.1 Display short description in tournament summary views
- [x] 7.2 Render long description with MarkdownRenderer
- [x] 7.3 Display rules link as clickable button/link
- [x] 7.4 Render rules content with MarkdownRenderer (collapsible or separate section)
- [x] 7.5 Display FFTT homologation link

## 8. Testing

- [x] 8.1 Test migration runs successfully
- [x] 8.2 Test API validates new fields correctly
- [x] 8.3 Test markdown rendering with various content
