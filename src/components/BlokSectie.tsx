import type { ReactNode } from 'react'

interface Props {
  titel: string
  nummer: number
  ingevuld: boolean
  standaardOpen?: boolean
  children: ReactNode
}

export function BlokSectie({ titel, nummer, ingevuld, standaardOpen = false, children }: Props) {
  return (
    <details className="blok-sectie" open={standaardOpen}>
      <summary>
        <span className="blok-nummer">{nummer}.</span> {titel}
        <span className={`voortgang ${ingevuld ? 'vol' : 'leeg'}`} aria-label={ingevuld ? 'ingevuld' : 'leeg'}>
          {ingevuld ? '●' : '○'}
        </span>
      </summary>
      <div className="blok-inhoud">{children}</div>
    </details>
  )
}
