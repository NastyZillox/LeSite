import {
  DIRS,
  TILE,
  VIEW_H,
  VIEW_W,
  key,
  opposite,
  type Dir,
  type Monster,
  type NpcDef,
  type SaveData,
  type SpeciesId,
} from './types'
import { Input } from './input'
import { Sfx } from './sfx'
import { getMap, neighbors, spawnWild, tileAt } from './maps'
import { SOLID } from './types'
import {
  drawCreature,
  drawDialogueBox,
  drawHpBar,
  drawNamePlate,
  drawNpc,
  drawPanel,
  drawPlayer,
  drawTile,
  p,
} from './art'
import { drawText, wrapText } from './font'
import { MOVES, SPECIES, TYPE_LABEL, healMonster, makeMonster, maxHpOf, xpToNext } from './data'
import { hasSave, loadSave, writeSave } from './save'
import {
  CMDS,
  CMD_LABEL,
  afterAnim,
  chooseCatch,
  chooseFight,
  chooseRun,
  firstAble,
  introMessages,
  startTrainer,
  startWild,
  switchTo,
  tickMessages,
  applyPotion,
  type Battle,
} from './battle'

type Mode = 'title' | 'overworld' | 'dialogue' | 'battle' | 'pause' | 'party' | 'bag' | 'badges'

type Choice = { label: string; fn: () => void }

const PAUSE_ITEMS = ['Équipe', 'Sac', 'Badges', 'Sauvegarder', 'Fermer']

export class Game {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  input: Input
  sfx = new Sfx()
  dead = false
  acc = 0
  last = 0
  tick = 0
  raf = 0

  mode: Mode = 'title'
  titleCursor = 0
  toast = ''
  toastT = 0

  name = 'Léo'
  mapId = 'bedroom'
  tx = 6
  ty = 5
  px = 6 * TILE
  py = 5 * TILE
  facing: Dir = 'down'
  moving = false
  moveDir: Dir = 'down'
  moveLeft = 0
  walkFrame = 0
  animT = 0
  bumpT = 0
  running = false

  party: Monster[] = []
  bag = { sphere: 0, potion: 0 }
  badges = [false, false, false, false, false, false, false, false]
  flags: Record<string, boolean> = {}
  playFrames = 0
  money = 0

  liveNpcs: NpcDef[] = []

  dlgPages: string[] = []
  dlgPage = 0
  dlgChar = 0
  dlgChoices: Choice[] | null = null
  dlgChoice = 0
  dlgOnClose: (() => void) | null = null

  fade = 0
  fadeDir = 0
  fadeMid = false
  fadeOnMid: (() => void) | null = null
  fadeColor = '#000000'

  battle: Battle | null = null
  pauseCursor = 0
  partyCursor = 0
  partyFrom: 'pause' | 'battle' | 'potion' = 'pause'
  bagCursor = 0
  returnMode: Mode = 'overworld'

  constructor(canvas: HTMLCanvasElement, input: Input) {
    this.canvas = canvas
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('canvas')
    this.ctx = ctx
    this.input = input
  }

  start() {
    this.input.attach()
    this.last = performance.now()
    const loop = (now: number) => {
      if (this.dead) return
      this.acc += now - this.last
      this.last = now
      const step = 1000 / 60
      let n = 0
      while (this.acc >= step && n < 5) {
        this.update()
        this.acc -= step
        n++
      }
      this.render()
      this.raf = requestAnimationFrame(loop)
    }
    this.raf = requestAnimationFrame(loop)
  }

  destroy() {
    this.dead = true
    cancelAnimationFrame(this.raf)
    this.input.detach()
  }

  private update() {
    this.input.tick()
    this.tick++
    this.playFrames++
    if (this.toastT > 0) this.toastT--
    if (this.bumpT > 0) this.bumpT--
    if (this.fadeDir !== 0) {
      this.fade += this.fadeDir * 0.07
      if (this.fade >= 1) {
        this.fade = 1
        if (!this.fadeMid) {
          this.fadeMid = true
          this.fadeOnMid?.()
        }
        this.fadeDir = -1
      } else if (this.fade <= 0 && this.fadeDir < 0) {
        this.fade = 0
        this.fadeDir = 0
        this.fadeOnMid = null
      }
      return
    }

    switch (this.mode) {
      case 'title':
        this.updateTitle()
        break
      case 'overworld':
        this.updateOverworld()
        break
      case 'dialogue':
        this.updateDialogue()
        break
      case 'battle':
        this.updateBattle()
        break
      case 'pause':
        this.updatePause()
        break
      case 'party':
        this.updateParty()
        break
      case 'bag':
        this.updateBag()
        break
      case 'badges':
        if (this.input.pressed.has('a') || this.input.pressed.has('b') || this.input.pressed.has('start')) {
          this.sfx.cancel()
          this.mode = 'pause'
        }
        break
    }
  }

