# Automatiek

![License](https://img.shields.io/badge/license-MIT-blue)
![Taal](https://img.shields.io/badge/taal-Nederlands-green)

**Automatiek** is een privacy-first Nederlandse automation-planner: werk automation-ideeën uit tot duidelijke bouwplannen die je vervolgens aan elke AI-agent (of een menselijke ontwikkelaar) kunt geven.

Geen account, geen server, geen tracking — alles draait in je eigen browser. Een rustig alternatief voor tools als Zapier, voor mensen die liever zelf bouwen.

## Wat is Automatiek?

Zapier voert automations úit; Automatiek helpt je ze te **plannen**. Je beschrijft een automation in zes vaste bouwblokken, met hulpvragen bij elk veld:

1. **Doel & trigger** — wat moet er automatisch gebeuren, en wat zet het in gang?
2. **Bronnen & data** — welke diensten, bestanden en API's zijn betrokken?
3. **Stappen** — genummerde acties in gewone taal, met invoer, uitvoer en foutscenario per stap.
4. **Kwaliteit & verificatie** — hoe testen we dat het werkt?
5. **Planning & uitvoering** — waar draait het, hoe vaak, en wat gebeurt er bij falen?
6. **Randvoorwaarden & privacy** — randgevallen en privacy-eisen.

Het resultaat exporteer je als **leesbaar Nederlands markdown-document** (plak het in je AI-agent en laat het bouwen) én als **machine-leesbaar JSON** (voor later geautomatiseerd gebruik).

## Werking

1. Maak een nieuw plan en vul de zes blokken in — alles wordt automatisch opgeslagen in je browser.
2. Zet de status op *klaar* als het plan compleet is.
3. Exporteer als markdown of JSON.
4. Geef het markdown-document aan je AI-agent (Hermes, ChatGPT, Claude — alles werkt) en laat het bouwen.

## Privacy

- Geen backend, geen account, geen analytics, geen externe verbindingen.
- Plannen staan in de lokale opslag van je browser (`localStorage`); exporteren kan altijd als bestand.
- Secrets horen nooit in een plan — het formulier herinnert je eraan: authenticatie leg je vast op de doelmachine, niet in het plan.

## Structuur

```
src/
  lib/           # pure logica: datamodel, validatie, markdown-generatie, opslag, export/import
  components/    # React-componenten: overzicht, editor, stappen, import
  styles/        # Editorial Monochrome styling
docs/
  superpowers/   # ontwerpspecificatie en implementatieplan
```

## Quickstart

```bash
npm install
npm run dev      # ontwikkelen op http://localhost:5173
npm test         # tests draaien
npm run build    # productie-build (statisch, overal te hosten)
```

## Roadmap

- **Fase 1 (nu):** planner — editor met zes blokken, export markdown + JSON, localStorage, import.
- **Fase 2 — Automation-hub:** run-monitoring van automations op je eigen machines, directe koppeling tussen plannen en uitvoering.
- **Fase 3 (optioneel):** bibliotheek met gedeelde plan-templates.

## Licentie

MIT
