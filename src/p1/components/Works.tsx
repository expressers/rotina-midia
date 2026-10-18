import { useRef, type RefObject } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { Play } from '@phosphor-icons/react'
import { features, srcSet, type Feature } from '../../shared/data'
import { usePlayer } from '../../shared/player'

export function Works() {
  const refs = useRef<(HTMLElement | null)[]>([])
  return (
    <section id="trabalhos" aria-labelledby="trabalhos-titulo" className="relative">
      <h2 id="trabalhos-titulo" className="sr-only">
        Trabalhos em destaque
      </h2>
      {features.map((f, i) => (
        <Panel
          key={f.video}
          feature={f}
          index={i}
          setRef={(el) => (refs.current[i] = el)}
          nextRef={{ get current() { return refs.current[i + 1] ?? null } } as RefObject<HTMLElement | null>}
          last={i === features.length - 1}
        />
      ))}
    </section>
  )
}

function Panel({
  feature: f,
  index,
  setRef,
  nextRef,
  last,
}: {
  feature: Feature
  index: number
  setRef: (el: HTMLElement | null) => void
  nextRef: RefObject<HTMLElement | null>
  last: boolean
}) {
  const own = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { open } = usePlayer()

  // Ken Burns while the panel arrives.
  const { scrollYProgress: arrive } = useScroll({ target: own, offset: ['start end', 'start start'] })
  const scale = useTransform(arrive, [0, 1], reduce ? [1, 1] : [1.18, 1.02])

  // Held back into the dark while the next panel slides over it.
  const { scrollYProgress: leave } = useScroll(last ? {} : { target: nextRef, offset: ['start end', 'start start'] })
  const shade = useTransform(leave, [0, 1], [0, last ? 0 : 0.75])
  const sink = useTransform(leave, [0, 1], reduce || last ? ['0%', '0%'] : ['0%', '-8%'])

  return (
    <article
      ref={(el) => {
        own.current = el
        setRef(el)
      }}
      className="sticky top-0 h-dvh overflow-hidden bg-ink"
      style={{ zIndex: index + 1 }}
      aria-label={`${f.title}, ${f.category}, ${f.place}`}
    >
      <motion.div className="absolute inset-0" style={{ y: sink }}>
        {f.scope ? (
          <div className="absolute inset-0 flex items-center justify-center md:px-[8vw]">
            <motion.img
              src={`/img/${f.image}-1280.webp`}
              alt={f.alt}
              width={1280}
              height={536}
              loading="lazy"
              decoding="async"
              style={{ scale }}
              className="h-full w-full object-cover md:aspect-[2.39/1] md:h-auto md:max-w-[1500px]"
            />
          </div>
        ) : (
          <motion.img
            src={`/img/${f.image}-1280.webp`}
            srcSet={srcSet(f.image, f.widths)}
            sizes="100vw"
            alt={f.alt}
            width={1920}
            height={1080}
            loading="lazy"
            decoding="async"
            style={{ scale }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        {!f.scope && <div className="absolute inset-0 bg-linear-to-b from-ink/50 via-ink/10 to-ink/70" aria-hidden />}
      </motion.div>

      {/* The centre line: title above, credits below. */}
      <div className="absolute inset-x-0 top-1/2 z-10 -translate-y-1/2 px-4 sm:px-8">
        <h3
          className={`display pb-3 text-paper drop-shadow-[0_4px_30px_rgba(0,0,0,0.45)] sm:pb-4 ${
            f.title.length > 18 ? 'max-w-[20ch] text-[10.5vw] md:text-[5.6vw]' : 'max-w-[16ch] text-[13vw] md:text-[7.5vw]'
          }`}
        >
          {f.title}
        </h3>
        <div className="h-px w-full bg-paper/50" aria-hidden />
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 pt-3 sm:pt-4">
          <p className="flex gap-6 text-sm font-medium tracking-[0.08em] text-paper uppercase sm:text-base">
            <span>{f.category}</span>
            <span className="text-paper/70">{f.place}</span>
          </p>
          <button
            type="button"
            onClick={() => open({ ids: [f.video], title: f.title })}
            className="press group flex items-center gap-3 bg-paper py-2.5 pr-5 pl-3 text-ink transition-colors duration-150 hover:bg-white"
          >
            <span className="grid size-7 place-items-center rounded-full bg-red text-paper">
              <Play size={13} weight="fill" className="translate-x-px" aria-hidden />
            </span>
            <span className="text-sm font-medium tracking-[0.08em] uppercase">Ver filme</span>
          </button>
        </div>
      </div>

      <motion.div className="pointer-events-none absolute inset-0 z-20 bg-ink" style={{ opacity: shade }} aria-hidden />
    </article>
  )
}
