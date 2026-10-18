import Lenis from 'lenis'

let instance: Lenis | null = null

export const getLenis = () => instance

/** Register a Lenis instance created elsewhere (Proposta 2 drives Lenis from the GSAP ticker). */
export function setLenis(l: Lenis | null) {
  instance = l
}

export function startLenis() {
  if (instance) return instance
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null
  instance = new Lenis({ autoRaf: true, lerp: 0.09, anchors: false })
  return instance
}

export function stopLenis() {
  instance?.destroy()
  instance = null
}

/** Scroll to an in-page anchor, through Lenis when it runs. */
export function goTo(hash: string) {
  const el = document.querySelector(hash)
  if (!el) return
  if (instance) instance.scrollTo(el as HTMLElement, { offset: 0, duration: 1.4 })
  else el.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  history.replaceState(null, '', hash)
}
