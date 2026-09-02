# Automatiek Fase 1 (Planner) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Een volledig client-side React-app waarin de gebruiker automation-ideeën uitwerkt tot bouwplannen van zes vaste blokken, exporteerbaar als NL-markdown en JSON.

**Architecture:** Vite + React + TypeScript, 100% client-side. Pure functies voor datamodel + markdown-generatie (getest met Vitest), dunne React-laag eromheen (React Testing Library). Opslag in localStorage met autosave; export/download als bestand; import met validatie.

**Tech Stack:** Vite, React 18, TypeScript, Vitest, @testing-library/react, Editorial Monochrome CSS (eigen tokens, geen UI-framework).

**Spec:** `docs/superpowers/specs/2026-09-02-automatiek-design.md`

## Global Constraints

- 100% client-side: geen backend, geen account, geen externe HTTP-calls, geen analytics/tracking.
- Alle UI-tekst in rustig Nederlands; geen hype-taal.
- Styling: Editorial Monochrome — monochrome kleuren, serif-kop / clean sans-body, veel witruimte, geen kleuraccenten.
- Secrets horen nooit in een plan; het formulier bevat hieraan herinnerende hulptekst.
- JSON-export heeft een `versie`-veld (schema-versie, start 1).
- Elke taak eindigt met groene tests + commit.

---

### Task 1: Project-scaffold

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/styles/tokens.css`, `src/styles/global.css`, `.gitignore`

**Interfaces:**
- Produces: draaiend Vite-project; entry `src/App.tsx`; testsetup via `vitest` + `jsdom`.

- [ ] **Step 1: Scaffold met npm create vite**

```bash
cd "/Users/tiendo/Documents/Code 7/automatiek"
npm create vite@latest . -- --template react-ts
npm install
npm install -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
```

(`npm create vite` in een niet-lege map: laat het alleen nieuwe bestanden schrijven; bestaande `docs/` en `.git/` blijven staan. Bevestig prompts, kies geen extra extras zoals ESLint-config tenzij aangeboden — dat mag.)

- [ ] **Step 2: vitest configureren**

`vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test-setup.ts',
  },
})
```

`src/test-setup.ts`:

```ts
import '@testing-library/jest-dom'
```

Voeg in `package.json` scripts toe:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Editorial Monochrome basis-styling**

`src/styles/tokens.css`:

```css
:root {
  --bg: #fafaf8;
  --fg: #1a1a18;
  --muted: #6b6b66;
  --border: #d8d8d2;
  --card: #ffffff;
  --serif: 'Iowan Old Style', 'Palatino Linotype', Georgia, serif;
  --sans: -apple-system, 'Helvetica Neue', Arial, sans-serif;
}
```

`src/styles/global.css`: basis-reset, `body { background: var(--bg); color: var(--fg); font-family: var(--sans); max-width: 46rem; margin: 0 auto; padding: 2rem 1rem; }`, koppen in `var(--serif)`, rustige formulierstijlen (labels boven velden, inputs met `border: 1px solid var(--border)`, geen schaduwen).

Vervang de default `App.tsx` door een lege shell:

```tsx
function App() {
  return <main><h1>Automatiek</h1><p>Bouwplannen voor automations.</p></main>
}
```

- [ ] **Step 4: Smoke-test**

Test `src/App.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import App from './App'

test('toont de app-titel', () => {
  render(<App />)
  expect(screen.getByText('Automatiek')).toBeInTheDocument()
})
```

- [ ] **Step 5: Run tests**

Run: `npm test`
Expected: PASS (1 test groen).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: Vite + React + TS scaffold met Editorial Monochrome basis"
```

---

### Task 2: Datamodel + validatie

**Files:**
- Create: `src/lib/types.ts`, `src/lib/plan.ts`
- Test: `src/lib/plan.test.ts`

**Interfaces:**
- Produces: `Plan`, `Stap`, `TriggerType` (types), `maakNieuwPlan(titel: string): Plan`, `valideerPlan(data: unknown): { geldig: boolean; fout?: string }`, `PLAN_SCHEMA_VERSIE = 1`.

