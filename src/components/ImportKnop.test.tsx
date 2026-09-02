import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ImportKnop } from './ImportKnop'
import { exportPlanAlsJson } from '../lib/export'
import { maakNieuwPlan } from '../lib/plan'

test('geldige import roept onImport aan', async () => {
  const onImport = vi.fn()
  render(<ImportKnop onImport={onImport} />)
  const plan = maakNieuwPlan('Geïmporteerd')
  const bestand = new File([exportPlanAlsJson(plan)], 'plan.json', { type: 'application/json' })
  await userEvent.upload(screen.getByLabelText(/importeer/i), bestand)
  await waitFor(() => expect(onImport).toHaveBeenCalledWith(expect.objectContaining({ titel: 'Geïmporteerd' })))
})

test('ongeldige import toont foutmelding en roept onImport NIET aan', async () => {
  const onImport = vi.fn()
  render(<ImportKnop onImport={onImport} />)
  const bestand = new File(['{"versie": 99}'], 'fout.json', { type: 'application/json' })
  await userEvent.upload(screen.getByLabelText(/importeer/i), bestand)
  await waitFor(() => expect(screen.getByText(/onbekende schema-versie/i)).toBeInTheDocument())
  expect(onImport).not.toHaveBeenCalled()
})
