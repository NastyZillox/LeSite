import type { GameMap, NpcDef, TileId, Warp } from './types'
import { key } from './types'

function grid(w: number, h: number, fill: TileId): TileId[][] {
  return Array.from({ length: h }, () => Array.from({ length: w }, () => fill))
}

function rect(t: TileId[][], x: number, y: number, w: number, h: number, tile: TileId) {
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      const yy = y + j
      const xx = x + i
      if (yy >= 0 && yy < t.length && xx >= 0 && xx < t[0].length) t[yy][xx] = tile
    }
  }
}

function set(t: TileId[][], x: number, y: number, tile: TileId) {
  if (y >= 0 && y < t.length && x >= 0 && x < t[0].length) t[y][x] = tile
}

function hline(t: TileId[][], x: number, y: number, w: number, tile: TileId) {
  rect(t, x, y, w, 1, tile)
}

function vline(t: TileId[][], x: number, y: number, h: number, tile: TileId) {
  rect(t, x, y, 1, h, tile)
}

function borderTrees(t: TileId[][]) {
  const h = t.length
  const w = t[0].length
  hline(t, 0, 0, w, 'tree')
  hline(t, 0, h - 1, w, 'tree')
  vline(t, 0, 0, h, 'tree')
  vline(t, w - 1, 0, h, 'tree')
}

function house(t: TileId[][], x: number, y: number, w = 5, roof: TileId = 'roof') {
  rect(t, x, y, w, 2, roof)
  rect(t, x, y + 2, w, 2, 'hwall')
  set(t, x + Math.floor(w / 2), y + 3, 'door')
}

function map(
  id: string,
  name: string,
  tiles: TileId[][],
  extra: {
    warps?: Record<string, Warp>
    npcs?: NpcDef[]
    signs?: Record<string, string>
    indoor?: boolean
    music?: GameMap['music']
    encounters?: GameMap['encounters']
  } = {},
): GameMap {
  return {
    id,
    name,
    w: tiles[0].length,
    h: tiles.length,
    tiles,
    warps: extra.warps ?? {},
    npcs: extra.npcs ?? [],
    signs: extra.signs ?? {},
    indoor: extra.indoor ?? false,
    music: extra.music ?? 'town',
    encounters: extra.encounters,
  }
}

function buildBedroom(): GameMap {
  const t = grid(12, 10, 'floor')
  rect(t, 0, 0, 12, 10, 'wall')
  rect(t, 1, 1, 10, 8, 'floor')
  rect(t, 1, 1, 2, 3, 'shelf')
  set(t, 10, 1, 'window')
  set(t, 8, 2, 'bed')
  set(t, 9, 2, 'bed')
  set(t, 5, 4, 'table')
  set(t, 6, 4, 'table')
  set(t, 10, 5, 'pc')
  set(t, 5, 7, 'mat')
  set(t, 6, 7, 'mat')
  set(t, 5, 8, 'stairs')
  set(t, 6, 8, 'stairs')
  set(t, 5, 9, 'stairs')
  set(t, 6, 9, 'stairs')
  return map('bedroom', 'Chambre', t, {
    indoor: true,
    music: 'indoor',
    warps: {
      [key(5, 8)]: { map: 'home', x: 7, y: 8, facing: 'down' },
      [key(6, 8)]: { map: 'home', x: 7, y: 8, facing: 'down' },
      [key(5, 9)]: { map: 'home', x: 7, y: 8, facing: 'down' },
      [key(6, 9)]: { map: 'home', x: 7, y: 8, facing: 'down' },
    },
    signs: {
      [key(10, 5)]: 'PC: sauvegarde depuis le menu START, ou parle à l infirmerie.',
    },
  })
}

function buildHome(): GameMap {
  const t = grid(14, 12, 'floor')
  rect(t, 0, 0, 14, 12, 'wall')
  rect(t, 1, 1, 12, 10, 'floor')
  rect(t, 1, 1, 2, 2, 'stairs')
  set(t, 10, 1, 'window')
  set(t, 11, 1, 'window')
  set(t, 4, 4, 'table')
  set(t, 5, 4, 'table')
  set(t, 6, 4, 'table')
  set(t, 4, 5, 'table')
  set(t, 5, 5, 'table')
  set(t, 6, 5, 'table')
  set(t, 6, 10, 'mat')
  set(t, 7, 10, 'mat')
  set(t, 6, 11, 'door')
  set(t, 7, 11, 'door')
  return map('home', 'Maison', t, {
    indoor: true,
    music: 'indoor',
    warps: {
      [key(1, 1)]: { map: 'bedroom', x: 6, y: 6, facing: 'down' },
      [key(2, 1)]: { map: 'bedroom', x: 6, y: 6, facing: 'down' },
      [key(1, 2)]: { map: 'bedroom', x: 6, y: 6, facing: 'down' },
      [key(2, 2)]: { map: 'bedroom', x: 6, y: 6, facing: 'down' },
      [key(6, 11)]: { map: 'village', x: 4, y: 12, facing: 'down' },
      [key(7, 11)]: { map: 'village', x: 4, y: 12, facing: 'down' },
    },
    npcs: [{ id: 'mom', x: 9, y: 6, sprite: 'mom', facing: 'left' }],
  })
}

function buildLab(): GameMap {
  const t = grid(14, 12, 'floor')
  rect(t, 0, 0, 14, 12, 'wall')
  rect(t, 1, 1, 12, 10, 'floor')
  rect(t, 1, 1, 12, 1, 'counter')
  set(t, 2, 1, 'shelf')
  set(t, 3, 1, 'shelf')
  set(t, 10, 1, 'pc')
  set(t, 4, 5, 'table')
  set(t, 5, 5, 'orb')
  set(t, 6, 5, 'orb')
  set(t, 7, 5, 'orb')
  set(t, 8, 5, 'table')
  set(t, 6, 10, 'mat')
  set(t, 7, 10, 'mat')
  set(t, 6, 11, 'door')
  set(t, 7, 11, 'door')
  return map('lab', 'Laboratoire', t, {
    indoor: true,
    music: 'indoor',
    warps: {
      [key(6, 11)]: { map: 'village', x: 12, y: 6, facing: 'down' },
      [key(7, 11)]: { map: 'village', x: 12, y: 6, facing: 'down' },
    },
    npcs: [{ id: 'prof', x: 10, y: 4, sprite: 'prof', facing: 'down' }],
    signs: {
      [key(10, 1)]: 'Notes du Prof. Sauge: trois starters, trois destins.',
    },
  })
}

function buildCenter(): GameMap {
  const t = grid(12, 10, 'floor')
  rect(t, 0, 0, 12, 10, 'wall')
  rect(t, 1, 1, 10, 8, 'floor')
  rect(t, 3, 2, 6, 2, 'carpet')
  set(t, 5, 1, 'heal')
  set(t, 6, 1, 'heal')
  set(t, 4, 2, 'counter')
  set(t, 5, 2, 'counter')
  set(t, 6, 2, 'counter')
  set(t, 7, 2, 'counter')
  set(t, 1, 1, 'pc')
  set(t, 5, 8, 'mat')
  set(t, 6, 8, 'mat')
  set(t, 5, 9, 'door')
  set(t, 6, 9, 'door')
  return map('center', 'Centre de Soins', t, {
    indoor: true,
    music: 'indoor',
    warps: {
      [key(5, 9)]: { map: 'village', x: 4, y: 18, facing: 'down' },
      [key(6, 9)]: { map: 'village', x: 4, y: 18, facing: 'down' },
    },
    npcs: [{ id: 'nurse', x: 5, y: 2, sprite: 'nurse', facing: 'down' }],
  })
}

function buildGym(): GameMap {
  const t = grid(13, 16, 'gym')
  rect(t, 0, 0, 13, 16, 'wall')
  rect(t, 1, 1, 11, 14, 'gym')
  set(t, 3, 6, 'statue')
  set(t, 9, 6, 'statue')
  set(t, 3, 10, 'statue')
  set(t, 9, 10, 'statue')
  set(t, 6, 3, 'statue')
  set(t, 6, 14, 'mat')
  set(t, 6, 15, 'door')
  return map('gym', 'Arène Roche', t, {
    indoor: true,
    music: 'gym',
    warps: {
      [key(6, 15)]: { map: 'village', x: 17, y: 18, facing: 'down' },
    },
    npcs: [
      { id: 'gym1', x: 4, y: 8, sprite: 'boy', facing: 'down' },
      { id: 'leader', x: 6, y: 2, sprite: 'leader', facing: 'down' },
    ],
  })
}