- [ ] **Step 1: Schrijf falende tests**

```ts
// src/lib/plan.test.ts
import { describe, test, expect } from 'vitest'
import { maakNieuwPlan, valideerPlan } from './plan'

describe('maakNieuwPlan', () => {
  test('maakt een leeg plan met zes blokken en juiste defaults', () => {
    const plan = maakNieuwPlan('Morgen briefing')
    expect(plan.titel).toBe('Morgen briefing')
    expect(plan.status).toBe('concept')
    expect(plan.versie).toBe(1)
    expect(plan.id).toMatch(/^[\w-]+$/)
    expect(plan.blokken.stappen).toEqual([])
    expect(plan.blokken.doelEnTrigger.triggerType).toBe('schema')
  })
})

describe('valideerPlan', () => {
  test('accepteert een geldig plan', () => {
    const plan = maakNieuwPlan('Test')
    expect(valideerPlan(plan)).toEqual({ geldig: true })
  })
  test('verwerpt object zonder versieveld', () => {
    const plan = maakNieuwPlan('Test')
    const { versie, ...zonderVersie } = plan
    const r = valideerPlan(zonderVersie)
    expect(r.geldig).toBe(false)
    expect(r.fout).toBeDefined()
  })
  test('verwerpt een onbekende schema-versie', () => {
    const plan = { ...maakNieuwPlan('Test'), versie: 99 }
    expect(valideerPlan(plan).geldig).toBe(false)
  })
  test('verwerpt null en non-objecten', () => {
    expect(valideerPlan(null).geldig).toBe(false)
    expect(valideerPlan('string').geldig).toBe(false)
  })
})
```

- [ ] **Step 2: Run tests — verwacht FAIL** (module bestaat niet)

Run: `npm test`

- [ ] **Step 3: Implementatie**

`src/lib/types.ts`:

```ts
export type TriggerType = 'schema' | 'webhook' | 'handmatig' | 'event'
export type PlanStatus = 'concept' | 'klaar'

export interface Stap {
  nummer: number
  omschrijving: string
  invoer: string
  uitvoer: string
  foutscenario: string
}

export interface PlanBlokken {
  doelEnTrigger: { doel: string; trigger: string; triggerType: TriggerType }
  bronnen: { diensten: string; data: string; authenticatie: string }
  stappen: Stap[]
  kwaliteit: { verificatie: string; testaanpak: string }
  uitvoering: { omgeving: string; planning: string; faalafhandeling: string }
  randvoorwaarden: { privacy: string; randgevallen: string }
}

export interface Plan {
  id: string
  versie: number
  titel: string
  status: PlanStatus
  aangemaakt: string
  gewijzigd: string
  blokken: PlanBlokken
}
```

`src/lib/plan.ts`:

```ts
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
```

- [ ] **Step 4: Run tests — verwacht PASS**

Run: `npm test`

- [ ] **Step 5: Commit**

```bash
git add src/lib
git commit -m "feat: datamodel Plan met validatie op schema-versie"
```

---

### Task 3: Markdown-generatie

**Files:**
- Create: `src/lib/markdown.ts`
- Test: `src/lib/markdown.test.ts`

**Interfaces:**
- Consumes: `Plan` uit Task 2.
- Produces: `planToMarkdown(plan: Plan): string` — deterministisch NL-document.

- [ ] **Step 1: Schrijf falende tests**

```ts
// src/lib/markdown.test.ts
import { describe, test, expect } from 'vitest'
import { planToMarkdown } from './markdown'
import { maakNieuwPlan } from './plan'
import type { Stap } from './types'

function planMetInhoud(): ReturnType<typeof maakNieuwPlan> {
  const plan = maakNieuwPlan('Ochtendbriefing')
  plan.blokken.doelEnTrigger = { doel: 'Dagelijkse samenvatting van mijn inbox', trigger: 'Elke werkdag om 08:00', triggerType: 'schema' }
  plan.blokken.stappen = [{
    nummer: 1,
    omschrijving: 'Haal ongelezen e-mail op',
    invoer: 'IMAP-connectie',
    uitvoer: 'Lijst berichten',
    foutscenario: 'Geen verbinding: sla run over, meld één keer',
  } as Stap]
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
  })
})
```

