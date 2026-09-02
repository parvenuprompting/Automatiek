import { useEffect, useState } from 'react'
import type { Plan } from './lib/types'
import { laadPlannen, slaPlannenOp, opslagBeschikbaar } from './lib/opslag'
import { maakNieuwPlan } from './lib/plan'
import { PlanOverzicht } from './components/PlanOverzicht'
import { PlanEditor } from './components/PlanEditor'
import { ImportKnop } from './components/ImportKnop'

export default function App() {
  const [plannen, setPlannen] = useState<Plan[]>(() => laadPlannen())
  const [actiefId, setActiefId] = useState<string | null>(null)

  useEffect(() => {
    slaPlannenOp(plannen)
  }, [plannen])

  const actief = plannen.find((p) => p.id === actiefId) ?? null

  function verwijder(id: string) {
    setPlannen((pl) => pl.filter((p) => p.id !== id))
    if (actiefId === id) setActiefId(null)
  }

  function dupliceer(id: string) {
    const bron = plannen.find((p) => p.id === id)
    if (!bron) return
    const kopie: Plan = {
      ...structuredClone(bron),
      id: crypto.randomUUID(),
      titel: `${bron.titel || 'Naamloos plan'} (kopie)`,
      status: 'concept',
    }
    setPlannen((pl) => [...pl, kopie])
  }

  function nieuw() {
    const plan = maakNieuwPlan('')
    setPlannen((pl) => [plan, ...pl])
    setActiefId(plan.id)
  }

  function wijzig(bijgewerkt: Plan) {
    setPlannen((pl) => pl.map((p) => (p.id === bijgewerkt.id ? bijgewerkt : p)))
  }

  function importeer(plan: Plan) {
    const bestaatAl = plannen.some((p) => p.id === plan.id)
    const toeTeVoegen: Plan = bestaatAl ? { ...plan, id: crypto.randomUUID() } : plan
    setPlannen((pl) => [toeTeVoegen, ...pl])
  }

  if (actief) {
    return <PlanEditor plan={actief} onWijzig={wijzig} onTerug={() => setActiefId(null)} />
  }

  return (
    <>
      {!opslagBeschikbaar() && (
        <p className="foutmelding">
          Opslag niet beschikbaar in deze browser. Exporteer je plannen als bestand.
        </p>
      )}
      <PlanOverzicht
        plannen={plannen}
        onSelect={setActiefId}
        onNieuw={nieuw}
        onVerwijder={verwijder}
        onDupliceer={dupliceer}
      />
      <p>
        <ImportKnop onImport={importeer} />
      </p>
    </>
  )
}