  private updateTitle() {
    if (this.input.pressed.has('up') || this.input.pressed.has('down')) {
      this.sfx.select()
      this.titleCursor = this.titleCursor === 0 ? 1 : 0
    }
    if (this.input.pressed.has('a') || this.input.pressed.has('start')) {
      if (this.titleCursor === 1 && !hasSave()) {
        this.sfx.bump()
        return
      }
      this.sfx.confirm()
      if (this.titleCursor === 1) {
        this.applySave(loadSave()!)
        this.startFade(() => {
          this.mode = 'overworld'
        })
      } else {
        this.newGame()
        this.startFade(() => {
          this.mode = 'overworld'
          this.openDialogue('Bienvenue à Bourgfeuillage ! Descends les escaliers, parle à ta mère, puis va voir le Prof. Sauge au labo.')
        })
      }
    }
  }

  private newGame() {
    this.name = 'Léo'
    this.party = []
    this.bag = { sphere: 0, potion: 2 }
    this.badges = [false, false, false, false, false, false, false, false]
    this.flags = {}
    this.playFrames = 0
    this.money = 500
    this.enterMap('bedroom', 6, 5, 'down', false)
  }

  private applySave(s: SaveData) {
    this.name = s.name
    this.party = s.party
    this.bag = s.bag
    this.badges = s.badges
    this.flags = s.flags
    this.playFrames = s.playFrames
    this.money = s.money
    this.enterMap(s.mapId, s.tx, s.ty, s.facing, false)
  }

  private snapshot(): SaveData {
    return {
      v: 1,
      name: this.name,
      mapId: this.mapId,
      tx: this.tx,
      ty: this.ty,
      facing: this.facing,
      party: this.party,
      bag: this.bag,
      badges: this.badges,
      flags: this.flags,
      playFrames: this.playFrames,
      money: this.money,
    }
  }

  saveGame() {
    writeSave(this.snapshot())
    this.sfx.save()
    this.toast = 'Sauvegardé !'
    this.toastT = 90
  }

  private enterMap(id: string, x: number, y: number, facing: Dir, fade = true) {
    const go = () => {
      this.mapId = id
      this.tx = x
      this.ty = y
      this.px = x * TILE
      this.py = y * TILE
      this.facing = facing
      this.moving = false
      this.moveLeft = 0
      this.liveNpcs = getMap(id).npcs.map((n) => ({ ...n }))
    }
    if (fade) this.startFade(go)
    else go()
  }

  private startFade(onMid: () => void, color = '#000000') {
    this.fadeDir = 1
    this.fade = 0.01
    this.fadeMid = false
    this.fadeOnMid = onMid
    this.fadeColor = color
  }

  private npcAt(x: number, y: number) {
    return this.liveNpcs.find((n) => n.x === x && n.y === y)
  }

  private blocked(x: number, y: number) {
    const m = getMap(this.mapId)
    const t = tileAt(m, x, y)
    if (SOLID.has(t)) return true
    if (this.npcAt(x, y)) return true
    if (x === this.tx && y === this.ty) return true
    return false
  }

  private updateOverworld() {
    if (this.input.pressed.has('start') || this.input.pressed.has('select')) {
      this.sfx.confirm()
      this.pauseCursor = 0
      this.mode = 'pause'
      return
    }
    if (this.moving) {
      const sp = this.running ? 4 : 2
      const d = DIRS[this.moveDir]
      this.px += d.x * sp
      this.py += d.y * sp
      this.moveLeft -= sp
      this.animT++
      this.walkFrame = Math.floor(this.animT / 4) % 4
      if (this.moveLeft <= 0) {
        this.tx += d.x
        this.ty += d.y
        this.px = this.tx * TILE
        this.py = this.ty * TILE
        this.moving = false
        this.walkFrame = 0
        this.afterStep()
      }
      return
    }

    if (this.input.pressed.has('a') && this.tryInteract()) return

    const dir = this.input.dir()
    if (!dir) {
      this.walkFrame = 0
      this.applyWarpAt(this.tx, this.ty)
      return
    }
    this.facing = dir
    this.running = this.input.down.has('b')
    const d = DIRS[dir]
    const nx = this.tx + d.x
    const ny = this.ty + d.y
    if (this.blocked(nx, ny)) {
      if (this.bumpT === 0) {
        this.sfx.bump()
        this.bumpT = 12
      }
      return
    }
    if (this.applyWarpAt(nx, ny)) return
    this.moving = true
    this.moveDir = dir
    this.moveLeft = TILE
    this.animT = 0
  }

  private applyWarpAt(x: number, y: number): boolean {
    const m = getMap(this.mapId)
    const warp = m.warps[key(x, y)]
    if (!warp) return false
    if (warp.map === 'route1' && !this.flags.gotStarter) {
      if (y === this.ty && x === this.tx) {
        this.ty = this.ty + 1
        this.px = this.tx * TILE
        this.py = this.ty * TILE
        this.facing = 'down'
      }
      this.openDialogue('Les herbes de la Route 1 sont dangereuses. Va d abord voir le Prof. Sauge !')
      return true
    }
    this.sfx.confirm()
    this.enterMap(warp.map, warp.x, warp.y, warp.facing ?? this.facing)
    return true
  }