function buildVillage(): GameMap {
  const t = grid(24, 22, 'grass')
  borderTrees(t)

  set(t, 11, 0, 'path')
  set(t, 12, 0, 'path')
  vline(t, 11, 1, 20, 'path')
  vline(t, 12, 1, 20, 'path')
  hline(t, 3, 6, 18, 'path')
  hline(t, 3, 12, 18, 'path')
  hline(t, 3, 18, 16, 'path')
  vline(t, 4, 8, 11, 'path')
  vline(t, 17, 12, 7, 'path')

  house(t, 9, 2, 7)
  set(t, 11, 5, 'door')
  house(t, 2, 8, 5)
  house(t, 2, 14, 5)
  house(t, 17, 8, 5)
  rect(t, 14, 13, 7, 2, 'roof')
  rect(t, 14, 15, 7, 3, 'hwall')
  set(t, 17, 17, 'door')

  set(t, 8, 7, 'flower')
  set(t, 14, 7, 'flower')
  set(t, 8, 13, 'flower')
  set(t, 14, 11, 'flower')
  set(t, 8, 19, 'flower')
  set(t, 9, 19, 'flower')
  set(t, 20, 19, 'flower')
  hline(t, 1, 5, 3, 'fence')
  hline(t, 20, 5, 3, 'fence')
  set(t, 10, 7, 'sign')
  set(t, 16, 19, 'sign')

  return map('village', 'Bourgfeuillage', t, {
    music: 'town',
    warps: {
      [key(4, 11)]: { map: 'home', x: 6, y: 9, facing: 'up' },
      [key(11, 5)]: { map: 'lab', x: 6, y: 10, facing: 'up' },
      [key(12, 5)]: { map: 'lab', x: 6, y: 10, facing: 'up' },
      [key(4, 17)]: { map: 'center', x: 5, y: 8, facing: 'up' },
      [key(17, 17)]: { map: 'gym', x: 6, y: 14, facing: 'up' },
      [key(11, 0)]: { map: 'route1', x: 7, y: 26, facing: 'up' },
      [key(12, 0)]: { map: 'route1', x: 8, y: 26, facing: 'up' },
    },
    npcs: [
      { id: 'kid', x: 10, y: 10, sprite: 'kid', facing: 'down' },
      { id: 'lass', x: 13, y: 12, sprite: 'lass', facing: 'left' },
      { id: 'clerk', x: 20, y: 12, sprite: 'clerk', facing: 'down' },
    ],
    signs: {
      [key(10, 7)]: 'Bourgfeuillage — Un village entre bois et collines.',
      [key(16, 19)]: 'Arène Roche — Champion: Granit',
    },
  })
}

function buildRoute1(): GameMap {
  const t = grid(16, 28, 'grass')
  borderTrees(t)
  // Path down the middle
  vline(t, 7, 0, 28, 'path')
  vline(t, 8, 0, 28, 'path')
  // South gate
  set(t, 7, 27, 'path')
  set(t, 8, 27, 'path')
  // North trees stay trees except we could add a dead end sign
  set(t, 7, 0, 'tree')
  set(t, 8, 0, 'tree')
  hline(t, 1, 1, 14, 'tree')

  // Tall grass patches
  rect(t, 1, 4, 5, 6, 'tall')
  rect(t, 10, 4, 5, 6, 'tall')
  rect(t, 1, 12, 5, 7, 'tall')
  rect(t, 10, 12, 5, 7, 'tall')
  rect(t, 2, 21, 4, 4, 'tall')
  rect(t, 10, 21, 5, 4, 'tall')

  // Water pond west
  rect(t, 1, 8, 4, 3, 'water')
  // Restore path through grass
  vline(t, 7, 3, 24, 'path')
  vline(t, 8, 3, 24, 'path')

  set(t, 9, 25, 'sign')
  set(t, 6, 3, 'flower')
  set(t, 9, 3, 'flower')
  hline(t, 1, 20, 3, 'fence')

  return map('route1', 'Route 1', t, {
    music: 'route',
    encounters: [
      { species: 'minipic', min: 2, max: 4, w: 40 },
      { species: 'rongegrain', min: 2, max: 4, w: 40 },
      { species: 'chenilys', min: 2, max: 3, w: 20 },
    ],
    warps: {
      [key(7, 27)]: { map: 'village', x: 11, y: 1, facing: 'down' },
      [key(8, 27)]: { map: 'village', x: 12, y: 1, facing: 'down' },
    },
    npcs: [{ id: 'route_kid', x: 10, y: 19, sprite: 'kid', facing: 'left' }],
    signs: {
      [key(9, 25)]: 'Route 1 — Herbes hautes: des créatures sauvages vivent ici.',
    },
  })
}

const MAPS: Record<string, GameMap> = {
  bedroom: buildBedroom(),
  home: buildHome(),
  lab: buildLab(),
  center: buildCenter(),
  gym: buildGym(),
  village: buildVillage(),
  route1: buildRoute1(),
}

export function getMap(id: string): GameMap {
  return MAPS[id] ?? MAPS.village
}

export function tileAt(m: GameMap, x: number, y: number): TileId {
  if (y < 0 || x < 0 || y >= m.h || x >= m.w) return 'void'
  return m.tiles[y][x]
}

export function neighbors(m: GameMap, x: number, y: number) {
  return {
    up: tileAt(m, x, y - 1),
    down: tileAt(m, x, y + 1),
    left: tileAt(m, x - 1, y),
    right: tileAt(m, x + 1, y),
  }
}

export function spawnWild(m: GameMap) {
  const table = m.encounters
  if (!table?.length) return null
  const total = table.reduce((s, e) => s + e.w, 0)
  let r = Math.random() * total
  for (const e of table) {
    r -= e.w
    if (r <= 0) {
      const level = e.min + Math.floor(Math.random() * (e.max - e.min + 1))
      return { species: e.species, level }
    }
  }
  const e = table[0]
  return { species: e.species, level: e.min }
}
