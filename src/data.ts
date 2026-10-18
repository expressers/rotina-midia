export type Film = {
  title: string
  category: string
  place?: string
  year?: string
  video?: string
  image?: string
}

/** Image base names in /public/img. Each exists as -720.webp and -1280.webp (most also -1920). */
export const img = (name: string, w: 720 | 1280 | 1920 = 1280) => `/img/${name}-${w}.webp`
export const srcSet = (name: string, widths: number[] = [720, 1280]) =>
  widths.map((w) => `/img/${name}-${w}.webp ${w}w`).join(', ')

export const SHOWREEL = ['LXxfrFPhoSY', 'qVphvpuwtds', 'Ap41LrhwKXY', 'OdtgXo-l9S4', 'YScU2LgGBcU']

export const stripFrames = [
  { name: 'candongueiro', alt: 'Jovem à janela de um candongueiro em Luanda' },
  { name: 'entranazona-mesa', alt: 'Jantar na campanha EntraNaZona' },
  { name: 'bai', alt: 'Conhecer Angola com o BAI' },
  { name: 'bastidores', alt: 'Bastidores de uma rodagem com luz e câmara' },
  { name: 'dioguito', alt: 'Videoclipe Tânia, de Dioguito' },
  { name: 'natal-bai-equipa', alt: 'Equipa do BAI no filme de Natal 2025' },
  { name: 'filda', alt: 'Palco da FILDA 2025' },
  { name: 'barco', alt: 'Noivos num barco' },
  { name: 'angotic', alt: 'Palco do Angotic 2025' },
  { name: 'casamento', alt: 'Noivos à entrada da festa' },
  { name: 'entranazona-festa', alt: 'Festa na campanha EntraNaZona' },
]

export type Feature = {
  title: string
  category: string
  place: string
  video: string
  image: string
  alt: string
  widths: number[]
  scope?: boolean
}

export const features: Feature[] = [
  {
    title: 'EntraNaZona',
    category: 'Campanha',
    place: 'Luanda',
    video: 'LXxfrFPhoSY',
    image: 'entranazona-mesa',
    alt: 'Mesa de jantar à luz de velas na campanha EntraNaZona',
    widths: [720, 1280],
  },
  {
    title: 'Afrimoney × Bulusinha & Cleyton M',
    category: 'Comercial',
    place: 'Luanda',
    video: 'qVphvpuwtds',
    image: 'africell',
    alt: 'Fotograma da campanha Afrimoney com luz magenta',
    widths: [720, 1280, 1920],
  },
  {
    title: 'Natal com BAI 2025',
    category: 'Corporativo',
    place: 'Luanda',
    video: 'Ap41LrhwKXY',
    image: 'natal-bai',
    alt: 'Abraço entre colegas diante da árvore de Natal do BAI',
    widths: [720, 1280],
  },
  {
    title: 'Back2Black',
    category: 'Documentário',
    place: 'Rio de Janeiro',
    video: 'OdtgXo-l9S4',
    image: 'back2black-scope',
    alt: 'Público e mesa de som no festival Back2Black',
    widths: [1280],
    scope: true,
  },
  {
    title: 'Jovens Embaixadores',
    category: 'Evento',
    place: 'São Paulo',
    video: 'YScU2LgGBcU',
    image: 'jovens-embaixadores',
    alt: 'Entrevista nocturna no programa Jovens Embaixadores',
    widths: [720, 1280],
  },
]

export const filmography: { group: string; films: Film[] }[] = [
  {
    group: 'Campanhas',
    films: [
      { title: 'EntraNaZona', category: 'Campanha', place: 'Luanda', video: 'LXxfrFPhoSY', image: 'entranazona-retrato' },
      { title: 'Afrimoney × Bulusinha & Cleyton M', category: 'Comercial', place: 'Luanda', video: 'qVphvpuwtds', image: 'africell' },
      { title: 'Africell', category: 'Campanha' },
      { title: 'Conhecer Angola com o BAI', category: 'Campanha', image: 'bai' },
    ],
  },
  {
    group: 'Corporativo e feiras',
    films: [
      { title: 'Natal com BAI', category: 'Corporativo', place: 'Luanda', year: '2025', video: 'Ap41LrhwKXY', image: 'natal-bai-equipa' },
      { title: 'Prémio Sirius Deloitte', category: 'Corporativo', place: 'Luanda', year: '2024' },
      { title: 'FILDA', category: 'Feira', place: 'Ícolo e Bengo', year: '2025', image: 'filda' },
      { title: 'US-Africa Business Summit', category: 'Feira', place: 'Luanda', year: '2025' },
      { title: 'Angotic', category: 'Feira', place: 'Luanda', year: '2025', image: 'angotic' },
      { title: 'FIB', category: 'Feira', place: 'Benguela', year: '2025' },
      { title: 'Etu Energias, lubrificantes', category: 'Lançamento', place: 'Luanda' },
      { title: 'Jovens Embaixadores', category: 'Evento', place: 'São Paulo', video: 'YScU2LgGBcU', image: 'jovens-embaixadores' },
    ],
  },
  {
    group: 'Videoclipes',
    films: [
      { title: 'Dioguito, “Tânia”', category: 'Videoclipe', place: 'Luanda', image: 'dioguito' },
      { title: 'Muloji', category: 'Videoclipe' },
      { title: 'Black Spygo & TRX, “Devolve”', category: 'Videoclipe' },
      { title: 'Yola Semedo, “Gaguejar”', category: 'Videoclipe' },
    ],
  },
  {
    group: 'Documentário',
    films: [{ title: 'Back2Black', category: 'Documentário', place: 'Rio de Janeiro', video: 'OdtgXo-l9S4', image: 'back2black-retrato' }],
  },
  {
    group: 'Casamentos e ensaios',
    films: [
      { title: 'Suleyma & Newton', category: 'Casamento' },
      { title: 'Nadiuska & Ed', category: 'Casamento' },
      { title: 'Ensaios em Bauru', category: 'Ensaio', place: 'Bauru, SP' },
    ],
  },
]

export const testimonials = [
  {
    quote:
      'Desde o início, a equipe demonstrou um alto nível de profissionalismo e paixão pela arte, o que se reflete em cada projeto realizado.',
    name: 'Yuri Almeida',
    role: 'BAI',
  },
  {
    quote:
      'Há cerca de três anos, contamos com a Rotina para a produção de vídeos corporativos e a experiência tem sido sempre excepcional.',
    name: 'Meraki',
    role: 'Vídeos corporativos',
  },
  {
    quote: 'Tive uma das melhores experiências e é claro, o meu casamento foi um sonho.',
    name: 'Suleyma Paquissi',
    role: 'Casamento',
  },
  {
    quote: 'Their professionalism goes beyond satisfaction and met our expectations as artists.',
    name: 'Snug Boy',
    role: 'Artista',
  },
]

export const contact = {
  luanda: { label: '+244 952 149 904', tel: '+244952149904', wa: 'https://wa.me/244952149904' },
  saoPaulo: { label: '+55 11 99208-1978', tel: '+5511992081978', wa: 'https://wa.me/5511992081978' },
  email: 'rotinamidia@gmail.com',
  address: 'Rua Visconde de Parnaíba, 1156, Mooca, São Paulo',
  instagram: 'https://www.instagram.com/rotina_midia/',
  youtube: 'https://www.youtube.com/@rotinamidia2537',
}
