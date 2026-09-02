import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PlanEditor } from './PlanEditor'
import { maakNieuwPlan } from '../lib/plan'

function setup() {
  const plan = maakNieuwPlan('Testplan')
  const onWijzig = vi.fn()
  const onTerug = vi.fn()
  return { plan, onWijzig, onTerug }
}

test('toont alle zes blokken', () => {
  const { plan, onWijzig, onTerug } = setup()
  render(<PlanEditor plan={plan} onWijzig={onWijzig} onTerug={onTerug} />)
  for (const kop of ['Doel & trigger', 'Bronnen & data', 'Stappen', 'Kwaliteit & verificatie', 'Planning & uitvoering', 'Randvoorwaarden & privacy']) {
    expect(screen.getByText(new RegExp(kop, 'i'))).toBeInTheDocument()
  }
})

test('typen in doelveld roept onWijzig aan met bijgewerkt plan', async () => {
  const { plan, onWijzig, onTerug } = setup()
  render(<PlanEditor plan={plan} onWijzig={onWijzig} onTerug={onTerug} />)
  const veld = screen.getByLabelText(/doel/i)
  await userEvent.type(veld, 'x')
  expect(onWijzig).toHaveBeenCalled()
  const laatste = onWijzig.mock.calls.at(-1)![0] as typeof plan
  expect(laatste.blokken.doelEnTrigger.doel).toBe('x')
})

test('stap toevoegen werkt', async () => {
  const { plan, onWijzig, onTerug } = setup()
  render(<PlanEditor plan={plan} onWijzig={onWijzig} onTerug={onTerug} />)
  await userEvent.click(screen.getByRole('button', { name: /stap toevoegen/i }))
  const stappen = (onWijzig.mock.calls.at(-1)![0] as typeof plan).blokken.stappen
  expect(stappen).toHaveLength(1)
})

test('gewijzigd-datum wordt bijgewerkt', async () => {
  const { plan, onWijzig, onTerug } = setup()
  render(<PlanEditor plan={plan} onWijzig={onWijzig} onTerug={onTerug} />)
  await userEvent.type(screen.getByLabelText(/doel/i), 'x')
  const laatste = onWijzig.mock.calls.at(-1)![0] as typeof plan
  expect(laatste.gewijzigd).not.toBe(plan.gewijzigd)
})

test('exportknoppen aanwezig', () => {
  const { plan, onWijzig, onTerug } = setup()
  render(<PlanEditor plan={plan} onWijzig={onWijzig} onTerug={onTerug} />)
  expect(screen.getByRole('button', { name: /exporteer markdown/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /exporteer json/i })).toBeInTheDocument()
})

test('terugknop roept onTerug aan', async () => {
  const { plan, onWijzig, onTerug } = setup()
  render(<PlanEditor plan={plan} onWijzig={onWijzig} onTerug={onTerug} />)
  await userEvent.click(screen.getByRole('button', { name: /terug naar overzicht/i }))
  expect(onTerug).toHaveBeenCalled()
})
