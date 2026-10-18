import { useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { Play } from '@phosphor-icons/react'
import { filmography, type Film } from '../data'
import { usePlayer } from '../player'

/**
 * End-credits table. On pointer devices a still follows the cursor over rows that have one.
 */
export function Filmography() {
  const { open } = usePlayer()
  const reduce = useReducedMotion()
  const [hover, setHover] = useState<Film | null>(null)
  const area = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const x = useSpring(mx, { stiffness: 260, damping: 30, mass: 0.6 })
  const y = useSpring(my, { stiffness: 260, damping: 30, mass: 0.6 })

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || !area.current) return
    const r = area.current.getBoundingClientRect()
    mx.set(e.clientX - r.left)
    my.set(e.clientY - r.top)
  }

  return (
    <section id="filmografia" aria-labelledby="filmografia-titulo" className="relative z-10 bg-ink px-4 pt-32 pb-28 sm:px-8 md:pt-44 md:pb-40">
      <h2 id="filmografia-titulo" className="display text-[17vw] md:text-[9vw]">
        Filmografia
      </h2>

      <div ref={area} className="relative mt-10 md:mt-16" onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">Trabalhos da Rotina Mídia por categoria</caption>
          <thead className="sr-only md:not-sr-only">
            <tr className="text-xs tracking-[0.12em] text-dim uppercase">
              <th scope="col" className="hidden w-[22%] pb-4 font-medium md:table-cell">
                Categoria
              </th>
              <th scope="col" className="pb-4 font-medium">
                Título
              </th>
              <th scope="col" className="hidden pb-4 font-medium lg:table-cell">
                Local
              </th>
              <th scope="col" className="hidden w-20 pb-4 font-medium sm:table-cell">
                Ano
              </th>
              <th scope="col" className="w-12 pb-4 font-medium">
                <span className="sr-only">Filme</span>
              </th>
            </tr>
          </thead>
          {filmography.map((g) => (
            <tbody key={g.group} className="border-t border-paper/25">
              {g.films.map((f, i) => (
                <tr
                  key={f.title}
                  onPointerEnter={() => setHover(f.image ? f : null)}
                  className="group transition-colors duration-150 hover:bg-paper/[0.04]"
                >
                  <th scope="row" className="hidden align-top md:table-cell">
                    {i === 0 && <span className="block pt-4 text-sm font-medium tracking-[0.08em] text-red-ink uppercase">{g.group}</span>}
                  </th>
                  <td className="py-3 pr-4 md:py-4">
                    {i === 0 && <span className="mb-1 block text-xs font-medium tracking-[0.1em] text-red-ink uppercase md:hidden">{g.group}</span>}
                    <span className="display block text-[2rem] leading-[0.95] text-paper md:text-[2.6rem]">{f.title}</span>
                    <span className="mt-1 block text-sm text-dim lg:hidden">{[f.place, f.year].filter(Boolean).join(', ')}</span>
                  </td>
                  <td className="hidden py-4 pr-4 align-middle text-dim lg:table-cell">{f.place}</td>
                  <td className="tnum hidden py-4 align-middle text-dim sm:table-cell">{f.year}</td>
                  <td className="py-3 text-right align-middle md:py-4">
                    {f.video && (
                      <button
                        type="button"
                        onClick={() => open({ ids: [f.video!], title: f.title })}
                        className="press inline-grid size-10 place-items-center rounded-full border border-paper/40 text-paper transition-colors duration-150 hover:border-red hover:bg-red"
                        aria-label={`Ver filme: ${f.title}`}
                      >
                        <Play size={14} weight="fill" className="translate-x-px" aria-hidden />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          ))}
        </table>

        {!reduce && (
          <motion.div
            className="pointer-events-none absolute top-0 left-0 z-10 hidden w-[22vw] max-w-[360px] [@media(hover:hover)_and_(pointer:fine)]:block"
            style={{ x, y, translateX: '-50%', translateY: '-115%' }}
            aria-hidden
          >
            <AnimatePresence mode="popLayout">
              {hover && (
                <motion.img
                  key={hover.image}
                  src={`/img/${hover.image}-720.webp`}
                  alt=""
                  className="aspect-video w-full object-cover shadow-[0_24px_60px_-12px_rgba(0,0,0,0.8)]"
                  initial={{ opacity: 0, scale: 0.94, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.97, filter: 'blur(4px)', transition: { duration: 0.12 } }}
                  transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </section>
  )
}
