import { CHAR_W, drawText, wrapText } from './font'
import { TYPE_COLOR, TYPE_LABEL } from './data'
import type { CreatureLook, Dir, NpcSprite, SpeciesId, TileId } from './types'
import { SPECIES } from './data'

export function p(ctx: CanvasRenderingContext2D, x: number, y: number, c: string, w = 1, h = 1) {
  ctx.fillStyle = c
  ctx.fillRect(x, y, w, h)
}

export function drawTile(
  ctx: CanvasRenderingContext2D,
  tile: TileId,
  x: number,
  y: number,
  tick: number,
  n: { up: TileId; down: TileId; left: TileId; right: TileId },
  variant = 0,
) {
  switch (tile) {
    case 'grass':
      drawGrass(ctx, x, y, variant, false)
      break
    case 'tall':
      drawGrass(ctx, x, y, variant, true)
      break
    case 'path':
      drawPath(ctx, x, y, n)
      break
    case 'tree':
      drawTree(ctx, x, y)
      break
    case 'water':
      drawWater(ctx, x, y, tick)
      break
    case 'wall':
      p(ctx, x, y, '#786850', 16, 16)
      p(ctx, x, y, '#907860', 16, 1)
      p(ctx, x, y + 15, '#5a4838', 16, 1)
      break
    case 'floor':
      p(ctx, x, y, '#e8d0a0', 16, 16)
      if ((variant & 1) === 0) p(ctx, x + 2, y + 3, '#dcc490', 1, 1)
      p(ctx, x, y + 15, '#d0b888', 16, 1)
      break
    case 'door':
      p(ctx, x, y, '#c8b090', 16, 16)
      p(ctx, x + 3, y + 2, '#5a3820', 10, 14)
      p(ctx, x + 4, y + 3, '#3a2418', 8, 12)
      p(ctx, x + 10, y + 8, '#d8c070', 1, 2)
      break
    case 'flower':
      drawGrass(ctx, x, y, variant, false)
      p(ctx, x + 4, y + 6, '#f07898', 3, 3)
      p(ctx, x + 5, y + 7, '#f8f0a0', 1, 1)
      p(ctx, x + 10, y + 9, '#f0d040', 2, 2)
      p(ctx, x + 7, y + 4, '#e85888', 2, 2)
      break
    case 'roof':
      p(ctx, x, y, '#c04040', 16, 16)
      p(ctx, x, y, '#e06058', 16, 3)
      for (let i = 0; i < 16; i += 4) p(ctx, x + i, y, '#a03030', 1, 16)
      p(ctx, x, y + 8, '#d85048', 16, 1)
      break
    case 'hwall':
      p(ctx, x, y, '#e8dcc0', 16, 16)
      p(ctx, x, y, '#f4ece0', 16, 2)
      p(ctx, x + 4, y + 4, '#88c0d8', 8, 6)
      p(ctx, x + 5, y + 5, '#d8f0f8', 3, 2)
      p(ctx, x, y + 15, '#c8b898', 16, 1)
      break
    case 'bed':
      p(ctx, x, y, '#e8d0a0', 16, 16)
      p(ctx, x + 1, y + 2, '#d05060', 14, 12)
      p(ctx, x + 1, y + 2, '#f0e8e0', 14, 4)
      p(ctx, x + 2, y + 3, '#d8c8b0', 4, 3)
      break
    case 'table':
      p(ctx, x, y, '#e8d0a0', 16, 16)
      p(ctx, x + 1, y + 3, '#b07840', 14, 10)
      p(ctx, x + 2, y + 4, '#c89050', 12, 3)
      break
    case 'mat':
      p(ctx, x, y, '#e8d0a0', 16, 16)
      p(ctx, x + 1, y + 6, '#c05050', 14, 8)
      p(ctx, x + 2, y + 7, '#a04040', 12, 1)
      break
    case 'pc':
      p(ctx, x, y, '#e8d0a0', 16, 16)
      p(ctx, x + 2, y + 2, '#4868a0', 12, 12)
      p(ctx, x + 4, y + 4, '#80d0f0', 8, 6)
      p(ctx, x + 5, y + 5, '#f8f8f8', 2, 2)
      break
    case 'sign':
      drawGrass(ctx, x, y, variant, false)
      p(ctx, x + 7, y + 10, '#905028', 2, 6)
      p(ctx, x + 3, y + 3, '#d8b060', 10, 8)
      p(ctx, x + 4, y + 5, '#705028', 8, 1)
      p(ctx, x + 4, y + 7, '#705028', 8, 1)
      break
    case 'fence':
      drawGrass(ctx, x, y, variant, false)
      p(ctx, x, y + 6, '#c8a068', 16, 3)
      p(ctx, x + 2, y + 4, '#a08050', 2, 10)
      p(ctx, x + 12, y + 4, '#a08050', 2, 10)
      break
    case 'carpet':
      p(ctx, x, y, '#d05070', 16, 16)
      p(ctx, x + 1, y + 1, '#e07088', 14, 14)
      p(ctx, x + 6, y + 6, '#f098a8', 4, 4)
      break
    case 'heal':
      p(ctx, x, y, '#e8d0a0', 16, 16)
      p(ctx, x + 2, y + 2, '#f0f0f8', 12, 12)
      p(ctx, x + 6, y + 4, '#e05070', 4, 8)
      p(ctx, x + 4, y + 6, '#e05070', 8, 4)
      break
    case 'gym':
      p(ctx, x, y, '#c8b090', 16, 16)
      p(ctx, x + 1, y + 1, '#b8a078', 14, 14)
      if ((x + y) % 32 < 16) p(ctx, x + 4, y + 4, '#a89068', 8, 8)
      break
    case 'statue':
      p(ctx, x, y, '#c8b090', 16, 16)
      p(ctx, x + 4, y + 2, '#908070', 8, 12)
      p(ctx, x + 5, y + 3, '#b0a090', 6, 4)
      p(ctx, x + 6, y + 4, '#303030', 1, 1)
      p(ctx, x + 9, y + 4, '#303030', 1, 1)
      break
    case 'counter':
      p(ctx, x, y, '#e8d0a0', 16, 16)
      p(ctx, x, y + 4, '#d8a058', 16, 12)
      p(ctx, x, y + 4, '#f0c078', 16, 3)
      break
    case 'shelf':
      p(ctx, x, y, '#e8d0a0', 16, 16)
      p(ctx, x + 1, y + 1, '#8a5a30', 14, 14)
      p(ctx, x + 2, y + 3, '#c04040', 5, 4)
      p(ctx, x + 8, y + 3, '#4070c0', 5, 4)
      p(ctx, x + 2, y + 9, '#e0e0e0', 12, 4)
      break
    case 'window':
      p(ctx, x, y, '#786850', 16, 16)
      p(ctx, x + 2, y + 2, '#80c0e0', 12, 12)
      p(ctx, x + 3, y + 3, '#d0f0f8', 4, 4)
      p(ctx, x + 8, y, '#786850', 1, 16)
      p(ctx, x, y + 8, '#786850', 16, 1)
      break
    case 'rug':
      p(ctx, x, y, '#e8d0a0', 16, 16)
      p(ctx, x + 1, y + 1, '#58a070', 14, 14)
      break
    case 'stairs':
      p(ctx, x, y, '#c09050', 16, 16)
      p(ctx, x, y + 4, '#d8a860', 16, 4)
      p(ctx, x, y + 8, '#e8c078', 16, 4)
      p(ctx, x, y + 12, '#f0d090', 16, 4)
      p(ctx, x, y + 3, '#a07040', 16, 1)
      p(ctx, x, y + 7, '#a07040', 16, 1)
      p(ctx, x, y + 11, '#a07040', 16, 1)
      break
    case 'orb':
      p(ctx, x, y, '#e8d0a0', 16, 16)
      p(ctx, x + 1, y + 8, '#b07840', 14, 6)
      drawOrb(ctx, x + 4, y + 1, variant)
      break
    default:
      p(ctx, x, y, '#000000', 16, 16)
  }
}

