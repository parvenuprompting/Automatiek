import { useState } from 'react'
import { leesSleutel, opslaanSleutel, wisSleutel } from '../lib/ai'
import {
  leesLeverancier,
  leesLokaalBasis,
  leesLokaalModel,
  zetLeverancier,
  zetLokaalBasis,
  zetLokaalModel,
  LOKAAL_BASIS_STANDAARD,
  LOKAAL_MODEL_STANDAARD,
  LOKAAL_NUM_CTX,
  type Leverancier,
} from '../lib/model'

interface Props {
  open: boolean
  onSluit: () => void
}

/**
 * Stelt in welk model de AI-plangenerator gebruikt. Standaard het lokale model
 * (geen account, geen sleutel); OpenRouter blijft als tweede keuze bestaan.
 */
export function ApiSleutelDialoog({ open, onSluit }: Props) {
  const [leverancier, setLeverancier] = useState<Leverancier>(leesLeverancier())
  const [basis, setBasis] = useState(leesLokaalBasis())
  const [model, setModel] = useState(leesLokaalModel())
  const [invoer, setInvoer] = useState(leesSleutel() ?? '')

  if (!open) return null

  function bewaar() {
    zetLeverancier(leverancier)
    if (leverancier === 'lokaal') {
      zetLokaalBasis(basis)
      zetLokaalModel(model)
    } else {
      opslaanSleutel(invoer.trim())
    }
    onSluit()
  }

  return (
    <div className="dialoog-achtergrond" role="dialog" aria-label="Model voor de plangenerator">
      <div className="dialoog">
        <h3>Model voor de plangenerator</h3>

        <label>
          Waar draait het model?
          <select
            value={leverancier}
            onChange={(e) => setLeverancier(e.target.value as Leverancier)}
          >
            <option value="lokaal">Lokaal op deze Mac (Ollama)</option>
            <option value="openrouter">OpenRouter (cloud)</option>
          </select>
        </label>

        {leverancier === 'lokaal' ? (
          <>
            <p>
              Je idee blijft op je eigen apparaat. Er is geen account en geen sleutel nodig —
              alleen een draaiende Ollama-server.
            </p>
            <label>
              Serveradres
              <input
                type="text"
                value={basis}
                placeholder={LOKAAL_BASIS_STANDAARD}
                onChange={(e) => setBasis(e.target.value)}
              />
            </label>
            <label>
              Modelnaam
              <input
                type="text"
                value={model}
                placeholder={LOKAAL_MODEL_STANDAARD}
                onChange={(e) => setModel(e.target.value)}
              />
            </label>
            <p className="hulptekst">
              Context wordt per aanvraag begrensd op {LOKAAL_NUM_CTX.toLocaleString('nl-NL')} tokens,
              zodat het model in het geheugen van de machine past.
            </p>
          </>
        ) : (
          <>
            <p>
              De AI-functie stuurt je automation-idee naar OpenRouter (model GLM 5.3). Daarvoor is
              een API-sleutel nodig van{' '}
              <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer">
                openrouter.ai/keys
              </a>
              .
            </p>
            <p>
              De sleutel blijft lokaal op je eigen apparaat — hij wordt nooit verzonden naar iets
              anders dan OpenRouter, en nooit opgeslagen in plannen of exports.
            </p>
            <label>
              API-sleutel
              <input
                type="password"
                value={invoer}
                placeholder="sk-or-…"
                onChange={(e) => setInvoer(e.target.value)}
              />
            </label>
          </>
        )}

        <div className="dialoog-acties">
          <button className="primaire" onClick={bewaar}>
            Opslaan
          </button>
          {leverancier === 'openrouter' && leesSleutel() && (
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
