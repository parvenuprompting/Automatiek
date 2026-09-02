import type { Stap } from '../lib/types'
import { HELP } from '../lib/hulpteksten'

interface Props {
  stappen: Stap[]
  onWijzig: (stappen: Stap[]) => void
}

export function StappenEditor({ stappen, onWijzig }: Props) {
  function wijzigStap(index: number, veld: keyof Stap, waarde: string) {
    const nieuw = stappen.map((s, i) => (i === index ? { ...s, [veld]: waarde } : s))
    onWijzig(nieuw)
  }

  function verwijderStap(index: number) {
    const nieuw = stappen
      .filter((_, i) => i !== index)
      .map((s, i) => ({ ...s, nummer: i + 1 }))
    onWijzig(nieuw)
  }

  return (
    <div className="stappen">
      {stappen.map((stap, i) => (
        <fieldset key={i} className="stap">
          <legend>Stap {stap.nummer}</legend>
          <label>
            Omschrijving
            <input
              type="text"
              value={stap.omschrijving}
              onChange={(e) => wijzigStap(i, 'omschrijving', e.target.value)}
            />
          </label>
          <p className="hulptekst">{HELP.stapOmschrijving}</p>
          <label>
            Invoer
            <input type="text" value={stap.invoer} onChange={(e) => wijzigStap(i, 'invoer', e.target.value)} />
          </label>
          <p className="hulptekst">{HELP.stapInvoer}</p>
          <label>
            Uitvoer
            <input type="text" value={stap.uitvoer} onChange={(e) => wijzigStap(i, 'uitvoer', e.target.value)} />
          </label>
          <p className="hulptekst">{HELP.stapUitvoer}</p>
          <label>
            Foutscenario
            <input
              type="text"
              value={stap.foutscenario}
              onChange={(e) => wijzigStap(i, 'foutscenario', e.target.value)}
            />
          </label>
          <p className="hulptekst">{HELP.stapFoutscenario}</p>
          <button className="subtiel verwijder-stap" onClick={() => verwijderStap(i)}>Verwijder</button>
        </fieldset>
      ))}
      <button className="subtiel" onClick={() =>
          onWijzig([...stappen, { nummer: stappen.length + 1, omschrijving: '', invoer: '', uitvoer: '', foutscenario: '' }])
        }
      >
        Stap toevoegen
      </button>
    </div>
  )
}
