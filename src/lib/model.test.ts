import { describe, test, expect, beforeEach } from 'vitest'
import {
  leesLeverancier,
  zetLeverancier,
  leesLokaalBasis,
  zetLokaalBasis,
  leesLokaalModel,
  zetLokaalModel,
  LOKAAL_BASIS_STANDAARD,
  LOKAAL_MODEL_STANDAARD,
  LOKAAL_NUM_CTX,
} from './model'

beforeEach(() => {
  localStorage.clear()
})

describe('leverancier', () => {
  test('standaard is het lokale model', () => {
    expect(leesLeverancier()).toBe('lokaal')
  })

  test('openrouter wordt bewaard en teruggelezen', () => {
    zetLeverancier('openrouter')
    expect(leesLeverancier()).toBe('openrouter')
    zetLeverancier('lokaal')
    expect(leesLeverancier()).toBe('lokaal')
  })
})

describe('lokaal serveradres en model', () => {
  test('zonder instelling gelden de standaardwaarden', () => {
    expect(leesLokaalBasis()).toBe(LOKAAL_BASIS_STANDAARD)
    expect(leesLokaalModel()).toBe(LOKAAL_MODEL_STANDAARD)
  })

  test('een eigen adres wordt bewaard, met trailing slash eraf', () => {
    zetLokaalBasis('http://127.0.0.1:11434///')
    expect(leesLokaalBasis()).toBe('http://127.0.0.1:11434')
  })

  test('een eigen modelnaam wordt bewaard', () => {
    zetLokaalModel('   qwen2.5-coder:7b  ')
    expect(leesLokaalModel()).toBe('qwen2.5-coder:7b')
  })

  test('een lege waarde laat de standaard staan', () => {
    zetLokaalBasis('   ')
    zetLokaalModel('')
    expect(leesLokaalBasis()).toBe(LOKAAL_BASIS_STANDAARD)
    expect(leesLokaalModel()).toBe(LOKAAL_MODEL_STANDAARD)
  })

  test('het contextvenster blijft begrensd op 65.536', () => {
    expect(LOKAAL_NUM_CTX).toBe(65536)
  })
})
