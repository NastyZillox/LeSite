import { MOVES, SPECIES, catchChance, damageRoll, maxHpOf, statsOf, xpToNext, makeMonster, healMonster } from './data'
import type { MoveId, Monster, SpeciesId } from './types'

export type BattleKind = 'wild' | 'trainer'

export type CmdId = 'fight' | 'bag' | 'party' | 'run'

export type BattlePhase =
  | 'intro'
  | 'command'
  | 'moves'
  | 'bag'
  | 'party'
  | 'anim'
  | 'win'
  | 'lose'
  | 'caught'

export type Msg = { text: string }

export type Battle = {
  kind: BattleKind
  trainerName?: string
  trainerParty?: Monster[]
  trainerIndex: number
  playerIndex: number
  foe: Monster
  phase: BattlePhase
  cmd: number
  moveSel: number
  bagSel: number
  partySel: number
  messages: Msg[]
  msgChar: number
  flash: number
  shake: number
  playerShake: number
  ballX: number
  ballShakes: number
  catching: boolean
  atkP: number
  defP: number
  atkF: number
  defF: number
  pending: (() => void) | null
  result: 'ongoing' | 'win' | 'lose' | 'caught' | 'ran'
  xpGain: number
  koMsg: boolean
  faintMsg: boolean
}

const CMDS: CmdId[] = ['fight', 'bag', 'party', 'run']
export const CMD_LABEL: Record<CmdId, string> = {
  fight: 'ATTAQUER',
  bag: 'SAC',
  party: 'ÉQUIPE',
  run: 'FUITE',
}

export function startWild(partyIndex: number, species: SpeciesId, level: number): Battle {
  return baseBattle('wild', partyIndex, makeMonster(species, level))
}

export function startTrainer(partyIndex: number, name: string, foes: Monster[]): Battle {
  const b = baseBattle('trainer', partyIndex, foes[0]!)
  b.trainerName = name
  b.trainerParty = foes
  b.trainerIndex = 0
  return b
}

function baseBattle(kind: BattleKind, playerIndex: number, foe: Monster): Battle {
  return {
    kind,
    playerIndex,
    foe,
    trainerIndex: 0,
    phase: 'intro',
    cmd: 0,
    moveSel: 0,
    bagSel: 0,
    partySel: 0,
    messages: [],
    msgChar: 0,
    flash: 0,
    shake: 0,
    playerShake: 0,
    ballX: 0,
    ballShakes: 0,
    catching: false,
    atkP: 0,
    defP: 0,
    atkF: 0,
    defF: 0,
    pending: null,
    result: 'ongoing',
    xpGain: 0,
    koMsg: false,
    faintMsg: false,
  }
}

export function introMessages(b: Battle): Msg[] {
  if (b.kind === 'trainer') return [{ text: `${b.trainerName} veut se battre !` }, { text: `${b.trainerName} envoie ${b.foe.nickname} !` }]
  return [{ text: `Un ${b.foe.nickname} sauvage apparaît !` }]
}

export function tickMessages(b: Battle, skip: boolean): boolean {
  const cur = b.messages[0]
  if (!cur) return true
  const len = cur.text.length
  if (b.msgChar < len) {
    b.msgChar = skip ? len : Math.min(len, b.msgChar + 2)
    return false
  }
  if (skip) {
    b.messages.shift()
    b.msgChar = 0
    return b.messages.length === 0
  }
  return false
}

export function pushMsg(b: Battle, text: string) {
  b.messages.push({ text })
}

export function firstAble(party: Monster[]): number {
  return party.findIndex((m) => m.hp > 0)
}

export function allFainted(party: Monster[]): boolean {
  return party.every((m) => m.hp <= 0)
}

type Side = 'player' | 'foe'

