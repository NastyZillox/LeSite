import type { Elem, MoveDef, MoveId, Species, SpeciesId } from './types'
import { uid, type LearnedMove, type Monster } from './types'

export const MOVES: Record<MoveId, MoveDef> = {
  charge: { id: 'charge', name: 'Charge', type: 'normal', power: 40, accuracy: 100, pp: 35, priority: 0 },
  griffe: { id: 'griffe', name: 'Griffe', type: 'normal', power: 40, accuracy: 100, pp: 35, priority: 0 },
  flamèche: { id: 'flamèche', name: 'Flamèche', type: 'feu', power: 40, accuracy: 100, pp: 25, priority: 0 },
  pistolet: { id: 'pistolet', name: "Pistolet à O", type: 'eau', power: 40, accuracy: 100, pp: 25, priority: 0 },
  fouet: { id: 'fouet', name: 'Fouet Lianes', type: 'plante', power: 45, accuracy: 100, pp: 25, priority: 0 },
  vive: { id: 'vive', name: 'Vive-Attaque', type: 'normal', power: 40, accuracy: 100, pp: 30, priority: 1 },
  jetpierres: { id: 'jetpierres', name: 'Jet-Pierres', type: 'roche', power: 50, accuracy: 90, pp: 15, priority: 0 },
  picpic: { id: 'picpic', name: 'Picpic', type: 'vol', power: 35, accuracy: 100, pp: 35, priority: 0 },
  rugissement: { id: 'rugissement', name: 'Rugissement', type: 'normal', power: 0, accuracy: 100, pp: 40, priority: 0, effect: 'atk-' },
  secretion: { id: 'secretion', name: 'Sécrétion', type: 'insecte', power: 0, accuracy: 95, pp: 40, priority: 0, effect: 'spe-' },
  ecrasface: { id: 'ecrasface', name: "Écras'Face", type: 'normal', power: 40, accuracy: 100, pp: 35, priority: 0 },
}

