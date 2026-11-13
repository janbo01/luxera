import { memo, type FC, type ReactNode } from 'react'

interface PageIntroProps {
  kicker: string
  title: ReactNode
  description?: ReactNode
  /** Small meta line under the description (counts, dates…). */
  meta?: ReactNode
  /** Right-hand (visually left, in RTL) slot — imagery, chips, actions. */
  aside?: ReactNode
  /** h1 by default; pass 'h2' when the page already has its h1. */
  as?: 'h1' | 'h2'
}

// Listing-page header (collections, a collection, the blog). It matches PageHeader:
// unboxed, title first, so the content starts high on a phone. The kicker is kept as
// an accessible label only — the breadcrumb above already says where the visitor is.
const PageIntro: FC<PageIntroProps> = ({
  kicker,
  title,
  description,
  meta,
  aside,
  as: Heading = 'h1',
}) => (
  <section
    aria-label={kicker}
    className="pt-4 md:pt-6 pb-2 grid md:grid-cols-[minmax(0,1fr)_auto] gap-5 md:gap-12 items-end"
  >
    <div className="min-w-0">
      <Heading className="font-heading font-bold text-[clamp(28px,4vw,46px)] leading-[1.15] m-0 text-ink [text-wrap:balance] [&_em]:not-italic [&_em]:font-[inherit]">
        {title}
      </Heading>
      {description && (
        <p className="max-w-[60ch] text-[15px] leading-[1.9] text-ink-2 mt-3 m-0">{description}</p>
      )}
      {meta && (
        <div className="mt-3 text-[13px] text-muted flex flex-wrap gap-x-4 gap-y-1 [font-variant-numeric:tabular-nums]">
          {meta}
        </div>
      )}
    </div>

    {aside && <div className="min-w-0 max-md:order-first">{aside}</div>}
  </section>
)

export default memo(PageIntro)
