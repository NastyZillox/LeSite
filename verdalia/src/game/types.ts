export const TILE = 16
export const VIEW_W = 240
export const VIEW_H = 160
export const STEP_MS = 1000 / 60

export type Dir = 'up' | 'down' | 'left' | 'right'
export type Btn = Dir | 'a' | 'b' | 'start' | 'select'

export type Elem =
  | 'normal'
  | 'feu'
  | 'eau'
  | 'plante'
  | 'vol'
  | 'insecte'
  | 'roche'
  | 'sol'
  | 'électrik'
  | 'poison'

export type TileId =
  | 'grass'
  | 'tall'
  | 'path'
  | 'tree'
  | 'water'
  | 'wall'
  | 'floor'
  | 'door'
  | 'flower'
  | 'roof'
  | 'hwall'
  | 'bed'
  | 'table'
  | 'mat'
  | 'pc'
  | 'sign'
  | 'fence'
  | 'carpet'
  | 'heal'
  | 'gym'
  | 'statue'
  | 'counter'
  | 'shelf'
  | 'window'
  | 'rug'
  | 'stairs'
  | 'orb'
  | 'void'

export const SOLID: ReadonlySet<TileId> = new Set([
  'tree',
  'water',
  'wall',
  'roof',
  'hwall',
  'bed',
  'table',
  'pc',
  'sign',
  'fence',
  'statue',
  'counter',
  'shelf',
  'window',
  'void',
  'orb',
])

export type MoveId =
  | 'charge'
  | 'griffe'
  | 'flamèche'
  | 'pistolet'
  | 'fouet'
  | 'vive'
  | 'jetpierres'
  | 'picpic'
  | 'rugissement'
  | 'secretion'
  | 'ecrasface'

export type SpeciesId =
  | 'pyronille'
  | 'aquilou'
  | 'sylfeuille'
  | 'minipic'
  | 'rongegrain'
  | 'chenilys'
  | 'caillou'
  | 'rocaille'

export type ItemId = 'sphere' | 'potion'

export type NpcSprite = 'mom' | 'prof' | 'nurse' | 'kid' | 'lass' | 'leader' | 'clerk' | 'boy'

export type MoveDef = {
  id: MoveId
  name: string
  type: Elem
  power: number
  accuracy: number
  pp: number
  priority: number
  effect?: 'atk-' | 'spe-'
}

export type Species = {
  id: SpeciesId
  name: string
  types: Elem[]
  base: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number }
  moves: { level: number; move: MoveId }[]
  catchRate: number
  xp: number
  front: CreatureLook
  back: CreatureLook
}

export type CreatureLook = {
  body: string
  accent: string
  eye: string
  shape: 'fox' | 'otter' | 'cat' | 'bird' | 'mouse' | 'bug' | 'rock' | 'golem'
}

export type LearnedMove = {
  id: MoveId
  pp: number
}

export type Monster = {
  uid: string
  species: SpeciesId
  nickname: string
  level: number
  hp: number
  xp: number
  moves: LearnedMove[]
}

export type Bag = {
  sphere: number
  potion: number
}

export type Warp = {
  map: string
  x: number
  y: number
  facing?: Dir
}

export type NpcDef = {
  id: string
  x: number
  y: number
  sprite: NpcSprite
  facing: Dir
  wander?: boolean
}

export type GameMap = {
  id: string
  name: string
  w: number
  h: number
  tiles: TileId[][]
  warps: Record<string, Warp>
  npcs: NpcDef[]
  signs: Record<string, string>
  indoor: boolean
  music: 'town' | 'route' | 'indoor' | 'gym'
  encounters?: { species: SpeciesId; min: number; max: number; w: number }[]
}

export type SaveData = {
  v: 1
  name: string
  mapId: string
  tx: number
  ty: number
  facing: Dir
  party: Monster[]
  bag: Bag
  badges: boolean[]
  flags: Record<string, boolean>
  playFrames: number
  money: number
}

export const DIRS: Record<Dir, { x: number; y: number }> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
}

export function opposite(d: Dir): Dir {
  if (d === 'up') return 'down'
  if (d === 'down') return 'up'
  if (d === 'left') return 'right'
  return 'left'
}

export function key(x: number, y: number): string {
  return `${x},${y}`
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}