  private afterStep() {
    if (this.applyWarpAt(this.tx, this.ty)) return
    const m = getMap(this.mapId)
    const tile = tileAt(m, this.tx, this.ty)
    if (tile === 'tall' && this.flags.gotStarter && this.party.some((p) => p.hp > 0) && Math.random() < 0.14) {
      const enc = spawnWild(m)
      if (enc) this.beginWild(enc.species, enc.level)
    }
  }

  private tryInteract(): boolean {
    const d = DIRS[this.facing]
    const x = this.tx + d.x
    const y = this.ty + d.y
    const npc = this.npcAt(x, y)
    if (npc) {
      npc.facing = opposite(this.facing)
      this.talk(npc.id)
      return true
    }
    const m = getMap(this.mapId)
    const sign = m.signs[key(x, y)]
    if (sign) {
      this.openDialogue(sign)
      return true
    }
    const t = tileAt(m, x, y)
    if (t === 'orb') {
      this.pickStarter(x)
      return true
    }
    if ((t === 'door' || t === 'stairs') && this.applyWarpAt(x, y)) return true
    if (t === 'pc') {
      this.openDialogue('PC de Bourgfeuillage. Sauvegarder la partie ?', {
        choices: [
          { label: 'Oui', fn: () => this.saveGame() },
          { label: 'Non', fn: () => {} },
        ],
      })
      return true
    }
    return false
  }

  private pickStarter(x: number) {
    if (this.flags.gotStarter) {
      this.openDialogue('Tu as déjà choisi ta créature.')
      return
    }
    const table: Record<number, SpeciesId> = { 5: 'pyronille', 6: 'aquilou', 7: 'sylfeuille' }
    const id = table[x]
    if (!id) return
    const sp = SPECIES[id]
    this.openDialogue(`${sp.name}, créature de type ${TYPE_LABEL[sp.types[0]!]}.\nLa prendre avec toi ?`, {
      choices: [
        {
          label: 'Oui',
          fn: () => {
            this.party = [makeMonster(id, 5)]
            this.flags.gotStarter = true
            this.bag.sphere += 5
            this.bag.potion += 3
            this.sfx.catch()
            this.openDialogue(
              `${sp.name} te rejoint !\nLe Prof. Sauge te donne 5 Sphères et des Potions.\nLes herbes de la Route 1 n attendent plus que toi.`,
            )
          },
        },
        { label: 'Non', fn: () => {} },
      ],
    })
  }

  private talk(id: string) {
    this.sfx.confirm()
    switch (id) {
      case 'mom':
        if (!this.flags.gotStarter) {
          this.openDialogue(
            "Enfin debout ! Le Prof. Sauge t'attend au laboratoire, juste au nord.\nFais attention dehors, d accord ?",
          )
        } else {
          this.openDialogue('Tu veux te reposer un peu ?', {
            choices: [
              {
                label: 'Oui',
                fn: () => {
                  this.healAll()
                  this.openDialogue('Tes créatures sont en pleine forme. Va briller !')
                },
              },
              { label: 'Non', fn: () => this.openDialogue('Reviens quand tu veux.') },
            ],
          })
        }
        break
      case 'prof':
        if (!this.flags.gotStarter) {
          this.openDialogue(
            "Je suis le Prof. Sauge. J étudie les créatures de Verdalia.\nChoisis-en une sur la table : Feu, Eau ou Plante.\nEnsuite, tente la Route 1, puis l Arène Roche !",
          )
        } else if (!this.badges[0]) {
          this.openDialogue(
            `Ton ${this.party[0]?.nickname} a l air en forme.\nCapture des créatures dans les herbes, soigne-les au Centre, puis défie Granit !`,
          )
        } else {
          this.openDialogue("Le Badge Roc... tu as déjà le souffle d un vrai dresseur. Le monde s ouvre à toi.")
        }
        break
      case 'nurse':
        this.openDialogue('Bienvenue au Centre de Soins. Je soigne tes créatures ?', {
          choices: [
            {
              label: 'Oui',
              fn: () => {
                this.healAll()
                this.openDialogue('Tes créatures sont remises à neuf ! Pense à sauvegarder (START).', {
                  choices: [
                    { label: 'Sauvegarder', fn: () => this.saveGame() },
                    { label: 'Plus tard', fn: () => {} },
                  ],
                })
              },
            },
            { label: 'Non', fn: () => this.openDialogue('Revenez vite !') },
          ],
        })
        break
      case 'kid':
        this.openDialogue(
          this.flags.gotStarter
            ? "J'ai vu un Minipic dans l herbe, au nord ! Cours avec B."
            : 'Le labo est le grand bâtiment au nord. Le prof est un peu distrait...',
        )
        break
      case 'lass':
        this.openDialogue("L Arène de Granit est à l est. Type Roche : l Eau et les Plantes, ça passe creme.")
        break
      case 'clerk':
        this.openDialogue("Un jour j ouvrirai un vrai magasin. En attendant, le prof donne des Sphères.")
        break
      case 'route_kid':
        this.openDialogue("Si tu es blessé, retourne au Centre, au sud du village. La croix rose, tu verras.")
        break
      case 'gym1':
        if (!this.flags.gotStarter) {
          this.openDialogue("Sans créature, tu ne vas pas faire long feu.")
        } else if (this.flags.beatGymTrainer) {
          this.openDialogue('Pas mal... Granit est encore plus solide.')
        } else {
          this.openDialogue("L Arène Roche, c est du costaud !", {
            onClose: () => this.beginTrainer('Roc', [makeMonster('caillou', 5)], () => {
              this.flags.beatGymTrainer = true
            }),
          })
        }
        break
      case 'leader':
        if (!this.flags.gotStarter) {
          this.openDialogue('Reviens avec une créature. On ne se bat pas à mains nues.')
        } else if (this.badges[0]) {
          this.openDialogue('Tu as le Badge Roc. Que la pierre guide tes pas.')
        } else {
          this.openDialogue("Je suis Granit, champion de l Arène Roche.\nMontre-moi ta détermination !", {
            onClose: () =>
              this.beginTrainer(
                'Granit',
                [makeMonster('caillou', 6), makeMonster('rocaille', 8)],
                () => {
                  this.badges[0] = true
                  this.money += 800
                  this.openDialogue(
                    "Impressionnant. Le Badge Roc est à toi !\nTes créatures encaisseront un peu mieux les coups.\nTu as aussi gagné 800 pièces.",
                  )
                },
              ),
          })
        }
        break
      default:
        this.openDialogue('...')
    }
  }