function drawGrass(ctx: CanvasRenderingContext2D, x: number, y: number, variant: number, tall: boolean) {
  p(ctx, x, y, tall ? '#48b040' : '#50b048', 16, 16)
  p(ctx, x, y, tall ? '#40a038' : '#48a840', 16, 2)
  const dots = [
    [2, 4],
    [7, 9],
    [12, 5],
    [4, 12],
    [10, 13],
    [14, 10],
  ]
  ctx.fillStyle = tall ? '#68d058' : '#68c858'
  for (const [dx, dy] of dots) {
    if (((variant + dx) & 1) === 0) ctx.fillRect(x + dx, y + dy, 1, 1)
  }
  ctx.fillStyle = '#308030'
  ctx.fillRect(x + 1, y + 8, 1, 1)
  ctx.fillRect(x + 9, y + 3, 1, 1)
  if (tall) {
    ctx.fillStyle = '#38a030'
    for (let i = 0; i < 8; i++) {
      const bx = x + 1 + (i * 2 + variant) % 14
      ctx.fillRect(bx, y + 2, 1, 8)
      ctx.fillStyle = '#70e060'
      ctx.fillRect(bx, y + 1, 1, 2)
      ctx.fillStyle = '#38a030'
    }
  }
}

function drawPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  n: { up: TileId; down: TileId; left: TileId; right: TileId },
) {
  p(ctx, x, y, '#e0d0a0', 16, 16)
  p(ctx, x + 3, y + 5, '#d0c090', 1, 1)
  p(ctx, x + 11, y + 10, '#d0c090', 1, 1)
  const fringe = (side: TileId) => side === 'grass' || side === 'tall' || side === 'flower' || side === 'tree'
  if (fringe(n.up)) {
    p(ctx, x, y, '#50b048', 16, 2)
    p(ctx, x + 2, y + 2, '#50b048', 2, 1)
    p(ctx, x + 8, y + 2, '#50b048', 3, 1)
  }
  if (fringe(n.down)) p(ctx, x, y + 14, '#50b048', 16, 2)
  if (fringe(n.left)) p(ctx, x, y, '#50b048', 2, 16)
  if (fringe(n.right)) p(ctx, x + 14, y, '#50b048', 2, 16)
}

