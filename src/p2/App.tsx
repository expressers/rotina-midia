import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { Play, SpeakerSimpleHigh, SpeakerSimpleSlash } from '@phosphor-icons/react'
import { Logo, Mark } from '../shared/Logo'
import { PlayerProvider, usePlayer } from '../shared/player'
import { setLenis } from '../shared/lenis'
import { Switcher } from '../shared/Switcher'
import { SHOWREEL, testimonials } from '../shared/data'
import { ACTS, FILMS, T } from './story'
import { Stage } from './scene/Stage'
import { Score } from './scene/sound'
import { Credits } from './Credits'
import { StaticTempo } from './StaticTempo'

gsap.registerPlugin(ScrollTrigger)

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

function canRun3D() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

export default function App() {
  const [mode] = useState<'3d' | 'static'>(() => (canRun3D() ? '3d' : 'static'))
  return (
    <PlayerProvider>
      {mode === '3d' ? <Tempo /> : <StaticTempo />}
      <Switcher current={2} />
    </PlayerProvider>
  )
}

/** A window on the journey: [in, out] with soft edges. */
function windowAt(p: number, a: number, b: number, fade = 0.012) {
  return smooth(a, a + fade, p) * (1 - smooth(b - fade, b, p))
}

function Tempo() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const journeyRef = useRef<HTMLDivElement>(null)
  const layerRef = useRef<HTMLDivElement>(null)
  const lbRef = useRef<HTMLDivElement>(null)
  const scrubRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<Stage | null>(null)
  const lenisRef = useRef<Lenis | null>(null)
  const score = useRef(new Score())
  const introTl = useRef<gsap.core.Timeline | null>(null)
  const [loaded, setLoaded] = useState(0)
  const [phase, setPhase] = useState<'loading' | 'intro' | 'ready'>('loading')
  const [sound, setSound] = useState(false)
  const [act, setAct] = useState(-1)
  const actRef = useRef(-2)
  const { open } = usePlayer()

  // Stage.
  useLayoutEffect(() => {
    const canvas = canvasRef.current!
    const stage = new Stage(
      canvas,
      (p) => setLoaded(p),
      () => setPhase((ph) => (ph === 'loading' ? 'intro' : ph)),
    )
    stageRef.current = stage
    stage.start()
    const onResize = () => stage.resize()
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') stage.pointer((e.clientX / innerWidth) * 2 - 1, -((e.clientY / innerHeight) * 2 - 1))
    }
    const onVis = () => (document.hidden ? stage.stop() : stage.start())
    window.addEventListener('resize', onResize)
    window.addEventListener('pointermove', onMove)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('visibilitychange', onVis)
      stage.dispose()
    }
  }, [])

  // Lenis on the GSAP ticker, locked until the opening ends.
  useLayoutEffect(() => {
    const lenis = new Lenis({ lerp: 0.075, anchors: false })
    lenisRef.current = lenis
    setLenis(lenis)
    lenis.stop()
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    window.scrollTo(0, 0)
    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      setLenis(null)
    }
  }, [])

  // Overlays, letterbox and scrubber follow the journey progress.
  const paint = useCallback((p: number) => {
    const layer = layerRef.current
    if (layer) {
      layer.querySelectorAll<HTMLElement>('[data-in]').forEach((el) => {
        const a = Number(el.dataset.in)
        const b = Number(el.dataset.out)
        const o = windowAt(p, a, b, Number(el.dataset.fade ?? 0.012))
        el.style.opacity = String(o)
        el.style.visibility = o < 0.01 ? 'hidden' : 'visible'
        const rise = el.dataset.rise ? Number(el.dataset.rise) : 18
        el.style.transform = `translate3d(0, ${(1 - o) * rise * (p < (a + b) / 2 ? 1 : -1)}px, 0)`
        el.style.pointerEvents = o > 0.6 ? 'auto' : 'none'
      })
      // São Paulo turns over with the fold.
      const sp = layer.querySelector<HTMLElement>('[data-flip]')
      if (sp) sp.style.transform = `rotateX(${(1 - smooth(T.luanda + 0.02, T.saoPaulo - 0.01, p)) * 180}deg)`
    }
    // IMAX for most of the film; scope bars while the films play.
    const scope = windowAt(p, T.films[0] - 0.03, T.films[4] + 0.03, 0.02)
    document.documentElement.style.setProperty('--scope', String(scope))
    const i = ACTS.reduce((acc, a, idx) => (p >= a.t - 0.03 ? idx : acc), -1)
    if (i !== actRef.current) {
      if (i >= 0 && actRef.current !== -2) score.current.hit()
      actRef.current = i
      setAct(i)
    }
    score.current.setProgress(p)
    if (scrubRef.current) scrubRef.current.style.setProperty('--p', String(p))
  }, [])

  useLayoutEffect(() => {
    document.documentElement.style.setProperty('--open', '0')
    paint(0)
  }, [paint])

  // Scroll -> progress.
  useEffect(() => {
    if (phase !== 'ready') return
    const state = { p: 0 }
    const tween = gsap.to(state, {
      p: 1,
      ease: 'none',
      scrollTrigger: { trigger: journeyRef.current, start: 'top top', end: 'bottom bottom', scrub: 1.1 },
      onUpdate: () => {
        if (stageRef.current) stageRef.current.progress = state.p
        paint(state.p)
      },
    })
    // Let the canvas sink behind the credits.
    const dim = gsap.to(canvasRef.current, {
      opacity: 0.28,
      ease: 'none',
      scrollTrigger: { trigger: '#creditos', start: 'top bottom', end: 'top 30%', scrub: true },
    })
    // The story layer and the act scrubber leave when the credits arrive.
    const outro = ScrollTrigger.create({
      trigger: '#creditos',
      start: 'top 80%',
      onEnter: () => gsap.to([layerRef.current, scrubRef.current], { autoAlpha: 0, duration: 0.5, overwrite: 'auto' }),
      onLeaveBack: () => gsap.to([layerRef.current, scrubRef.current], { autoAlpha: 1, duration: 0.5, overwrite: 'auto' }),
    })
    ScrollTrigger.refresh()
    paint(0)
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
      dim.scrollTrigger?.kill()
      dim.kill()
      outro.kill()
    }
  }, [phase, paint])

  // The opening.
  useEffect(() => {
    if (phase !== 'intro') return
    const stage = stageRef.current!
    const lenis = lenisRef.current!
    document.documentElement.classList.add('is-intro')
    const proxy = { v: 0 }
    const tl = gsap.timeline({
      onComplete: () => {
        document.documentElement.classList.remove('is-intro')
        lenis.start()
        setPhase('ready')
      },
    })
    tl.to(proxy, { v: 1, duration: 3.6, ease: 'power2.inOut', onUpdate: () => (stage.intro = proxy.v) }, 0)
      .fromTo('.t-line', { yPercent: 110 }, { yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.14 }, 2.1)
      .fromTo('.t-sub', { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 2.9)
      .to(document.documentElement, { '--open': 1, duration: 1.3, ease: 'expo.inOut' }, 3.0)
      .fromTo('.hud', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8, ease: 'power2.out' }, 3.3)
    introTl.current = tl
    const skip = () => tl.progress() < 1 && tl.progress(1)
    const opts = { once: true, passive: true } as const
    window.addEventListener('wheel', skip, opts)
    window.addEventListener('touchmove', skip, opts)
    window.addEventListener('keydown', skip, opts)
    return () => {
      window.removeEventListener('wheel', skip)
      window.removeEventListener('touchmove', skip)
      window.removeEventListener('keydown', skip)
    }
  }, [phase])

  const toggleSound = () => {
    if (sound) score.current.stop()
    else score.current.start()
    setSound(!sound)
  }

  const goToAct = (t: number) => {
    const j = journeyRef.current
    const lenis = lenisRef.current
    if (!j || !lenis) return
    const top = j.offsetTop
    const y = top + t * (j.offsetHeight - innerHeight)
    lenis.scrollTo(y, { duration: 2.4, easing: (x) => 1 - Math.pow(1 - x, 4) })
  }

  const goToContact = (e: React.MouseEvent) => {
    e.preventDefault()
    lenisRef.current?.scrollTo('#proxima-cena', { duration: 2.6 })
  }

  return (
    <div className="tempo">
      <canvas ref={canvasRef} className="fixed inset-0 z-0 h-dvh w-screen" aria-hidden />

      {/* Letterbox: 2.39:1 during the opening, IMAX after, scope again while the films play. */}
      <div ref={lbRef} className="letterbox pointer-events-none fixed inset-0 z-20" aria-hidden>
        <span />
        <span />
      </div>

      {/* Loader */}
      <div
        className={`fixed inset-0 z-50 grid place-items-center bg-[#050506] transition-opacity duration-700 ${phase === 'loading' ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        aria-hidden={phase !== 'loading'}
      >
        <div className="flex flex-col items-center gap-5">
          <Mark className="h-8 w-auto text-red" />
          <p className="tnum font-display text-sm tracking-[0.4em] text-paper/70" role="status">
            {String(Math.round(loaded * 100)).padStart(3, '0')}
          </p>
        </div>
      </div>

      {/* HUD */}
      <header className="hud fixed inset-x-0 top-0 z-30 flex items-center justify-between px-4 py-4 sm:px-8 sm:py-5">
        <a href="/proposta-2/" className="text-paper" aria-label="Rotina Mídia">
          <Logo className="h-[22px] w-auto sm:h-[26px]" />
        </a>
        <div className="flex items-center gap-2 sm:gap-5">
          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={sound}
            className="press flex items-center gap-2 px-2 py-2 text-[0.72rem] tracking-[0.3em] text-paper/75 uppercase hover:text-paper"
          >
            {sound ? <SpeakerSimpleHigh size={18} aria-hidden /> : <SpeakerSimpleSlash size={18} aria-hidden />}
            <span className="hidden sm:inline">{sound ? 'Som ligado' : 'Som'}</span>
            <span className="sr-only sm:hidden">{sound ? 'Desligar som' : 'Ligar som'}</span>
          </button>
          <a href="#proxima-cena" onClick={goToContact} className="press bg-paper px-3.5 py-2 text-[0.72rem] font-medium tracking-[0.2em] text-ink uppercase no-underline hover:bg-white">
            Contacto
          </a>
        </div>
      </header>

      {/* Act scrubber */}
      <nav ref={scrubRef} aria-label="Actos" className="hud scrubber fixed bottom-4 left-1/2 z-30 -translate-x-1/2 sm:bottom-5">
        <ol className="flex items-center gap-1">
          {ACTS.map((a, i) => (
            <li key={a.n}>
              <button
                type="button"
                onClick={() => goToAct(a.t)}
                aria-current={act === i ? 'step' : undefined}
                className={`group flex h-8 items-center gap-2 px-2.5 text-[0.7rem] tracking-[0.25em] uppercase transition-colors duration-200 ${act === i ? 'text-paper' : 'text-paper/45 hover:text-paper/85'}`}
              >
                <span className={`font-display text-sm tracking-normal ${act === i ? 'text-red-ink' : ''}`}>{a.n}</span>
                <span className={`hidden lg:inline ${act === i ? '' : 'lg:hidden lg:group-hover:inline'}`}>{a.label}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      {/* Story overlays (fixed), driven by journey progress */}
      <div ref={layerRef} className="pointer-events-none fixed inset-0 z-10 [perspective:900px]">
        {/* Title */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-[18vh] text-center" data-in="-1" data-out={T.enter - 0.015} data-fade="0.02">
          <h1 className="display text-[15vw] leading-[0.84] md:text-[min(9.5vw,15vh)]">
            <span className="block overflow-hidden"><span className="t-line block">Da rotina</span></span>
            <span className="block overflow-hidden"><span className="t-line block">ao cinema.</span></span>
          </h1>
          <p className="t-sub mt-6 px-4 text-[0.68rem] tracking-[0.28em] text-paper/70 uppercase sm:text-[0.72rem] sm:tracking-[0.42em]">Produtora audiovisual · Luanda / São Paulo</p>
        </div>

        <Chapter n="I" label="A rotina" a={T.rotina - 0.04} b={T.rotina2 + 0.03} line="Tudo começa numa rotina." sub="Um candongueiro, uma mesa posta, um palco por montar." />
        <Chapter n="II" label="O olhar" a={T.olhar - 0.03} b={T.olhar + 0.035} line="Até alguém decidir olhar." sub="Realização de Fernando Filó, do guião à edição." />

        {/* III: the films */}
        <p className="chapter-mark absolute top-24 left-4 sm:top-28 sm:left-8" data-in={T.films[0] - 0.035} data-out={T.films[4] + 0.03} data-rise="0">
          <span className="text-red-ink">III</span> Os filmes
        </p>
        {FILMS.map((f, i) => (
          <div key={f.video} className="film absolute inset-x-0 bottom-[calc(var(--lb-h)+4.5rem)] px-4 sm:bottom-[calc(var(--lb-h)+3rem)] sm:px-8" data-in={T.films[i] - 0.026} data-out={T.films[i] + 0.026}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-2 text-[0.72rem] tracking-[0.35em] text-paper/75 uppercase">
                  {f.category} <span className="text-paper/40">/</span> {f.place}
                </p>
                <h2 className={`display ${f.title.length > 18 ? 'text-[10vw] md:text-[4.6vw]' : 'text-[14vw] md:text-[7vw]'}`}>{f.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => open({ ids: [f.video], title: f.title })}
                className="press flex w-max items-center gap-3 bg-paper py-2.5 pr-5 pl-3 text-ink hover:bg-white"
              >
                <span className="grid size-7 place-items-center rounded-full bg-red text-paper">
                  <Play size={13} weight="fill" className="translate-x-px" aria-hidden />
                </span>
                <span className="text-sm font-medium tracking-[0.12em] uppercase">Ver filme</span>
              </button>
            </div>
          </div>
        ))}

        {/* IV: two worlds */}
        <p className="chapter-mark absolute top-24 left-4 sm:top-28 sm:left-8" data-in={T.luanda - 0.04} data-out={T.saoPaulo + 0.03} data-rise="0">
          <span className="text-red-ink">IV</span> Dois mundos
        </p>
        <div className="absolute inset-x-0 bottom-[16vh] text-center" data-in={T.luanda - 0.035} data-out={T.luanda + 0.03}>
          <p className="display text-[22vw] md:text-[12vw]">Luanda</p>
        </div>
        <div className="absolute inset-x-0 top-[18vh] text-center [transform-style:preserve-3d]" data-in={T.saoPaulo - 0.03} data-out={T.saoPaulo + 0.035}>
          <p data-flip className="display origin-bottom text-[22vw] [backface-visibility:hidden] md:text-[12vw]">São Paulo</p>
        </div>
        <p className="statement absolute inset-x-0 bottom-[22vh] px-4 text-center sm:bottom-[10vh]" data-in={T.saoPaulo - 0.015} data-out={T.saoPaulo + 0.035}>
          Uma produtora, duas cidades, o mesmo olhar.
        </p>

        {/* V: voices as subtitles */}
        <p className="chapter-mark absolute top-24 left-4 sm:top-28 sm:left-8" data-in={T.vozes[0] - 0.02} data-out={T.vozes[3] + 0.02} data-rise="0">
          <span className="text-red-ink">V</span> Vozes
        </p>
        {testimonials.map((q, i) => (
          <figure key={q.name} className="subtitle absolute inset-x-0 bottom-[14vh] px-4 text-center" data-in={T.vozes[i] - 0.0125} data-out={T.vozes[i] + 0.0125} data-fade="0.004" data-rise="0">
            <blockquote className="mx-auto max-w-[34ch] text-[1.3rem] leading-snug text-paper sm:text-[1.9rem]">{q.quote}</blockquote>
            <figcaption className="mt-3 text-[0.72rem] tracking-[0.35em] text-paper/60 uppercase">
              {q.name}, {q.role}
            </figcaption>
          </figure>
        ))}

        {/* VI: the end, as a beginning */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 text-center" data-in={T.fim - 0.03} data-out="2" data-fade="0.025">
          <Logo className="h-[clamp(2.5rem,7vw,6rem)] w-auto text-paper" />
          <p className="text-[0.72rem] tracking-[0.42em] text-paper/70 uppercase">Da rotina ao cinema.</p>
          <button
            type="button"
            onClick={() => open({ ids: SHOWREEL, title: 'Showreel Rotina Mídia' })}
            className="press mt-2 flex items-center gap-3 text-paper"
          >
            <span className="grid size-14 place-items-center rounded-full bg-red shadow-[0_10px_40px_-8px_rgba(191,8,17,0.7)]">
              <Play size={22} weight="fill" className="translate-x-0.5" aria-hidden />
            </span>
            <span className="display text-2xl">Ver showreel</span>
          </button>
        </div>
      </div>

      {/* The scroll that drives the film */}
      <div ref={journeyRef} id="filme" className="relative z-0 h-[1500vh]" aria-hidden />

      <Credits />
    </div>
  )
}

function Chapter({ n, label, a, b, line, sub }: { n: string; label: string; a: number; b: number; line: string; sub: string }) {
  return (
    <>
      <p className="chapter-mark absolute top-24 left-4 sm:top-28 sm:left-8" data-in={a} data-out={b} data-rise="0">
        <span className="text-red-ink">{n}</span> {label}
      </p>
      <div className="absolute inset-x-0 bottom-[14vh] px-4 text-center sm:bottom-[16vh]" data-in={a + 0.01} data-out={b}>
        <p className="statement mx-auto">{line}</p>
        <p className="mt-4 text-[0.72rem] tracking-[0.35em] text-paper/65 uppercase">{sub}</p>
      </div>
    </>
  )
}
