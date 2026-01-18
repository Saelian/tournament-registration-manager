import { test } from '@japa/runner'
import csvImportService from '#services/csv_import_service'

test.group('CSV Import Service', () => {
  test('successfully parses semicolon separated csv', ({ assert }) => {
    const csv = `name;referenceLetter;date;startTime;pointsMin;pointsMax;quota;price;isSpecial;nonNumberedOnly;genderRestriction;allowedCategories;maxCheckinTime
Tableau A;A;2026-05-16;09:00;500;699;30;8.00;false;false;;;`

    const rows = csvImportService.parse(csv)

    assert.lengthOf(rows, 1)

    // Check keys of the first row
    assert.property(rows[0], 'name')
    assert.equal(rows[0].name, 'Tableau A')
    assert.equal(rows[0].pointsMin, '500')
    assert.equal(rows[0].price, '8.00')

    // Validation should succeed
    const validated = csvImportService.validateRow(rows[0], 1)

    if (validated.errors.length > 0) {
      console.log(validated.errors)
    }
    assert.isTrue(validated.isValid)
  })

  test('successfully parses comma separated csv', ({ assert }) => {
    const csv = `name,referenceLetter,date,startTime,pointsMin,pointsMax,quota,price,isSpecial,nonNumberedOnly,genderRestriction,allowedCategories,maxCheckinTime
Tableau A,A,2026-05-16,09:00,500,699,30,8.00,false,false,,,`
    const rows = csvImportService.parse(csv)
    assert.equal(rows[0].name, 'Tableau A')
    const validated = csvImportService.validateRow(rows[0], 1)
    assert.isTrue(validated.isValid)
  })
})
