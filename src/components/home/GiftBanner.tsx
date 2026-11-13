import { memo, type FC } from 'react'
import Icon from '../icons/Icon'
import { BTN_CLS } from '../ui/Button'

/** Entry point to the gift finder, placed between the product rows. */
const GiftBanner: FC = () => (
  <section className="page-section page-section--compact cv-auto" aria-label="راهنمای انتخاب هدیه">
    <div className="rounded-[var(--radius-lg)] bg-plum-2 text-[var(--color-petal)] px-[clamp(20px,4vw,56px)] py-[clamp(24px,3.4vw,44px)] grid grid-cols-[1fr_auto] max-md:grid-cols-1 gap-5 md:gap-8 items-center">
      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-medium opacity-80">راهنمای هدیه</span>
        <h2 className="font-heading font-bold text-[clamp(22px,2.6vw,34px)] leading-[1.2] m-0">
          هدیه‌ی مناسب را در سه قدم پیدا کنید
        </h2>
        <p className="m-0 text-[14.5px] leading-[1.85] opacity-90 max-w-[52ch] max-md:line-clamp-2">
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
