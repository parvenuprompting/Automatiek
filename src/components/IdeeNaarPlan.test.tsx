import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IdeeNaarPlan } from './IdeeNaarPlan'
import { leesSleutel, opslaanSleutel } from '../lib/ai'
import { zetLeverancier } from '../lib/model'
import { maakNieuwPlan } from '../lib/plan'

beforeEach(() => {
  localStorage.clear()
  vi.stubGlobal('crypto', { ...crypto, randomUUID: () => 'uuid-123' })
})

test('cloudroute zonder API-sleutel: de dialoog opent bij klik', async () => {
  zetLeverancier('openrouter')
  const onVraagSleutel = vi.fn()
  render(<IdeeNaarPlan onPlanGemaakt={() => {}} onVraagSleutel={onVraagSleutel} />)
  await userEvent.type(screen.getByLabelText(/omschrijf je automation-idee/i), 'test idee')
  await userEvent.click(screen.getByRole('button', { name: /genereer plan met ai/i }))
  expect(onVraagSleutel).toHaveBeenCalled()
})

test('lokale route heeft géén sleutel nodig', async () => {
  const plan = maakNieuwPlan('Lokaal gegenereerd')
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: { content: JSON.stringify(plan) } }),
    }),
  )
  const onVraagSleutel = vi.fn()
  const onPlanGemaakt = vi.fn()
  render(<IdeeNaarPlan onPlanGemaakt={onPlanGemaakt} onVraagSleutel={onVraagSleutel} />)
  await userEvent.type(screen.getByLabelText(/omschrijf je automation-idee/i), 'test idee')
  await userEvent.click(screen.getByRole('button', { name: /genereer plan met ai/i }))
  await waitFor(() =>
    expect(onPlanGemaakt).toHaveBeenCalledWith(expect.objectContaining({ titel: 'Lokaal gegenereerd' })),
  )
  expect(onVraagSleutel).not.toHaveBeenCalled()
})

test('lokale route zonder server toont een Nederlandse foutmelding', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNREFUSED')))
  render(<IdeeNaarPlan onPlanGemaakt={() => {}} onVraagSleutel={() => {}} />)
  await userEvent.type(screen.getByLabelText(/omschrijf je automation-idee/i), 'test idee')
  await userEvent.click(screen.getByRole('button', { name: /genereer plan met ai/i }))
  expect(await screen.findByText(/Geen verbinding met het lokale model/)).toBeInTheDocument()
})

test('leeg idee: knop uitgeschakeld', () => {
  render(<IdeeNaarPlan onPlanGemaakt={() => {}} onVraagSleutel={() => {}} />)
  expect(screen.getByRole('button', { name: /genereer plan met ai/i })).toBeDisabled()
})

test('fout van de AI netjes getoond', async () => {
  opslaanSleutel('test')
  zetLeverancier('openrouter')
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

test('geslaagde cloudgeneratie roept onPlanGemaakt aan en laat de sleutel staan', async () => {
  opslaanSleutel('test')
  zetLeverancier('openrouter')
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