function drawTree(ctx: CanvasRenderingContext2D, x: number, y: number) {
  p(ctx, x, y, '#389038', 16, 16)
  p(ctx, x, y, '#2a7828', 16, 16)
  p(ctx, x + 1, y + 1, '#40a040', 14, 12)
  p(ctx, x + 3, y + 2, '#58c050', 8, 6)
  p(ctx, x + 2, y + 3, '#186018', 2, 2)
  p(ctx, x + 11, y + 8, '#186018', 2, 2)
  p(ctx, x + 6, y + 12, '#805028', 4, 4)
  p(ctx, x + 7, y + 11, '#905830', 2, 2)
}

function drawWater(ctx: CanvasRenderingContext2D, x: number, y: number, tick: number) {
  const f = Math.floor(tick / 20) % 2
  p(ctx, x, y, '#2878c0', 16, 16)
  p(ctx, x, y, '#3890d8', 16, 16)
  ctx.fillStyle = '#48a8e8'
  if (f === 0) {
    ctx.fillRect(x + 2, y + 4, 5, 1)
    ctx.fillRect(x + 9, y + 10, 5, 1)
    ctx.fillRect(x + 4, y + 13, 4, 1)
  } else {
    ctx.fillRect(x + 5, y + 6, 5, 1)
    ctx.fillRect(x + 1, y + 11, 5, 1)
    ctx.fillRect(x + 10, y + 3, 4, 1)
  }
  p(ctx, x, y, '#1868a8', 16, 1)
}

function drawOrb(ctx: CanvasRenderingContext2D, x: number, y: number, which: number) {
  const colors = ['#f07030', '#4090e0', '#50c048']
  const c = colors[which % 3]
  p(ctx, x, y + 2, '#f8f8f8', 8, 8)
  p(ctx, x + 1, y + 1, c, 6, 5)
  p(ctx, x + 1, y + 6, '#e8e8e8', 6, 4)
  p(ctx, x, y + 5, '#303030', 8, 1)
  p(ctx, x + 3, y + 4, '#303030', 2, 3)
  p(ctx, x + 2, y + 2, '#fff8f0', 2, 2)
}

export function drawPlayer(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  dir: Dir,
  frame: number,
  running: boolean,
) {
  const bob = frame % 2 === 1 ? 1 : 0
  const step = frame % 4
  const leg = step === 1 ? -1 : step === 3 ? 1 : 0
  drawKid(ctx, x, y - 8 + (running ? bob : 0), dir, leg, {
    hair: '#5a3020',
    shirt: '#d04040',
    pants: '#3058a0',
    skin: '#f0c8a0',
  })
}