function applyMove(
  b: Battle,
  party: Monster[],
  actor: Side,
  moveId: MoveId,
) {
  const player = party[b.playerIndex]!
  const atk = actor === 'player' ? player : b.foe
  const def = actor === 'player' ? b.foe : player
  const mv = MOVES[moveId]
  const slot = atk.moves.find((m) => m.id === moveId)
  if (slot) slot.pp = Math.max(0, slot.pp - 1)
  pushMsg(b, `${atk.nickname} utilise ${mv.name} !`)
  const atkStage = actor === 'player' ? b.atkP : b.atkF
  const defStage = actor === 'player' ? b.defF : b.defP
  const res = damageRoll(atk, def, moveId, atkStage, defStage)
  if (res.miss) {
    pushMsg(b, `Mais ça échoue !`)
    return
  }
  if (res.effect === 'atk-') {
    if (actor === 'player') b.atkF = Math.max(-6, b.atkF - 1)
    else b.atkP = Math.max(-6, b.atkP - 1)
    pushMsg(b, `L'attaque de ${def.nickname} diminue !`)
    return
  }
  if (res.effect === 'spe-') {
    pushMsg(b, `${def.nickname} est ralenti !`)
    return
  }
  def.hp = Math.max(0, def.hp - res.dmg)
  if (actor === 'player') b.flash = 10
  else b.playerShake = 10
  b.shake = 8
  if (res.eff === 0) pushMsg(b, `Ça n'a aucun effet...`)
  else if (res.eff > 1) pushMsg(b, `C'est super efficace !`)
  else if (res.eff < 1) pushMsg(b, `Ce n'est pas très efficace...`)
}

function foeMove(foe: Monster): MoveId {
  const usable = foe.moves.filter((m) => m.pp > 0)
  const pool = usable.length ? usable : foe.moves
  return pool[Math.floor(Math.random() * pool.length)]!.id
}

export function chooseFight(b: Battle, party: Monster[], moveIndex: number) {
  const player = party[b.playerIndex]!
  const move = player.moves[moveIndex]
  if (!move || move.pp <= 0) {
    pushMsg(b, 'Plus de PP !')
    b.phase = 'anim'
    return
  }
  const fMove = foeMove(b.foe)
  const pSpe = statsOf(player).spe
  const fSpe = statsOf(b.foe).spe
  const pFirst = MOVES[move.id].priority !== MOVES[fMove].priority
    ? MOVES[move.id].priority > MOVES[fMove].priority
    : pSpe >= fSpe
  b.phase = 'anim'
  if (pFirst) {
    applyMove(b, party, 'player', move.id)
    if (b.foe.hp > 0) applyMove(b, party, 'foe', fMove)
  } else {
    applyMove(b, party, 'foe', fMove)
    if (player.hp > 0) applyMove(b, party, 'player', move.id)
  }
}

export function chooseRun(b: Battle): boolean {
  if (b.kind === 'trainer') {
    pushMsg(b, 'On ne peut pas fuir un dresseur !')
    b.phase = 'anim'
    return false
  }
  if (Math.random() < 0.8) {
    pushMsg(b, 'Tu prends la fuite !')
    b.result = 'ran'
    b.phase = 'anim'
    return true
  }
  pushMsg(b, 'Tu ne peux pas fuir !')
  b.phase = 'anim'
  return false
}

export function chooseCatch(b: Battle, party: Monster[]): 'fail' | 'full' | 'start' {
  if (b.kind === 'trainer') {
    pushMsg(b, 'Tu ne peux pas capturer la créature d un dresseur !')
    b.phase = 'anim'
    return 'fail'
  }
  if (party.length >= 6) {
    pushMsg(b, "L'équipe est pleine !")
    b.phase = 'anim'
    return 'full'
  }
  b.catching = true
  b.ballX = 0
  b.ballShakes = 0
  b.phase = 'anim'
  pushMsg(b, `Tu lances une Sphère !`)
  return 'start'
}