- [ ] **Step 2: Run tests — verwacht FAIL**

Run: `npm test`

- [ ] **Step 3: Implementatie**

`src/lib/markdown.ts` — pure functie; per blok een helper die alleen gevulde velden uitschrijft; stappen als genummerde lijst met sublijst invoer/uitvoer/foutscenario. Voortaan ook een slotregel: `_Agent: bouw en test dit plan; vraag bij onduidelijkheden terug._`

```ts
import type { Plan } from './types'

function regel(label: string, waarde: string): string | null {
  const v = waarde.trim()
  return v ? `${label}: ${v}` : null
}

function lijst(regels: (string | null)[]): string {
  return regels.filter((r): r is string => r !== null).map((r) => `- ${r}`).join('\n')
}

const TRIGGER_LABELS: Record<string, string> = {
  schema: 'Vast schema (cron)',
  webhook: 'Webhook (event-gedreven)',
  handmatig: 'Handmatig starten',
  event: 'Event bij een dienst',
}

export function planToMarkdown(plan: Plan): string {
  const b = plan.blokken
  const delen: string[] = []
  delen.push(`# Bouwplan: ${plan.titel}`)
  delen.push(`_Status: ${plan.status === 'klaar' ? 'klaar voor bouw' : 'concept'} · Schema-versie ${plan.versie}_`)

  delen.push('## 1. Doel & trigger')
  delen.push(lijst([
    regel('Doel', b.doelEnTrigger.doel),
    regel('Trigger', b.doelEnTrigger.trigger),
    regel('Triggertype', TRIGGER_LABELS[b.doelEnTrigger.triggerType] ?? b.doelEnTrigger.triggerType),
  ]))

  delen.push('## 2. Bronnen & data')
  delen.push(lijst([
    regel('Diensten', b.bronnen.diensten),
    regel('Data', b.bronnen.data),
    regel('Authenticatie', b.bronnen.authenticatie),
  ]))

  if (b.stappen.length > 0) {
    delen.push('## 3. Stappen')
    const stappen = b.stappen.map((s) => {
      const regels = [regel('Invoer', s.invoer), regel('Uitvoer', s.uitvoer), regel('Foutscenario', s.foutscenario)]
      const detail = lijst(regels)
      return detail ? `${s.nummer}. ${s.omschrijving}\n${detail.split('\n').map((l) => `   ${l}`).join('\n')}` : `${s.nummer}. ${s.omschrijving}`
    })
    delen.push(stappen.join('\n'))
  }

  delen.push('## 4. Kwaliteit & verificatie')
  delen.push(lijst([
    regel('Verificatie', b.kwaliteit.verificatie),
    regel('Testaanpak', b.kwaliteit.testaanpak),
  ]))

  delen.push('## 5. Planning & uitvoering')
  delen.push(lijst([
    regel('Omgeving', b.uitvoering.omgeving),
    regel('Planning', b.uitvoering.planning),
    regel('Faalafhandeling', b.uitvoering.faalafhandeling),
  ]))

  delen.push('## 6. Randvoorwaarden & privacy')
  delen.push(lijst([
    regel('Privacy', b.randvoorwaarden.privacy),
    regel('Randgevallen', b.randvoorwaarden.randgevallen),
  ]))

  delen.push('_Agent: bouw en test dit plan volgens de bovenstaande specificatie; stel bij onduidelijkheden vragen vóór implementatie._')

  // Lege secties (alleen kop zonder regels) eruit filteren
  return delen.filter((d) => d !== '' && !(d.startsWith('## ') && !delen[delen.indexOf(d) + 1]))
    .join('\n\n') + '\n'
}
```

(Bij implementatie: de "lege sectie"-filter moet simpel en getest blijven — een sectie valt weg als óf de kop óf de lijst leeg is. Vereenvoudig naar een per-blok helper `sectie(kop, lijstregels)` die `null` teruggeeft bij lege regels, als dat leesbaarder is. De tests leiden.)

- [ ] **Step 4: Run tests — verwacht PASS**

Run: `npm test`

- [ ] **Step 5: Commit**

```bash
git add src/lib/markdown.ts src/lib/markdown.test.ts
git commit -m "feat: deterministische NL-markdown-generatie uit plan"
```

---

### Task 4: Opslag (localStorage) + export/import

**Files:**
- Create: `src/lib/opslag.ts`, `src/lib/export.ts`
- Test: `src/lib/opslag.test.ts`, `src/lib/export.test.ts`

**Interfaces:**
- Consumes: `Plan`, `valideerPlan`, `planToMarkdown`.
- Produces: `laadPlannen(): Plan[]`, `slaPlannenOp(plannen: Plan[]): void`, `opslagBeschikbaar(): boolean`, `exportPlanAlsJson(plan: Plan): string`, `exportPlanAlsMarkdown(plan: Plan): string`, `download(bestandsnaam: string, inhoud: string): void`, `parseerImport(json: string): { geldig: boolean; plan?: Plan; fout?: string }`.

- [ ] **Step 1: Schrijf falende tests**

```ts
// src/lib/opslag.test.ts
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
```

```ts
// src/lib/export.test.ts
import { describe, test, expect } from 'vitest'
import { parseerImport, exportPlanAlsJson } from './export'
import { maakNieuwPlan } from './plan'

