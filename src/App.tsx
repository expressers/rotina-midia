import { useEffect } from 'react'
import { PlayerProvider } from './player'
import { startLenis, stopLenis } from './lenis'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Works } from './components/Works'
import { About } from './components/About'
import { Filmography } from './components/Filmography'
import { Testimonials } from './components/Testimonials'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'

export default function App() {
  useEffect(() => {
    startLenis()
    return stopLenis
  }, [])

  return (
    <PlayerProvider>
      <a
        href="#trabalhos"
        className="fixed top-2 left-2 z-50 -translate-y-20 bg-paper px-4 py-2 text-ink focus:translate-y-0"
      >
        Saltar para os trabalhos
      </a>
      <Header />
      <main>
        <Hero />
        <Works />
        <About />
        <Filmography />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </PlayerProvider>
  )
}
