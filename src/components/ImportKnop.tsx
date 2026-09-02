import { useState } from 'react'
import { parseerImport } from '../lib/export'
import type { Plan } from '../lib/types'

interface Props {
  onImport: (plan: Plan) => void
}

export function ImportKnop({ onImport }: Props) {
  const [fout, setFout] = useState<string | null>(null)

  async function lees(bestand: File) {
    setFout(null)
    const tekst = await bestand.text()
    const r = parseerImport(tekst)
    if (!r.geldig || !r.plan) {
      setFout(r.fout ?? 'Onbekende fout bij het lezen van het bestand.')
      return
    }
    onImport(r.plan)
  }

  return (
    <span className="import-knop">
      <label className="knop-als-label">
        Importeer plan (.json)
        <input
          type="file"
          accept=".json,application/json"
          style={{ display: 'none' }}
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) void lees(f)
            e.target.value = ''
          }}
        />
      </label>
      {fout && <span className="foutmelding">{fout}</span>}
    </span>
  )
}
