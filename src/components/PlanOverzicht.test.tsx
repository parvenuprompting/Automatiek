import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PlanOverzicht } from './PlanOverzicht'
import { maakNieuwPlan } from '../lib/plan'

const plannen = [maakNieuwPlan('Ochtendbriefing'), maakNieuwPlan('Backup-check')]

const leegProps = {
  onSelect: () => {},
  onNieuw: () => {},
  onVerwijder: () => {},
  onDupliceer: () => {},
}

test('toont titels van alle plannen', () => {
  render(<PlanOverzicht plannen={plannen} {...leegProps} />)
  expect(screen.getByText('Ochtendbriefing')).toBeInTheDocument()
  expect(screen.getByText('Backup-check')).toBeInTheDocument()
})

test('nieuwe-plan-knop roept onNieuw aan', async () => {
  const onNieuw = vi.fn()
  render(<PlanOverzicht plannen={[]} {...leegProps} onNieuw={onNieuw} />)
  await userEvent.click(screen.getByRole('button', { name: /nieuw plan/i }))
  expect(onNieuw).toHaveBeenCalled()
})

test('verwijderen vraagt bevestiging', async () => {
  const onVerwijder = vi.fn()
  render(<PlanOverzicht plannen={plannen} {...leegProps} onVerwijder={onVerwijder} />)
  await userEvent.click(screen.getAllByRole('button', { name: /verwijder/i })[0])
  expect(onVerwijder).not.toHaveBeenCalled()
  await userEvent.click(screen.getByRole('button', { name: /ja, verwijder/i }))
  expect(onVerwijder).toHaveBeenCalledWith(plannen[0].id)
})

test('dupliceerknop roept onDupliceer aan', async () => {
  const onDupliceer = vi.fn()
  render(<PlanOverzicht plannen={plannen} {...leegProps} onDupliceer={onDupliceer} />)
  await userEvent.click(screen.getAllByRole('button', { name: /dupliceer/i })[0])
  expect(onDupliceer).toHaveBeenCalledWith(plannen[0].id)
})