  private healAll() {
    for (const m of this.party) healMonster(m)
    this.sfx.heal()
  }

  openDialogue(text: string, opts?: { choices?: Choice[]; onClose?: () => void }) {
    const lines = wrapText(text, 34)
    const pages: string[] = []
    for (let i = 0; i < lines.length; i += 3) {
      pages.push(lines.slice(i, i + 3).join('\n'))
    }
    this.dlgPages = pages.length ? pages : ['']
    this.dlgPage = 0
    this.dlgChar = 0
    this.dlgChoices = opts?.choices ?? null
    this.dlgChoice = 0
    this.dlgOnClose = opts?.onClose ?? null
    this.mode = 'dialogue'
  }

  private updateDialogue() {
    const page = this.dlgPages[this.dlgPage] ?? ''
    const last = this.dlgPage >= this.dlgPages.length - 1
    if (this.dlgChar < page.length) {
      this.dlgChar += 2
      if (this.input.pressed.has('a') || this.input.pressed.has('b')) this.dlgChar = page.length
      return
    }
    if (last && this.dlgChoices?.length) {
      if (this.input.pressed.has('up')) {
        this.sfx.select()
        this.dlgChoice = (this.dlgChoice + this.dlgChoices.length - 1) % this.dlgChoices.length
      }
      if (this.input.pressed.has('down')) {
        this.sfx.select()
        this.dlgChoice = (this.dlgChoice + 1) % this.dlgChoices.length
      }
      if (this.input.pressed.has('a')) {
        this.sfx.confirm()
        const pick = this.dlgChoices[this.dlgChoice]!
        this.dlgChoices = null
        this.mode = 'overworld'
        pick.fn()
      }
      return
    }
    if (this.input.pressed.has('a') || this.input.pressed.has('b')) {
      if (!last) {
        this.dlgPage++
        this.dlgChar = 0
        this.sfx.select()
      } else {
        this.mode = 'overworld'
        const cb = this.dlgOnClose
        this.dlgOnClose = null
        cb?.()
      }
    }
  }

  private beginWild(species: SpeciesId, level: number) {
    this.sfx.battle()
    this.startFade(() => {
      const idx = firstAble(this.party)
      if (idx < 0) return
      this.battle = startWild(idx, species, level)
      this.battle.messages = introMessages(this.battle)
      this.mode = 'battle'
    }, '#f8f8f8')
  }

  private beginTrainer(name: string, foes: Monster[], onWin: () => void) {
    this.sfx.battle()
    this.startFade(() => {
      const idx = firstAble(this.party)
      if (idx < 0) return
      this.battle = startTrainer(idx, name, foes)
      this.battle.messages = introMessages(this.battle)
      this.battle.pending = onWin
      this.mode = 'battle'
    }, '#f8f8f8')
  }

