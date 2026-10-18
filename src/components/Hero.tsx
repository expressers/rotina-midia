import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { Play } from '@phosphor-icons/react'
import { SHOWREEL, srcSet, stripFrames } from '../data'
import { usePlayer } from '../player'

const N = stripFrames.length
const EASE = [0.23, 1, 0.32, 1] as const

/**
 * Pinned poster. The phrase is split and held at the edges while a strip of
 * 16:9 frames runs through a fixed gate in the middle, driven by scroll.
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { open } = usePlayer()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })

  // Frame 1 sits in the gate at rest; the last-but-one reaches it at the end of the pin.
  // Intermittent pull-down, like a projector: each frame holds in the gate, then the next is pulled in.
  const transform = useTransform(scrollYProgress, (p) => {
    const raw = (reduce ? 0 : p) * (N - 3)
    const i = Math.floor(raw)
    const t = Math.min(1, Math.max(0, (raw - i - 0.35) / 0.5))
    const k = 1 + i + t * t * (3 - 2 * t)
    return `translate3d(calc(50vw - var(--fw) / 2 - ${k} * (var(--fw) + var(--gap))), 0, 0)`
  })
  const lineLeft = useTransform(scrollYProgress, [0, 1], ['0vw', reduce ? '0vw' : '-4vw'])
  const lineRight = useTransform(scrollYProgress, [0, 1], ['0vw', reduce ? '0vw' : '4vw'])

  const reveal = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { clipPath: 'inset(0 0 100% 0)', y: '0.25em' },
          animate: { clipPath: 'inset(0 0 -10% 0)', y: '0em' },
          transition: { duration: 1.1, delay, ease: EASE },
        }

  return (
    <section
      id="top"
      ref={ref}
      aria-label="Rotina Mídia"
      className="relative h-[230vh] [--fw:86vw] [--gap:10px] sm:h-[260vh] md:[--fw:min(34vw,62vh)] md:[--gap:14px] lg:[--fw:min(30vw,62vh)]"
    >
      <div className="sticky top-0 flex h-dvh flex-col justify-between overflow-hidden pt-20 pb-6 sm:pt-24 sm:pb-8">
        <h1 className="sr-only">Rotina Mídia, da rotina ao cinema. Produtora audiovisual entre Luanda e São Paulo.</h1>

        <motion.p aria-hidden style={{ x: lineLeft }} className="display px-4 text-[23vw] sm:px-8 md:text-[min(14vw,19vh)]">
          <motion.span className="block" {...reveal(0.15)}>
            Da rotina
          </motion.span>
        </motion.p>

        {/* Film strip and gate */}
        <div className="relative my-4 sm:my-6">
          <motion.div
            className="relative"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.35, ease: EASE }}
          >
            <div className="perfs h-4 w-full sm:h-5" aria-hidden />
            <div className="overflow-hidden bg-film">
              <motion.ul className="flex w-max gap-(--gap) will-change-transform" style={{ transform }}>
                {stripFrames.map((f) => (
                  <li key={f.name} className="relative aspect-video w-(--fw) shrink-0 overflow-hidden bg-ink">
                    <img
                      src={`/img/${f.name}-720.webp`}
                      srcSet={srcSet(f.name)}
                      sizes="(min-width: 1024px) 30vw, (min-width: 768px) 34vw, 86vw"
                      alt={f.alt}
                      width={1280}
                      height={720}
                      loading="eager"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  </li>
                ))}
              </motion.ul>
            </div>
            <div className="perfs h-4 w-full sm:h-5" aria-hidden />
            {/* The gate: everything outside it is held back like the dark around a projector aperture. */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
              <div className="absolute top-4 left-1/2 aspect-video w-(--fw) -translate-x-1/2 shadow-[0_0_0_100vmax_rgba(11,10,9,0.58)] sm:top-5">
                <span className="absolute -top-px -left-px h-5 w-5 border-t-2 border-l-2 border-paper/80" />
                <span className="absolute -top-px -right-px h-5 w-5 border-t-2 border-r-2 border-paper/80" />
                <span className="absolute -bottom-px -left-px h-5 w-5 border-b-2 border-l-2 border-paper/80" />
                <span className="absolute -right-px -bottom-px h-5 w-5 border-r-2 border-b-2 border-paper/80" />
              </div>
            </div>
          </motion.div>

          <div className="absolute inset-0 flex items-center justify-center">
            <motion.button
              type="button"
              onClick={() => open({ ids: SHOWREEL, title: 'Showreel Rotina Mídia' })}
              initial={reduce ? false : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.9, ease: EASE }}
              className="group flex items-center gap-4"
            >
              <span className="press grid size-16 place-items-center rounded-full bg-red text-paper shadow-[0_10px_40px_-8px_rgba(191,8,17,0.6)] transition-transform duration-200 ease-(--ease-out-strong) group-hover:scale-105 sm:size-20">
                <Play size={28} weight="fill" className="translate-x-0.5" aria-hidden />
              </span>
              <span className="display text-2xl text-paper drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)] sm:text-3xl">Ver showreel</span>
            </motion.button>
          </div>
        </div>

        <div className="flex flex-col gap-4 px-4 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <motion.p
            className="order-2 max-w-[34ch] text-[0.95rem] leading-snug text-dim md:text-base lg:order-1 lg:mb-[1.2vw]"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: EASE }}
          >
            Produtora audiovisual entre Luanda e São Paulo. Campanhas, videoclipes, corporativo e casamentos, do guião à edição.
          </motion.p>
          <motion.p aria-hidden style={{ x: lineRight }} className="display order-1 self-end text-right whitespace-nowrap text-[23vw] lg:order-2 md:text-[min(14vw,19vh)]">
            <motion.span className="block" {...reveal(0.3)}>
              ao cinema.
            </motion.span>
          </motion.p>
        </div>
      </div>
    </section>
  )
}
