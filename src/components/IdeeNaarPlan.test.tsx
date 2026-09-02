import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IdeeNaarPlan } from './IdeeNaarPlan'
import { leesSleutel, opslaanSleutel } from '../lib/ai'
import { maakNieuwPlan } from '../lib/plan'

beforeEach(() => {
  localStorage.clear()
  vi.stubGlobal('crypto', { ...crypto, randomUUID: () => 'uuid-123' })
})

test('zonder API-sleutel opent de dialoog bij klik', async () => {
  const onVraagSleutel = vi.fn()
  render(<IdeeNaarPlan onPlanGemaakt={() => {}} onVraagSleutel={onVraagSleutel} />)
  await userEvent.type(screen.getByLabelText(/omschrijf je automation-idee/i), 'test idee')
  await userEvent.click(screen.getByRole('button', { name: /genereer plan met ai/i }))
  expect(onVraagSleutel).toHaveBeenCalled()
})

test('leeg idee: knop uitgeschakeld', () => {
  render(<IdeeNaarPlan onPlanGemaakt={() => {}} onVraagSleutel={() => {}} />)
  expect(screen.getByRole('button', { name: /genereer plan met ai/i })).toBeDisabled()
})

test('fout van de AI netjes getoond', async () => {
  opslaanSleutel('test')
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: false, status: 402, json: async () => ({}) }),
  )
  render(<IdeeNaarPlan onPlanGemaakt={() => {}} onVraagSleutel={() => {}} />)
  await userEvent.type(screen.getByLabelText(/omschrijf je automation-idee/i), 'test idee')
  await userEvent.click(screen.getByRole('button', { name: /genereer plan met ai/i }))
  const melding = await screen.findByText(/402/)
  expect(melding).toBeInTheDocument()
})

test('geslaagde generatie roept onPlanGemaakt aan en maakt veld leeg', async () => {
  opslaanSleutel('test')
  const plan = maakNieuwPlan('Gegenereerd')
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: JSON.stringify(plan) } }] }),
    }),
  )
  const onPlanGemaakt = vi.fn()
  render(<IdeeNaarPlan onPlanGemaakt={onPlanGemaakt} onVraagSleutel={() => {}} />)
  const veld = screen.getByLabelText(/omschrijf je automation-idee/i)
  await userEvent.type(veld, 'test idee')
  await userEvent.click(screen.getByRole('button', { name: /genereer plan met ai/i }))
  await screen.findByText(/Genereer plan met AI/)
  expect(onPlanGemaakt).toHaveBeenCalledWith(expect.objectContaining({ titel: 'Gegenereerd' }))
  expect(leesSleutel()).toBe('test')
})
