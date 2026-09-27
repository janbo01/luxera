import { memo, type FC, type ReactNode } from 'react'

interface SectionHeaderProps {
  kicker: string
  title: ReactNode
  aside?: ReactNode
  headClass?: string
}

// Title and aside share one row at every width so the aside (view-all link,
// carousel arrows) never costs mobile users an extra line of scroll.
const SectionHeader: FC<SectionHeaderProps> = ({ kicker, title, aside, headClass }) => (
  <div
    className={
      headClass ??
      'flex items-end justify-between gap-4 mb-7 pb-5 border-b border-rule sm:gap-6 sm:mb-10 sm:pb-7'
    }
  >
    <div className="min-w-0">
      <span className="kicker mb-3 sm:mb-4">{kicker}</span>
      <h2 className="font-heading font-bold text-[clamp(26px,3.6vw,48px)] leading-[1.1] tracking-[-0.005em] m-0 max-w-[18ch] text-ink [&_em]:text-plum [&_em]:font-normal [&_em]:not-italic">
        {title}
      </h2>
    </div>
    {aside ? <div className="flex items-center gap-2 shrink-0 sm:gap-3">{aside}</div> : null}
  </div>
)

export default memo(SectionHeader)
