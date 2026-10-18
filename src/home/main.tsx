import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowRight } from '@phosphor-icons/react'
import '../shared/base.css'
import { Logo } from '../shared/Logo'

const PROPOSALS = [
  {
    href: '/proposta-1/',
    n: '1',
    name: 'Cartaz',
    line: 'A página como uma bobine em projecção: timecode no topo, película no hero, filmes em ecrã inteiro.',
    image: 'entranazona-mesa',
  },
  {
    href: '/proposta-2/',
    n: '2',
    name: 'Tempo',
    line: 'Uma travessia em 3D, contada em actos: o símbolo vira eclipse, a câmara entra nos filmes, as cidades dobram-se.',
    image: 'bastidores',
  },
]

function Home() {
  return (
    <main className="flex min-h-dvh flex-col bg-ink">
      <header className="flex items-center justify-between px-4 py-5 sm:px-8">
        <Logo className="h-6 w-auto text-paper" />
        <p className="text-sm text-dim">Propostas de homepage</p>
      </header>

      <h1 className="sr-only">Rotina Mídia: escolha uma proposta de homepage</h1>

      <div className="grid flex-1 gap-1 px-1 pb-1 md:grid-cols-2">
        {PROPOSALS.map((p) => (
          <a
            key={p.n}
            href={p.href}
            className="group relative flex min-h-[44dvh] flex-col justify-end overflow-hidden p-5 text-paper no-underline sm:p-8 md:min-h-0"
          >
            <img
              src={`/img/${p.image}-1280.webp`}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-60 transition-[transform,opacity] duration-700 ease-(--ease-out-strong) group-hover:scale-[1.04] group-hover:opacity-80"
            />
            <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/40 to-ink/10" aria-hidden />
            <div className="relative">
              <p className="display flex items-baseline gap-[0.22em] text-[22vw] leading-[0.8] md:text-[11vw]">
                <span className="text-red">{p.n}</span>
                <span>{p.name}</span>
              </p>
              <div className="mt-5 flex items-end justify-between gap-6 border-t border-paper/30 pt-4">
                <p className="max-w-[44ch] text-dim">{p.line}</p>
                <span className="press grid size-12 shrink-0 place-items-center rounded-full bg-paper text-ink transition-colors duration-150 group-hover:bg-red group-hover:text-paper">
                  <ArrowRight size={20} weight="bold" aria-hidden />
                </span>
              </div>
            </div>
            <span className="sr-only">Abrir proposta {p.n}</span>
          </a>
        ))}
      </div>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Home />
  </StrictMode>,
)
