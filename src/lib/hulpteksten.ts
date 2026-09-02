/** Hulpvragen per veld — rustig Nederlands, herinneren aan secrets-beleid. */
export const HELP = {
  titel: 'Kort en concreet, bijvoorbeeld "Ochtendbriefing van mijn inbox".',
  status: 'Concept terwijl je schrijft; zet op "klaar" als het plan compleet is.',
  doel: 'Wat moet er automatisch gebeuren, in één zin?',
  trigger: 'Wat zet het in gang? Bijvoorbeeld "elke werkdag om 08:00".',
  triggerType: 'Kies hoe het proces start.',
  diensten: 'Welke diensten, bestanden of API\'s zijn betrokken?',
  data: 'Welke data stroomt erdoorheen? Van bron naar bestemming.',
  authenticatie:
    'Hoe logt de automation in? Zet secrets nooit in het plan — altijd op de doelmachine (bijv. omgevingsvariabele).',
  stapOmschrijving: 'Wat gebeurt er in deze stap, in gewone taal?',
  stapInvoer: 'Wat gaat erin?',
  stapUitvoer: 'Wat komt eruit?',
  stapFoutscenario: 'Wat als het misgaat? Wat moet de automation dan doen?',
  verificatie: 'Hoe weten we dat het werkt? Welk bewijs levert een run op?',
  testaanpak: 'Hoe testen? Bijvoorbeeld een droge run met testdata.',
  omgeving: 'Waar draait het? Bijvoorbeeld je Mac, VPS of een server.',
  planning: 'Hoe vaak of wanneer draait het?',
  faalafhandeling: 'Wat gebeurt er bij een mislukte run? Wie of wat wordt gewaarschuwd?',
  privacy: 'Welke privacy-eisen gelden? Liever offline of lokaal waar kan.',
  randgevallen: 'Welke uitzonderingen bestaan er? Lege resultaten, tijdzones, limieten?',
} as const
