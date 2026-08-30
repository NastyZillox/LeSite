import { useCallback, useRef } from 'react'
import type { Input } from './game/input'
import type { Btn, Dir } from './game/types'

type Props = { input: Input }

export function TouchPad({ input }: Props) {
  return (
    <div className="pad">
      <DPad input={input} />
      <div className="pad-right">
        <div className="shoulder">
          <HoldBtn className="pill" label="SELECT" btn="select" input={input} />
          <HoldBtn className="pill" label="START" btn="start" input={input} />
        </div>
        <div className="ab">
          <HoldBtn className="round b" label="B" btn="b" input={input} />
          <HoldBtn className="round a" label="A" btn="a" input={input} />
        </div>
      </div>
    </div>
  )
}

function DPad({ input }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const active = useRef<Dir | null>(null)

  const apply = useCallback(
    (clientX: number, clientY: number) => {
      const el = ref.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const x = clientX - r.left - r.width / 2
      const y = clientY - r.top - r.height / 2
      const dead = Math.min(r.width, r.height) * 0.14
      let dir: Dir | null = null
      if (Math.abs(x) > dead || Math.abs(y) > dead) {
        dir = Math.abs(x) > Math.abs(y) ? (x < 0 ? 'left' : 'right') : y < 0 ? 'up' : 'down'
      }
      if (dir !== active.current) {
        input.clearDirs()
        if (dir) input.set(dir, true)
        active.current = dir
      }
    },
    [input],
  )

  const clear = useCallback(() => {
    input.clearDirs()
    active.current = null
  }, [input])

  return (
    <div
      ref={ref}
      className="dpad"
      onPointerDown={(e) => {
        e.preventDefault()
        e.currentTarget.setPointerCapture(e.pointerId)
        apply(e.clientX, e.clientY)
      }}
      onPointerMove={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) apply(e.clientX, e.clientY)
      }}
      onPointerUp={clear}
      onPointerCancel={clear}
    >
      <div className="dpad-plus">
        <span className="arm up" />
        <span className="arm down" />
        <span className="arm left" />
        <span className="arm right" />
        <span className="nub" />
      </div>
    </div>
  )
}

function HoldBtn({
  btn,
  label,
  className,
  input,
}: {
  btn: Btn
  label: string
  className: string
  input: Input
}) {
  return (
    <button
      type="button"
      className={className}
      aria-label={label}
      onPointerDown={(e) => {
        e.preventDefault()
        e.currentTarget.setPointerCapture(e.pointerId)
        input.set(btn, true)
      }}
      onPointerUp={() => input.set(btn, false)}
      onPointerCancel={() => input.set(btn, false)}
    >
      {label}
    </button>
  )
}
