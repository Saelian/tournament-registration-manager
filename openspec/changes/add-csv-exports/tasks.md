# Tasks: add-csv-exports

## 1. Backend API - Referee Export
- [ ] 1.1 GET /admin/exports/referee - Export for sports software
- [ ] 1.2 Format: License, Last Name, First Name, Points, Club, Sex, Category
- [ ] 1.3 Group by table
- [ ] 1.4 Filter only paid registrations
- [ ] 1.5 Generate CSV file with UTF-8 BOM encoding

## 2. Backend API - Accounting Export
- [ ] 2.1 GET /admin/exports/accounting - Payment export
- [ ] 2.2 Format: Date, Player, Email, Tables, Amount, Payment Method
- [ ] 2.3 Include all payments (online, cash, check)
- [ ] 2.4 Generate CSV file

## 3. Frontend
- [ ] 3.1 Exports page in back-office
- [ ] 3.2 "Download - Referee" button
- [ ] 3.3 "Download - Accounting" button
- [ ] 3.4 Table selector (for filtered Referee export)
- [ ] 3.5 Period selector (for accounting export)

## 4. Export Options
- [ ] 4.1 All tables vs single table export
- [ ] 4.2 Export by day (Saturday, Sunday, all)
- [ ] 4.3 Configurable date format

## 5. Tests
- [ ] 5.1 Test Referee export with real data
- [ ] 5.2 Test import into SPID (if possible)
- [ ] 5.3 Test accounting export