import { describe, test, expect } from 'vitest'
import { parseerImport, exportPlanAlsJson } from './export'
import { maakNieuwPlan } from './plan'

describe('export/import round-trip', () => {
  test('export → import geeft hetzelfde plan terug', () => {
    const plan = maakNieuwPlan('Roundtrip')
    const json = exportPlanAlsJson(plan)
    const r = parseerImport(json)
    expect(r.geldig).toBe(true)
    expect(r.plan!.titel).toBe('Roundtrip')
    expect(r.plan!.id).toBe(plan.id)
  })
  test('kapotte JSON geeft nette foutmelding', () => {
    const r = parseerImport('{"versie": 1, kapoot')
    expect(r.geldig).toBe(false)
    expect(r.fout).toBeDefined()
  })
  test('onbekende versie wordt geweigerd', () => {
    const r = parseerImport('{"versie": 99}')
    expect(r.geldig).toBe(false)
  })
})