  private updateBattle() {
    const b = this.battle
    if (!b) return
    if (b.flash > 0) b.flash--
    if (b.shake > 0) b.shake--
    if (b.playerShake > 0) b.playerShake--

    if (b.phase === 'win' || b.phase === 'lose' || b.phase === 'caught') {
      if (this.input.pressed.has('a') || this.input.pressed.has('b')) this.endBattle()
      return
    }

    const skip = this.input.pressed.has('a') || this.input.pressed.has('b')
    if (b.phase === 'intro' || b.phase === 'anim') {
      if (b.messages.length === 0) {
        if (b.phase === 'intro') b.phase = 'command'
        else afterAnim(b, this.party)
        return
      }
      const done = tickMessages(b, skip)
      if (done) {
        if (b.phase === 'intro') b.phase = 'command'
        else afterAnim(b, this.party)
      }
      return
    }

    if (b.phase === 'command') {
      this.nav2d(b, 'cmd', 2)
      if (this.input.pressed.has('a')) {
        this.sfx.confirm()
        const c = CMDS[b.cmd]
        if (c === 'fight') b.phase = 'moves'
        else if (c === 'bag') b.phase = 'bag'
        else if (c === 'party') {
          this.partyFrom = 'battle'
          this.partyCursor = b.playerIndex
          this.mode = 'party'
        } else chooseRun(b)
      }
      return
    }

    if (b.phase === 'moves') {
      const player = this.party[b.playerIndex]!
      if (this.input.pressed.has('b')) {
        this.sfx.cancel()
        b.phase = 'command'
        return
      }
      this.nav2d(b, 'moveSel', 2, player.moves.length)
      if (this.input.pressed.has('a')) {
        this.sfx.hit()
        chooseFight(b, this.party, b.moveSel)
      }
      return
    }

    if (b.phase === 'bag') {
      if (this.input.pressed.has('b')) {
        b.phase = 'command'
        return
      }
      if (this.input.pressed.has('up') || this.input.pressed.has('down')) {
        b.bagSel = b.bagSel === 0 ? 1 : 0
        this.sfx.select()
      }
      if (this.input.pressed.has('a')) {
        if (b.bagSel === 0) {
          if (this.bag.sphere <= 0) {
            this.openBattleMsg(b, 'Pas de Sphère...')
            return
          }
          const r = chooseCatch(b, this.party)
          if (r === 'start') this.bag.sphere--
        } else {
          if (this.bag.potion <= 0) {
            this.openBattleMsg(b, 'Pas de Potion...')
            return
          }
          if (applyPotion(b, this.party)) this.bag.potion--
        }
      }
    }

    if (b.phase === 'party') {
      this.partyFrom = 'battle'
      this.mode = 'party'
    }
  }

  private openBattleMsg(b: Battle, text: string) {
    b.messages.push({ text })
    b.msgChar = 0
    b.phase = 'anim'
  }

  private nav2d(b: Battle, field: 'cmd' | 'moveSel', cols: number, len = 4) {
    let v = b[field]
    if (this.input.pressed.has('left') && v % cols > 0) {
      v--
      this.sfx.select()
    }
    if (this.input.pressed.has('right') && v % cols < cols - 1 && v + 1 < len) {
      v++
      this.sfx.select()
    }
    if (this.input.pressed.has('up') && v - cols >= 0) {
      v -= cols
      this.sfx.select()
    }
    if (this.input.pressed.has('down') && v + cols < len) {
      v += cols
      this.sfx.select()
    }
    b[field] = v
  }

  private endBattle() {
    const b = this.battle
    this.battle = null
    const result = b?.result
    const pending = b?.pending
    if (result === 'lose') {
      this.startFade(() => {
        this.healAll()
        this.enterMap('center', 5, 6, 'down', false)
        this.mode = 'overworld'
        this.openDialogue('Tes créatures sont K.O.... Tu te réveilles au Centre de Soins.')
      })
      return
    }
    this.startFade(() => {
      this.mode = 'overworld'
      if (result === 'caught' && b) this.party.push(b.foe)
      if (result === 'win' && pending) pending()
    })
  }

  private updatePause() {
    if (this.input.pressed.has('b') || this.input.pressed.has('start')) {
      this.sfx.cancel()
      this.mode = 'overworld'
      return
    }
    if (this.input.pressed.has('up')) {
      this.pauseCursor = (this.pauseCursor + PAUSE_ITEMS.length - 1) % PAUSE_ITEMS.length
      this.sfx.select()
    }
    if (this.input.pressed.has('down')) {
      this.pauseCursor = (this.pauseCursor + 1) % PAUSE_ITEMS.length
      this.sfx.select()
    }
    if (this.input.pressed.has('a')) {
      this.sfx.confirm()
      const it = PAUSE_ITEMS[this.pauseCursor]
      if (it === 'Fermer') this.mode = 'overworld'
      else if (it === 'Équipe') {
        this.partyFrom = 'pause'
        this.partyCursor = 0
        this.mode = 'party'
      } else if (it === 'Sac') {
        this.bagCursor = 0
        this.mode = 'bag'
      } else if (it === 'Badges') this.mode = 'badges'
      else if (it === 'Sauvegarder') this.saveGame()
    }
  }

