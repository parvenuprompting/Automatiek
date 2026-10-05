import { describe, test, expect } from 'vitest'
import { maakNieuwPlan, valideerPlan, valideerVoorstel } from './plan'

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

describe('valideerVoorstel (antwoord van een model)', () => {
  const voorstel = {
    versie: 1,
    titel: 'Voorstel van het model',
    blokken: {
      doelEnTrigger: { doel: 'x', trigger: 'y', triggerType: 'schema' },
      bronnen: { diensten: '', data: '', authenticatie: '' },
      stappen: [{ nummer: 1, omschrijving: '', invoer: '', uitvoer: '', foutscenario: '' }],
      kwaliteit: { verificatie: '', testaanpak: '' },
      uitvoering: { omgeving: '', planning: '', faalafhandeling: '' },
      randvoorwaarden: { privacy: '', randgevallen: '' },
    },
  }

  test('een voorstel zonder id is geldig — de app vult de administratie zelf', () => {
    expect(valideerVoorstel(voorstel)).toEqual({ geldig: true })
  })

  test('een ontbrekend bouwblok wordt gemeld', () => {
    const zonder = { ...voorstel, blokken: { ...voorstel.blokken, uitvoering: undefined } }
    const r = valideerVoorstel(zonder)
    expect(r.geldig).toBe(false)
    expect(r.fout).toContain('uitvoering')
  })

  test('zonder titel of blokken is het ongeldig', () => {
    expect(valideerVoorstel({ versie: 1, blokken: voorstel.blokken }).geldig).toBe(false)
    expect(valideerVoorstel({ versie: 1, titel: 'x' }).geldig).toBe(false)
    expect(valideerVoorstel(null).geldig).toBe(false)
  })

  test('een andere schema-versie wordt geweigerd', () => {
    expect(valideerVoorstel({ ...voorstel, versie: 99 }).geldig).toBe(false)
  })
})
