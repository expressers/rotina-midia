/**
 * Opt-in score, synthesised with WebAudio (no files):
 * a low two-oscillator drone and a pocket-watch tick that tightens as you travel.
 */
export class Score {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private filter: BiquadFilterNode | null = null
  private oscs: OscillatorNode[] = []
  private noise: AudioBuffer | null = null
  private timer = 0
  private rate = 1
  private beat = 0
  on = false

  start() {
    if (this.on) return
    this.on = true
    const ctx = (this.ctx ??= new AudioContext())
    void ctx.resume()
    const master = ctx.createGain()
    master.gain.value = 0
    master.connect(ctx.destination)
    master.gain.linearRampToValueAtTime(0.9, ctx.currentTime + 1.6)
    this.master = master

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 160
    filter.Q.value = 6
    filter.connect(master)
    this.filter = filter

    const drone = ctx.createGain()
    drone.gain.value = 0.05
    drone.connect(filter)
    this.oscs = [55, 55.35, 82.4].map((f, i) => {
      const o = ctx.createOscillator()
      o.type = i === 2 ? 'sine' : 'sawtooth'
      o.frequency.value = f
      o.connect(drone)
      o.start()
      return o
    })

    if (!this.noise) {
      const len = Math.floor(ctx.sampleRate * 0.03)
      this.noise = ctx.createBuffer(1, len, ctx.sampleRate)
      const d = this.noise.getChannelData(0)
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 6)
    }
    this.schedule()
  }

  private schedule = () => {
    if (!this.on || !this.ctx || !this.master) return
    const ctx = this.ctx
    const src = ctx.createBufferSource()
    src.buffer = this.noise
    const hp = ctx.createBiquadFilter()
    hp.type = 'bandpass'
    hp.frequency.value = this.beat % 2 ? 2600 : 3400
    hp.Q.value = 4
    const g = ctx.createGain()
    g.gain.value = this.beat % 4 === 0 ? 0.55 : 0.32
    src.connect(hp).connect(g).connect(this.master)
    src.start()
    this.beat++
    this.timer = window.setTimeout(this.schedule, 1000 / this.rate)
  }

  /** 0..1 through the film: the watch runs faster and the drone opens up. */
  setProgress(p: number) {
    this.rate = 1 + p * 1.4
    if (this.filter && this.ctx) this.filter.frequency.setTargetAtTime(160 + p * 520, this.ctx.currentTime, 0.4)
  }

  /** A low hit when a new act begins. */
  hit() {
    if (!this.on || !this.ctx || !this.master) return
    const ctx = this.ctx
    const o = ctx.createOscillator()
    o.type = 'sine'
    o.frequency.setValueAtTime(70, ctx.currentTime)
    o.frequency.exponentialRampToValueAtTime(34, ctx.currentTime + 1.2)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.6, ctx.currentTime + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.6)
    o.connect(g).connect(this.master)
    o.start()
    o.stop(ctx.currentTime + 1.7)
  }

  stop() {
    if (!this.on || !this.ctx || !this.master) return
    this.on = false
    clearTimeout(this.timer)
    const ctx = this.ctx
    const m = this.master
    m.gain.cancelScheduledValues(ctx.currentTime)
    m.gain.setTargetAtTime(0, ctx.currentTime, 0.25)
    const oscs = this.oscs
    setTimeout(() => {
      oscs.forEach((o) => o.stop())
      m.disconnect()
    }, 1200)
    this.oscs = []
  }
}
