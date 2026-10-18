import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { testimonials } from '../data'

export function Testimonials() {
  const [active, setActive] = useState(0)
  const reduce = useReducedMotion()
  const t = testimonials[active]

  return (
    <section aria-labelledby="depoimentos-titulo" className="relative z-10 border-t border-paper/15 bg-ink px-4 py-28 sm:px-8 md:py-40">
      <h2 id="depoimentos-titulo" className="sr-only">
        Depoimentos
      </h2>
      <div className="grid gap-12 md:grid-cols-[1fr_minmax(220px,300px)] md:gap-20">
        <figure className="min-h-[15rem] md:min-h-[20rem]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8, filter: 'blur(3px)', transition: { duration: 0.15 } }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            >
              <blockquote className="max-w-[30ch] font-sans text-[1.65rem] leading-[1.25] font-medium text-paper text-balance md:text-[2.6rem] md:leading-[1.15]">
                <span className="text-red-ink">“</span>
                {t.quote}
                <span className="text-red-ink">”</span>
              </blockquote>
              <figcaption className="mt-8 text-dim">
                <span className="font-medium text-paper">{t.name}</span>, {t.role}
              </figcaption>
            </motion.div>
          </AnimatePresence>
        </figure>

        <div role="tablist" aria-label="Escolher depoimento" className="flex flex-row flex-wrap gap-x-6 gap-y-3 md:flex-col md:gap-0 md:border-l md:border-paper/20">
          {testimonials.map((q, i) => (
            <button
              key={q.name}
              role="tab"
              type="button"
              aria-selected={i === active}
              onClick={() => setActive(i)}
              className={`display relative text-left text-2xl transition-colors duration-150 md:py-3 md:pl-6 md:text-3xl ${
                i === active ? 'text-paper' : 'text-paper/45 hover:text-paper/80'
              }`}
            >
              {i === active && (
                <motion.span
                  layoutId="testimonial-mark"
                  className="absolute -bottom-1 left-0 h-0.5 w-full bg-red md:top-0 md:bottom-0 md:-left-px md:h-full md:w-0.5"
                  transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
                  aria-hidden
                />
              )}
              {q.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
