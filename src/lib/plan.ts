import type { Plan } from './types'

export const PLAN_SCHEMA_VERSIE = 1

export function maakNieuwPlan(titel: string): Plan {
  const nu = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    versie: PLAN_SCHEMA_VERSIE,
    titel,
    status: 'concept',
    aangemaakt: nu,
    gewijzigd: nu,
    blokken: {
      doelEnTrigger: { doel: '', trigger: '', triggerType: 'schema' },
      bronnen: { diensten: '', data: '', authenticatie: '' },
      stappen: [],
      kwaliteit: { verificatie: '', testaanpak: '' },
      uitvoering: { omgeving: '', planning: '', faalafhandeling: '' },
      randvoorwaarden: { privacy: '', randgevallen: '' },
    },
  }
}

export function valideerPlan(data: unknown): { geldig: boolean; fout?: string } {
  if (data === null || typeof data !== 'object') {
    return { geldig: false, fout: 'Dit bestand bevat geen geldig plan.' }
  }
  const p = data as Record<string, unknown>
  if (p.versie !== PLAN_SCHEMA_VERSIE) {
    return { geldig: false, fout: `Onbekende schema-versie (${String(p.versie)}). Verwacht: ${PLAN_SCHEMA_VERSIE}.` }
  }
  if (typeof p.id !== 'string' || typeof p.titel !== 'string' || typeof p.blokken !== 'object' || p.blokken === null) {
    return { geldig: false, fout: 'Het plan mist verplichte velden (id, titel of blokken).' }
  }
  const b = p.blokken as Record<string, unknown>
  for (const sleutel of ['doelEnTrigger', 'bronnen', 'stappen', 'kwaliteit', 'uitvoering', 'randvoorwaarden']) {
    if (!(sleutel in b)) {
      return { geldig: false, fout: `Het plan mist bouwblok "${sleutel}".` }
    }
  }
  return { geldig: true }
}
