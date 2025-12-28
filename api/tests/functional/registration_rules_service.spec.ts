import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import registrationRulesService from '#services/registration_rules_service'
import Table from '#models/table'
import Player from '#models/player'

test.group('Registration Rules Service', () => {

  test('getEligibleTables: filters by points', async ({ assert }) => {
    const player = new Player()
    player.points = 1000

    const t1 = new Table()
    t1.pointsMin = 500
    t1.pointsMax = 900
    t1.name = 'Low'
    
    const t2 = new Table()
    t2.pointsMin = 1100
    t2.pointsMax = 1500
    t2.name = 'High'
    
    const t3 = new Table()
    t3.pointsMin = 500
    t3.pointsMax = 1500
    t3.name = 'Ok'

    const res = await registrationRulesService.getEligibleTables(player, [t1, t2, t3])

    assert.lengthOf(res, 3)
    assert.isFalse(res[0].isEligible)
    assert.include(res[0].reasons, 'POINTS_TOO_HIGH')
    assert.isFalse(res[1].isEligible)
    assert.include(res[1].reasons, 'POINTS_TOO_LOW')
    assert.isTrue(res[2].isEligible)
  })

  test('checkDailyLimit: max 2 tables per day', ({ assert }) => {
    const date = DateTime.fromISO('2025-01-01')
    
    const t1 = new Table()
    t1.date = date; t1.isSpecial = false
    
    const t2 = new Table()
    t2.date = date; t2.isSpecial = false
    
    const t3 = new Table()
    t3.date = date; t3.isSpecial = false

    const res = registrationRulesService.checkDailyLimit([t1, t2, t3], [])
    assert.isFalse(res.valid)
  })

  test('checkDailyLimit: special tables do not count', ({ assert }) => {
    const date = DateTime.fromISO('2025-01-01')
    
    const t1 = new Table()
    t1.date = date; t1.isSpecial = false
    
    const t2 = new Table()
    t2.date = date; t2.isSpecial = false
    
    const t3 = new Table()
    t3.date = date; t3.isSpecial = true

    const res = registrationRulesService.checkDailyLimit([t1, t2, t3], [])
    assert.isTrue(res.valid)
  })

  test('checkTimeConflicts: detects same start time', ({ assert }) => {
    const date = DateTime.fromISO('2025-01-01')

    const t1 = new Table()
    t1.date = date; t1.startTime = '10:00'

    const t2 = new Table()
    t2.date = date; t2.startTime = '10:00'

    const res = registrationRulesService.checkTimeConflicts([t1, t2], [])
    assert.isFalse(res.valid)
  })

  test('checkTimeConflicts: allows different start times', ({ assert }) => {
    const date = DateTime.fromISO('2025-01-01')

    const t1 = new Table()
    t1.date = date; t1.startTime = '10:00'

    const t2 = new Table()
    t2.date = date; t2.startTime = '14:00'

    const res = registrationRulesService.checkTimeConflicts([t1, t2], [])
    assert.isTrue(res.valid)
  })

  test('checkDailyLimit: allows 2 tables on different days', ({ assert }) => {
    const day1 = DateTime.fromISO('2025-01-01')
    const day2 = DateTime.fromISO('2025-01-02')

    const t1 = new Table()
    t1.date = day1; t1.isSpecial = false

    const t2 = new Table()
    t2.date = day1; t2.isSpecial = false

    const t3 = new Table()
    t3.date = day2; t3.isSpecial = false

    const t4 = new Table()
    t4.date = day2; t4.isSpecial = false

    const res = registrationRulesService.checkDailyLimit([t1, t2, t3, t4], [])
    assert.isTrue(res.valid)
  })

  test('checkDailyLimit: considers existing registrations', ({ assert }) => {
    const date = DateTime.fromISO('2025-01-01')

    const existingTable = new Table()
    existingTable.date = date; existingTable.isSpecial = false

    const newTable1 = new Table()
    newTable1.date = date; newTable1.isSpecial = false

    const newTable2 = new Table()
    newTable2.date = date; newTable2.isSpecial = false

    // Simulate existing registration with preloaded table
    const existingReg = { table: existingTable } as any

    const res = registrationRulesService.checkDailyLimit([newTable1, newTable2], [existingReg])
    assert.isFalse(res.valid)
  })

  test('checkTimeConflicts: considers existing registrations', ({ assert }) => {
    const date = DateTime.fromISO('2025-01-01')

    const existingTable = new Table()
    existingTable.date = date; existingTable.startTime = '10:00'

    const newTable = new Table()
    newTable.date = date; newTable.startTime = '10:00'

    // Simulate existing registration with preloaded table
    const existingReg = { table: existingTable } as any

    const res = registrationRulesService.checkTimeConflicts([newTable], [existingReg])
    assert.isFalse(res.valid)
  })

  test('getEligibleTables: player exactly at boundary points', async ({ assert }) => {
    const player = new Player()
    player.points = 1000

    const table = new Table()
    table.pointsMin = 1000
    table.pointsMax = 1000
    table.name = 'Exact'

    const res = await registrationRulesService.getEligibleTables(player, [table])

    assert.lengthOf(res, 1)
    assert.isTrue(res[0].isEligible)
  })
})
