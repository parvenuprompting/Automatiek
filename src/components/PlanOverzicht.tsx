import { useState } from 'react'
import type { Plan } from '../lib/types'

interface Props {
  plannen: Plan[]
  onSelect: (id: string) => void
  onNieuw: () => void
  onVerwijder: (id: string) => void
  onDupliceer: (id: string) => void
}

const TRIGGER_LABELS: Record<string, string> = {
  schema: 'Vast schema',
  webhook: 'Webhook',
  handmatig: 'Handmatig',
  event: 'Event',
}

export function PlanOverzicht({ plannen, onSelect, onNieuw, onVerwijder, onDupliceer }: Props) {
  const [bevestig, setBevestig] = useState<string | null>(null)

  return (
    <main>
      <header>
        <h1>Automatiek</h1>
        <p>Werk automation-ideeën uit tot bouwplannen voor elke AI-agent.</p>
      </header>

      <p>
        <button className="primaire" onClick={onNieuw}>
          Nieuw plan
        </button>
      </p>

      {plannen.length === 0 ? (
        <p>Nog geen plannen. Begin met je eerste automation-idee.</p>
      ) : (
        <ul className="plannen-lijst">
          {plannen.map((plan) => (
            <li key={plan.id} className="plan-kaart">
              <div className="plan-kaart-hoofd">
                <button className="kaart-titel" onClick={() => onSelect(plan.id)}>
                  {plan.titel || 'Naamloos plan'}
                </button>
                <span className="kenmerk">{plan.status === 'klaar' ? 'klaar' : 'concept'}</span>
                <span className="kenmerk">
                  {TRIGGER_LABELS[plan.blokken.doelEnTrigger.triggerType] ?? plan.blokken.doelEnTrigger.triggerType}
                </span>
              </div>
              <div className="plan-kaart-acties">
                <button onClick={() => onSelect(plan.id)}>Bewerk</button>
                <button onClick={() => onDupliceer(plan.id)}>Dupliceer</button>
                {bevestig === plan.id ? (
                  <span className="bevestig">
                    Zeker weten?{' '}
                    <button onClick={() => { onVerwijder(plan.id); setBevestig(null) }}>Ja, verwijder</button>
                    <button onClick={() => setBevestig(null)}>Annuleer</button>
                  </span>
                ) : (
                  <button onClick={() => setBevestig(plan.id)}>Verwijder</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
