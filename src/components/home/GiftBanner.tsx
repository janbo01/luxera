import { memo, type FC } from 'react'
import Icon from '../icons/Icon'
import { BTN_CLS } from '../ui/Button'

/** Entry point to the gift finder, placed between the product rows. */
const GiftBanner: FC = () => (
  <section className="page-section cv-auto" aria-label="راهنمای انتخاب هدیه">
    <div className="rounded-[var(--radius-lg)] bg-plum-2 text-[var(--color-petal)] px-[clamp(24px,5vw,72px)] py-[clamp(32px,5vw,64px)] grid grid-cols-[1fr_auto] max-md:grid-cols-1 gap-8 items-center">
      <div className="flex flex-col gap-3">
        <span className="font-mono text-[11px] tracking-[0.2em] uppercase opacity-80">
          Gift finder
        </span>
        <h2 className="font-heading font-bold text-[clamp(26px,3.4vw,44px)] leading-[1.15] m-0">
          هدیه‌ی مناسب را در سه قدم پیدا کنید
        </h2>
        <p className="m-0 text-[15px] leading-[1.9] opacity-90 max-w-[52ch]">
          بگویید برای چه کسی، برای کدام مناسبت و با چه بودجه‌ای. ما چند قطعه‌ی مناسب پیشنهاد می‌دهیم
          و می‌توانید لینکش را برای کسی بفرستید.
        </p>
      </div>
      <a href="/gift" className={`${BTN_CLS} !bg-bg !text-ink justify-self-start`}>
        شروع کنید
        <span className="arr">
          <Icon name="gift" size={16} />
        </span>
      </a>
    </div>
  </section>
)

export default memo(GiftBanner)
