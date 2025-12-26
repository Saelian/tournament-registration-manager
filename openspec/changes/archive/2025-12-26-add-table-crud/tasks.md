# Tasks: add-table-crud

## 1. Data Model
- [x] 1.1 Create Table model
- [x] 1.2 Create migration (name, date, start_time, points_min, points_max, quota, price, is_special, tournament_id)
- [x] 1.3 Define Table belongsTo Tournament relation
- [x] 1.4 Add VineJS validations

## 2. Backend API
- [x] 2.1 Create TablesController
- [x] 2.2 GET /admin/tables - List all tables
- [x] 2.3 GET /admin/tables/:id - Retrieve a table
- [x] 2.4 POST /admin/tables - Create a table
- [x] 2.5 PUT /admin/tables/:id - Modify a table
- [x] 2.6 DELETE /admin/tables/:id - Delete a table
- [x] 2.7 Add registered count (registered_count) (Mocked as 0 for now)

## 3. Admin Frontend
- [x] 3.1 Create table list page
- [x] 3.2 Create creation/edition form
- [x] 3.3 Add "Special Table" switch
- [x] 3.4 Display progress bar (places used)
- [x] 3.5 TanStack Query integration

## 4. Non-auth user Frontend
- [x] 4.1 Create Tournament list page
- [x] 4.2 Create Table list page for a given tournament

## 5. Tests
- [x] 5.1 Test complete CRUD
- [x] 5.2 Test validations (points_min <= points_max, etc.)
- [x] 5.3 Test deletion with existing registrations (N/A - Registrations not implemented yet)
