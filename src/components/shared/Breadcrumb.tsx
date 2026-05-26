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
  <nav className="crumb">
    {items.map((item, i) => (
      <Fragment key={i}>
        {i > 0 && <span>/</span>}
        {item.to
          ? <Link to={item.to}>{item.label}</Link>
          : <span className="crumb__current">{item.label}</span>
        }
      </Fragment>
    ))}
  </nav>
)

export default Breadcrumb
