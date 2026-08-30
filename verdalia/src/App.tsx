import { useEffect, useMemo, useRef } from 'react'
import { Game } from './game/Game'
import { Input } from './game/input'
import { TouchPad } from './TouchPad'

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const input = useMemo(() => new Input(), [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const game = new Game(canvas, input)
    game.start()
    return () => game.destroy()
  }, [input])

  useEffect(() => {
    const block = (e: Event) => e.preventDefault()
    document.addEventListener('gesturestart', block)
    document.body.addEventListener('touchmove', block, { passive: false })
    return () => {
      document.removeEventListener('gesturestart', block)
      document.body.removeEventListener('touchmove', block)
    }
  }, [])

  return (
    <div className="shell">
      <div className="bezel">
        <div className="bezel-top">
          <span className="led" />
          <span className="brand">VERDALIA</span>
          <span className="led dim" />
        </div>
        <div className="screen">
          <canvas ref={canvasRef} width={240} height={160} />
        </div>
        <p className="hint">Flèches / WASD · A: Z/Espace · B: X · START: Échap · Courir: B</p>
      </div>
      <TouchPad input={input} />
    </div>
  )
}
