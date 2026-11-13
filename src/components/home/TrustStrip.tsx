import { memo, type FC } from 'react'
import Icon from '../icons/Icon'

const ITEMS = [
  { icon: 'truck', title: 'ارسال رایگان', desc: 'بالای ۲.۵ میلیون تومان' },
  { icon: 'refresh', title: '۴ روز بازگشت', desc: 'بدون پرسش و بدون هزینه' },
  { icon: 'shield', title: 'روکش ماندگار', desc: 'بدون نیکل، مناسب پوست حساس' },
  { icon: 'gift', title: 'مناسب هدیه', desc: 'بسته‌بندی شیک برای هر مناسبت' },
]

/**
 * The one reassurance band on the home page (the hero ticker that repeated it is gone).
 * Open on the page background between two hairlines: it informs, it is not a control.
 */
const TrustStrip: FC = () => (
  <section aria-label="تضمین‌های لوکسرا" className="page-section !pt-3 md:!pt-4 !pb-0">
    <ul className="m-0 p-0 list-none grid grid-cols-4 max-[900px]:grid-cols-2 gap-x-6 border-y border-rule">
      {ITEMS.map((it) => (
        <li key={it.title} className="flex items-center gap-3 py-3.5">
          <span className="w-9 h-9 rounded-full bg-copper/10 grid place-items-center text-copper-dark shrink-0">
            <Icon name={it.icon} size={16} strokeWidth={1.6} />
          </span>
          <span className="min-w-0">
            <span className="block font-heading text-[13.5px] font-semibold leading-[1.3] text-ink">
              {it.title}
            </span>
            <span className="block text-[13px] text-muted leading-[1.5]">{it.desc}</span>
          </span>
        </li>
      ))}
    </ul>
  </section>
)

export default memo(TrustStrip)
