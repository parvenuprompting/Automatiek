import type { Plan } from './types'
import { valideerVoorstel, PLAN_SCHEMA_VERSIE } from './plan'
import { leesLeverancier, leesLokaalBasis, leesLokaalModel, LOKAAL_NUM_CTX } from './model'

const SLEUTEL_OPSLAG = 'automatiek:openrouter-key'
const EINDPUNT = 'https://openrouter.ai/api/v1/chat/completions'
const MODEL = 'z-ai/glm-5.3'

export function leesSleutel(): string | null {
  try {
    return localStorage.getItem(SLEUTEL_OPSLAG)
  } catch {
    return null
  }
}

export function opslaanSleutel(sleutel: string): void {
  localStorage.setItem(SLEUTEL_OPSLAG, sleutel)
}

export function wisSleutel(): void {
  localStorage.removeItem(SLEUTEL_OPSLAG)
}

const SYSTEEMPROMPT = `Je bent een automation-architect. Zet het idee van de gebruiker om in een volledig bouwplan voor een automation.

Antwoord ÚÍTSLUITEND met een JSON-object volgens dit exacte schema — geen tekst eromheen, geen markdown, geen uitleg:

{
  "versie": ${PLAN_SCHEMA_VERSIE},
  "titel": "korte titel",
  "status": "concept",
  "blokken": {
    "doelEnTrigger": { "doel": "...", "trigger": "...", "triggerType": "schema" | "webhook" | "handmatig" | "event" },
    "bronnen": { "diensten": "...", "data": "...", "authenticatie": "..." },
    "stappen": [ { "nummer": 1, "omschrijving": "...", "invoer": "...", "uitvoer": "...", "foutscenario": "..." } ],
    "kwaliteit": { "verificatie": "...", "testaanpak": "..." },
    "uitvoering": { "omgeving": "...", "planning": "...", "faalafhandeling": "..." },
    "randvoorwaarden": { "privacy": "...", "randgevallen": "..." }
  }
}

Regels:
- Schrijf alles in rustig Nederlands, concreet en zonder hype-taal.
- Zet nooit echte secrets of API-keys in het plan; beschrijf bij "authenticatie" alleen de wijze (bijv. "API-key via omgevingsvariabele op de doelmachine").
- Stappen zijn genummerde acties in gewone taal; geef elke stap invoer, uitvoer en een foutscenario.
- Wees praktisch: verwijst naar echte diensten en standaardoplossingen waar mogelijk.
- Laat geen velden leeg; vul alles zinvol in.`

/** Haalt het JSON-object uit een antwoord dat mogelijk tekst of markdown bevat. */
function haalJsonUitAntwoord(tekst: string): string {
  const omheining = tekst.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (omheining) return omheining[1].trim()
  const accolade = tekst.match(/\{[\s\S]*\}/)
  if (accolade) return accolade[0]
  return tekst.trim()
}

/**
 * Vraagt het lokale model (Ollama) om een plan.
 *
 * We gebruiken Ollama's eigen `/api/chat` en niet het OpenAI-pad: alleen daar kan
 * `num_ctx` mee, en dat is precies de knop die het geheugen begrenst. Zonder die
 * knop laadt Ollama het model met de serverstandaard (op deze Mac 262.144 tokens).
 */
export async function vraagLokaalModel(idee: string): Promise<string> {
  const basis = leesLokaalBasis().replace(/\/+$/, '')
  const model = leesLokaalModel()

  let antwoord: Response
  try {
    antwoord = await fetch(`${basis}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEEMPROMPT },
          { role: 'user', content: idee },
        ],
        stream: false,
        options: { num_ctx: LOKAAL_NUM_CTX, temperature: 0.2 },
      }),
    })
  } catch {
    throw new Error(`Geen verbinding met het lokale model. Draait je Ollama-server op ${basis}?`)
  }

  if (!antwoord.ok) {
    throw new Error(
      `Het lokale model gaf een fout terug (status ${antwoord.status}). ` +
        `Bestaat het model "${model}" wel? Controleer het met "ollama list".`,
    )
  }

  const data = (await antwoord.json()) as { message?: { content?: string } }
  const inhoud = data.message?.content
  if (!inhoud) {
    throw new Error('Het lokale model gaf een leeg antwoord terug. Probeer het opnieuw.')
  }
  return inhoud
}

export async function genereerPlanMetAi(idee: string, sleutel: string = leesSleutel() ?? ''): Promise<Plan> {
  // Lokaal is de standaard: geen account, geen sleutel, geen internet.
  if (leesLeverancier() !== 'openrouter') {
    return planVanAntwoord(await vraagLokaalModel(idee))
  }

  let antwoord: Response
  try {
    antwoord = await fetch(EINDPUNT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sleutel}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEEMPROMPT },
          { role: 'user', content: idee },
        ],
      }),
    })
  } catch {
    throw new Error('Geen verbinding met OpenRouter. Controleer je internetverbinding en probeer opnieuw.')
  }

  if (!antwoord.ok) {
    throw new Error(`OpenRouter gaf een fout terug (status ${antwoord.status}). Controleer je API-key en credits.`)
  }

  const data = (await antwoord.json()) as { choices?: { message?: { content?: string } }[] }
  const inhoud = data.choices?.[0]?.message?.content
  if (!inhoud) {
    throw new Error('De AI gaf een leeg antwoord terug. Probeer het opnieuw.')
  }

  return planVanAntwoord(inhoud)
}

/**
 * Zet een modelantwoord om in een gevalideerd Plan. Gedeeld door de lokale en de
 * cloudroute, zodat beide hetzelfde streng controleren.
 */
function planVanAntwoord(inhoud: string): Plan {
  let geparseerd: unknown
  try {
    geparseerd = JSON.parse(haalJsonUitAntwoord(inhoud))
  } catch {
    throw new Error('De AI gaf een ongeldig plan terug. Probeer het opnieuw met een specifieker idee.')
  }

  const validatie = valideerVoorstel(geparseerd)
  if (!validatie.geldig) {
    throw new Error(`De AI gaf een ongeldig plan terug (${validatie.fout}). Probeer het opnieuw met een specifieker idee.`)
  }

  const plan = geparseerd as Plan
  // Administratie altijd zelf bepalen — nooit vertrouwen op model-output
  const nu = new Date().toISOString()
  return {
    ...plan,
    versie: PLAN_SCHEMA_VERSIE,
    id: crypto.randomUUID(),
    status: 'concept',
    aangemaakt: nu,
    gewijzigd: nu,
  }
}
