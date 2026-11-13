import { memo, type FC, type ReactNode } from 'react'
import Icon from '../icons/Icon'

interface ViewAllLinkProps {
  href: string
  children: ReactNode
}

/**
 * Section "view all" action: an outlined pill, the same height and outline as the carousel
 * arrows it sits beside, so the header's actions read as one set of controls.
 */
const ViewAllLink: FC<ViewAllLinkProps> = ({ href, children }) => (
  <a
    href={href}
    className="group inline-flex items-center gap-1.5 h-11 ps-4 pe-3 rounded-full border border-rule bg-surface text-[13.5px] font-medium text-ink whitespace-nowrap transition-colors duration-200 hover:border-ink hover:bg-ink hover:text-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum"
  >
    {children}
    <Icon
      name="arrow-left"
      size={14}
      className="transition-transform duration-200 group-hover:-translate-x-0.5"
    />
  </a>
)

export default memo(ViewAllLink)
