import { Fragment, type FC } from 'react'
import { Link } from 'react-router-dom'

interface CrumbItem {
  label: string
  to?: string
}

interface BreadcrumbProps {
  items: CrumbItem[]
}

const Breadcrumb: FC<BreadcrumbProps> = ({ items }) => (
  <nav className="flex gap-2 font-mono text-[11px] tracking-[0.14em] text-muted px-[var(--pad)] pt-7 uppercase">
    {items.map((item, i) => (
      <Fragment key={i}>
        {i > 0 && <span className="text-rule">/</span>}
        {item.to
          ? <Link to={item.to} className="hover:text-plum transition-colors">{item.label}</Link>
          : <span className="text-ink">{item.label}</span>
        }
      </Fragment>
    ))}
  </nav>
)

export default Breadcrumb
