import { useState, Fragment, type FC } from 'react'
import Icon from '../icons/Icon'
import { PRODUCT_DETAIL } from '../../data/productDetail'
import type { ProductDetail } from '../../types'

interface TabsProps {
  product?: ProductDetail
}

type TabId = 'desc' | 'specs' | 'care' | 'shipping'

const TAB_LABELS: { id: TabId; label: string }[] = [
  { id: 'desc',     label: 'توضیحات' },
  { id: 'specs',    label: 'مشخصات' },
  { id: 'care',     label: 'نگهداری' },
  { id: 'shipping', label: 'ارسال و بازگشت' },
]

const Tabs: FC<TabsProps> = ({ product }) => {
  const [activeTab, setActiveTab] = useState<TabId>('desc')
  const p = product ?? PRODUCT_DETAIL

  return (
    <section className="pt-[72px] px-[var(--pad)] mb-0">
      <nav className="flex items-center border-b border-rule overflow-x-auto">
        {TAB_LABELS.map(({ id, label }) => (
          <button
            key={id}
            className={`px-[22px] py-[18px] font-body text-[14px] font-medium border-b-2 -mb-px transition-colors duration-200 relative whitespace-nowrap flex-shrink-0 ${activeTab === id ? 'border-b-ink text-ink' : 'border-b-transparent text-muted hover:text-ink-2'}`}
            onClick={() => setActiveTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="py-10">

        {/* Description */}
        <div className={`grid-cols-2 gap-12 items-start max-md:grid-cols-1 max-md:gap-8 ${activeTab === 'desc' ? 'grid' : 'hidden'}`}>
          <div>
            <h3 className="font-heading text-[24px] font-bold m-0 mb-4 leading-[1.2] flex items-center gap-2.5">
              درباره‌ی این قطعه
              <span className="font-display italic font-normal text-copper-dark text-[16px]">— The Story</span>
            </h3>
            {p.description.split('\n\n').map((para, i) => (
              <p key={i} className="m-0 mb-3.5 text-[15px] leading-[1.95] text-ink-2 max-w-[55ch]">{para}</p>
            ))}
          </div>
          <div>
            <h4 className="font-heading text-[18px] font-semibold m-0 mb-4 flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-[6px] bg-bg-2 grid place-items-center text-copper">
                <Icon name="check" size={11} strokeWidth={2.4} />
              </span>
              ویژگی‌های اصلی
            </h4>
            <ul className="flex flex-col gap-3 list-none p-0 m-0">
              {p.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-3 px-4 py-3.5 bg-surface border border-rule rounded-[10px] text-[14px] leading-[1.55]">
                  <span className="w-[22px] h-[22px] rounded-full bg-bg-2 grid place-items-center text-copper flex-shrink-0 mt-0.5">
                    <Icon name="check" size={11} strokeWidth={2.4} />
                  </span>
                  {h}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Specs */}
        <div className={`grid-cols-2 gap-12 items-start max-md:grid-cols-1 max-md:gap-8 ${activeTab === 'specs' ? 'grid' : 'hidden'}`}>
          <div>
            <h3 className="font-heading text-[24px] font-bold m-0 mb-4 leading-[1.2] flex items-center gap-2.5">
              مشخصاتِ فنی
              <span className="font-display italic font-normal text-copper-dark text-[16px]">— Specifications</span>
            </h3>
            <div className="grid [grid-template-columns:auto_1fr] border-t border-rule text-[14px]">
              {p.specs.map(([k, v], i) => (
                <Fragment key={i}>
                  <span className="py-3.5 border-b border-rule text-muted font-body text-[12px] tracking-[0.06em] pe-6">{k}</span>
                  <span className="py-3.5 border-b border-rule text-ink-2" dir={/[\d۰-۹]/.test(v) ? 'ltr' : undefined}>{v}</span>
                </Fragment>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-heading text-[18px] font-semibold m-0 mb-4 flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-[6px] bg-bg-2 grid place-items-center text-copper">
                <Icon name="shield" size={13} strokeWidth={2} />
              </span>
              کیفیت و اصالت
            </h4>
            <ul className="flex flex-col gap-3 list-none p-0 m-0">
              <li className="flex items-start gap-3 px-4 py-3.5 bg-surface border border-rule rounded-[10px] text-[14px] leading-[1.55]">
                <span className="w-[22px] h-[22px] rounded-full bg-bg-2 grid place-items-center text-copper flex-shrink-0 mt-0.5"><Icon name="check" size={11} strokeWidth={2.4} /></span>
                انتخاب و تأیید کیفیت توسط تیم لوکسرا
              </li>
              <li className="flex items-start gap-3 px-4 py-3.5 bg-surface border border-rule rounded-[10px] text-[14px] leading-[1.55]">
                <span className="w-[22px] h-[22px] rounded-full bg-bg-2 grid place-items-center text-copper flex-shrink-0 mt-0.5"><Icon name="check" size={11} strokeWidth={2.4} /></span>
                هر قطعه با کدِ یکتای اصالت همراه است
              </li>
              <li className="flex items-start gap-3 px-4 py-3.5 bg-surface border border-rule rounded-[10px] text-[14px] leading-[1.55]">
                <span className="w-[22px] h-[22px] rounded-full bg-bg-2 grid place-items-center text-copper flex-shrink-0 mt-0.5"><Icon name="check" size={11} strokeWidth={2.4} /></span>
                کنترلِ کیفیتِ ۳ مرحله‌ای پیش از ارسال
              </li>
            </ul>
          </div>
        </div>

        {/* Care */}
        <div className={`grid-cols-2 gap-12 items-start max-md:grid-cols-1 max-md:gap-8 ${activeTab === 'care' ? 'grid' : 'hidden'}`}>
          <div>
            <h3 className="font-heading text-[24px] font-bold m-0 mb-4 leading-[1.2] flex items-center gap-2.5">
              نگهداری
              <span className="font-display italic font-normal text-copper-dark text-[16px]">— Care guide</span>
            </h3>
            <p className="m-0 mb-3.5 text-[15px] leading-[1.95] text-ink-2 max-w-[55ch]">برای حفظ درخشش قطعه، چند نکته‌ی ساده را رعایت کنید: قطعه را پیش از حمام، شنا یا ورزش از خود جدا کنید. در تماس با عطر، اسپری مو و موادِ شوینده قرار ندهید. پس از هر بار استفاده، با پارچه‌ای نرم آن را تمیز کنید و در کیسه‌ی مخملیِ همراه نگه دارید.</p>
          </div>
          <div>
            <h4 className="font-heading text-[18px] font-semibold m-0 mb-4 flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-[6px] bg-bg-2 grid place-items-center text-copper">
                <Icon name="info" size={13} strokeWidth={2} />
              </span>
              توصیه‌های روزمره
            </h4>
            <ul className="flex flex-col gap-3 list-none p-0 m-0">
              <li className="flex items-start gap-3 px-4 py-3.5 bg-surface border border-rule rounded-[10px] text-[14px] leading-[1.55]">
                <span className="w-[22px] h-[22px] rounded-full bg-bg-2 grid place-items-center text-copper flex-shrink-0 mt-0.5"><Icon name="check" size={11} strokeWidth={2.4} /></span>
                پارچه‌ی مخصوصِ پولیش — هر دو هفته یک بار
              </li>
              <li className="flex items-start gap-3 px-4 py-3.5 bg-surface border border-rule rounded-[10px] text-[14px] leading-[1.55]">
                <span className="w-[22px] h-[22px] rounded-full bg-bg-2 grid place-items-center text-copper flex-shrink-0 mt-0.5"><Icon name="check" size={11} strokeWidth={2.4} /></span>
                دور از رطوبت و گرمای مستقیم
              </li>
              <li className="flex items-start gap-3 px-4 py-3.5 bg-surface border border-rule rounded-[10px] text-[14px] leading-[1.55]">
                <span className="w-[22px] h-[22px] rounded-full bg-bg-2 grid place-items-center text-copper flex-shrink-0 mt-0.5"><Icon name="check" size={11} strokeWidth={2.4} /></span>
                نگه‌داری در جعبه‌ی برند، جدا از سایرِ زیورآلات
              </li>
            </ul>
          </div>
        </div>

        {/* Shipping */}
        <div className={`grid-cols-2 gap-12 items-start max-md:grid-cols-1 max-md:gap-8 ${activeTab === 'shipping' ? 'grid' : 'hidden'}`}>
          <div>
            <h3 className="font-heading text-[24px] font-bold m-0 mb-4 leading-[1.2] flex items-center gap-2.5">
              ارسال و بازگشت
              <span className="font-display italic font-normal text-copper-dark text-[16px]">— Shipping &amp; returns</span>
            </h3>
            <p className="m-0 mb-3.5 text-[15px] leading-[1.95] text-ink-2 max-w-[55ch]">سفارش‌های تهران در ۴ تا ۶ ساعت با اسنپ‌باکس به‌دستِ شما می‌رسد. شهرستان‌ها از طریقِ تیپاکس یا پستِ پیشتاز در ۲ تا ۵ روز کاری ارسال می‌شود. سفارش‌های بالای ۲٫۵ میلیون تومان شاملِ ارسالِ رایگان هستند.</p>
            <p className="m-0 mb-3.5 text-[15px] leading-[1.95] text-ink-2 max-w-[55ch]">شما تا ۴ روز پس از دریافتِ قطعه می‌توانید آن را با بسته‌بندیِ اصلی به ما بازگردانید. پس از این مهلت امکان پذیرش مرجوعی وجود ندارد.</p>
          </div>
          <div>
            <h4 className="font-heading text-[18px] font-semibold m-0 mb-4 flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-[6px] bg-bg-2 grid place-items-center text-copper">
                <Icon name="truck" size={13} strokeWidth={2} />
              </span>
              روش‌های ارسال
            </h4>
            <ul className="flex flex-col gap-3 list-none p-0 m-0">
              <li className="flex items-start gap-3 px-4 py-3.5 bg-surface border border-rule rounded-[10px] text-[14px] leading-[1.55]">
                <span className="w-[22px] h-[22px] rounded-full bg-bg-2 grid place-items-center text-copper flex-shrink-0 mt-0.5"><Icon name="check" size={11} strokeWidth={2.4} /></span>
                اسنپ‌باکس · تهران · ۴–۶ ساعت
              </li>
              <li className="flex items-start gap-3 px-4 py-3.5 bg-surface border border-rule rounded-[10px] text-[14px] leading-[1.55]">
                <span className="w-[22px] h-[22px] rounded-full bg-bg-2 grid place-items-center text-copper flex-shrink-0 mt-0.5"><Icon name="check" size={11} strokeWidth={2.4} /></span>
                تیپاکس · سراسر ایران · ۲۴–۴۸ ساعت
              </li>
              <li className="flex items-start gap-3 px-4 py-3.5 bg-surface border border-rule rounded-[10px] text-[14px] leading-[1.55]">
                <span className="w-[22px] h-[22px] rounded-full bg-bg-2 grid place-items-center text-copper flex-shrink-0 mt-0.5"><Icon name="check" size={11} strokeWidth={2.4} /></span>
                پستِ پیشتاز · کلِ کشور · ۴۸–۷۲ ساعت
              </li>
            </ul>
          </div>
        </div>

      </div>
    </section>
  )
}

export default Tabs
