import { usePageMeta } from '../hooks/usePageMeta'
import type { FC } from 'react'
import Icon from '../components/icons/Icon'
import { BTN_CLS, BTN_GHOST_CLS } from '../components/ui/Button'

const NotFoundPage: FC = () => {
  usePageMeta({ title: 'صفحه یافت نشد', noIndex: true })
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-[clamp(20px,4vw,56px)] py-[100px] text-center min-h-[60vh]">
      {/* Decorative numeral; the real heading is the message below */}
      <div
        className="font-heading font-bold text-[clamp(88px,16vw,160px)] text-copper/20 leading-none select-none"
        aria-hidden="true"
      >
        ۴۰۴
      </div>
      <h1 className="font-heading font-bold text-[clamp(22px,3vw,30px)] text-ink m-0">
        صفحه پیدا نشد
      </h1>
      <p className="text-[14.5px] text-muted max-w-[360px] leading-[1.9] m-0">
        صفحه‌ای که دنبالش می‌گردید وجود ندارد یا جابه‌جا شده است.
      </p>
      <div className="flex gap-3 mt-2 flex-wrap justify-center">
        <a href="/" className={BTN_CLS}>
          بازگشت به خانه
          <span className="arr">
            <Icon name="arrow-left" size={16} />
          </span>
        </a>
        <a href="/category/new" className={BTN_GHOST_CLS}>
          مشاهده محصولات
        </a>
      </div>
    </div>
  )
}

export default NotFoundPage
