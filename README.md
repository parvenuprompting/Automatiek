# Automatiek.

![License](https://img.shields.io/badge/license-MIT-blue)
![Taal](https://img.shields.io/badge/taal-Nederlands-green)
![Privacy](https://img.shields.io/badge/privacy-100%25%20lokaal-lightgrey)

**Automatiek** is een privacy-first Nederlandse automation-planner. Werk automation-ideeën uit tot duidelijke bouwplannen, en geef die vervolgens aan elke AI-agent — of een menselijke ontwikkelaar — om te bouwen.

Geen account, geen server, geen tracking. Alles draait en blijft in je eigen browser.

Zapier voert automations úit; Automatiek helpt je ze te **plannen**. Voor mensen die liever zelf bouwen.

## Zo werkt het

1. **Maak een plan** en vul de zes bouwblokken in — hulpvragen bij elk veld, automatische opslag.
2. **Zet de status op *klaar*** zodra het plan compleet is.
3. **Exporteer als markdown** (leesbaar document) of **JSON** (machine-leesbaar).
4. **Plak het markdown-document in je AI-agent** — Hermes, Claude, ChatGPT, of wie dan ook — en laat het bouwen.

## De zes bouwblokken

Elk plan volgt dezelfde vaste structuur, zodat elk plan compleet is:

| Nr. | Blok | Wat het vastlegt |
|---|---|---|
| 01 | **Doel & trigger** | Wat moet er automatisch gebeuren, en wat zet het in gang? |
| 02 | **Bronnen & data** | Welke diensten, bestanden en API's zijn betrokken? |
| 03 | **Stappen** | Genummerde acties in gewone taal, met invoer, uitvoer en foutscenario. |
| 04 | **Kwaliteit & verificatie** | Hoe testen we dat het werkt? |
| 05 | **Planning & uitvoering** | Waar draait het, hoe vaak, wat gebeurt er bij falen? |
| 06 | **Randvoorwaarden & privacy** | Randgevallen en privacy-eisen. |

## Privacy

- Geen backend, geen account, geen analytics, geen externe verbindingen.
- Plannen staan in de lokale opslag van je browser (`localStorage`); exporteren als bestand kan altijd.
- Secrets horen nóóit in een plan — de editor herinnert je eraan: authenticatie leg je vast op de doelmachine, niet in het plan.

## Quickstart

```bash
npm install
npm run dev      # ontwikkelen op http://localhost:5173
npm test         # tests draaien (29 stuks)
npm run build    # productie-build (statisch, overal te hosten)
```

## Structuur

```
src/
  lib/           # pure logica: datamodel, validatie, markdown-generatie, opslag, export/import
  components/    # React-componenten: overzicht, editor, stappen, import
  styles/        # Editorial Monochrome (Fraunces + Inter, paper & ink)
docs/
  superpowers/   # ontwerpspecificatie en implementatieplan
```

## Roadmap

- **Fase 1 (nu):** planner — editor met zes blokken, export markdown + JSON, localStorage, import.
- **Fase 2 — Automation-hub:** run-monitoring van automations op je eigen machines, directe koppeling tussen plannen en uitvoering.
- **Fase 3 (optioneel):** bibliotheek met gedeelde plan-templates.

## Licentie

MIT