describe('export/import round-trip', () => {
  test('export → import geeft hetzelfde plan terug', () => {
    const plan = maakNieuwPlan('Roundtrip')
    const json = exportPlanAlsJson(plan)
    const r = parseerImport(json)
    expect(r.geldig).toBe(true)
    expect(r.plan!.titel).toBe('Roundtrip')
    expect(r.plan!.id).toBe(plan.id)
  })
  test('kapotte JSON geeft nette foutmelding', () => {
    const r = parseerImport('{"versie": 1, kapot')
    expect(r.geldig).toBe(false)
    expect(r.fout).toBeDefined()
  })
  test('onbekende versie wordt geweigerd', () => {
    const r = parseerImport('{"versie": 99}')
    expect(r.geldig).toBe(false)
  })
})
```

- [ ] **Step 2: Run tests — verwacht FAIL**

Run: `npm test`

- [ ] **Step 3: Implementatie**

`src/lib/opslag.ts` (sleutel `automatiek:plannen`):

```ts
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
```

`src/lib/export.ts`:

```ts
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
  return titel.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'plan'
}
```

- [ ] **Step 4: Run tests — verwacht PASS**

Run: `npm test`

- [ ] **Step 5: Commit**

```bash
git add src/lib/opslag.ts src/lib/opslag.test.ts src/lib/export.ts src/lib/export.test.ts
git commit -m "feat: localStorage-opslag en JSON/markdown export-import"
```

---

### Task 5: Overzichtspagina (lijst plannen)

**Files:**
- Create: `src/components/PlanOverzicht.tsx`
- Modify: `src/App.tsx`
- Test: `src/components/PlanOverzicht.test.tsx`

**Interfaces:**
- Consumes: `Plan`, `laadPlannen`, `slaPlannenOp`, `maakNieuwPlan`.
- Produces: component `<PlanOverzicht />` met props `{ plannen, onSelect, onNieuw, onVerwijder, onDupliceer }`; App houdt plannen-state en persisteert via autosave-effect.

- [ ] **Step 1: Falende test**

```tsx
// src/components/PlanOverzicht.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PlanOverzicht } from './PlanOverzicht'
import { maakNieuwPlan } from '../lib/plan'

const plannen = [maakNieuwPlan('Ochtendbriefing'), maakNieuwPlan('Backup-check')]

test('toont titels van alle plannen', () => {
  render(<PlanOverzicht plannen={plannen} onSelect={() => {}} onNieuw={() => {}} onVerwijder={() => {}} onDupliceer={() => {}} />)
  expect(screen.getByText('Ochtendbriefing')).toBeInTheDocument()
  expect(screen.getByText('Backup-check')).toBeInTheDocument()
})