export function drawNpc(
  ctx: CanvasRenderingContext2D,
  sprite: NpcSprite,
  x: number,
  y: number,
  dir: Dir,
  frame: number,
) {
  const palettes: Record<NpcSprite, { hair: string; shirt: string; pants: string; skin: string }> = {
    mom: { hair: '#c06030', shirt: '#e07090', pants: '#704090', skin: '#f0c8a0' },
    prof: { hair: '#d0d0d0', shirt: '#f0f0f0', pants: '#405070', skin: '#e8c090' },
    nurse: { hair: '#f0e0a0', shirt: '#f0b0c0', pants: '#f8f8f8', skin: '#f0c8a0' },
    kid: { hair: '#303030', shirt: '#40a0e0', pants: '#305070', skin: '#f0c8a0' },
    lass: { hair: '#e8d060', shirt: '#f080b0', pants: '#f8e0f0', skin: '#f0c8a0' },
    leader: { hair: '#704020', shirt: '#b08050', pants: '#504030', skin: '#e0b080' },
    clerk: { hair: '#403020', shirt: '#308070', pants: '#304040', skin: '#f0c8a0' },
    boy: { hair: '#c04020', shirt: '#e0a040', pants: '#505050', skin: '#f0c8a0' },
  }
  const leg = frame % 4 === 1 ? -1 : frame % 4 === 3 ? 1 : 0
  drawKid(ctx, x, y - 8, dir, leg, palettes[sprite])
}

function drawKid(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  dir: Dir,
  leg: number,
  pal: { hair: string; shirt: string; pants: string; skin: string },
) {
  const { hair, shirt, pants, skin } = pal
  const outline = '#202020'
  // shadow
  p(ctx, x + 3, y + 22, '#00000028', 10, 2)
  if (dir === 'down') {
    p(ctx, x + 4, y + 2, hair, 8, 5)
    p(ctx, x + 5, y + 6, skin, 6, 5)
    p(ctx, x + 6, y + 8, outline, 1, 1)
    p(ctx, x + 9, y + 8, outline, 1, 1)
    p(ctx, x + 7, y + 10, '#e08080', 2, 1)
    p(ctx, x + 4, y + 11, shirt, 8, 6)
    p(ctx, x + 3, y + 12, skin, 2, 4)
    p(ctx, x + 11, y + 12, skin, 2, 4)
    p(ctx, x + 4, y + 17, pants, 8, 5)
    p(ctx, x + 4 + leg, y + 20, '#e8e8e8', 3, 3)
    p(ctx, x + 9 - leg, y + 20, '#e8e8e8', 3, 3)
  } else if (dir === 'up') {
    p(ctx, x + 4, y + 2, hair, 8, 8)
    p(ctx, x + 5, y + 6, skin, 6, 3)
    p(ctx, x + 4, y + 11, shirt, 8, 6)
    p(ctx, x + 3, y + 12, skin, 2, 4)
    p(ctx, x + 11, y + 12, skin, 2, 4)
    p(ctx, x + 4, y + 17, pants, 8, 5)
    p(ctx, x + 4 + leg, y + 20, '#e8e8e8', 3, 3)
    p(ctx, x + 9 - leg, y + 20, '#e8e8e8', 3, 3)
  } else {
    const flip = dir === 'left'
    const ox = flip ? 1 : 0
    p(ctx, x + 4 + ox, y + 2, hair, 7, 6)
    p(ctx, x + 5 + ox, y + 6, skin, 5, 5)
    p(ctx, x + (flip ? 6 : 9), y + 8, outline, 1, 1)
    p(ctx, x + 4 + ox, y + 11, shirt, 8, 6)
    p(ctx, x + (flip ? 11 : 3), y + 12, skin, 2, 4)
    p(ctx, x + 5, y + 17, pants, 6, 5)
    p(ctx, x + 4 + (flip ? -leg : leg), y + 20, '#e8e8e8', 4, 3)
    p(ctx, x + 8, y + 20, '#e8e8e8', 3, 2)
  }
  p(ctx, x + 4, y + 1, outline, 8, 1)
}

