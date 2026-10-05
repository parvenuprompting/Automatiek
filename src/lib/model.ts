/**
 * Modelkeuze voor de AI-plangenerator.
 *
 * Standaard draait alles **lokaal** via Ollama: geen account, geen sleutel, geen
 * internet. OpenRouter blijft beschikbaar als tweede keuze voor wie een
 * cloudmodel wil gebruiken.
 *
 * Let op de contextgrens: de Ollama-app op deze Mac staat op
 * `OLLAMA_CONTEXT_LENGTH=262144`. Een model dat zonder expliciete `num_ctx`
 * wordt geladen, probeert dus 256K context te pakken en duwt het geheugen vol.
 * Daarom stuurt deze app altijd `LOKAAL_NUM_CTX` mee.
 */

export type Leverancier = 'lokaal' | 'openrouter'

const LEVERANCIER_OPSLAG = 'automatiek:leverancier'
const LOKAAL_BASIS_OPSLAG = 'automatiek:lokaal-basis'
const LOKAAL_MODEL_OPSLAG = 'automatiek:lokaal-model'

/** Loopback-adres van de Ollama-server (het `/v1`-deel laten we weg: wij praten native). */
export const LOKAAL_BASIS_STANDAARD = 'http://127.0.0.1:11434'
export const LOKAAL_MODEL_STANDAARD = 'deepseek-r1:8b'

/**
 * Contextvenster dat wij het model geven. Bewust niet hoger: op een Mac met 24 GB
 * past 65.536 volledig in het GPU-geheugen, terwijl 131.072 deels naar de CPU zakt
 * (traag, plus swap).
 */
export const LOKAAL_NUM_CTX = 65536

function lees(sleutel: string): string | null {
  try {
    return localStorage.getItem(sleutel)
  } catch {
    return null
  }
}

function schrijf(sleutel: string, waarde: string): void {
  try {
    localStorage.setItem(sleutel, waarde)
  } catch {
    // Opslag geblokkeerd: dan werkt de app met de standaardwaarden verder.
  }
}

export function leesLeverancier(): Leverancier {
  return lees(LEVERANCIER_OPSLAG) === 'openrouter' ? 'openrouter' : 'lokaal'
}

export function zetLeverancier(leverancier: Leverancier): void {
  schrijf(LEVERANCIER_OPSLAG, leverancier)
}

export function leesLokaalBasis(): string {
  const waarde = (lees(LOKAAL_BASIS_OPSLAG) ?? '').trim()
  return waarde || LOKAAL_BASIS_STANDAARD
}

export function zetLokaalBasis(basis: string): void {
  const schoon = basis.trim().replace(/\/+$/, '')
  if (schoon) schrijf(LOKAAL_BASIS_OPSLAG, schoon)
}

export function leesLokaalModel(): string {
  const waarde = (lees(LOKAAL_MODEL_OPSLAG) ?? '').trim()
  return waarde || LOKAAL_MODEL_STANDAARD
}

export function zetLokaalModel(model: string): void {
  const schoon = model.trim()
  if (schoon) schrijf(LOKAAL_MODEL_OPSLAG, schoon)
}
