import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { genereerPlanMetAi, opslaanSleutel, leesSleutel } from './ai'

const GELDIG_PLAN_JSON = {
  versie: 1,
  id: 'test-id-123',
  titel: 'Ochtendbriefing',
  status: 'concept',
  aangemaakt: new Date().toISOString(),
  gewijzigd: new Date().toISOString(),
  blokken: {
    doelEnTrigger: { doel: 'Dagelijkse inbox-samenvatting', trigger: '08:00', triggerType: 'schema' },
    bronnen: { diensten: 'Gmail, Telegram', data: 'Ongelezen berichten', authenticatie: 'API-key via env' },
    stappen: [],
    kwaliteit: { verificatie: 'Log controle', testaanpak: 'Droge run' },
    uitvoering: { omgeving: 'Mac', planning: 'Dagelijks', faalafhandeling: 'Notificatie' },
    randvoorwaarden: { privacy: 'Geen data naar derden', randgevallen: 'Geen berichten' },
  },
}

function mockFetch(body: unknown, status = 200) {
  const fn = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  })
  vi.stubGlobal('fetch', fn)
  return fn
}

beforeEach(() => {
  localStorage.clear()
  opslaanSleutel('test-key')
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('genereerPlanMetAi', () => {
  test('geldige response levert gevalideerd Plan', async () => {
    mockFetch({
      choices: [{ message: { content: '```json\n' + JSON.stringify(GELDIG_PLAN_JSON) + '\n```' } }],
    })
    const plan = await genereerPlanMetAi('ochtendbriefing')
    expect(plan.titel).toBe('Ochtendbriefing')
    expect(plan.blokken.bronnen.diensten).toBe('Gmail, Telegram')
  })

  test('request gaat naar openrouter met GLM 5.3 en de sleutel', async () => {
    const fn = mockFetch({
      choices: [{ message: { content: JSON.stringify(GELDIG_PLAN_JSON) } }],
    })
    await genereerPlanMetAi('test idee')
    const [url, opties] = fn.mock.calls[0]
    expect(url).toBe('https://openrouter.ai/api/v1/chat/completions')
    expect(opties.headers.Authorization).toBe('Bearer test-key')
    expect(JSON.parse(opties.body).model).toBe('z-ai/glm-5.3')
  })

  test('ongeldig JSON-plan geeft foutmelding', async () => {
    mockFetch({ choices: [{ message: { content: '{"versie": 99, kapoot' } }] })
    await expect(genereerPlanMetAi('test')).rejects.toThrow(/ongeldig/i)
  })

  test('HTTP-fout geeft NL-foutmelding met status', async () => {
    mockFetch({ error: 'insufficient credits' }, 402)
    await expect(genereerPlanMetAi('test')).rejects.toThrow(/402/)
  })

  test('model terugvlucht in tekst levert plan zonder markdown-hinder', async () => {
    mockFetch({
      choices: [{ message: { content: 'Hier is je plan:\n' + JSON.stringify(GELDIG_PLAN_JSON) } }],
    })
    const plan = await genereerPlanMetAi('test')
    expect(plan.titel).toBe('Ochtendbriefing')
  })
})

describe('sleutelbeheer', () => {
  test('opslaan en lezen', () => {
    opslaanSleutel('abc123')
    expect(leesSleutel()).toBe('abc123')
  })
  test('lege opslag geeft null', () => {
    localStorage.clear()
    expect(leesSleutel()).toBeNull()
  })
})