export function drawCreature(
  ctx: CanvasRenderingContext2D,
  species: SpeciesId,
  x: number,
  y: number,
  size: number,
  side: 'front' | 'back',
  flash = false,
) {
  const sp = SPECIES[species]
  const look = side === 'front' ? sp.front : sp.back
  if (flash) {
    drawShape(ctx, look, x, y, size, '#f8f8f8', '#f8f8f8')
    return
  }
  drawShape(ctx, look, x, y, size, look.body, look.accent)
}

function drawShape(
  ctx: CanvasRenderingContext2D,
  look: CreatureLook,
  x: number,
  y: number,
  size: number,
  body: string,
  accent: string,
) {
  const s = size / 32
  const px = (ox: number, oy: number, w: number, h: number, c: string) => {
    ctx.fillStyle = c
    ctx.fillRect(x + ox * s, y + oy * s, w * s, h * s)
  }
  const eye = look.eye
  switch (look.shape) {
    case 'fox':
      px(8, 10, 16, 14, body)
      px(6, 6, 8, 8, body)
      px(18, 6, 8, 8, body)
      px(10, 8, 4, 4, accent)
      px(18, 8, 4, 4, accent)
      px(12, 14, 8, 6, accent)
      px(22, 18, 8, 6, '#f07020')
      px(24, 16, 6, 4, '#f8d040')
      px(12, 16, 2, 2, eye)
      px(18, 16, 2, 2, eye)
      px(10, 22, 4, 6, body)
      px(18, 22, 4, 6, body)
      break
    case 'otter':
      px(8, 12, 16, 12, body)
      px(10, 6, 12, 10, body)
      px(12, 14, 10, 8, accent)
      px(22, 16, 8, 4, body)
      px(13, 10, 2, 2, eye)
      px(18, 10, 2, 2, eye)
      px(10, 22, 5, 6, body)
      px(18, 22, 5, 6, body)
      break
    case 'cat':
      px(8, 12, 16, 12, body)
      px(10, 6, 12, 10, body)
      px(8, 4, 5, 6, body)
      px(19, 4, 5, 6, body)
      px(14, 2, 4, 5, '#40a038')
      px(12, 14, 8, 6, accent)
      px(13, 10, 2, 2, eye)
      px(18, 10, 2, 2, eye)
      px(10, 22, 4, 6, body)
      px(18, 22, 4, 6, body)
      break
    case 'bird':
      px(10, 10, 14, 12, body)
      px(8, 8, 8, 8, body)
      px(12, 14, 10, 6, accent)
      px(22, 12, 6, 3, '#f09040')
      px(6, 6, 8, 4, body)
      px(14, 12, 2, 2, eye)
      px(12, 20, 3, 6, '#e0d0b0')
      px(18, 20, 3, 6, '#e0d0b0')
      break
    case 'mouse':
      px(8, 12, 16, 12, body)
      px(10, 8, 12, 10, body)
      px(6, 6, 6, 6, body)
      px(20, 6, 6, 6, body)
      px(12, 14, 8, 6, accent)
      px(13, 12, 2, 2, eye)
      px(18, 12, 2, 2, eye)
      px(22, 16, 8, 3, body)
      px(10, 22, 4, 6, body)
      px(18, 22, 4, 6, body)
      break
    case 'bug':
      px(6, 14, 6, 8, body)
      px(12, 12, 8, 10, body)
      px(20, 14, 6, 8, body)
      px(8, 16, 3, 3, accent)
      px(14, 14, 3, 3, accent)
      px(21, 16, 3, 3, accent)
      px(14, 10, 4, 4, body)
      px(15, 11, 2, 2, eye)
      px(8, 22, 3, 4, '#306020')
      px(16, 22, 3, 4, '#306020')
      px(22, 22, 3, 4, '#306020')
      break
    case 'rock':
      px(8, 10, 16, 14, body)
      px(10, 8, 12, 4, accent)
      px(6, 14, 4, 8, body)
      px(22, 14, 4, 8, body)
      px(12, 14, 2, 2, eye)
      px(18, 14, 2, 2, eye)
      px(10, 22, 5, 6, body)
      px(17, 22, 5, 6, body)
      break
    case 'golem':
      px(6, 8, 20, 16, body)
      px(8, 6, 16, 6, accent)
      px(4, 12, 6, 10, body)
      px(22, 12, 6, 10, body)
      px(12, 12, 3, 3, eye)
      px(18, 12, 3, 3, eye)
      px(8, 22, 6, 8, body)
      px(18, 22, 6, 8, body)
      break
  }
}

