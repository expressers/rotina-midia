import { Play } from '@phosphor-icons/react'
import { Logo } from '../shared/Logo'
import { SHOWREEL, testimonials } from '../shared/data'
import { usePlayer } from '../shared/player'
import { FILMS } from './story'
import { Credits } from './Credits'

/**
 * Same story without the camera move: for reduced motion or no WebGL.
 */
export function StaticTempo() {
  const { open } = usePlayer()
  return (
    <div className="tempo bg-ink">
      <header className="flex items-center justify-between px-4 py-5 sm:px-8">
        <Logo className="h-6 w-auto text-paper" />
      </header>
      <section className="flex min-h-[80dvh] flex-col items-center justify-center px-4 text-center">
        <h1 className="display text-[15vw] leading-[0.84] md:text-[9vw]">
          Da rotina
          <br />
          ao cinema.
        </h1>
        <p className="mt-6 text-[0.72rem] tracking-[0.42em] text-paper/70 uppercase">Produtora audiovisual · Luanda / São Paulo</p>
        <button type="button" onClick={() => open({ ids: SHOWREEL, title: 'Showreel Rotina Mídia' })} className="press mt-10 flex items-center gap-3">
          <span className="grid size-14 place-items-center rounded-full bg-red text-paper">
            <Play size={22} weight="fill" aria-hidden />
          </span>
          <span className="display text-2xl">Ver showreel</span>
        </button>
      </section>

      {[
        { n: 'I', label: 'A rotina', line: 'Tudo começa numa rotina.', img: 'candongueiro' },
        { n: 'II', label: 'O olhar', line: 'Até alguém decidir olhar.', img: 'bastidores' },
      ].map((c) => (
        <section key={c.n} className="px-4 py-20 sm:px-8">
          <p className="chapter-mark">
            <span className="text-red-ink">{c.n}</span> {c.label}
          </p>
          <img src={`/img/${c.img}-1280.webp`} alt="" className="mt-6 aspect-video w-full object-cover" loading="lazy" />
          <p className="statement mt-8">{c.line}</p>
        </section>
      ))}

      <section className="px-4 py-20 sm:px-8">
        <p className="chapter-mark">
          <span className="text-red-ink">III</span> Os filmes
        </p>
        <div className="mt-8 grid gap-12">
          {FILMS.map((f) => (
            <article key={f.video}>
              <img src={`/img/${f.image}-1280.webp`} alt={f.alt} className="aspect-video w-full object-cover" loading="lazy" />
              <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-[0.72rem] tracking-[0.35em] text-paper/70 uppercase">
                    {f.category} / {f.place}
                  </p>
                  <h2 className="display mt-2 text-5xl">{f.title}</h2>
                </div>
                <button type="button" onClick={() => open({ ids: [f.video], title: f.title })} className="press bg-paper px-4 py-2.5 text-sm font-medium tracking-[0.12em] text-ink uppercase">
                  Ver filme
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 py-20 sm:px-8">
        <p className="chapter-mark">
          <span className="text-red-ink">V</span> Vozes
        </p>
        <div className="mt-8 grid gap-10">
          {testimonials.map((q) => (
            <figure key={q.name}>
              <blockquote className="max-w-[34ch] text-2xl text-paper">“{q.quote}”</blockquote>
              <figcaption className="mt-3 text-[0.72rem] tracking-[0.35em] text-paper/60 uppercase">
                {q.name}, {q.role}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <Credits />
    </div>
  )
}
