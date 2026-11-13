import { memo, type FC, type ReactNode } from 'react'
import Breadcrumb from './Breadcrumb'

interface Crumb {
  label: string
  to?: string
}

interface PageHeaderProps {
  /** Path back up the site. "Home" is added in front automatically. */
  crumbs?: Crumb[]
  title: ReactNode
  /** One line on what the page is for. */
  description?: ReactNode
  /** Small facts under the description: a count, a date, a reading time. */
  meta?: ReactNode
  /** Optional slot beside the title on wide screens (a search field, an action). */
  aside?: ReactNode
  /** h1 by default; pass 'h2' only when the page already has its h1. */
  as?: 'h1' | 'h2'
}

/**
 * The one page header every non-home page uses: breadcrumb, title, an optional
 * intro line and meta. It is deliberately unboxed so content starts high on a
 * phone. Colours come from theme tokens only, so any admin theme applies.
 */
const PageHeader: FC<PageHeaderProps> = ({
  crumbs,
  title,
  description,
  meta,
  aside,
  as: Heading = 'h1',
}) => (
  <header>
    {crumbs && <Breadcrumb items={[{ label: 'خانه', to: '/' }, ...crumbs]} />}
    <div className="max-w-[var(--maxw)] mx-auto px-[var(--pad)] pt-4 md:pt-6 pb-6 md:pb-8 grid md:grid-cols-[minmax(0,1fr)_auto] gap-x-10 gap-y-4 items-end">
      <div className="min-w-0">
        <Heading className="font-heading font-bold text-[clamp(28px,4vw,46px)] leading-[1.15] m-0 text-ink [text-wrap:balance]">
          {title}
        </Heading>
        {description && (
          <p className="max-w-[60ch] text-[15px] leading-[1.9] text-ink-2 mt-3 m-0">
            {description}
          </p>
        )}
        {meta && (
          <div className="mt-3 text-[13px] text-muted flex flex-wrap gap-x-4 gap-y-1 [font-variant-numeric:tabular-nums]">
            {meta}
          </div>
        )}
      </div>
      {aside && <div className="min-w-0">{aside}</div>}
    </div>
  </header>
)

export default memo(PageHeader)
