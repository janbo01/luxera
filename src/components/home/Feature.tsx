import { memo, type FC } from 'react'
import { Link } from 'react-router-dom'
import whyLuxera from '../../assets/images/why-luxera.webp'
import { BTN_CLS } from '../ui/Button'
import Icon from '../icons/Icon'

const PILLARS = [
  { icon: 'shield',  title: 'گواهیِ اصالت',    desc: 'برای هر قطعه‌ی جواهر فانتزی' },
  { icon: 'check',   title: '۴ روز بازگشت',    desc: 'بدون پرسش، بدون هزینه' },
  { icon: 'bag',     title: 'کیفیت تضمینی',    desc: 'از برندهای معتبر' },
  { icon: 'clock',   title: 'ارسال سریع',       desc: 'رایگان بالای ۲.۵ میلیون' },
]

const Feature: FC = () => (
  <section className="px-[var(--pad)] max-w-[1480px] mx-auto">
    <div className="bg-surface rounded-[var(--radius)] overflow-hidden grid grid-cols-[1.05fr_1fr] max-md:grid-cols-1">

      <div className="py-14 px-12 flex flex-col gap-6 max-md:py-9 max-md:px-6">
        <span className="font-display italic font-normal text-sm tracking-[0.04em] text-copper-dark inline-flex items-center gap-2.5 before:block before:w-[22px] before:h-px before:bg-current before:opacity-60">
          Our Promise
        </span>
        <h2 className="font-heading font-bold text-[clamp(30px,2.8vw,40px)] leading-[1.2] m-0 [&_em]:font-body [&_em]:italic [&_em]:font-normal [&_em]:text-copper-dark">
          جواهراتِ فانتزی، <em>قیمتِ واقعی.</em>
        </h2>
        <p className="text-ink-2 text-[15px] leading-[1.85] m-0 max-w-[48ch]">
          در لوکسرا، بهترین جواهرات فانتزی و اکسسوری مد را برایتان انتخاب
          می‌کنیم. فلزات بی‌آلرژی، روکش‌های با کیفیت، و طرح‌های روز —
          چون معتقدیم سبک خوب نباید گران باشد.
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          {PILLARS.map((p) => (
            <div key={p.title} className="border border-rule rounded-[10px] p-3.5 flex items-center gap-3">
              <span className="w-9 h-9 rounded-lg bg-bg-2 grid place-items-center text-copper shrink-0 [&>svg]:w-[18px] [&>svg]:h-[18px]">
                <Icon name={p.icon} size={22} strokeWidth={1.6} />
              </span>
              <div>
                <h3 className="font-heading text-sm font-semibold leading-[1.2] m-0 mb-0.5 text-ink">{p.title}</h3>
                <p className="text-[11px] text-muted m-0 leading-[1.3]">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2.5 mt-2">
          <Link to="/about" className={BTN_CLS}>
            داستانِ ما را بخوانید
            <span className="arr"><Icon name="arrow-left" size={16} /></span>
          </Link>
        </div>
      </div>

      <div className="relative min-h-[420px] max-md:min-h-[240px] bg-gradient-to-br from-bg-2 to-[#D5BFA6]">
        <img
          src={whyLuxera}
          alt="Fashion jewelry flat lay"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          width="1200"
          height="800"
        />
      </div>
    </div>
  </section>
)

export default memo(Feature)
