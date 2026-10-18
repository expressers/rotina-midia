import { Mark } from './Logo'
import { goTo } from '../lenis'

export function Footer() {
  return (
    <footer className="relative z-10 bg-ink px-4 py-6 text-sm text-dim sm:px-8">
      <p className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Mark className="h-4 w-auto text-red" />
        <span>© {new Date().getFullYear()} Rotina Mídia</span>
        <span>Luanda / São Paulo</span>
        <a href="mailto:rotinamidia@gmail.com" className="text-dim no-underline hover:text-paper">
          rotinamidia@gmail.com
        </a>
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault()
            goTo('#top')
          }}
          className="ml-auto text-dim no-underline hover:text-paper">
          Voltar ao início
        </a>
      </p>
    </footer>
  )
}
