import type { Plan, PlanBlokken, TriggerType } from '../lib/types'
import { HELP } from '../lib/hulpteksten'
import { exportPlanAlsMarkdown, exportPlanAlsJson, download, slug } from '../lib/export'
import { BlokSectie } from './BlokSectie'
import { StappenEditor } from './StappenEditor'

interface Props {
  plan: Plan
  onWijzig: (plan: Plan) => void
  onTerug: () => void
}

function gevuld(...waarden: string[]): boolean {
  return waarden.some((w) => w.trim() !== '')
}

export function PlanEditor({ plan, onWijzig, onTerug }: Props) {
  function mutatie(fn: (b: PlanBlokken) => void) {
    const kopie = structuredClone(plan)
    fn(kopie.blokken)
    kopie.gewijzigd = new Date().toISOString()
    onWijzig(kopie)
  }

  const b = plan.blokken

  function tekst(
    label: string,
    hulp: string,
    waarde: string,
    zet: (v: string) => void,
    alsTekstvak = false,
  ) {
    return (
      <>
        <label>
          {label}
          {alsTekstvak ? (
            <textarea value={waarde} onChange={(e) => zet(e.target.value)} />
          ) : (
            <input type="text" value={waarde} onChange={(e) => zet(e.target.value)} />
          )}
        </label>
        <p className="hulptekst">{hulp}</p>
      </>
    )
  }

  return (
    <main>
      <p>
        <button onClick={onTerug}>← Terug naar overzicht</button>
      </p>

      <label>
        Titel
        <input
          type="text"
          value={plan.titel}
          onChange={(e) => {
            const kopie = structuredClone(plan)
            kopie.titel = e.target.value
            kopie.gewijzigd = new Date().toISOString()
            onWijzig(kopie)
          }}
        />
      </label>
      <p className="hulptekst">{HELP.titel}</p>

      <label>
        Status
        <select
          value={plan.status}
          onChange={(e) => {
            const kopie = structuredClone(plan)
            kopie.status = e.target.value as Plan['status']
            kopie.gewijzigd = new Date().toISOString()
            onWijzig(kopie)
          }}
        >
          <option value="concept">concept</option>
          <option value="klaar">klaar</option>
        </select>
      </label>
      <p className="hulptekst">{HELP.status}</p>

      <BlokSectie
        titel="Doel & trigger"
        nummer={1}
        standaardOpen
        ingevuld={gevuld(b.doelEnTrigger.doel, b.doelEnTrigger.trigger)}
      >
        {tekst('Doel', HELP.doel, b.doelEnTrigger.doel, (v) => mutatie((x) => { x.doelEnTrigger.doel = v }), true)}
        {tekst('Trigger', HELP.trigger, b.doelEnTrigger.trigger, (v) => mutatie((x) => { x.doelEnTrigger.trigger = v }))}
        <label>
          Triggertype
          <select
            value={b.doelEnTrigger.triggerType}
            onChange={(e) => mutatie((x) => { x.doelEnTrigger.triggerType = e.target.value as TriggerType })}
          >
            <option value="schema">Vast schema (cron)</option>
            <option value="webhook">Webhook (event-gedreven)</option>
            <option value="handmatig">Handmatig starten</option>
            <option value="event">Event bij een dienst</option>
          </select>
        </label>
        <p className="hulptekst">{HELP.triggerType}</p>
      </BlokSectie>

      <BlokSectie titel="Bronnen & data" nummer={2} ingevuld={gevuld(b.bronnen.diensten, b.bronnen.data, b.bronnen.authenticatie)}>
        {tekst('Diensten', HELP.diensten, b.bronnen.diensten, (v) => mutatie((x) => { x.bronnen.diensten = v }), true)}
        {tekst('Data', HELP.data, b.bronnen.data, (v) => mutatie((x) => { x.bronnen.data = v }), true)}
        {tekst('Authenticatie', HELP.authenticatie, b.bronnen.authenticatie, (v) => mutatie((x) => { x.bronnen.authenticatie = v }), true)}
      </BlokSectie>

      <BlokSectie titel="Stappen" nummer={3} ingevuld={b.stappen.some((s) => s.omschrijving.trim() !== '')}>
        <StappenEditor stappen={b.stappen} onWijzig={(s) => mutatie((x) => { x.stappen = s })} />
      </BlokSectie>

      <BlokSectie titel="Kwaliteit & verificatie" nummer={4} ingevuld={gevuld(b.kwaliteit.verificatie, b.kwaliteit.testaanpak)}>
        {tekst('Verificatie', HELP.verificatie, b.kwaliteit.verificatie, (v) => mutatie((x) => { x.kwaliteit.verificatie = v }), true)}
        {tekst('Testaanpak', HELP.testaanpak, b.kwaliteit.testaanpak, (v) => mutatie((x) => { x.kwaliteit.testaanpak = v }), true)}
      </BlokSectie>

      <BlokSectie titel="Planning & uitvoering" nummer={5} ingevuld={gevuld(b.uitvoering.omgeving, b.uitvoering.planning, b.uitvoering.faalafhandeling)}>
        {tekst('Omgeving', HELP.omgeving, b.uitvoering.omgeving, (v) => mutatie((x) => { x.uitvoering.omgeving = v }))}
        {tekst('Planning', HELP.planning, b.uitvoering.planning, (v) => mutatie((x) => { x.uitvoering.planning = v }))}
        {tekst('Faalafhandeling', HELP.faalafhandeling, b.uitvoering.faalafhandeling, (v) => mutatie((x) => { x.uitvoering.faalafhandeling = v }), true)}
      </BlokSectie>

      <BlokSectie titel="Randvoorwaarden & privacy" nummer={6} ingevuld={gevuld(b.randvoorwaarden.privacy, b.randvoorwaarden.randgevallen)}>
        {tekst('Privacy', HELP.privacy, b.randvoorwaarden.privacy, (v) => mutatie((x) => { x.randvoorwaarden.privacy = v }), true)}
        {tekst('Randgevallen', HELP.randgevallen, b.randvoorwaarden.randgevallen, (v) => mutatie((x) => { x.randvoorwaarden.randgevallen = v }), true)}
      </BlokSectie>

      <div className="exportbalk">
        <button className="primaire" onClick={() => download(`${slug(plan.titel)}.md`, exportPlanAlsMarkdown(plan))}>
          Exporteer markdown
        </button>
        <button onClick={() => download(`${slug(plan.titel)}.json`, exportPlanAlsJson(plan))}>Exporteer JSON</button>
      </div>
    </main>
  )
}
