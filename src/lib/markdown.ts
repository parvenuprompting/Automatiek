import type { Plan } from './types'

function regel(label: string, waarde: string): string | null {
  const v = waarde.trim()
  return v ? `${label}: ${v}` : null
}

function lijst(regels: (string | null)[]): string {
  return regels.filter((r): r is string => r !== null).map((r) => `- ${r}`).join('\n')
}

/** Geeft "## kop\n- regels" of null als er geen regels zijn (sectie valt weg). */
function sectie(kop: string, regels: (string | null)[]): string | null {
  const l = lijst(regels)
  return l ? `## ${kop}\n${l}` : null
}

const TRIGGER_LABELS: Record<string, string> = {
  schema: 'Vast schema (cron)',
  webhook: 'Webhook (event-gedreven)',
  handmatig: 'Handmatig starten',
  event: 'Event bij een dienst',
}

export function planToMarkdown(plan: Plan): string {
  const b = plan.blokken
  const delen: (string | null)[] = []

  delen.push(`# Bouwplan: ${plan.titel}`)
  delen.push(`_Status: ${plan.status === 'klaar' ? 'klaar voor bouw' : 'concept'} · Schema-versie ${plan.versie}_`)

  delen.push(sectie('1. Doel & trigger', [
    regel('Doel', b.doelEnTrigger.doel),
    regel('Trigger', b.doelEnTrigger.trigger),
    regel('Triggertype', TRIGGER_LABELS[b.doelEnTrigger.triggerType] ?? b.doelEnTrigger.triggerType),
  ]))

  delen.push(sectie('2. Bronnen & data', [
    regel('Diensten', b.bronnen.diensten),
    regel('Data', b.bronnen.data),
    regel('Authenticatie', b.bronnen.authenticatie),
  ]))

  if (b.stappen.length > 0) {
    const stappen = b.stappen.map((s) => {
      const detail = lijst([
        regel('Invoer', s.invoer),
        regel('Uitvoer', s.uitvoer),
        regel('Foutscenario', s.foutscenario),
      ])
      return detail
        ? `${s.nummer}. ${s.omschrijving}\n${detail.split('\n').map((l) => `   ${l}`).join('\n')}`
        : `${s.nummer}. ${s.omschrijving}`
    })
    delen.push(`## 3. Stappen\n${stappen.join('\n')}`)
  }

  delen.push(sectie('4. Kwaliteit & verificatie', [
    regel('Verificatie', b.kwaliteit.verificatie),
    regel('Testaanpak', b.kwaliteit.testaanpak),
  ]))

  delen.push(sectie('5. Planning & uitvoering', [
    regel('Omgeving', b.uitvoering.omgeving),
    regel('Planning', b.uitvoering.planning),
    regel('Faalafhandeling', b.uitvoering.faalafhandeling),
  ]))

  delen.push(sectie('6. Randvoorwaarden & privacy', [
    regel('Privacy', b.randvoorwaarden.privacy),
    regel('Randgevallen', b.randvoorwaarden.randgevallen),
  ]))

  delen.push('_Agent: bouw en test dit plan volgens de bovenstaande specificatie; stel bij onduidelijkheden vragen vóór implementatie._')

  return delen.filter((d): d is string => d !== null).join('\n\n') + '\n'
}
