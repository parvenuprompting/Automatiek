import { describe, test, expect } from 'vitest'
import { maakNieuwPlan, valideerPlan } from './plan'

describe('maakNieuwPlan', () => {
  test('maakt een leeg plan met zes blokken en juiste defaults', () => {
    const plan = maakNieuwPlan('Morgen briefing')
    expect(plan.titel).toBe('Morgen briefing')
    expect(plan.status).toBe('concept')
    expect(plan.versie).toBe(1)
    expect(plan.id).toMatch(/^[\w-]+$/)
    expect(plan.blokken.stappen).toEqual([])
    expect(plan.blokken.doelEnTrigger.triggerType).toBe('schema')
  })
})

describe('valideerPlan', () => {
  test('accepteert een geldig plan', () => {
    const plan = maakNieuwPlan('Test')
    expect(valideerPlan(plan)).toEqual({ geldig: true })
  })
  test('verwerpt object zonder versieveld', () => {
    const plan = maakNieuwPlan('Test')
    const kopie: Record<string, unknown> = { ...plan }
    delete kopie.versie
    const r = valideerPlan(kopie)
    expect(r.geldig).toBe(false)
    expect(r.fout).toBeDefined()
  })
  test('verwerpt een onbekende schema-versie', () => {
    const plan = { ...maakNieuwPlan('Test'), versie: 99 }
    expect(valideerPlan(plan).geldig).toBe(false)
  })
  test('verwerpt null en non-objecten', () => {
    expect(valideerPlan(null).geldig).toBe(false)
    expect(valideerPlan('string').geldig).toBe(false)
  })
})
