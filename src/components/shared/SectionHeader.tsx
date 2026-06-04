import { memo, type FC, type ReactNode } from 'react'

interface SectionHeaderProps {
  kicker: string
  title: ReactNode
  aside?: ReactNode
  headClass?: string
}

const SectionHeader: FC<SectionHeaderProps> = ({
  kicker,
  title,
  aside,
  headClass,
}) => (
  <div className={headClass ?? 'flex items-end justify-between mb-12 gap-6'}>
    <div>
      <span className="font-mono text-[10px] tracking-[0.2em] text-muted uppercase mb-3.5 block">
        {kicker}
      </span>
      <h2 className="font-heading font-bold text-[clamp(32px,4vw,56px)] leading-[1.05] tracking-[-0.005em] m-0 max-w-[18ch] text-ink [&_em]:text-plum [&_em]:font-normal [&_em]:not-italic">
        {title}
      </h2>
    </div>
    {aside}
  </div>
)

export default memo(SectionHeader)