export const SPECIES: Record<SpeciesId, Species> = {
  pyronille: {
    id: 'pyronille',
    name: 'Pyronille',
    types: ['feu'],
    base: { hp: 39, atk: 52, def: 43, spa: 60, spd: 50, spe: 65 },
    moves: [
      { level: 1, move: 'griffe' },
      { level: 1, move: 'rugissement' },
      { level: 5, move: 'flamèche' },
      { level: 8, move: 'vive' },
    ],
    catchRate: 45,
    xp: 62,
    front: { body: '#f07830', accent: '#f8d030', eye: '#202020', shape: 'fox' },
    back: { body: '#e06828', accent: '#f0c028', eye: '#202020', shape: 'fox' },
  },
  aquilou: {
    id: 'aquilou',
    name: 'Aquilou',
    types: ['eau'],
    base: { hp: 44, atk: 48, def: 65, spa: 50, spd: 64, spe: 43 },
    moves: [
      { level: 1, move: 'charge' },
      { level: 1, move: 'rugissement' },
      { level: 5, move: 'pistolet' },
      { level: 8, move: 'vive' },
    ],
    catchRate: 45,
    xp: 63,
    front: { body: '#48a0e0', accent: '#f0e8d0', eye: '#202020', shape: 'otter' },
    back: { body: '#3c90d0', accent: '#e8e0c8', eye: '#202020', shape: 'otter' },
  },
  sylfeuille: {
    id: 'sylfeuille',
    name: 'Sylfeuille',
    types: ['plante'],
    base: { hp: 45, atk: 49, def: 49, spa: 65, spd: 65, spe: 45 },
    moves: [
      { level: 1, move: 'charge' },
      { level: 1, move: 'rugissement' },
      { level: 5, move: 'fouet' },
      { level: 8, move: 'vive' },
    ],
    catchRate: 45,
    xp: 64,
    front: { body: '#58c048', accent: '#e07090', eye: '#202020', shape: 'cat' },
    back: { body: '#48b040', accent: '#d06080', eye: '#202020', shape: 'cat' },
  },
  minipic: {
    id: 'minipic',
    name: 'Minipic',
    types: ['normal', 'vol'],
    base: { hp: 40, atk: 45, def: 40, spa: 35, spd: 35, spe: 56 },
    moves: [
      { level: 1, move: 'charge' },
      { level: 1, move: 'picpic' },
      { level: 5, move: 'vive' },
    ],
    catchRate: 255,
    xp: 50,
    front: { body: '#c8b090', accent: '#f0e0c0', eye: '#202020', shape: 'bird' },
    back: { body: '#b8a080', accent: '#e8d8b8', eye: '#202020', shape: 'bird' },
  },
  rongegrain: {
    id: 'rongegrain',
    name: 'Rongegrain',
    types: ['normal'],
    base: { hp: 30, atk: 56, def: 35, spa: 25, spd: 35, spe: 72 },
    moves: [
      { level: 1, move: 'charge' },
      { level: 1, move: 'rugissement' },
      { level: 4, move: 'vive' },
    ],
    catchRate: 255,
    xp: 51,
    front: { body: '#c08050', accent: '#f0d0b0', eye: '#202020', shape: 'mouse' },
    back: { body: '#b07048', accent: '#e8c8a8', eye: '#202020', shape: 'mouse' },
  },
  chenilys: {
    id: 'chenilys',
    name: 'Chenilys',
    types: ['insecte'],
    base: { hp: 45, atk: 30, def: 35, spa: 20, spd: 20, spe: 45 },
    moves: [
      { level: 1, move: 'charge' },
      { level: 1, move: 'secretion' },
      { level: 5, move: 'ecrasface' },
    ],
    catchRate: 255,
    xp: 39,
    front: { body: '#78c040', accent: '#f0e050', eye: '#202020', shape: 'bug' },
    back: { body: '#68b038', accent: '#e0d048', eye: '#202020', shape: 'bug' },
  },
  caillou: {
    id: 'caillou',
    name: 'Caillou',
    types: ['roche'],
    base: { hp: 40, atk: 80, def: 100, spa: 30, spd: 30, spe: 20 },
    moves: [
      { level: 1, move: 'charge' },
      { level: 1, move: 'jetpierres' },
    ],
    catchRate: 120,
    xp: 60,
    front: { body: '#b0a080', accent: '#706050', eye: '#202020', shape: 'rock' },
    back: { body: '#a09070', accent: '#605040', eye: '#202020', shape: 'rock' },
  },
  rocaille: {
    id: 'rocaille',
    name: 'Rocaille',
    types: ['roche', 'sol'],
    base: { hp: 55, atk: 95, def: 115, spa: 45, spd: 45, spe: 25 },
    moves: [
      { level: 1, move: 'charge' },
      { level: 1, move: 'jetpierres' },
      { level: 6, move: 'ecrasface' },
    ],
    catchRate: 60,
    xp: 86,
    front: { body: '#908070', accent: '#d0c0a0', eye: '#202020', shape: 'golem' },
    back: { body: '#807060', accent: '#c0b090', eye: '#202020', shape: 'golem' },
  },
}

const TYPE_CHART: Record<Elem, Partial<Record<Elem, number>>> = {
  normal: { roche: 0.5, sol: 1 },
  feu: { feu: 0.5, eau: 0.5, plante: 2, insecte: 2, roche: 0.5, sol: 1 },
  eau: { feu: 2, eau: 0.5, plante: 0.5, roche: 2, sol: 2 },
  plante: { feu: 0.5, eau: 2, plante: 0.5, vol: 0.5, insecte: 0.5, roche: 2, sol: 2, poison: 0.5 },
  vol: { plante: 2, insecte: 2, roche: 0.5, électrik: 0.5 },
  insecte: { feu: 0.5, plante: 2, vol: 0.5, roche: 0.5, poison: 0.5 },
  roche: { feu: 2, vol: 2, insecte: 2, sol: 0.5 },
  sol: { feu: 2, plante: 0.5, vol: 0, roche: 2, électrik: 2, poison: 2 },
  électrik: { eau: 2, plante: 0.5, vol: 2, sol: 0, électrik: 0.5 },
  poison: { plante: 2, poison: 0.5, sol: 0.5, roche: 0.5 },
}

export const TYPE_LABEL: Record<Elem, string> = {
  normal: 'Normal',
  feu: 'Feu',
  eau: 'Eau',
  plante: 'Plante',
  vol: 'Vol',
  insecte: 'Insecte',
  roche: 'Roche',
  sol: 'Sol',
  électrik: 'Électrik',
  poison: 'Poison',
}