export function resolveCatch(b: Battle): boolean {
  const ok = Math.random() < catchChance(b.foe)
  if (ok) {
    b.result = 'caught'
    pushMsg(b, `Gotcha ! ${b.foe.nickname} est attrapé !`)
    return true
  }
  pushMsg(b, `Oh non ! ${b.foe.nickname} s'est libéré !`)
  return false
}

export function afterAnim(b: Battle, party: Monster[]): void {
  const player = party[b.playerIndex]!
  if (b.catching) {
    b.catching = false
    const ok = resolveCatch(b)
    if (!ok && b.foe.hp > 0 && player.hp > 0) applyMove(b, party, 'foe', foeMove(b.foe))
    return
  }
  if (b.result === 'ran') {
    b.phase = 'win'
    return
  }
  if (b.result === 'caught') {
    b.phase = 'caught'
    return
  }
  if (b.foe.hp <= 0) {
    if (!b.koMsg) {
      b.koMsg = true
      pushMsg(b, `${b.foe.nickname} est K.O. !`)
      const xp = Math.floor((SPECIES[b.foe.species].xp * b.foe.level) / 5)
      b.xpGain = xp
      player.xp += xp
      pushMsg(b, `${player.nickname} gagne ${xp} EXP. !`)
      while (player.level < 20 && player.xp >= xpToNext(player.level + 1)) {
        player.level += 1
        const newMax = maxHpOf(player)
        player.hp = Math.min(newMax, player.hp + 3)
        pushMsg(b, `${player.nickname} monte au N.${player.level} !`)
        const learned = SPECIES[player.species].moves.find((mv) => mv.level === player.level)
        if (learned && !player.moves.some((m) => m.id === learned.move) && player.moves.length < 4) {
          player.moves.push({ id: learned.move, pp: MOVES[learned.move].pp })
          pushMsg(b, `${player.nickname} apprend ${MOVES[learned.move].name} !`)
        }
      }
      return
    }
    b.koMsg = false
    if (b.kind === 'trainer' && b.trainerParty) {
      const next = b.trainerParty.findIndex((m, i) => i > b.trainerIndex && m.hp > 0)
      if (next >= 0) {
        b.trainerIndex = next
        b.foe = b.trainerParty[next]!
        b.atkF = 0
        b.defF = 0
        pushMsg(b, `${b.trainerName} envoie ${b.foe.nickname} !`)
        return
      }
    }
    b.result = 'win'
    b.phase = 'win'
    return
  }
  if (player.hp <= 0) {
    if (!b.faintMsg) {
      b.faintMsg = true
      pushMsg(b, `${player.nickname} est K.O. !`)
      return
    }
    b.faintMsg = false
    if (allFainted(party)) {
      b.result = 'lose'
      b.phase = 'lose'
      return
    }
    pushMsg(b, 'Choisis une créature.')
    b.phase = 'party'
    return
  }
  b.phase = 'command'
}

export function switchTo(b: Battle, party: Monster[], index: number, foeAttacks: boolean) {
  if (party[index]!.hp <= 0) return false
  b.playerIndex = index
  b.atkP = 0
  b.defP = 0
  pushMsg(b, `En avant, ${party[index]!.nickname} !`)
  if (foeAttacks && b.foe.hp > 0) {
    applyMove(b, party, 'foe', foeMove(b.foe))
  }
  b.phase = 'anim'
  return true
}

export function applyPotion(b: Battle, party: Monster[]): boolean {
  const m = party[b.playerIndex]!
  const max = maxHpOf(m)
  if (m.hp >= max) {
    pushMsg(b, `Les PV de ${m.nickname} sont déjà au max !`)
    b.phase = 'anim'
    return false
  }
  m.hp = Math.min(max, m.hp + 20)
  pushMsg(b, `${m.nickname} récupère des PV !`)
  applyMove(b, party, 'foe', foeMove(b.foe))
  b.phase = 'anim'
  return true
}

export { CMDS, healMonster, maxHpOf }
