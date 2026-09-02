import type { Plan } from './types'

const SLEUTEL = 'automatiek:plannen'

export function opslagBeschikbaar(): boolean {
  try {
    const t = '__automatiek_test__'
    localStorage.setItem(t, t)
    localStorage.removeItem(t)
    return true
  } catch {
    return false
  }
}

export function slaPlannenOp(plannen: Plan[]): void {
  localStorage.setItem(SLEUTEL, JSON.stringify(plannen))
}

export function laadPlannen(): Plan[] {
  try {
    const raw = localStorage.getItem(SLEUTEL)
    if (!raw) return []
    return JSON.parse(raw) as Plan[]
  } catch {
    return []
  }
}
