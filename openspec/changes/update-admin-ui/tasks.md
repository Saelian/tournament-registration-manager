## 1. Card Component

- [x] 1.1 Install Card component from neobrutalism.dev CLI or copy source
- [x] 1.2 Create `web/src/components/ui/card.tsx` with Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- [x] 1.3 Ensure Card uses neo-brutal styling (border-2, shadow offset)

## 2. Refactor Tournament Config Page

- [x] 2.1 Replace hardcoded card divs with Card component in view mode
- [x] 2.2 Wrap edit form in Card component
- [x] 2.3 Import and integrate TableList component below tournament config

## 3. Extract TableList Component

- [x] 3.1 Create `TableList` component from TableListPage logic
- [x] 3.2 Replace hardcoded card styling in table items with Card component
- [x] 3.3 Keep TableForm as separate full-page component

## 4. Update Admin Navigation

- [x] 4.1 Remove "Tableaux" NavLink from AdminLayout
- [x] 4.2 Rename "Tournoi" to "Gestion" or keep as "Tournoi"

## 5. Update Routing

- [x] 5.1 Remove `/admin/tables` route from App.tsx
- [x] 5.2 Update redirect to point to `/admin/tournament`

## 6. Page Layout Adjustments

- [x] 6.1 Add section separator between tournament config and tables list
- [x] 6.2 Ensure responsive layout works with combined content
- [x] 6.3 Add "Tableaux" section header with create button

## 7. Testing

- [x] 7.1 Verify tournament config displays correctly
- [x] 7.2 Verify tables list displays below config
- [x] 7.3 Verify table CRUD operations still work
- [x] 7.4 Verify navigation no longer shows Tableaux tab
- [x] 7.5 Verify Card component styling matches existing design
