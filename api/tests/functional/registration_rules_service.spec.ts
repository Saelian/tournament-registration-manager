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
})
