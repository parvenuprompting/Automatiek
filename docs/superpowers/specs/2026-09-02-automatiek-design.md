# Automatiek — Ontwerpspecificatie

**Datum:** 2026-09-02
**Status:** Goedgekeurd (ontwerp in chat, naam gekozen: Automatiek)
**Pad:** Fase 1 van de roadmap (planner)

## 1. Doel

Automatiek is een volledig client-side React-app waarin de gebruiker
automation-ideeën uitwerkt tot gestructureerde bouwplannen. Een bouwplan is
agent-agnostisch: het exporteerbaar als leesbaar Nederlands markdown-document
 én als machine-leesbaar JSON, bruikbaar met elke AI-agent (Hermes, ChatGPT,
Claude) of een menselijke ontwikkelaar.

Doel: een Nederlandse, privacy-first "Zapier-vervanger" — geen account, geen
backend, geen data bij derden. De app plant; de uitvoering gebeurt door de
agent naar wie het plan wordt geëxporteerd.

## 2. Vastgestelde beslissingen

| Onderwerp | Beslissing |
|---|---|
| Scope fase 1 | Alleen planner; uitvoering/monitoring is fase 2 |
| Doelgroep plan | Agent-agnostisch (mens + elke AI-agent) |
| Export | Twee uitvoeren: NL-markdown én JSON-schema |
| Architectuur | 100% client-side, geen backend, geen account |
| Opslag | localStorage (autosoave) + bestandsexport/-import |
| Stack | Vite + React + TypeScript |
| Styling | Editorial Monochrome (rustig Nederlands, geen hype) |
| Vormgeving forms | Controlled components, geen form-library |
| State | Simpele context hook; geen Redux/TanStack Query |
| Naam | **Automatiek** |
| Repo | Nieuwe privé-repo `automatiek`, pas publiek op expliciet besluit |

## 3. Datamodel

Eén `Plan`-object:

```ts
interface Plan {
  id: string;            // uuid
  versie: number;        // schema-versie, start 1
  titel: string;
  status: 'concept' | 'klaar';
  aangemaakt: string;    // ISO
  gewijzigd: string;     // ISO
  blokken: {
    doelEnTrigger: { doel: string; trigger: string; triggerType: 'schema' | 'webhook' | 'handmatig' | 'event' };
    bronnen: { diensten: string; data: string; authenticatie: string };
    stappen: Stap[];     // array
    kwaliteit: { verificatie: string; testaanpak: string };
    uitvoering: { omgeving: string; planning: string; faalafhandeling: string };
    randvoorwaarden: { privacy: string; randgevallen: string };
  };
}

interface Stap {
  nummer: number;
  omschrijving: string;
  invoer: string;
  uitvoer: string;
  foutscenario: string;
}
```

Markdown wordt deterministisch gegenereerd door een pure functie
`planToMarkdown(plan): string` — geen LLM, volledig testbaar.

## 4. Kernstructuur bouwplan (zes blokken)

1. **Doel & trigger** — wat moet er automatisch gebeuren; wat zet het in gang
   (schema / webhook / handmatig / event).
2. **Bronnen & data** — betrokken diensten, bestanden, API's; datastroom;
   authenticatiewijze (secrets altijd op doelmachine, nooit in het plan).
3. **Stappen** — genummerde acties in gewone taal; per stap invoer, verwachte
   uitvoer, foutscenario.
4. **Kwaliteit & verificatie** — hoe testen we dat het werkt (droge run,
   testdata, bewijsstuk).
5. **Planning & uitvoering** — waar draait het (Mac/VPS), hoe vaak, wat bij
   falen (notificatie bij mislukking).
6. **Randvoorwaarden & privacy** — offline-first waar mogelijk, randgevallen,
   geen secrets in het plan zelf.

Elk veld krijgt een korte NL-hulpvraag in de UI (geen lege schermen).

## 5. Componenten & flows

- **Plannen-overzicht** — lijst kaartjes (titel, trigger, status), acties:
  nieuw, bewerk, verwijder (met bevestiging), dupliceren.
- **Plan-editor** — zes blokken als secties, in-/uitklapbaar, voortgangs-
  indicatie per blok; autosave bij elke wijziging.
- **Exportdialoog** — keuze markdown / JSON / beide; download als lokaal
  bestand.
- **Import** — JSON-bestand inlezen, valideren, toevoegen.
- **Hermes-workflow** — markdown plakken in de chat; fase 2 maakt hiervan een
  directe koppeling.

## 6. Foutafhandeling

- localStorage vol/onbeschikbaar → NL-foutmelding + advies: exporteren.
- Kapot/incompatibel import-JSON → validatie op versieveld; nette foutmelding;
  niets overschreven.
- Verwijderen altijd met bevestiging.
- Autosave: geen "opslaan"-knop die vergeten kan worden.

## 7. Testing

- **Vitest**: `planToMarkdown`, JSON-validatie, export/import round-trip.
- **React Testing Library**: editor-flow (nieuw plan → blokken vullen →
  export bestaat).
- **Acceptatietest**: eerste echte plan in Hermes plakken en door de agent
  laten bouwen.

## 8. Roadmap

- **Fase 1 (deze spec):** planner — editor, zes blokken, export md+json,
  localStorage, import.
- **Fase 2 — Automation-hub:** run-monitoring op Mac/VPS, statusoverzicht,
  directe koppeling Hermes ↔ plannen (JSON-schema is hier al op voorbereid).
- **Fase 3 (optioneel):** plan-bibliotheek (community-templates), GitHub
  Pages-hosting met NL-handleiding.

## 9. Randvoorwaarden

- Privacy-first: geen analytics, geen tracking, geen externe calls.
- UI: Editorial Monochrome, rustig Nederlands, geen hype-taal.
- README in rustig Nederlands.
