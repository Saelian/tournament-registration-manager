## 1. Database Schema

- [ ] 1.1 Create migration to add `options` JSONB column with default `{}`
- [ ] 1.2 Create migration to add content columns (`short_description`, `long_description`, `rules_link`, `rules_content`, `fftt_homologation_link`)
- [ ] 1.3 Migrate existing `refund_deadline` and `waitlist_timer_hours` data into `options` JSONB
- [ ] 1.4 Drop old `refund_deadline` and `waitlist_timer_hours` columns

## 2. Backend Model & Validation

- [ ] 2.1 Update `Tournament` model with new columns and `options` JSONB typing
- [ ] 2.2 Create `TournamentOptions` interface/type
- [ ] 2.3 Update VineJS validator for tournament update with new fields and options structure
- [ ] 2.4 Update tournament controller to handle options object

## 3. API Response

- [ ] 3.1 Ensure GET /admin/tournament returns flattened options (backward compatible) or nested options object
- [ ] 3.2 Ensure PUT /admin/tournament accepts new structure
- [ ] 3.3 Add validation for URL fields (rules_link, fftt_homologation_link)

## 4. Frontend Types & API

- [ ] 4.1 Update Zod schema for tournament with new fields
- [ ] 4.2 Update TypeScript types for `TournamentFormData`
- [ ] 4.3 Update API hooks if needed

## 5. Frontend Markdown Support

- [ ] 5.1 Install `react-markdown` and `remark-gfm` packages
- [ ] 5.2 Create `MarkdownRenderer` component in `src/components/ui/`
- [ ] 5.3 Style markdown output with Tailwind prose classes

## 6. Tournament Form

- [ ] 6.1 Add short description field (Input, max 500 chars with counter)
- [ ] 6.2 Add long description field (Textarea with markdown preview)
- [ ] 6.3 Add rules link field (Input type URL)
- [ ] 6.4 Add rules content field (large Textarea with markdown preview)
- [ ] 6.5 Add FFTT homologation link field (Input type URL)
- [ ] 6.6 Group options fields (refund deadline, waitlist timer) in dedicated section

## 7. Tournament Display

- [ ] 7.1 Display short description in tournament summary views
- [ ] 7.2 Render long description with MarkdownRenderer
- [ ] 7.3 Display rules link as clickable button/link
- [ ] 7.4 Render rules content with MarkdownRenderer (collapsible or separate section)
- [ ] 7.5 Display FFTT homologation link

## 8. Testing

- [ ] 8.1 Test migration runs successfully
- [ ] 8.2 Test API validates new fields correctly
- [ ] 8.3 Test markdown rendering with various content
