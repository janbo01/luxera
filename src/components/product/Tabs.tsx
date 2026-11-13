import { useState, Fragment, type FC } from 'react'
import Icon from '../icons/Icon'
import { SHIPPING } from '../../data/shipping'
import { PRODUCT_DETAIL } from '../../data/productDetail'
import type { ProductDetail } from '../../types'

interface TabsProps {
  product?: ProductDetail
}

type TabId = 'desc' | 'specs' | 'care' | 'shipping'

const TAB_LABELS: { id: TabId; label: string }[] = [
  { id: 'desc', label: 'توضیحات' },
  { id: 'specs', label: 'مشخصات' },
  { id: 'care', label: 'نگهداری' },
  { id: 'shipping', label: 'ارسال و بازگشت' },
]

const Tabs: FC<TabsProps> = ({ product }) => {
  const [activeTab, setActiveTab] = useState<TabId>('desc')
  const p = product ?? PRODUCT_DETAIL
  // Reference data moved here from the top of the info panel.
  const specs: string[][] = [
    ...p.specs,
    ['کد محصول', `LUX-${p.id.slice(0, 6).toUpperCase()}`],
    ...(p.en && p.en !== p.fa ? [['نام لاتین', p.en]] : []),
  ]

  return (
    <section id="details" className="pt-8 md:pt-[72px] px-[var(--pad)] mb-0 scroll-mt-24">
      {/* Four short tabs share the width on phones, so none is cut off. */}
      <nav className="grid grid-cols-4 md:flex md:items-center border-b border-rule">
        {TAB_LABELS.map(({ id, label }) => (
          <button
            key={id}
            className={`px-1 md:px-[22px] py-4 md:py-[18px] font-body text-[13.5px] md:text-[14px] font-medium border-b-2 -mb-px transition-colors duration-200 relative whitespace-nowrap text-center ${activeTab === id ? 'border-b-ink text-ink' : 'border-b-transparent text-muted hover:text-ink-2'}`}
            onClick={() => setActiveTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="py-10">
        {/* Description */}
        <div
          className={`${p.highlights.length > 0 ? 'grid-cols-2' : 'grid-cols-1'} gap-12 items-start max-md:grid-cols-1 max-md:gap-8 ${activeTab === 'desc' ? 'grid' : 'hidden'}`}
        >
          <div>
            <h2 className="font-heading text-[24px] font-bold m-0 mb-4 leading-[1.2] flex items-center gap-2.5">
              درباره‌ی این قطعه
            </h2>
            {p.description.split('\n\n').map((para, i) => (
              <p key={i} className="m-0 mb-3.5 text-[15px] leading-[1.95] text-ink-2 max-w-[68ch]">
                {para}
              </p>
            ))}
          </div>
          {p.highlights.length > 0 && (
            <div>
              <h3 className="font-heading text-[18px] font-semibold m-0 mb-4 flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-xs bg-bg-2 grid place-items-center text-copper">
                  <Icon name="check" size={11} strokeWidth={2.4} />
                </span>
                ویژگی‌های اصلی
              </h3>
              <ul className="flex flex-col gap-3 list-none p-0 m-0">
                {p.highlights.map((h, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 px-4 py-3.5 bg-surface border border-rule rounded-sm text-[14px] leading-[1.55]"
                  >
                    <span className="w-[22px] h-[22px] rounded-full bg-bg-2 grid place-items-center text-copper flex-shrink-0 mt-0.5">
                      <Icon name="check" size={11} strokeWidth={2.4} />
                    </span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Specs */}
        <div
          className={`grid-cols-2 gap-12 items-start max-md:grid-cols-1 max-md:gap-8 ${activeTab === 'specs' ? 'grid' : 'hidden'}`}
        >
          <div>
            <h2 className="font-heading text-[24px] font-bold m-0 mb-4 leading-[1.2] flex items-center gap-2.5">
              مشخصاتِ فنی
            </h2>
            <div className="grid [grid-template-columns:auto_1fr] border-t border-rule text-[14px]">
              {specs.map(([k, v], i) => (
                <Fragment key={i}>
                  <span className="py-3.5 border-b border-rule text-muted font-body text-[13px] tracking-[0.06em] pe-6">
                    {k}
                  </span>
                  <span
                    className="py-3.5 border-b border-rule text-ink-2"
                    dir={/[\d۰-۹]/.test(v) ? 'ltr' : undefined}
                  >
                    {v}
                  </span>
                </Fragment>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-heading text-[18px] font-semibold m-0 mb-4 flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-xs bg-bg-2 grid place-items-center text-copper">
                <Icon name="shield" size={13} strokeWidth={2} />
              </span>
              کیفیت و اصالت
            </h3>
            <ul className="flex flex-col gap-3 list-none p-0 m-0">
              <li className="flex items-start gap-3 px-4 py-3.5 bg-surface border border-rule rounded-sm text-[14px] leading-[1.55]">
                <span className="w-[22px] h-[22px] rounded-full bg-bg-2 grid place-items-center text-copper flex-shrink-0 mt-0.5">
                  <Icon name="check" size={11} strokeWidth={2.4} />
                </span>
                انتخاب و تأیید کیفیت توسط تیم لوکسرا
              </li>
              <li className="flex items-start gap-3 px-4 py-3.5 bg-surface border border-rule rounded-sm text-[14px] leading-[1.55]">
                <span className="w-[22px] h-[22px] rounded-full bg-bg-2 grid place-items-center text-copper flex-shrink-0 mt-0.5">
                  <Icon name="check" size={11} strokeWidth={2.4} />
                </span>
                هر قطعه با کدِ یکتای اصالت همراه است
              </li>
              <li className="flex items-start gap-3 px-4 py-3.5 bg-surface border border-rule rounded-sm text-[14px] leading-[1.55]">
                <span className="w-[22px] h-[22px] rounded-full bg-bg-2 grid place-items-center text-copper flex-shrink-0 mt-0.5">
                  <Icon name="check" size={11} strokeWidth={2.4} />
                </span>
                کنترلِ کیفیتِ ۳ مرحله‌ای پیش از ارسال
              </li>
            </ul>
          </div>
        </div>

        {/* Care */}
        <div
          className={`grid-cols-2 gap-12 items-start max-md:grid-cols-1 max-md:gap-8 ${activeTab === 'care' ? 'grid' : 'hidden'}`}
        >
          <div>
            <h2 className="font-heading text-[24px] font-bold m-0 mb-4 leading-[1.2] flex items-center gap-2.5">
              نگهداری
            </h2>
            <p className="m-0 mb-3.5 text-[15px] leading-[1.95] text-ink-2 max-w-[55ch]">
              برای حفظ درخشش قطعه، چند نکته‌ی ساده را رعایت کنید: قطعه را پیش از حمام، شنا یا ورزش
              از خود جدا کنید. در تماس با عطر، اسپری مو و موادِ شوینده قرار ندهید. پس از هر بار
              استفاده، با پارچه‌ای نرم آن را تمیز کنید و در کیسه‌ی مخملیِ همراه نگه دارید.
            </p>
          </div>
          <div>
            <h3 className="font-heading text-[18px] font-semibold m-0 mb-4 flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-xs bg-bg-2 grid place-items-center text-copper">
                <Icon name="info" size={13} strokeWidth={2} />
              </span>
              توصیه‌های روزمره
            </h3>
            <ul className="flex flex-col gap-3 list-none p-0 m-0">
              <li className="flex items-start gap-3 px-4 py-3.5 bg-surface border border-rule rounded-sm text-[14px] leading-[1.55]">
                <span className="w-[22px] h-[22px] rounded-full bg-bg-2 grid place-items-center text-copper flex-shrink-0 mt-0.5">
                  <Icon name="check" size={11} strokeWidth={2.4} />
                </span>
                پارچه‌ی مخصوصِ پولیش — هر دو هفته یک بار
              </li>
              <li className="flex items-start gap-3 px-4 py-3.5 bg-surface border border-rule rounded-sm text-[14px] leading-[1.55]">
                <span className="w-[22px] h-[22px] rounded-full bg-bg-2 grid place-items-center text-copper flex-shrink-0 mt-0.5">
                  <Icon name="check" size={11} strokeWidth={2.4} />
                </span>
                دور از رطوبت و گرمای مستقیم
              </li>
              <li className="flex items-start gap-3 px-4 py-3.5 bg-surface border border-rule rounded-sm text-[14px] leading-[1.55]">
                <span className="w-[22px] h-[22px] rounded-full bg-bg-2 grid place-items-center text-copper flex-shrink-0 mt-0.5">
                  <Icon name="check" size={11} strokeWidth={2.4} />
                </span>
                نگه‌داری در جعبه‌ی برند، جدا از سایرِ زیورآلات
              </li>
            </ul>
          </div>
        </div>

        {/* Shipping */}
        <div
          className={`grid-cols-2 gap-12 items-start max-md:grid-cols-1 max-md:gap-8 ${activeTab === 'shipping' ? 'grid' : 'hidden'}`}
        >
          <div>
            <h2 className="font-heading text-[24px] font-bold m-0 mb-4 leading-[1.2] flex items-center gap-2.5">
              ارسال و بازگشت
            </h2>
            <p className="m-0 mb-3.5 text-[15px] leading-[1.95] text-ink-2 max-w-[55ch]">
              سفارش‌های تهران در ۴ تا ۶ ساعت با اسنپ‌باکس به‌دستِ شما می‌رسد. شهرستان‌ها از طریقِ
              تیپاکس یا پستِ پیشتاز در ۲ تا ۵ روز کاری ارسال می‌شود. سفارش‌های بالای ۲٫۵ میلیون
              تومان شاملِ ارسالِ رایگان هستند.
            </p>
            <p className="m-0 mb-3.5 text-[15px] leading-[1.95] text-ink-2 max-w-[55ch]">
              شما تا ۴ روز پس از دریافتِ قطعه می‌توانید آن را با بسته‌بندیِ اصلی به ما بازگردانید.
              پس از این مهلت امکان پذیرش مرجوعی وجود ندارد.
            </p>
          </div>
          <div>
            <h3 className="font-heading text-[18px] font-semibold m-0 mb-4 flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-xs bg-bg-2 grid place-items-center text-copper">
                <Icon name="truck" size={13} strokeWidth={2} />
              </span>
              روش‌های ارسال
            </h3>
            <ul className="flex flex-col gap-3 list-none p-0 m-0">
              {SHIPPING.map((o) => (
                <li
                  key={o.id}
                  className="flex items-start gap-3 px-4 py-3.5 bg-surface border border-rule rounded-sm text-[14px] leading-[1.55]"
                >
                  <span className="w-[22px] h-[22px] rounded-full bg-bg-2 grid place-items-center text-copper flex-shrink-0 mt-0.5">
                    <Icon name="check" size={11} strokeWidth={2.4} />
                  </span>
                  {o.name} · {o.teheranOnly ? 'فقط تهران' : 'سراسر ایران'} ·{' '}
                  {o.teheranOnly ? 'همان روز یا روز بعد' : o.etaLabel}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Tabs