export function typeEffect(move: Elem, defender: Elem[]): number {
  let m = 1
  for (const t of defender) m *= TYPE_CHART[move]?.[t] ?? 1
  return m
}

export function statAt(base: number, level: number, isHp = false): number {
  if (isHp) return Math.floor((2 * base * level) / 100) + level + 10
  return Math.floor((2 * base * level) / 100) + 5
}

export function maxHpOf(m: Monster): number {
  return statAt(SPECIES[m.species].base.hp, m.level, true)
}

export function statsOf(m: Monster) {
  const b = SPECIES[m.species].base
  return {
    hp: statAt(b.hp, m.level, true),
    atk: statAt(b.atk, m.level),
    def: statAt(b.def, m.level),
    spa: statAt(b.spa, m.level),
    spd: statAt(b.spd, m.level),
    spe: statAt(b.spe, m.level),
  }
}

export function xpToNext(level: number): number {
  return level * level * level
}

export function movesForLevel(species: SpeciesId, level: number): LearnedMove[] {
  const learned = SPECIES[species].moves.filter((mv) => mv.level <= level)
  const last4 = learned.slice(-4)
  return last4.map((mv) => ({ id: mv.move, pp: MOVES[mv.move].pp }))
}

export function makeMonster(species: SpeciesId, level: number, nickname?: string): Monster {
  const sp = SPECIES[species]
  const mon: Monster = {
    uid: uid(),
    species,
    nickname: nickname ?? sp.name,
    level,
    hp: 1,
    xp: xpToNext(level),
    moves: movesForLevel(species, level),
  }
  mon.hp = maxHpOf(mon)
  return mon
}

export function stageMul(stage: number): number {
  const s = Math.max(-6, Math.min(6, stage))
  return s >= 0 ? (2 + s) / 2 : 2 / (2 - s)
}

export function damageRoll(
  attacker: Monster,
  defender: Monster,
  moveId: MoveId,
  atkStage: number,
  defStage: number,
): { dmg: number; eff: number; stab: boolean; miss: boolean; effect?: 'atk-' | 'spe-' } {
  const mv = MOVES[moveId]
  if (Math.random() * 100 > mv.accuracy) return { dmg: 0, eff: 1, stab: false, miss: true }
  if (mv.power <= 0) return { dmg: 0, eff: 1, stab: false, miss: false, effect: mv.effect }

  const a = statsOf(attacker)
  const d = statsOf(defender)
  const spA = SPECIES[attacker.species]
  const spD = SPECIES[defender.species]
  const special = mv.type === 'feu' || mv.type === 'eau' || mv.type === 'plante' || mv.type === 'électrik'
  const atk = (special ? a.spa : a.atk) * stageMul(atkStage)
  const def = (special ? d.spd : d.def) * stageMul(defStage)
  const base = Math.floor((((2 * attacker.level) / 5 + 2) * mv.power * (atk / Math.max(1, def))) / 50) + 2
  const stab = spA.types.includes(mv.type)
  const eff = typeEffect(mv.type, spD.types)
  const rand = 0.85 + Math.random() * 0.15
  const dmg = Math.max(1, Math.floor(base * (stab ? 1.5 : 1) * eff * rand))
  return { dmg, eff, stab, miss: false }
}

export function catchChance(mon: Monster, ballBonus = 1): number {
  const sp = SPECIES[mon.species]
  const hpMax = maxHpOf(mon)
  const a = ((3 * hpMax - 2 * mon.hp) * sp.catchRate * ballBonus) / (3 * hpMax)
  return Math.max(0, Math.min(1, a / 255))
}

export function healMonster(m: Monster) {
  m.hp = maxHpOf(m)
  m.moves = m.moves.map((mv) => ({ ...mv, pp: MOVES[mv.id].pp }))
}

export const TYPE_COLOR: Record<Elem, string> = {
  normal: '#c8c0b0',
  feu: '#f07030',
  eau: '#5090e0',
  plante: '#48b048',
  vol: '#98b8f0',
  insecte: '#a8c030',
  roche: '#b8a050',
  sol: '#e0c068',
  électrik: '#f8d030',
  poison: '#a040a0',
}