test('nieuwe-plan-knop roept onNieuw aan', async () => {
  const onNieuw = vi.fn()
  render(<PlanOverzicht plannen={[]} onSelect={() => {}} onNieuw={onNieuw} onVerwijder={() => {}} onDupliceer={() => {}} />)
  await userEvent.click(screen.getByRole('button', { name: /nieuw plan/i }))
  expect(onNieuw).toHaveBeenCalled()
})

test('verwijderen vraagt bevestiging', async () => {
  const onVerwijder = vi.fn()
  render(<PlanOverzicht plannen={plannen} onSelect={() => {}} onNieuw={() => {}} onVerwijder={onVerwijder} onDupliceer={() => {}} />)
  await userEvent.click(screen.getAllByRole('button', { name: /verwijder/i })[0])
  expect(onVerwijder).not.toHaveBeenCalled()
  await userEvent.click(screen.getByRole('button', { name: /ja, verwijder/i }))
  expect(onVerwijder).toHaveBeenCalledWith(plannen[0].id)
})

test('dupliceerknop roept onDupliceer aan', async () => {
  const onDupliceer = vi.fn()
  render(<PlanOverzicht plannen={plannen} onSelect={() => {}} onNieuw={() => {}} onVerwijder={() => {}} onDupliceer={onDupliceer} />)
  await userEvent.click(screen.getAllByRole('button', { name: /dupliceer/i })[0])
  expect(onDupliceer).toHaveBeenCalledWith(plannen[0].id)
})
```

- [ ] **Step 2: Run tests — verwacht FAIL**

- [ ] **Step 3: Implementatie**

`PlanOverzicht.tsx`: kaartjes-grid (CSS: 1 kolom mobiel, 2 kolommen breed), per kaart titel (serif), trigger-type-label, status-label (`concept`/`klaar`), knoppen Bewerk / Dupliceer / Verwijder; verwijderen toont inline bevestigingsregel "Zeker weten?" met knoppen "Ja, verwijder" / "Annuleer". Lege staat: "Nog geen plannen. Begin met je eerste automation-idee." + grote Nieuw plan-knop. Kop "Automatiek" met ondertitel "Werk automation-ideeën uit tot bouwplannen voor elke AI-agent."

`App.tsx` wordt stateful:

```tsx
const [plannen, setPlannen] = useState<Plan[]>(() => laadPlannen())
useEffect(() => { slaPlannenOp(plannen) }, [plannen])
```

Handlers: `onNieuw` (maakNieuwPlan('') → selecteer editor), `onVerwijder(id)`, `onDupliceer(id)` (kopieer plan met nieuw id + titel " (kopie)" + status 'concept'), `onSelect(id)` → editor-view (editor komt in Task 6; tijdelijk een stub-view met de titel).

- [ ] **Step 4: Run tests — verwacht PASS**

- [ ] **Step 5: Commit**

```bash
git add src/components src/App.tsx
git commit -m "feat: plannen-overzicht met nieuw/dupliceer/verwijder-met-bevestiging"
```

---

### Task 6: Plan-editor (zes blokken + stappen)

**Files:**
- Create: `src/components/PlanEditor.tsx`, `src/components/BlokSectie.tsx`, `src/components/StappenEditor.tsx`
- Modify: `src/App.tsx` (stub vervangen)
- Test: `src/components/PlanEditor.test.tsx`

**Interfaces:**
- Consumes: `Plan` + alle lib-functies.
- Produces: `<PlanEditor plan={plan} onWijzig={wijsGewijzigdPlanAan} onTerug={} />`; `BlokSectie` met props `{ titel, nummer, ingevuld: boolean, kinderen, standaardOpen: boolean }`; `StappenEditor` met props `{ stappen, onWijzig }`. Help-teksten per veld als constante `HELP` in `src/lib/hulpteksten.ts` (NL, verwijst ook naar secrets-beleid).

- [ ] **Step 1: Falende tests**

```tsx
// src/components/PlanEditor.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PlanEditor } from './PlanEditor'
import { maakNieuwPlan } from '../lib/plan'

