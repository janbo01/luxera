import { usePageMeta } from '../hooks/usePageMeta'
import type { FC } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/icons/Icon'
import { BTN_CLS, BTN_GHOST_CLS } from '../components/ui/Button'

const NotFoundPage: FC = () => {
  usePageMeta({ title: 'صفحه یافت نشد', noIndex: true })
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-[clamp(20px,4vw,56px)] py-[100px] text-center min-h-[60vh]">
      <div className="opacity-25 mb-2">
        <Icon name="search" size={48} />
      </div>
      <h1 className="font-display text-[clamp(64px,12vw,120px)] font-normal text-rule leading-none m-0">
        ۴۰۴
      </h1>
      <h2 className="font-body text-[clamp(18px,3vw,24px)] text-ink m-0">صفحه پیدا نشد</h2>
      <p className="text-sm text-muted max-w-[360px] leading-[1.7] m-0">
        صفحه‌ای که دنبالش می‌گردید وجود ندارد یا جابه‌جا شده است.
      </p>
      <div className="flex gap-3 mt-2 flex-wrap justify-center">
        <Link to="/" className={BTN_CLS}>
          بازگشت به خانه
          <span className="arr">←</span>
        </Link>
        <Link to="/category/new" className={BTN_GHOST_CLS}>
          مشاهده محصولات
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage
