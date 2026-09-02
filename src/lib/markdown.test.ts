import { describe, test, expect } from 'vitest'
import { planToMarkdown } from './markdown'
import { maakNieuwPlan } from './plan'
import type { Plan } from './types'

function planMetInhoud(): Plan {
  const plan = maakNieuwPlan('Ochtendbriefing')
  plan.blokken.doelEnTrigger = { doel: 'Dagelijkse samenvatting van mijn inbox', trigger: 'Elke werkdag om 08:00', triggerType: 'schema' }
  plan.blokken.bronnen = { diensten: 'Gmail', data: 'Ongelezen berichten', authenticatie: 'OAuth via omgevingsvariabele' }
  plan.blokken.kwaliteit = { verificatie: 'Log toont berichtaantal', testaanpak: 'Droge run met testaccount' }
  plan.blokken.uitvoering = { omgeving: 'Mac, launchd', planning: 'Werkdagen 08:00', faalafhandeling: 'Notificatie via Telegram' }
  plan.blokken.randvoorwaarden = { privacy: 'Geen data naar derden', randgevallen: 'Geen nieuws: korte melding' }
  plan.blokken.stappen = [{
    nummer: 1,
    omschrijving: 'Haal ongelezen e-mail op',
    invoer: 'IMAP-connectie',
    uitvoer: 'Lijst berichten',
    foutscenario: 'Geen verbinding: sla run over, meld één keer',
  }]
  return plan
}

describe('planToMarkdown', () => {
  test('bevat titel en alle zes blokkoppen', () => {
    const md = planToMarkdown(planMetInhoud())
    expect(md).toContain('# Bouwplan: Ochtendbriefing')
    expect(md).toContain('## 1. Doel & trigger')
    expect(md).toContain('## 2. Bronnen & data')
    expect(md).toContain('## 3. Stappen')
    expect(md).toContain('## 4. Kwaliteit & verificatie')
    expect(md).toContain('## 5. Planning & uitvoering')
    expect(md).toContain('## 6. Randvoorwaarden & privacy')
  })
  test('bevat stappen als genummerde acties met details', () => {
    const md = planToMarkdown(planMetInhoud())
    expect(md).toContain('1. Haal ongelezen e-mail op')
    expect(md).toContain('- Invoer: IMAP-connectie')
    expect(md).toContain('- Uitvoer: Lijst berichten')
    expect(md).toContain('- Foutscenario: Geen verbinding')
  })
  test('is deterministisch', () => {
    expect(planToMarkdown(planMetInhoud())).toBe(planToMarkdown(planMetInhoud()))
  })
  test('lege velden vallen weg in plaats van lege koppen', () => {
    const md = planToMarkdown(maakNieuwPlan('Leeg plan'))
    expect(md).not.toContain('Doel:')
    expect(md).not.toContain('## 2. Bronnen & data')
  })
})
