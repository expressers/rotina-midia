import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'

const COL_A = [
  { name: 'bastidores', alt: 'Bastidores de uma rodagem' },
  { name: 'natal-bai-equipa', alt: 'Equipa do BAI' },
  { name: 'candongueiro', alt: 'Jovem num candongueiro' },
  { name: 'back2black-retrato', alt: 'Entrevista no Back2Black', w: 720 as const },
]
const COL_B = [
  { name: 'barco', alt: 'Noivos num barco' },
  { name: 'entranazona-retrato', alt: 'Retrato na campanha EntraNaZona' },
  { name: 'angotic', alt: 'Palco do Angotic 2025' },
  { name: 'jovens-embaixadores', alt: 'Entrevista em São Paulo' },
]

/**
 * Pinned title "Luanda / São Paulo" with frames travelling up behind it at two speeds.
 */
export function About() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const yA = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['30%', '-55%'])
  const yB = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['60%', '-80%'])

  return (
    <section id="sobre" ref={ref} aria-labelledby="sobre-titulo" className="relative z-10 h-[220vh] bg-ink">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <motion.div style={{ y: yA }} className="absolute top-0 left-[3vw] flex w-[38vw] flex-col gap-[6vh] md:left-[6vw] md:w-[24vw]">
          {COL_A.map((f) => (
            <Frame key={f.name} {...f} />
          ))}
        </motion.div>
        <motion.div style={{ y: yB }} className="absolute top-0 right-[3vw] flex w-[38vw] flex-col gap-[10vh] md:right-[8vw] md:w-[20vw]">
          {COL_B.map((f) => (
            <Frame key={f.name} {...f} />
          ))}
        </motion.div>
      </div>

      <div className="sticky top-0 flex h-dvh flex-col items-center justify-center px-4 sm:px-8">
        <h2 id="sobre-titulo" className="display text-center text-[19vw] leading-[0.82] md:text-[11.5vw]">
          Luanda <span className="text-red">/</span>
          <br className="md:hidden" /> São Paulo
        </h2>
        <div className="mt-10 grid max-w-3xl gap-5 bg-ink/75 px-4 py-4 text-center md:mt-12">
          <p className="text-lg leading-relaxed text-paper md:text-xl">
            Somos uma produtora audiovisual entre Angola e o Brasil. Contamos histórias que emocionam: campanhas, videoclipes, filmes corporativos,
            feiras, documentários e casamentos.
          </p>
          <p className="text-dim">
            Realização de <span className="font-medium text-paper">Fernando Filó</span>, do guião à edição.
          </p>
        </div>
      </div>
    </section>
  )
}

function Frame({ name, alt, w = 720 }: { name: string; alt: string; w?: 720 }) {
  return (
    <div className="aspect-video w-full overflow-hidden bg-film opacity-55">
      <img src={`/img/${name}-${w}.webp`} alt={alt} width={720} height={405} loading="lazy" decoding="async" className="h-full w-full object-cover" />
    </div>
  )
}