export function drawPanel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  theme: 'blue' | 'green' | 'wood' | 'dark' = 'blue',
) {
  const pal =
    theme === 'green'
      ? ['#f8f8f0', '#a0d888', '#186838', '#e8f8d8']
      : theme === 'wood'
        ? ['#f8f0d8', '#d0a060', '#704018', '#fff8e0']
        : theme === 'dark'
          ? ['#d0d0e0', '#405070', '#182030', '#c8d0e0']
          : ['#f8f8f8', '#58a0e0', '#204888', '#d0e8f8']
  p(ctx, x, y, pal[0], w, h)
  p(ctx, x + 1, y + 1, pal[1], w - 2, h - 2)
  p(ctx, x + 2, y + 2, pal[2], w - 4, h - 4)
  p(ctx, x + 4, y + 4, pal[3], w - 8, h - 8)
  p(ctx, x + 5, y + 5, pal[2], w - 10, h - 10)
}

export function drawDialogueBox(
  ctx: CanvasRenderingContext2D,
  text: string,
  charsShown: number,
  opts?: { choices?: string[]; choice?: number; continue?: boolean },
) {
  drawPanel(ctx, 8, 104, 224, 48, 'blue')
  const shown = text.slice(0, charsShown)
  const lines = wrapText(shown, 34)
  const vis = lines.slice(0, 3)
  for (let i = 0; i < vis.length; i++) {
    drawText(ctx, vis[i], 16, 112 + i * 10, '#f8f8f0', 1)
  }
  if (opts?.choices?.length) {
    const bx = 130
    const by = 70
    drawPanel(ctx, bx, by, 100, 12 + opts.choices.length * 12, 'blue')
    opts.choices.forEach((c, i) => {
      const col = i === (opts.choice ?? 0) ? '#f8f070' : '#f8f8f0'
      drawText(ctx, (i === (opts.choice ?? 0) ? '▶ ' : '  ') + c, bx + 8, by + 8 + i * 12, col, 1)
    })
  } else if (opts?.continue && charsShown >= text.length) {
    if (Math.floor(Date.now() / 400) % 2 === 0) drawText(ctx, '▼', 214, 138, '#f8f070', 1)
  }
}

export function drawHpBar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, hp: number, max: number) {
  const ratio = Math.max(0, Math.min(1, max <= 0 ? 0 : hp / max))
  p(ctx, x, y, '#404040', w, 5)
  p(ctx, x + 1, y + 1, '#f8f8f8', w - 2, 3)
  const col = ratio > 0.5 ? '#40e070' : ratio > 0.2 ? '#f0d030' : '#f04040'
  const inner = Math.floor((w - 2) * ratio)
  if (inner > 0) p(ctx, x + 1, y + 1, col, inner, 3)
}

export function drawNamePlate(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  name: string,
  level: number,
  hp: number,
  max: number,
  xpRatio: number | null,
  wide = false,
) {
  const w = wide ? 120 : 110
  const h = xpRatio != null ? 36 : 30
  drawPanel(ctx, x, y, w, h, 'wood')
  drawText(ctx, name, x + 8, y + 6, '#203018', 1, false)
  drawText(ctx, `N.${level}`, x + w - 8 - measureDigits(`N.${level}`), y + 6, '#203018', 1, false)
  drawText(ctx, 'PV', x + 8, y + 16, '#c04040', 1, false)
  drawHpBar(ctx, x + 22, y + 17, w - 32, hp, max)
  if (xpRatio != null) {
    p(ctx, x + 8, y + 26, '#404040', w - 16, 3)
    p(ctx, x + 8, y + 26, '#40a0f0', Math.floor((w - 16) * xpRatio), 3)
  }
}

function measureDigits(s: string) {
  return s.length * CHAR_W
}

export function drawTypeBadge(ctx: CanvasRenderingContext2D, type: import('./types').Elem, x: number, y: number) {
  const label = TYPE_LABEL[type]
  const w = label.length * CHAR_W + 6
  p(ctx, x, y, TYPE_COLOR[type], w, 10)
  drawText(ctx, label, x + 3, y + 2, '#202020', 1, false)
}
