import type { FC, ReactNode } from 'react'

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
  headClass = 'section__head',
}) => (
  <div className={headClass}>
    <div>
      <span className="section__kicker">{kicker}</span>
      <h2 className="section__title">{title}</h2>
    </div>
    {aside}
  </div>
)

export default SectionHeader
