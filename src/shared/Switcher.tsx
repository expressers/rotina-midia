/**
 * Small fixed control to move between the two homepage proposals.
 * Lives bottom-left on both pages; the chooser page is one click away.
 */
export function Switcher({ current, placement = 'bottom-left' }: { current: 1 | 2; placement?: 'bottom-left' | 'right' }) {
  const item = (n: 1 | 2) =>
    `grid h-8 min-w-8 place-items-center px-2.5 text-[0.8rem] font-medium no-underline transition-colors duration-150 ${
      n === current ? 'bg-paper text-ink' : 'text-paper/70 hover:text-paper'
    }`
  return (
    <nav
      aria-label="Propostas"
      className={`fixed z-[60] flex items-center gap-1 border border-paper/20 bg-ink/80 p-1 backdrop-blur-md ${
        placement === 'right'
          ? 'top-1/2 right-2 -translate-y-1/2 flex-col sm:right-3'
          : 'bottom-4 left-4 sm:bottom-5 sm:left-5'
      }`}
    >
      <a
        href="/"
        className={`text-[0.72rem] tracking-[0.14em] text-paper/60 uppercase no-underline hover:text-paper ${placement === 'right' ? 'px-1 py-1 [writing-mode:vertical-rl]' : 'px-2'}`}
      >
        Propostas
      </a>
      <a href="/proposta-1/" className={item(1)} aria-current={current === 1 ? 'page' : undefined} aria-label="Proposta 1">
        1
      </a>
      <a href="/proposta-2/" className={item(2)} aria-current={current === 2 ? 'page' : undefined} aria-label="Proposta 2">
        2
      </a>
    </nav>
  )
}
