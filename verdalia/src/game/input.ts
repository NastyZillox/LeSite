import type { Btn, Dir } from './types'

const DIR_SET: ReadonlySet<string> = new Set(['up', 'down', 'left', 'right'])

export class Input {
  down = new Set<Btn>()
  pressed = new Set<Btn>()
  released = new Set<Btn>()
  private prev = new Set<Btn>()
  private dirStack: Dir[] = []
  private unbind: Array<() => void> = []

  attach() {
    const onDown = (e: KeyboardEvent) => {
      const b = mapKey(e.code)
      if (!b) return
      e.preventDefault()
      this.set(b, true)
    }
    const onUp = (e: KeyboardEvent) => {
      const b = mapKey(e.code)
      if (!b) return
      e.preventDefault()
      this.set(b, false)
    }
    const onBlur = () => {
      this.down.clear()
      this.dirStack = []
    }
    window.addEventListener('keydown', onDown, { passive: false })
    window.addEventListener('keyup', onUp, { passive: false })
    window.addEventListener('blur', onBlur)
    this.unbind.push(
      () => window.removeEventListener('keydown', onDown),
      () => window.removeEventListener('keyup', onUp),
      () => window.removeEventListener('blur', onBlur),
    )
  }

  detach() {
    for (const fn of this.unbind) fn()
    this.unbind = []
    this.down.clear()
    this.dirStack = []
  }

  set(btn: Btn, value: boolean) {
    if (value) {
      if (!this.down.has(btn)) {
        this.down.add(btn)
        if (isDir(btn)) {
          this.dirStack = this.dirStack.filter((d) => d !== btn)
          this.dirStack.unshift(btn)
        }
      }
    } else {
      this.down.delete(btn)
      if (isDir(btn)) this.dirStack = this.dirStack.filter((d) => d !== btn)
    }
  }

  tick() {
    this.pressed.clear()
    this.released.clear()
    for (const b of this.down) {
      if (!this.prev.has(b)) this.pressed.add(b)
    }
    for (const b of this.prev) {
      if (!this.down.has(b)) this.released.add(b)
    }
    this.prev = new Set(this.down)
  }

  dir(): Dir | null {
    return this.dirStack[0] ?? null
  }

  clearDirs() {
    for (const d of ['up', 'down', 'left', 'right'] as Dir[]) this.down.delete(d)
    this.dirStack = []
  }
}

function isDir(b: Btn): b is Dir {
  return DIR_SET.has(b)
}

function mapKey(code: string): Btn | null {
  switch (code) {
    case 'ArrowUp':
    case 'KeyW':
      return 'up'
    case 'ArrowDown':
    case 'KeyS':
      return 'down'
    case 'ArrowLeft':
    case 'KeyA':
      return 'left'
    case 'ArrowRight':
    case 'KeyD':
      return 'right'
    case 'KeyZ':
    case 'KeyC':
    case 'KeyK':
    case 'Space':
    case 'Enter':
      return 'a'
    case 'KeyX':
    case 'KeyL':
    case 'ShiftLeft':
    case 'ShiftRight':
    case 'Backspace':
      return 'b'
    case 'Escape':
      return 'start'
    case 'Tab':
    case 'KeyE':
      return 'select'
    default:
      return null
  }
}
