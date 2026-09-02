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
  schema: 'schema',
  webhook: 'webhook',
  handmatig: 'handmatig',
  event: 'event',
}

export function PlanOverzicht({ plannen, onSelect, onNieuw, onVerwijder, onDupliceer }: Props) {
  const [bevestig, setBevestig] = useState<string | null>(null)

  return (
    <main>
      <header className="titel-groep">
        <p className="eyebrow">Nederlandse automation-planner</p>
        <h1 className="pagina-titel">
          Automatiek<em>.</em>
        </h1>
        <p className="ondertitel">
          Werk automation-ideeën uit tot duidelijke bouwplannen — voor elke AI-agent, of een mens.
          Alles blijft op je eigen apparaat.
        </p>
      </header>

      {plannen.length === 0 ? (
        <div className="leeg-bericht">
          <p>Nog geen plannen. Begin met je eerste automation-idee.</p>
          <button className="primaire" onClick={onNieuw}>
            Nieuw plan
          </button>
        </div>
      ) : (
        <>
          <div className="actiebalk">
            <button className="primaire" onClick={onNieuw}>
              Nieuw plan
            </button>
          </div>
          <ul className="plannen-lijst">
            {plannen.map((plan) => (
              <li key={plan.id} className="plan-kaart">
                <div className="plan-kaart-hoofd">
                  <button className="kaart-titel" onClick={() => onSelect(plan.id)}>
                    {plan.titel || 'Naamloos plan'}
                  </button>
                  <span className="kenmerk">{plan.status}</span>
                  <span className="kenmerk">
                    {TRIGGER_LABELS[plan.blokken.doelEnTrigger.triggerType] ?? plan.blokken.doelEnTrigger.triggerType}
                  </span>
                </div>
                <div className="plan-kaart-acties">
                  {bevestig === plan.id ? (
                    <span className="bevestig">
                      Zeker weten?
                      <button className="subtiel" onClick={() => { onVerwijder(plan.id); setBevestig(null) }}>
                        Ja, verwijder
                      </button>
                      <button className="subtiel" onClick={() => setBevestig(null)}>
                        Annuleer
                      </button>
                    </span>
                  ) : (
                    <>
                      <button className="subtiel" onClick={() => onDupliceer(plan.id)}>
                        Dupliceer
                      </button>
                      <button className="subtiel" onClick={() => setBevestig(plan.id)}>
                        Verwijder
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <div className="sluit-sectie">
            <h2>
              Klaar om te <em>bouwen</em>?
            </h2>
            <p>
              Exporteer je plan als markdown en geef het aan je AI-agent — Hermes, Claude, ChatGPT.
              Het plan bevat alles wat nodig is.
            </p>
          </div>
        </>
      )}

      <footer className="voettekst">
        <span>Automatiek</span>
        <span>Alles lokaal — geen account, geen tracking</span>
      </footer>
    </main>
  )
}