function setup() {
  const plan = maakNieuwPlan('Testplan')
  const onWijzig = vi.fn()
  const onTerug = vi.fn()
  return { plan, onWijzig, onTerug }
}

test('toont alle zes blokken met voortgang', () => {
  const { plan, onWijzig, onTerug } = setup()
  render(<PlanEditor plan={plan} onWijzig={onWijzig} onTerug={onTerug} />)
  for (const kop of ['Doel & trigger', 'Bronnen & data', 'Stappen', 'Kwaliteit & verificatie', 'Planning & uitvoering', 'Randvoorwaarden & privacy']) {
    expect(screen.getByText(new RegExp(kop, 'i'))).toBeInTheDocument()
  }
})

test('typen in doelveld roept onWijzig aan met bijgewerkt plan', async () => {
  const { plan, onWijzig, onTerug } = setup()
  render(<PlanEditor plan={plan} onWijzig={onWijzig} onTerug={onTerug} />)
  const veld = screen.getByLabelText(/doel/i)
  await userEvent.type(veld, 'x')
  expect(onWijzig).toHaveBeenCalled()
  const laatste = onWijzig.mock.calls.at(-1)[0] as typeof plan
  expect(laatste.blokken.doelEnTrigger.doel).toBe('x')
})

test('stap toevoegen en invullen', async () => {
  const { plan, onWijzig, onTerug } = setup()
  render(<PlanEditor plan={plan} onWijzig={onWijzig} onTerug={onTerug} />)
  await userEvent.click(screen.getByRole('button', { name: /stap toevoegen/i }))
  const omschrijving = onWijzig.mock.calls.at(-1)[0].blokken.stappen
  expect(omschrijving).toHaveLength(1)
})

test('gewijzigd-datum wordt bijgewerkt', async () => {
  const { plan, onWijzig, onTerug } = setup()
  render(<PlanEditor plan={plan} onWijzig={onWijzig} onTerug={onTerug} />)
  await userEvent.type(screen.getByLabelText(/doel/i), 'x')
  const laatste = onWijzig.mock.calls.at(-1)[0] as typeof plan
  expect(laatste.gewijzigd).not.toBe(plan.gewijzigd)
})

test('exportknoppen downloaden md en json', async () => {
  const { plan, onWijzig, onTerug } = setup()
  render(<PlanEditor plan={plan} onWijzig={onWijzig} onTerug={onTerug} />)
  expect(screen.getByRole('button', { name: /exporteer markdown/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /exporteer json/i })).toBeInTheDocument()
})

test('terugknop', async () => {
  const { plan, onWijzig, onTerug } = setup()
  render(<PlanEditor plan={plan} onWijzig={onWijzig} onTerug={onTerug} />)
  await userEvent.click(screen.getByRole('button', { name: /terug naar overzicht/i }))
  expect(onTerug).toHaveBeenCalled()
})
```

- [ ] **Step 2: Run tests — verwacht FAIL**

- [ ] **Step 3: Implementatie**

- `BlokSectie`: `<details open={standaardOpen}>`-achtige sectie met kop "N. Titel" + voortgangsstipje (gevuld = gevulde velden > 0), verpakkend monochrome kaartje.
- `PlanEditor`: titelveld bovenaan, status-schakelaar (concept/klaar), zes `BlokSectie`s met inputs + `HELP`-hulpvraag onder elk label. Elke wijziging: kopieer plan (structuredClone), muteer, `gewijzigd = new Date().toISOString()`, roep `onWijzig` — autosave loopt via App-effect.
- `StappenEditor`: lijst stappen met omschrijving/voor/invoer/uitvoer/foutscenario + "Stap toevoegen"-knop (nummer = lengte+1) en verwijderknop per stap.
- Exportbalk onderaan: knoppen "Exporteer markdown" (`download(slug+ '.md', exportPlanAlsMarkdown)`) en "Exporteer JSON".
- Hulpteksten (fragment, in `src/lib/hulpteksten.ts`): doel → "Wat moet er automatisch gebeuren, in één zin?"; authenticatie → "Hoe logt de automation in? Zet secrets nooit in het plan — altijd op de doelmachine (bijv. env-var)."; etc. voor alle velden.

- [ ] **Step 4: Run tests — verwacht PASS**

- [ ] **Step 5: Commit**

```bash
git add src/components src/lib/hulpteksten.ts src/App.tsx
git commit -m "feat: plan-editor met zes blokken, stappenlijst en export"
```

---

### Task 7: Import + foutafhandeling + README

**Files:**
- Create: `src/components/ImportKnop.tsx`
- Modify: `src/App.tsx` (import-handler), `README.md`
- Test: `src/components/ImportKnop.test.tsx`

**Interfaces:**
- Consumes: `parseerImport`.
- Produces: `<ImportKnop onImport={gevalideerdPlan => void} />` — file-input, leest tekst, toont fout bij ongeldig.

- [ ] **Step 1: Falende test**

```tsx
// src/components/ImportKnop.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ImportKnop } from './ImportKnop'
import { exportPlanAlsJson } from '../lib/export'
import { maakNieuwPlan } from '../lib/plan'

