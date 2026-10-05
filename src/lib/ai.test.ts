import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { genereerPlanMetAi, opslaanSleutel, leesSleutel } from './ai'
import {
  zetLeverancier,
  zetLokaalModel,
  LOKAAL_BASIS_STANDAARD,
  LOKAAL_MODEL_STANDAARD,
  LOKAAL_NUM_CTX,
} from './model'

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

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('genereerPlanMetAi — cloudroute (OpenRouter)', () => {
  beforeEach(() => {
    localStorage.clear()
    opslaanSleutel('test-key')
    zetLeverancier('openrouter')
  })

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

describe('genereerPlanMetAi — lokale route (standaard, geen sleutel nodig)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  test('standaard gaat het naar Ollama /api/chat, met num_ctx en zonder sleutel', async () => {
    const fn = mockFetch({ message: { content: JSON.stringify(GELDIG_PLAN_JSON) } })
    const plan = await genereerPlanMetAi('test idee')
    const [url, opties] = fn.mock.calls[0]
    expect(url).toBe(`${LOKAAL_BASIS_STANDAARD}/api/chat`)
    expect(opties.headers.Authorization).toBeUndefined()
    const body = JSON.parse(opties.body)
    expect(body.model).toBe(LOKAAL_MODEL_STANDAARD)
    expect(body.stream).toBe(false)
    expect(body.options.num_ctx).toBe(LOKAAL_NUM_CTX)
    expect(plan.titel).toBe('Ochtendbriefing')
  })

  test('onbereikbare server geeft een Nederlandse melding over Ollama', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNREFUSED')))
    await expect(genereerPlanMetAi('test')).rejects.toThrow(/Geen verbinding met het lokale model/)
  })

  test('onbekend model noemt de modelnaam en de controle via ollama list', async () => {
    mockFetch({ error: 'model not found' }, 404)
    await expect(genereerPlanMetAi('test')).rejects.toThrow(/ollama list/)
  })

  test('een zelfgekozen lokaal model wordt gebruikt', async () => {
    zetLokaalModel('qwen2.5-coder:7b')
    const fn = mockFetch({ message: { content: JSON.stringify(GELDIG_PLAN_JSON) } })
    await genereerPlanMetAi('test')
    expect(JSON.parse(fn.mock.calls[0][1].body).model).toBe('qwen2.5-coder:7b')
  })

  test('leeg antwoord van het lokale model geeft foutmelding', async () => {
    mockFetch({ message: { content: '' } })
    await expect(genereerPlanMetAi('test')).rejects.toThrow(/leeg antwoord/i)
  })
})

describe('sleutelbeheer', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  test('opslaan en lezen', () => {
    opslaanSleutel('abc123')
    expect(leesSleutel()).toBe('abc123')
  })
  test('lege opslag geeft null', () => {
    localStorage.clear()
    expect(leesSleutel()).toBeNull()
  })
})
