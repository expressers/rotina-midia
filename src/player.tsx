import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { X } from '@phosphor-icons/react'
import { getLenis } from './lenis'

type Clip = { ids: string[]; title: string }
type Ctx = { open: (clip: Clip) => void }

const PlayerContext = createContext<Ctx>({ open: () => {} })
export const usePlayer = () => useContext(PlayerContext)

const embedUrl = (ids: string[]) => {
  const [first, ...rest] = ids
  const params = new URLSearchParams({ autoplay: '1', rel: '0', modestbranding: '1', playsinline: '1' })
  if (rest.length) params.set('playlist', rest.join(','))
  return `https://www.youtube-nocookie.com/embed/${first}?${params}`
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  const [clip, setClip] = useState<Clip | null>(null)

  const open = useCallback((next: Clip) => {
    returnFocus.current = document.activeElement as HTMLElement | null
    setClip(next)
  }, [])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (clip && !dialog.open) {
      dialog.showModal()
      getLenis()?.stop()
    }
  }, [clip])

  const close = useCallback(() => dialogRef.current?.close(), [])

  const onClose = () => {
    setClip(null)
    getLenis()?.start()
    returnFocus.current?.focus({ preventScroll: true })
  }

  return (
    <PlayerContext.Provider value={{ open }}>
      {children}
      <dialog
        ref={dialogRef}
        onClose={onClose}
        onClick={(e) => {
          if (e.target === e.currentTarget) close()
        }}
        aria-label={clip ? `Leitor: ${clip.title}` : 'Leitor de vídeo'}
        className="player m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0 text-paper backdrop:bg-ink/95"
      >
        {clip && (
          <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-4 py-16 sm:px-10" onClick={(e) => e.target === e.currentTarget && close()}>
            <div className="flex w-full max-w-[min(1400px,calc((100dvh-10rem)*16/9))] items-end justify-between gap-6">
              <p className="display truncate text-2xl sm:text-4xl">{clip.title}</p>
              <button
                type="button"
                onClick={close}
                autoFocus
                className="press flex shrink-0 items-center gap-2 text-sm font-medium tracking-wide text-paper/80 uppercase transition-colors duration-150 hover:text-paper"
              >
                Fechar <X size={22} weight="bold" aria-hidden />
              </button>
            </div>
            <div className="relative aspect-video w-full max-w-[min(1400px,calc((100dvh-10rem)*16/9))] bg-black">
              <iframe
                src={embedUrl(clip.ids)}
                title={clip.title}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
          </div>
        )}
      </dialog>
    </PlayerContext.Provider>
  )
}
