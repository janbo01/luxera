import { memo, type FC, type ReactNode } from 'react'
import Icon from '../icons/Icon'

interface ViewAllLinkProps {
  href: string
  children: ReactNode
}

const ViewAllLink: FC<ViewAllLinkProps> = ({ href, children }) => (
  <a href={href} className="link-draw group whitespace-nowrap">
    {children}
    <Icon
      name="arrow-left"
      size={15}
      className="transition-transform duration-300 group-hover:-translate-x-1"
    />
  </a>
)

export default memo(ViewAllLink)
