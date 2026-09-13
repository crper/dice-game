import type { GameMode } from '@/types/game'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { BookIcon, DiceIcon, EyeIcon, SwordsIcon, VolumeOffIcon, VolumeOnIcon } from '@/components/ui/icons'
import { persistLanguage } from '@/i18n'

export interface HeaderProps {
  mode: GameMode
  onModeChange: (mode: GameMode) => void
  soundEnabled: boolean
  onSoundToggle: () => void
  onOpenRules: () => void
  busy: boolean
}

/** Sticky app bar: identity, mode switch, language and the two global toggles. */
export function Header({ mode, onModeChange, soundEnabled, onSoundToggle, onOpenRules, busy }: HeaderProps) {
  const { t, i18n } = useTranslation()

  const switchLanguage = (language: string) => {
    void i18n.changeLanguage(language)
    persistLanguage(language)
  }

  return (
    <header className="sticky top-0 z-30 border-b border-white/8 bg-room-950/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 text-room-950 shadow-[0_10px_30px_-14px_rgb(251_191_36/0.9)]">
            <DiceIcon className="h-6 w-6" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold text-white sm:text-lg">{t('app.title')}</h1>
            <p className="truncate text-xs text-slate-400">{t(`app.subtitle.${mode}`)}</p>
          </div>
        </div>

        <ToggleGroup
          type="single"
          variant="outline"
          spacing={0}
          value={mode}
          onValueChange={(value) => value && onModeChange(value as GameMode)}
          aria-label={t('setup.title')}
          className="order-last w-full sm:order-none sm:w-auto"
        >
          <ToggleGroupItem value="liar" className="h-9 flex-1 flex-col gap-0 px-4 sm:flex-row sm:gap-1.5">
            <span className="flex items-center gap-1.5 text-[13px] font-medium">
              <SwordsIcon className="h-4 w-4" />
              {t('mode.liar')}
            </span>
            <span className="text-[10px] text-slate-500">{t('mode.liarHint')}</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="open" className="h-9 flex-1 flex-col gap-0 px-4 sm:flex-row sm:gap-1.5">
            <span className="flex items-center gap-1.5 text-[13px] font-medium">
              <EyeIcon className="h-4 w-4" />
              {t('mode.open')}
            </span>
            <span className="text-[10px] text-slate-500">{t('mode.openHint')}</span>
          </ToggleGroupItem>
        </ToggleGroup>

        <div className="flex shrink-0 items-center gap-2">
          <ToggleGroup
            type="single"
            variant="outline"
            spacing={0}
            value={i18n.language}
            onValueChange={(value) => value && switchLanguage(value)}
            aria-label={t('header.language')}
          >
            <ToggleGroupItem value="zh" className="px-2.5 text-xs">
              中文
            </ToggleGroupItem>
            <ToggleGroupItem value="en" className="px-2.5 text-xs">
              EN
            </ToggleGroupItem>
          </ToggleGroup>

          <Button
            variant="ghost"
            size="icon"
            aria-label={soundEnabled ? t('header.soundOn') : t('header.soundOff')}
            aria-pressed={soundEnabled}
            onClick={onSoundToggle}
          >
            {soundEnabled ? <VolumeOnIcon /> : <VolumeOffIcon />}
          </Button>
          <Button variant="outline" onClick={onOpenRules} disabled={busy} className="hidden sm:inline-flex">
            <BookIcon data-icon="inline-start" />
            {t('header.rules')}
          </Button>
          <Button variant="ghost" size="icon" aria-label={t('header.rulesAria')} onClick={onOpenRules} className="sm:hidden">
            <BookIcon />
          </Button>
        </div>
      </div>
    </header>
  )
}
