import { usePageMeta } from '../hooks/usePageMeta'
import type { FC } from 'react'
import Icon from '../components/icons/Icon'
import { BTN_CLS, BTN_GHOST_CLS } from '../components/ui/Button'
import { CATEGORIES } from '../data/categories'

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
      <p className="text-[14.5px] text-muted max-w-[40ch] leading-[1.9] m-0">
        این صفحه وجود ندارد یا جابه‌جا شده است. اگر دنبال قطعه‌ای بودید که فروخته شده، شبیهش را
        جستجو کنید.
      </p>
      <form
        action="/search"
        method="get"
        role="search"
        className="flex gap-2 w-full max-w-[400px] mt-2"
      >
        <label htmlFor="nf-q" className="sr-only">
          جستجو در فروشگاه
        </label>
        <input
          id="nf-q"
          name="q"
          type="search"
          placeholder="مثلاً گردنبند قلب"
          enterKeyHint="search"
          className="flex-1 min-w-0 min-h-12 px-4 rounded-full bg-surface border border-rule text-[15px] text-ink outline-none focus:border-ink"
        />
        <button
          type="submit"
          aria-label="جستجو"
          className="w-12 h-12 shrink-0 grid place-items-center rounded-full bg-ink text-bg"
        >
          <Icon name="search" size={17} />
        </button>
      </form>
      <nav aria-label="دسته‌بندی‌ها" className="flex flex-wrap gap-2 justify-center max-w-[520px]">
        {CATEGORIES.filter((c) => c.id !== 'new').map((c) => (
          <a
            key={c.id}
            href={`/category/${c.id}`}
            className="inline-flex items-center min-h-11 px-4 rounded-full border border-rule bg-surface text-[13.5px] text-ink-2 hover:border-ink hover:text-ink"
          >
            {c.fa}
          </a>
        ))}
      </nav>
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
