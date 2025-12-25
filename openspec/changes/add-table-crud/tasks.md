# Tasks: add-table-crud

## 1. Data Model
- [ ] 1.1 Create Table model
- [ ] 1.2 Create migration (name, date, start_time, points_min, points_max, quota, price, is_special, tournament_id)
- [ ] 1.3 Define Table belongsTo Tournament relation
- [ ] 1.4 Add VineJS validations

## 2. Backend API
- [ ] 2.1 Create TablesController
- [ ] 2.2 GET /admin/tables - List all tables
- [ ] 2.3 GET /admin/tables/:id - Retrieve a table
- [ ] 2.4 POST /admin/tables - Create a table
- [ ] 2.5 PUT /admin/tables/:id - Modify a table
- [ ] 2.6 DELETE /admin/tables/:id - Delete a table
- [ ] 2.7 Add registered count (registered_count)

## 3. Admin Frontend
- [ ] 3.1 Create table list page
- [ ] 3.2 Create creation/edition form
- [ ] 3.3 Add "Special Table" switch
- [ ] 3.4 Display progress bar (places used)
- [ ] 3.5 TanStack Query integration

## 4. Tests
- [ ] 4.1 Test complete CRUD
- [ ] 4.2 Test validations (points_min <= points_max, etc.)
- [ ] 4.3 Test deletion with existing registrations