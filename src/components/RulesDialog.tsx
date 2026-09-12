import type { GameMode } from '../types/game'
import { Dialog } from './ui/Dialog'
import { PipFace } from './ui/PipFace'

export interface RulesDialogProps {
  open: boolean
  onClose: () => void
  mode: GameMode
}

const SECTIONS = [
  {
    title: '怎么玩：大话骰（翻盖）',
    items: [
      '每人一副骰盅，只有自己能看自己的点数。',
      '轮流叫骰：报出「至少有几个几点」，例如「4 个 3」。',
      '后手必须叫得更大：数量更大，或数量相同、点数更大。',
      '任何时候都可以「开盅」质疑上一手，全场揭盅数骰决定胜负。',
    ],
  },
  {
    title: '开盅怎么判',
    items: [
      '全桌实有点数 ≥ 叫出的数量 → 叫骰成立，开盅方受罚。',
      '全桌实有点数 < 叫出的数量 → 叫骰不成立，叫骰方受罚。',
      '开启「1 为万能」后，每颗 1 点都能当任意点数计入（叫 1 点时除外）。',
    ],
  },
  {
    title: '明牌模式',
    items: [
      '一次性掷出全部骰子，直接公布点数，没有隐藏信息。',
      '结果会给出点数总和、大小判定、顺子／豹子识别与点数分布。',
      '适合熟悉规则、验证概率，或者单纯看骰子滚一滚。',
    ],
  },
  {
    title: '操作',
    items: [
      '牌桌上方有「低角 / 常规 / 俯视」三个视角按钮；也可以左右拖动桌面微调角度，视角不会转到桌子背面。',
      '明牌模式下，点桌面任意位置即可掷骰，也可以按桌面上的「掷骰」按钮。',
      '手机上纵向滑动仍是翻页，不会被牌桌吃掉；只有横向拖动才会转动视角。',
      '回合中调整骰子数量或万能规则会重开本局，叫骰记录会清空。',
      '「减少动态效果」会跳过滚动动画，直接落定。',
    ],
  },
]

/** Rules reference, opened from the app bar at any time. */
export function RulesDialog({ open, onClose, mode }: RulesDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="玩法说明"
      description={mode === 'liar' ? '当前模式：大话骰（翻盖）' : '当前模式：明牌'}
    >
      <div className="space-y-5">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h3 className="text-[13px] font-semibold tracking-wide text-amber-200/90">{section.title}</h3>
            <ul className="mt-2 space-y-1.5">
              {section.items.map((item) => (
                <li key={item} className="flex gap-2.5 text-[13px] leading-6 text-slate-300">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section className="rounded-2xl border border-white/8 bg-black/25 px-4 py-3">
          <h3 className="text-[13px] font-semibold text-slate-200">点数对照</h3>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6].map((value) => (
              <span key={value} className="flex items-center gap-1.5 rounded-lg bg-white/[0.06] px-2 py-1">
                <PipFace value={value} className="h-5 w-5" />
                <span className="tnum text-[11px] text-slate-400">{value}</span>
              </span>
            ))}
          </div>
        </section>
      </div>
    </Dialog>
  )
}
