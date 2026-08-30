export class Sfx {
  private ctx: AudioContext | null = null
  muted = false

  private ac(): AudioContext | null {
    if (this.muted) return null
    if (!this.ctx) {
      const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!C) return null
      this.ctx = new C()
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume()
    return this.ctx
  }

  tone(freq: number, dur: number, type: OscillatorType = 'square', vol = 0.05, slide = 0) {
    const ctx = this.ac()
    if (!ctx) return
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = type
    o.frequency.setValueAtTime(freq, ctx.currentTime)
    if (slide) o.frequency.linearRampToValueAtTime(freq + slide, ctx.currentTime + dur)
    g.gain.setValueAtTime(vol, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur)
    o.connect(g)
    g.connect(ctx.destination)
    o.start()
    o.stop(ctx.currentTime + dur)
  }

  select() {
    this.tone(880, 0.04)
  }
  confirm() {
    this.tone(523, 0.05)
    this.tone(784, 0.08)
  }
  cancel() {
    this.tone(330, 0.06)
  }
  bump() {
    this.tone(90, 0.05, 'square', 0.04)
  }
  heal() {
    this.tone(523, 0.08, 'square', 0.04, 200)
    this.tone(784, 0.12, 'square', 0.04, 200)
  }
  hit() {
    this.tone(180, 0.08, 'square', 0.07, -80)
  }
  battle() {
    this.tone(220, 0.1, 'square', 0.06)
    this.tone(330, 0.12, 'square', 0.05)
    this.tone(440, 0.16, 'square', 0.05)
  }
  catch() {
    this.tone(392, 0.1, 'square', 0.05, 80)
    this.tone(523, 0.14, 'square', 0.05, 80)
    this.tone(659, 0.2, 'square', 0.05, 40)
  }
  faint() {
    this.tone(300, 0.2, 'sawtooth', 0.04, -180)
  }
  save() {
    this.tone(660, 0.08)
    this.tone(880, 0.12)
  }
}