test('geldige import roept onImport aan', async () => {
  const onImport = vi.fn()
  render(<ImportKnop onImport={onImport} />)
  const plan = maakNieuwPlan('Geïmporteerd')
  const bestand = new File([exportPlanAlsJson(plan)], 'plan.json', { type: 'application/json' })
  await userEvent.upload(screen.getByLabelText(/importeer/i), bestand)
  await waitFor(() => expect(onImport).toHaveBeenCalledWith(expect.objectContaining({ titel: 'Geïmporteerd' })))
})

test('ongeldige import toont foutmelding en roept onImport NIET aan', async () => {
  const onImport = vi.fn()
  render(<ImportKnop onImport={onImport} />)
  const bestand = new File(['{"versie": 99}'], 'fout.json', { type: 'application/json' })
  await userEvent.upload(screen.getByLabelText(/importeer/i), bestand)
  await waitFor(() => expect(screen.getByText(/onbekende schema-versie/i)).toBeInTheDocument())
  expect(onImport).not.toHaveBeenCalled()
})
```

- [ ] **Step 2: Run tests — verwacht FAIL**

- [ ] **Step 3: Implementatie**

- `ImportKnop`: verborgen file-input + knop "Importeer plan (.json)"; leest `file.text()`, `parseerImport`, bij fout `fout` tonen in rode tekst (monochrome: donkerrood `#8b2020` als enige waarschuwingskleur), bij succes `onImport(plan)`.
- `App.tsx`: import voegt plan toe aan lijst (id-collision: als id al bestaat, nieuw id); opslag-waarschuwing als `!opslagBeschikbaar()` → balk "Opslag niet beschikbaar in deze browser. Exporteer je plannen als bestand."
- `README.md`: shields.io-badges (build/tests/licentie MIT), secties: Wat is Automatiek / Werking / Structuur / Quickstart (`npm install && npm run dev`), NL-handleiding (plan maken → exporteren → plakken in je AI-agent), roadmap (fase 2 hub), privacy-paragraaf (geen server, geen tracking, alles lokaal).

- [ ] **Step 4: Run alle tests + build**

Run: `npm test && npm run build`
Expected: alle tests PASS, build slaagt.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: JSON-import met validatie, opslag-waarschuwing en NL-readme"
```

---

### Task 8: Eindcontrole + push

**Files:** geen nieuwe.

- [ ] **Step 1: Volledige verificatie**

Run: `npm test && npm run build && npm run dev` (dev kort starten, `curl -s http://localhost:5173 | head -5`, dan afsluiten).
Expected: tests groen, build groen, dev-server serveert de app.

- [ ] **Step 2: Handmatige rooktest (interactietest)**

Open `http://localhost:5173` in de preview: maak plan → vul blokken → exporteer markdown → controleer inhoudelijk dat het document leesbaar en compleet is (dit is de acceptatietest richting echte Hermes-uitvoer).

- [ ] **Step 3: Push**

```bash
git push origin main
git ls-remote --heads origin
```

Expected: remote main-sha == lokale HEAD.
