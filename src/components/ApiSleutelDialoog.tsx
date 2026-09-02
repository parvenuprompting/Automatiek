import { useState } from 'react'
import { leesSleutel, opslaanSleutel, wisSleutel } from '../lib/ai'

interface Props {
  open: boolean
  onSluit: () => void
}

export function ApiSleutelDialoog({ open, onSluit }: Props) {
  const [invoer, setInvoer] = useState(leesSleutel() ?? '')

  if (!open) return null

  return (
    <div className="dialoog-achtergrond" role="dialog" aria-label="OpenRouter API-sleutel">
      <div className="dialoog">
        <h3>OpenRouter API-sleutel</h3>
        <p>
          De AI-functie stuurt je automation-idee naar OpenRouter (model GLM 5.3) om er een
          bouwplan van te maken. Daarvoor is een API-sleutel nodig van{' '}
          <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer">
            openrouter.ai/keys
          </a>
          .
        </p>
        <p>De sleutel blijft lokaal op je eigen apparaat — hij wordt nooit verzonden naar iets anders dan OpenRouter, en nooit opgeslagen in plannen of exports.</p>
        <label>
          API-sleutel
          <input
            type="password"
            value={invoer}
            placeholder="sk-or-…"
            onChange={(e) => setInvoer(e.target.value)}
          />
        </label>
        <div className="dialoog-acties">
          <button
            className="primaire"
            onClick={() => {
              opslaanSleutel(invoer.trim())
              onSluit()
            }}
          >
            Opslaan
          </button>
          {leesSleutel() && (
            <button
              onClick={() => {
                wisSleutel()
                setInvoer('')
                onSluit()
              }}
            >
              Verwijder sleutel
            </button>
          )}
          <button className="subtiel" onClick={onSluit}>
            Annuleer
          </button>
        </div>
      </div>
    </div>
  )
}
