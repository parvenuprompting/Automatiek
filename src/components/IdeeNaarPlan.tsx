import { useState } from 'react'
import { genereerPlanMetAi, leesSleutel } from '../lib/ai'
import type { Plan } from '../lib/types'

interface Props {
  onPlanGemaakt: (plan: Plan) => void
  onVraagSleutel: () => void
}

export function IdeeNaarPlan({ onPlanGemaakt, onVraagSleutel }: Props) {
  const [idee, setIdee] = useState('')
  const [bezig, setBezig] = useState(false)
  const [fout, setFout] = useState<string | null>(null)

  async function genereer() {
    const sleutel = leesSleutel()
    if (!sleutel) {
      onVraagSleutel()
      return
    }
    setBezig(true)
    setFout(null)
    try {
      const plan = await genereerPlanMetAi(idee)
      onPlanGemaakt(plan)
      setIdee('')
    } catch (e) {
      setFout(e instanceof Error ? e.message : 'Onbekende fout.')
    } finally {
      setBezig(false)
    }
  }

  return (
    <section className="idee-sectie">
      <p className="eyebrow">Of laat AI het plan opzetten</p>
      <label>
        Omschrijf je automation-idee
        <textarea
          value={idee}
          placeholder="Bijvoorbeeld: elke ochtend om 8 uur een samenvatting van mijn ongelezen e-mail in Telegram…"
          onChange={(e) => setIdee(e.target.value)}
        />
      </label>
      <p className="hulptekst">
        Je idee gaat naar OpenRouter (GLM 5.3) en komt terug als voorstel dat je daarna vrij kunt
        bewerken. Alleen als jij een API-sleutel hebt ingesteld.
      </p>
      <button className="primaire" disabled={bezig || idee.trim() === ''} onClick={() => void genereer()}>
        {bezig ? 'Plan wordt gemaakt…' : 'Genereer plan met AI'}
      </button>
      {fout && <p className="foutmelding">{fout}</p>}
    </section>
  )
}
