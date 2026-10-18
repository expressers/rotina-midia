import { ArrowUpRight, Play, WhatsappLogo } from '@phosphor-icons/react'
import { contact, filmography } from '../shared/data'
import { usePlayer } from '../shared/player'

/** End credits that roll by natural scroll, then the next scene: contact. */
export function Credits() {
  const { open } = usePlayer()
  return (
    <>
      <section id="creditos" aria-labelledby="creditos-titulo" className="relative z-10 px-4 pt-[30vh] pb-[20vh] sm:px-8">
        <h2 id="creditos-titulo" className="sr-only">
          Filmografia
        </h2>
        <div className="mx-auto max-w-3xl text-center">
          <p className="credit-role">Uma produção</p>
          <p className="display mt-3 text-5xl sm:text-7xl">Rotina Mídia</p>

          <p className="credit-role mt-24">Realização</p>
          <p className="display mt-3 text-4xl sm:text-5xl">Fernando Filó</p>

          {filmography.map((g) => (
            <div key={g.group} className="mt-24">
              <h3 className="credit-role">{g.group}</h3>
              <ul className="mt-6 grid gap-3">
                {g.films.map((f) => (
                  <li key={f.title} className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                    <span className="text-right text-sm text-dim tnum">{[f.place, f.year].filter(Boolean).join(', ')}</span>
                    <span className="display text-2xl text-paper sm:text-[2rem]">{f.title}</span>
                    <span className="text-left">
                      {f.video && (
                        <button
                          type="button"
                          onClick={() => open({ ids: [f.video!], title: f.title })}
                          className="press inline-grid size-8 place-items-center rounded-full border border-paper/35 text-paper transition-colors duration-150 hover:border-red hover:bg-red"
                          aria-label={`Ver filme: ${f.title}`}
                        >
                          <Play size={11} weight="fill" className="translate-x-px" aria-hidden />
                        </button>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <p className="credit-role mt-24">Filmado em</p>
          <p className="display mt-3 text-4xl sm:text-5xl">Luanda / São Paulo</p>
        </div>
      </section>

      <section id="proxima-cena" aria-labelledby="proxima-titulo" className="relative z-10 flex min-h-dvh flex-col justify-center px-4 py-24 sm:px-8">
        <div className="mx-auto w-full max-w-5xl">
          <p className="credit-role text-left">Próxima cena</p>
          <h2 id="proxima-titulo" className="display mt-4 text-[17vw] leading-[0.82] md:text-[9vw]">
            A sua.
          </h2>
          <p className="mt-6 max-w-[44ch] text-lg text-dim">Conte-nos o projecto. Respondemos de Luanda e de São Paulo, e o WhatsApp é o caminho mais rápido.</p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href={contact.luanda.wa}
              target="_blank"
              rel="noopener noreferrer"
              className="press inline-flex items-center gap-3 bg-red px-6 py-4 font-medium text-paper no-underline transition-colors duration-150 hover:bg-[#d10b15]"
            >
              <WhatsappLogo size={22} weight="fill" aria-hidden />
              Falar no WhatsApp
            </a>
            <a href={`mailto:${contact.email}`} className="px-2 py-4 text-paper underline decoration-paper/40 hover:decoration-paper">
              {contact.email}
            </a>
          </div>

          <dl className="mt-16 grid gap-8 border-t border-paper/20 pt-8 sm:grid-cols-3">
            <div>
              <dt className="credit-role text-left">Luanda</dt>
              <dd className="mt-2">
                <a href={`tel:${contact.luanda.tel}`} className="tnum text-lg text-paper no-underline hover:underline">
                  {contact.luanda.label}
                </a>
              </dd>
            </div>
            <div>
              <dt className="credit-role text-left">São Paulo</dt>
              <dd className="mt-2">
                <a href={`tel:${contact.saoPaulo.tel}`} className="tnum text-lg text-paper no-underline hover:underline">
                  {contact.saoPaulo.label}
                </a>
              </dd>
            </div>
            <div>
              <dt className="credit-role text-left">Estúdio</dt>
              <dd className="mt-2 text-dim">{contact.address}</dd>
            </div>
          </dl>
        </div>
      </section>

      <footer className="relative z-10 flex flex-wrap items-center gap-x-6 gap-y-2 px-4 pt-6 pb-20 text-sm text-dim sm:px-8 sm:pb-6">
        <span>© {new Date().getFullYear()} Rotina Mídia</span>
        <a href={contact.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-dim no-underline hover:text-paper">
          Instagram <ArrowUpRight size={13} aria-hidden />
        </a>
        <a href={contact.youtube} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-dim no-underline hover:text-paper">
          YouTube <ArrowUpRight size={13} aria-hidden />
        </a>
      </footer>
    </>
  )
}
