import { Fragment, type FC } from 'react'
import Icon from '../icons/Icon'

interface CrumbItem {
  label: string
  to?: string
}

interface BreadcrumbProps {
  items: CrumbItem[]
}

const Breadcrumb: FC<BreadcrumbProps> = ({ items }) => (
  <nav
    aria-label="مسیر صفحه"
    className="max-w-[var(--maxw)] mx-auto flex items-center gap-1.5 text-[12.5px] text-muted px-[var(--pad)] pt-3 md:pt-4 min-w-0"
  >
    {items.map((item, i) => (
      <Fragment key={i}>
        {i > 0 && <Icon name="chevron-left" size={11} className="opacity-50 shrink-0" />}
        {item.to ? (
          <a
            href={item.to}
            className="inline-flex items-center min-h-[40px] shrink-0 hover:text-plum transition-colors"
          >
            {item.label}
          </a>
        ) : (
          <span className="text-ink truncate min-w-0" aria-current="page">
            {item.label}
          </span>
        )}
      </Fragment>
    ))}
  </nav>
)

export default Breadcrumb