  private updateParty() {
    if (this.input.pressed.has('b')) {
      this.sfx.cancel()
      if (this.partyFrom === 'battle') {
        this.mode = 'battle'
        if (this.battle && this.battle.phase === 'party' && this.party[this.battle.playerIndex]!.hp <= 0) {
          return
        }
        if (this.battle) this.battle.phase = 'command'
      } else this.mode = 'pause'
      return
    }
    if (this.party.length === 0) return
    if (this.input.pressed.has('up')) {
      this.partyCursor = (this.partyCursor + this.party.length - 1) % this.party.length
      this.sfx.select()
    }
    if (this.input.pressed.has('down')) {
      this.partyCursor = (this.partyCursor + 1) % this.party.length
      this.sfx.select()
    }
    if (this.input.pressed.has('a')) {
      const m = this.party[this.partyCursor]!
      if (this.partyFrom === 'potion') {
        if (m.hp >= maxHpOf(m)) {
          this.sfx.bump()
          return
        }
        this.bag.potion--
        m.hp = Math.min(maxHpOf(m), m.hp + 20)
        this.sfx.heal()
        this.mode = 'bag'
        this.toast = `${m.nickname} récupère des PV !`
        this.toastT = 80
        return
      }
      if (this.partyFrom === 'battle' && this.battle) {
        if (m.hp <= 0) {
          this.sfx.bump()
          return
        }
        if (this.partyCursor === this.battle.playerIndex && this.party[this.battle.playerIndex]!.hp > 0) {
          this.sfx.bump()
          return
        }
        const forced = this.party[this.battle.playerIndex]!.hp <= 0
        switchTo(this.battle, this.party, this.partyCursor, !forced)
        this.mode = 'battle'
        this.sfx.confirm()
      }
    }
  }

  private updateBag() {
    if (this.input.pressed.has('b')) {
      this.sfx.cancel()
      this.mode = 'pause'
      return
    }
    if (this.input.pressed.has('up') || this.input.pressed.has('down')) {
      this.bagCursor = this.bagCursor === 0 ? 1 : 0
      this.sfx.select()
    }
    if (this.input.pressed.has('a') && this.bagCursor === 1) {
      if (this.bag.potion <= 0 || this.party.length === 0) {
        this.sfx.bump()
        return
      }
      this.partyFrom = 'potion'
      this.partyCursor = 0
      this.mode = 'party'
    }
  }

  private render() {
    const ctx = this.ctx
    ctx.imageSmoothingEnabled = false
    if (this.mode === 'title') this.renderTitle()
    else if (this.mode === 'battle' && this.battle) this.renderBattle()
    else this.renderWorld()

    if (this.mode === 'dialogue') this.renderDialogue()
    if (this.mode === 'pause') this.renderPause()
    if (this.mode === 'party') this.renderParty()
    if (this.mode === 'bag') this.renderBag()
    if (this.mode === 'badges') this.renderBadges()

    if (this.toastT > 0) {
      drawPanel(ctx, 50, 4, 140, 20, 'green')
      drawText(ctx, this.toast, 58, 9, '#f8fff0', 1)
    }
    if (this.fade > 0) {
      ctx.fillStyle = this.fadeColor
      ctx.globalAlpha = Math.min(1, this.fade)
      ctx.fillRect(0, 0, VIEW_W, VIEW_H)
      ctx.globalAlpha = 1
    }
  }

