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

/**
 * Controleert een **voorstel van een model**: titel, bouwblokken en schema-versie.
 *
 * Bewust géén `id`: dat kent het model niet en de app zet het er zelf op (net als
 * het tijdstip en de status). `valideerPlan` blijft de strengere controle voor
 * bestanden die iemand importeert — die horen wél een id te hebben.
 */
export function valideerVoorstel(data: unknown): { geldig: boolean; fout?: string } {
  if (data === null || typeof data !== 'object') {
    return { geldig: false, fout: 'Het antwoord bevat geen geldig plan.' }
  }
  const p = data as Record<string, unknown>
  if (p.versie !== undefined && p.versie !== PLAN_SCHEMA_VERSIE) {
    return { geldig: false, fout: `Onbekende schema-versie (${String(p.versie)}). Verwacht: ${PLAN_SCHEMA_VERSIE}.` }
  }
  if (typeof p.titel !== 'string' || typeof p.blokken !== 'object' || p.blokken === null) {
    return { geldig: false, fout: 'Het plan mist verplichte velden (titel of blokken).' }
  }
  const b = p.blokken as Record<string, unknown>
  for (const sleutel of ['doelEnTrigger', 'bronnen', 'stappen', 'kwaliteit', 'uitvoering', 'randvoorwaarden']) {
    const blok = b[sleutel]
    if (blok === null || blok === undefined || typeof blok !== 'object') {
      return { geldig: false, fout: `Het plan mist bouwblok "${sleutel}".` }
    }
  }
  return { geldig: true }
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
