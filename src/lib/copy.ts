import type { Difficulty, GameMode, Phase } from '../types/game'

/**
 * Every user-facing string in one module.
 *
 * Keeping copy out of the components means a wording change never risks a
 * layout regression, and the English README has a single source to mirror.
 */
export const MODE_DESCRIPTIONS: Record<GameMode, string> = {
  liar: '大话骰 · 只有你看得见自己的骰子',
  open: '明牌 · 全部骰子一次公开',
}

export const PHASE_LABELS: Record<Phase, string> = {
  idle: '准备开局',
  rolling: '骰子滚动中',
  'awaiting-call': '轮到你叫骰',
  'ai-thinking': '对手思考中',
  revealing: '开盅中',
  'round-over': '本局结束',
}

export const SEAT_LABELS = {
  player: '你',
  ai: '对手',
} as const

/** Labels painted onto the felt trays in the 3D scene. */
export const TRAY_LABELS = {
  player: '你的骰子',
  ai: '对手的骰子',
  shared: '本局骰子',
}

export const DIFFICULTY_COPY: Record<Difficulty, { label: string; hint: string }> = {
  easy: { label: '轻松', hint: '对手叫骰保守，开盅犹豫' },
  normal: { label: '标准', hint: '按概率权衡叫与开' },
  hard: { label: '高手', hint: '对手果断开盅，加注精准' },
}

export const ROLL_FAILED_MESSAGE = '未能启动 3D 渲染，已切换为平面骰面显示。'

export const VIEW_HINT = '左右拖动可转动牌桌'

export const CAMERA_PRESETS = [
  { preset: 'low', label: '低角' },
  { preset: 'default', label: '常规' },
  { preset: 'top', label: '俯视' },
] as const

export const STAGE_COPY = {
  /** Open mode: the primary action lives on the table itself. */
  rollNow: '掷骰',
  rollHint: '点桌面任意位置也能掷',
  rolling: '掷骰中…',
  rollAgain: '再掷一次',
  /** Liar's Dice: jump to the bidding console when it may be off-screen. */
  goToBid: '去叫骰',
  /** Compact result readout shown on the felt in open mode. */
  totalLabel: '点数和',
}

/** 作者署名与公众号引导，README 与页脚共用同一份措辞。 */
export const AUTHOR_COPY = {
  name: '黑白汤',
  platform: '微信公众号',
  search: '微信搜索「黑白汤」',
  tagline: '不定期写点 AI 与前端的折腾记录',
  tech: 'React · TypeScript · Vite · Three.js · Tailwind CSS · 实时刚体投掷模拟',
}
