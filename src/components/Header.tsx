import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValueEvent, useScroll } from 'motion/react'
import { List, X } from '@phosphor-icons/react'
import { Logo } from './Logo'
import { goTo } from '../lenis'

const NAV = [
  { href: '#trabalhos', label: 'Trabalhos' },
  { href: '#sobre', label: 'Sobre' },
  { href: '#filmografia', label: 'Filmografia' },
  { href: '#contacto', label: 'Contacto' },
]

/** 24 fps; one frame for every 6px scrolled. */
const PX_PER_FRAME = 6
const pad = (n: number) => String(n).padStart(2, '0')
export function timecode(px: number) {
  const frames = Math.max(0, Math.floor(px / PX_PER_FRAME))
  const ff = frames % 24
  const totalS = Math.floor(frames / 24)
  return `${pad(Math.floor(totalS / 3600))}:${pad(Math.floor(totalS / 60) % 60)}:${pad(totalS % 60)}:${pad(ff)}`
}

export function Header() {
  const { scrollY, scrollYProgress } = useScroll()
  const tcRef = useRef<HTMLSpanElement>(null)
  const [menu, setMenu] = useState(false)

  useMotionValueEvent(scrollY, 'change', (v) => {
    if (tcRef.current) tcRef.current.textContent = timecode(v)
  })

  useEffect(() => {
    if (!menu) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menu])

  const nav = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    setMenu(false)
    goTo(href)
  }

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <div className="pointer-events-none absolute inset-0 h-28 bg-linear-to-b from-ink/85 via-ink/40 to-transparent" aria-hidden />
      <div className="relative mx-auto flex h-16 items-center justify-between gap-6 px-4 sm:h-[72px] sm:px-8">
        <a href="#top" onClick={nav('#top')} className="press shrink-0 text-paper" aria-label="Rotina Mídia, início">
          <Logo className="h-[22px] w-auto sm:h-[26px]" />
        </a>

        <nav aria-label="Principal" className="hidden md:block">
          <ul className="flex items-center gap-8">
            {NAV.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={nav(l.href)}
                  className="text-[0.95rem] font-medium text-paper/80 no-underline transition-colors duration-150 hover:text-paper"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-4">
          <p className="flex items-baseline gap-2 text-paper" aria-hidden title="Timecode da página">
            <span className="text-[0.7rem] font-medium tracking-[0.12em] text-red-ink">TC</span>
            <span ref={tcRef} className="tnum font-display text-lg leading-none tracking-wide sm:text-xl">
              00:00:00:00
            </span>
          </p>
          <button
            type="button"
            className="press -mr-2 p-2 text-paper md:hidden"
            aria-expanded={menu}
            aria-controls="menu-movel"
            onClick={() => setMenu((m) => !m)}
          >
            <span className="sr-only">{menu ? 'Fechar menu' : 'Abrir menu'}</span>
            {menu ? <X size={24} weight="bold" aria-hidden /> : <List size={24} weight="bold" aria-hidden />}
          </button>
        </div>
      </div>

      {/* Playhead: scroll progress through the reel. */}
      <motion.div
        aria-hidden
        className="absolute inset-x-0 top-16 h-px origin-left bg-red sm:top-[72px]"
        style={{ scaleX: scrollYProgress }}
      />

      <div
        id="menu-movel"
        hidden={!menu}
        className="fixed inset-x-0 top-16 bottom-0 bg-ink px-4 pt-10 md:hidden"
      >
        <ul className="flex flex-col gap-2">
          {NAV.map((l) => (
            <li key={l.href}>
              <a href={l.href} onClick={nav(l.href)} className="display block py-2 text-6xl text-paper no-underline">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  )
}
