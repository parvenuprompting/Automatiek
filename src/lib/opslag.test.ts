import { describe, test, expect, beforeEach } from 'vitest'
import { laadPlannen, slaPlannenOp, opslagBeschikbaar } from './opslag'
import { maakNieuwPlan } from './plan'

beforeEach(() => localStorage.clear())

describe('opslag', () => {
  test('slaat op en laadt terug', () => {
    const plan = maakNieuwPlan('Test')
    slaPlannenOp([plan])
    expect(laadPlannen()[0].titel).toBe('Test')
  })
  test('lege opslag geeft lege lijst', () => {
    expect(laadPlannen()).toEqual([])
  })
  test('corrupte opslag geeft lege lijst, geen crash', () => {
    localStorage.setItem('automatiek:plannen', 'geen-json')
    expect(laadPlannen()).toEqual([])
  })
  test('opslagBeschikbaar', () => {
    expect(opslagBeschikbaar()).toBe(true)
  })
})
