const SAVE_KEY = 'verdalia-save-v1'

import type { SaveData } from './types'

export function loadSave(): SaveData | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as SaveData
    if (data.v !== 1 || !data.party) return null
    return data
  } catch {
    return null
  }
}

export function writeSave(data: SaveData) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(data))
}

export function clearSave() {
  localStorage.removeItem(SAVE_KEY)
}

export function hasSave(): boolean {
  return loadSave() !== null
}
