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

// Compact editorial page header shared by listing pages (collections, blog…).
// Colours come only from theme tokens so the admin palette applies unchanged.
const PageIntro: FC<PageIntroProps> = ({
  kicker,
  title,
  description,
  meta,
  aside,
  as: Heading = 'h1',
}) => (
  <section className="mt-4 md:mt-6 relative rounded-[var(--radius-lg)] overflow-hidden isolate bg-surface ring-1 ring-inset ring-rule px-[clamp(20px,4vw,56px)] py-[clamp(24px,3.4vw,48px)] grid md:grid-cols-[minmax(0,1fr)_auto] gap-6 md:gap-12 items-center">
    <div
      aria-hidden="true"
      className="absolute -bottom-2/3 end-[20%] w-[45%] aspect-square rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-copper)_9%,transparent),transparent)] -z-10 pointer-events-none"
    />

    <div className="min-w-0">
      <span className="kicker mb-3 md:mb-4">{kicker}</span>
      <Heading className="font-heading font-bold text-[clamp(32px,5vw,64px)] leading-[1.05] tracking-[-0.015em] m-0 text-ink [&_em]:not-italic [&_em]:font-normal [&_em]:text-plum">
        {title}
      </Heading>
      {description && (
        <p className="max-w-[54ch] text-[14px] md:text-[15px] leading-[1.85] text-ink-2 mt-3 md:mt-4 m-0">
          {description}
        </p>
      )}
      {meta && (
        <div className="mt-4 text-[12.5px] text-muted flex flex-wrap gap-x-4 gap-y-1">{meta}</div>
      )}
    </div>

    {aside && <div className="min-w-0">{aside}</div>}
  </section>
)

export default memo(PageIntro)
