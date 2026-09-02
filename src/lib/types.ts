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
