import { features } from '../shared/data'

/**
 * The film, in journey progress (0..1 over the scroll of #journey).
 * Camera stations, overlays and the act scrubber all read from here.
 */
export const T = {
  intro: 0,
  enter: 0.065,
  through: 0.1,
  rotina: 0.165,
  rotina2: 0.235,
  olhar: 0.305,
  films: [0.385, 0.445, 0.505, 0.565, 0.625],
  luanda: 0.705,
  saoPaulo: 0.775,
  vozes: [0.83, 0.855, 0.88, 0.905],
  fim: 0.955,
  end: 1,
} as const

export const ACTS = [
  { n: 'I', label: 'A rotina', t: T.rotina },
  { n: 'II', label: 'O olhar', t: T.olhar },
  { n: 'III', label: 'Os filmes', t: T.films[0] },
  { n: 'IV', label: 'Dois mundos', t: T.luanda },
  { n: 'V', label: 'Vozes', t: T.vozes[0] },
  { n: 'VI', label: 'Fim', t: T.fim },
]

/** z position of each feature screen, alternating sides of the path. */
export const FILM_Z = [-62, -74, -86, -98, -110]
export const FILM_X = [-2.4, 2.4, -2.4, 2.4, -2.4]
export const FILMS = features

export const ECLIPSE_END_Z = -194