  private renderTitle() {
    const ctx = this.ctx
    ctx.fillStyle = '#1878b8'
    ctx.fillRect(0, 0, VIEW_W, VIEW_H)
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = i % 2 ? '#2090c8' : '#1880b8'
      ctx.fillRect(0, 70 + i * 8, VIEW_W, 8)
    }
    ctx.fillStyle = '#38a040'
    ctx.fillRect(0, 118, VIEW_W, 42)
    ctx.fillStyle = '#186828'
    for (let i = 0; i < 12; i++) ctx.fillRect(i * 22, 100, 18, 30)
    drawCreature(ctx, 'pyronille', 20, 88, 40, 'front')
    drawCreature(ctx, 'aquilou', 100, 90, 38, 'front')
    drawCreature(ctx, 'sylfeuille', 175, 88, 40, 'front')
    drawText(ctx, 'VERDALIA', 52, 16, '#f8f070', 2)
    drawText(ctx, "Hommage aux RPG GBA", 52, 40, '#f0f8ff', 1)
    drawPanel(ctx, 62, 54, 116, 36, 'blue')
    const has = hasSave()
    drawText(ctx, `${this.titleCursor === 0 ? '▶ ' : '  '}Nouvelle partie`, 72, 62, this.titleCursor === 0 ? '#f8f070' : '#f8f8f0', 1)
    drawText(
      ctx,
      `${this.titleCursor === 1 ? '▶ ' : '  '}Continuer`,
      72,
      74,
      !has ? '#8090a0' : this.titleCursor === 1 ? '#f8f070' : '#f8f8f0',
      1,
    )
  }

  private renderWorld() {
    const ctx = this.ctx
    const m = getMap(this.mapId)
    ctx.fillStyle = m.indoor ? '#181818' : '#186828'
    ctx.fillRect(0, 0, VIEW_W, VIEW_H)
    let camX = this.px + 8 - VIEW_W / 2
    let camY = this.py + 8 - VIEW_H / 2
    const maxX = Math.max(0, m.w * TILE - VIEW_W)
    const maxY = Math.max(0, m.h * TILE - VIEW_H)
    camX = Math.max(0, Math.min(maxX, camX))
    camY = Math.max(0, Math.min(maxY, camY))
    if (m.w * TILE < VIEW_W) camX = -Math.floor((VIEW_W - m.w * TILE) / 2)
    if (m.h * TILE < VIEW_H) camY = -Math.floor((VIEW_H - m.h * TILE) / 2)

    const x0 = Math.floor(camX / TILE) - 1
    const y0 = Math.floor(camY / TILE) - 1
    const x1 = x0 + Math.ceil(VIEW_W / TILE) + 2
    const y1 = y0 + Math.ceil(VIEW_H / TILE) + 2
    for (let ty = y0; ty <= y1; ty++) {
      for (let tx = x0; tx <= x1; tx++) {
        const tile = tileAt(m, tx, ty)
        const sx = tx * TILE - camX
        const sy = ty * TILE - camY
        const variant = tile === 'orb' ? tx - 5 : tx * 3 + ty
        drawTile(ctx, tile, sx, sy, this.tick, neighbors(m, tx, ty), variant)
      }
    }

    type Spr = { y: number; draw: () => void }
    const spr: Spr[] = []
    spr.push({
      y: this.py,
      draw: () => drawPlayer(ctx, this.px - camX, this.py - camY, this.facing, this.walkFrame, this.running),
    })
    for (const n of this.liveNpcs) {
      spr.push({
        y: n.y * TILE,
        draw: () => drawNpc(ctx, n.sprite, n.x * TILE - camX, n.y * TILE - camY, n.facing, 0),
      })
    }
    spr.sort((a, b) => a.y - b.y)
    for (const s of spr) s.draw()

    if (this.mode === 'overworld') {
      drawText(ctx, m.name, 4, 4, '#f8f8f0', 1)
    }
  }

  private renderDialogue() {
    const page = this.dlgPages[this.dlgPage] ?? ''
    const last = this.dlgPage >= this.dlgPages.length - 1
    drawDialogueBox(this.ctx, page, this.dlgChar, {
      choices: last && this.dlgChar >= page.length ? this.dlgChoices?.map((c) => c.label) : undefined,
      choice: this.dlgChoice,
      continue: !this.dlgChoices,
    })
  }

  private renderBattle() {
    const ctx = this.ctx
    const b = this.battle!
    const player = this.party[b.playerIndex]!
    ctx.fillStyle = '#58b868'
    ctx.fillRect(0, 0, VIEW_W, 96)
    ctx.fillStyle = '#70c878'
    ctx.fillRect(0, 70, VIEW_W, 26)
    ctx.fillStyle = '#c8b070'
    ctx.fillRect(0, 88, VIEW_W, 16)
    ctx.fillStyle = '#e8d8a8'
    ctx.beginPath()
    ctx.ellipse(58, 100, 40, 10, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(175, 48, 36, 9, 0, 0, Math.PI * 2)
    ctx.fill()

    const foeX = 148 + (b.shake % 2 === 0 ? 0 : 2)
    const foeFlash = b.flash > 0 && this.tick % 2 === 0
    drawCreature(ctx, b.foe.species, foeX, 8, 56, 'front', foeFlash)
    const px = 16 + (b.playerShake % 2 === 0 ? 0 : -2)
    drawCreature(ctx, player.species, px, 52, 64, 'back')

    const foeMax = maxHpOf(b.foe)
    const pMax = maxHpOf(player)
    drawNamePlate(ctx, 8, 8, b.foe.nickname, b.foe.level, b.foe.hp, foeMax, null)
    const xpR = Math.max(0, Math.min(1, (player.xp - xpToNext(player.level)) / Math.max(1, xpToNext(player.level + 1) - xpToNext(player.level))))
    drawNamePlate(ctx, 116, 62, player.nickname, player.level, player.hp, pMax, xpR, true)

    if (b.messages.length) {
      drawDialogueBox(ctx, b.messages[0]!.text, b.msgChar, { continue: b.msgChar >= b.messages[0]!.text.length })
      return
    }

    if (b.phase === 'command') {
      drawPanel(ctx, 8, 104, 120, 48, 'blue')
      drawText(ctx, 'Que doit faire', 16, 112, '#f8f8f0', 1)
      drawText(ctx, `${player.nickname} ?`, 16, 124, '#f8f8f0', 1)
      drawPanel(ctx, 128, 100, 104, 56, 'blue')
      CMDS.forEach((c, i) => {
        const col = i % 2
        const row = Math.floor(i / 2)
        const sel = b.cmd === i
        drawText(ctx, `${sel ? '▶' : ' '} ${CMD_LABEL[c]}`, 132 + col * 50, 110 + row * 18, sel ? '#f8f070' : '#f8f8f0', 1)
      })
    } else if (b.phase === 'moves') {
      drawPanel(ctx, 8, 100, 224, 56, 'blue')
      player.moves.forEach((mv, i) => {
        const col = i % 2
        const row = Math.floor(i / 2)
        const sel = b.moveSel === i
        const def = MOVES[mv.id]
        drawText(ctx, `${sel ? '▶' : ' '} ${def.name}`, 16 + col * 110, 108 + row * 14, sel ? '#f8f070' : '#f8f8f0', 1)
      })
      const cur = player.moves[b.moveSel]
      if (cur) {
        const def = MOVES[cur.id]
        drawText(ctx, `PP ${cur.pp}/${def.pp}  ${TYPE_LABEL[def.type]}`, 16, 140, '#d0e8f8', 1)
      }
    } else if (b.phase === 'bag') {
      drawPanel(ctx, 40, 40, 160, 70, 'blue')
      drawText(ctx, `${b.bagSel === 0 ? '▶' : ' '} Sphère ×${this.bag.sphere}`, 56, 54, b.bagSel === 0 ? '#f8f070' : '#f8f8f0', 1)
      drawText(ctx, `${b.bagSel === 1 ? '▶' : ' '} Potion ×${this.bag.potion}`, 56, 70, b.bagSel === 1 ? '#f8f070' : '#f8f8f0', 1)
      drawText(ctx, 'B: retour', 56, 90, '#a0c0d8', 1)
    }
  }

  private renderPause() {
    const ctx = this.ctx
    drawPanel(ctx, 130, 8, 102, 92, 'blue')
    PAUSE_ITEMS.forEach((it, i) => {
      drawText(ctx, `${this.pauseCursor === i ? '▶ ' : '  '}${it}`, 138, 16 + i * 14, this.pauseCursor === i ? '#f8f070' : '#f8f8f0', 1)
    })
    const sec = Math.floor(this.playFrames / 60)
    const mm = Math.floor(sec / 60)
    const ss = (sec % 60).toString().padStart(2, '0')
    drawPanel(ctx, 8, 8, 100, 28, 'wood')
    drawText(ctx, this.name, 16, 14, '#203018', 1, false)
    drawText(ctx, `${mm}:${ss}`, 16, 24, '#203018', 1, false)
  }

  private renderParty() {
    const ctx = this.ctx
    ctx.fillStyle = '#186040'
    ctx.fillRect(0, 0, VIEW_W, VIEW_H)
    drawText(ctx, this.partyFrom === 'potion' ? 'Utiliser Potion' : 'Équipe', 8, 6, '#f8f070', 1)
    if (!this.party.length) {
      drawText(ctx, 'Aucune créature.', 8, 24, '#f8f8f0', 1)
      return
    }
    this.party.forEach((m, i) => {
      const y = 20 + i * 22
      const sel = i === this.partyCursor
      drawPanel(ctx, 6, y, 228, 20, sel ? 'green' : 'blue')
      drawText(ctx, `${sel ? '▶ ' : '  '}${m.nickname}  N.${m.level}`, 12, y + 3, '#f8f8f0', 1)
      const max = maxHpOf(m)
      drawHpBar(ctx, 130, y + 8, 90, m.hp, max)
      drawText(ctx, `${m.hp}/${max}`, 130, y + 2, '#f8f8f0', 1)
    })
  }

  private renderBag() {
    const ctx = this.ctx
    drawPanel(ctx, 20, 24, 200, 100, 'blue')
    drawText(ctx, 'Sac', 32, 34, '#f8f070', 1)
    drawText(ctx, `${this.bagCursor === 0 ? '▶' : ' '} Sphère ×${this.bag.sphere}`, 32, 52, this.bagCursor === 0 ? '#f8f070' : '#f8f8f0', 1)
    drawText(ctx, `${this.bagCursor === 1 ? '▶' : ' '} Potion ×${this.bag.potion}`, 32, 68, this.bagCursor === 1 ? '#f8f070' : '#f8f8f0', 1)
    drawText(ctx, this.bagCursor === 0 ? 'Sert à capturer (combat).' : 'A: soigner une créature.', 32, 92, '#c0d8e8', 1)
  }

  private renderBadges() {
    const ctx = this.ctx
    drawPanel(ctx, 20, 20, 200, 120, 'wood')
    drawText(ctx, 'Badges', 32, 30, '#203018', 1, false)
    const names = ['Roc', '—', '—', '—', '—', '—', '—', '—']
    names.forEach((n, i) => {
      const x = 36 + (i % 4) * 44
      const y = 52 + Math.floor(i / 4) * 40
      p(ctx, x, y, this.badges[i] ? '#d0a050' : '#786850', 28, 28)
      if (this.badges[i]) {
        p(ctx, x + 6, y + 6, '#f0e0a0', 16, 16)
        p(ctx, x + 10, y + 10, '#a07030', 8, 8)
      }
      drawText(ctx, n, x + 4, y + 30, '#203018', 1, false)
    })
  }
}
