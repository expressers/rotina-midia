import { ArrowUpRight, EnvelopeSimple, InstagramLogo, MapPin, WhatsappLogo, YoutubeLogo } from '@phosphor-icons/react'
import { contact, srcSet } from '../../shared/data'

export function Contact() {
  return (
    <section id="contacto" aria-labelledby="contacto-titulo" className="relative z-10 flex min-h-dvh items-end overflow-hidden bg-ink">
      <img
        src="/img/bastidores-1280.webp"
        srcSet={srcSet('bastidores', [720, 1280, 1920])}
        sizes="100vw"
        alt="Bastidores de uma rodagem da Rotina Mídia: luz, câmara e equipa à volta da apresentadora"
        width={1920}
        height={1080}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/30 to-ink/40" aria-hidden />

      <div className="relative w-full px-4 pt-32 pb-6 sm:px-8 sm:pb-8">
        <div className="max-w-xl bg-ink p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] sm:p-10">
          <h2 id="contacto-titulo" className="display text-[15vw] sm:text-7xl">
            Conte-nos o seu projecto.
          </h2>
          <p className="mt-4 max-w-[42ch] text-dim">Respondemos de Luanda e de São Paulo. O WhatsApp é o caminho mais rápido.</p>

          <a
            href={contact.luanda.wa}
            target="_blank"
            rel="noopener noreferrer"
            className="press mt-8 inline-flex items-center gap-3 bg-red px-5 py-3.5 font-medium text-paper no-underline transition-colors duration-150 hover:bg-[#d10b15]"
          >
            <WhatsappLogo size={22} weight="fill" aria-hidden />
            Falar no WhatsApp
          </a>

          <dl className="mt-10 grid gap-x-8 gap-y-6 border-t border-paper/20 pt-8 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium tracking-[0.12em] text-dim uppercase">Luanda</dt>
              <dd className="mt-1">
                <a href={`tel:${contact.luanda.tel}`} className="tnum text-lg text-paper no-underline hover:underline">
                  {contact.luanda.label}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium tracking-[0.12em] text-dim uppercase">São Paulo</dt>
              <dd className="mt-1">
                <a href={`tel:${contact.saoPaulo.tel}`} className="tnum text-lg text-paper no-underline hover:underline">
                  {contact.saoPaulo.label}
                </a>
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="sr-only">Email</dt>
              <dd>
                <a href={`mailto:${contact.email}`} className="inline-flex items-center gap-2 text-lg text-paper no-underline hover:underline">
                  <EnvelopeSimple size={20} aria-hidden className="text-dim" />
                  {contact.email}
                </a>
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="sr-only">Morada</dt>
              <dd className="flex items-start gap-2 text-dim">
                <MapPin size={20} aria-hidden className="mt-0.5 shrink-0" />
                {contact.address}
              </dd>
            </div>
          </dl>

          <ul className="mt-8 flex gap-6 text-sm">
            <li>
              <a href={contact.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-paper/80 no-underline hover:text-paper">
                <InstagramLogo size={20} aria-hidden /> Instagram <ArrowUpRight size={14} aria-hidden />
              </a>
            </li>
            <li>
              <a href={contact.youtube} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-paper/80 no-underline hover:text-paper">
                <YoutubeLogo size={20} aria-hidden /> YouTube <ArrowUpRight size={14} aria-hidden />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}
