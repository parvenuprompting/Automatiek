import type { Plan } from './types'
import { valideerPlan } from './plan'
import { planToMarkdown } from './markdown'

export function exportPlanAlsJson(plan: Plan): string {
  return JSON.stringify(plan, null, 2)
}

export function exportPlanAlsMarkdown(plan: Plan): string {
  return planToMarkdown(plan)
}

export function parseerImport(json: string): { geldig: boolean; plan?: Plan; fout?: string } {
  let data: unknown
  try {
    data = JSON.parse(json)
  } catch {
    return { geldig: false, fout: 'Dit bestand is geen geldige JSON.' }
  }
  const v = valideerPlan(data)
  if (!v.geldig) return { geldig: false, fout: v.fout }
  return { geldig: true, plan: data as Plan }
}

export function download(bestandsnaam: string, inhoud: string): void {
  const blob = new Blob([inhoud], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = bestandsnaam
  a.click()
  URL.revokeObjectURL(url)
}

export function slug(titel: string): string {
  return (
    titel
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'plan'
  )
}
