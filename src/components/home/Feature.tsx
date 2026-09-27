import { memo, type FC } from 'react'

import whyLuxera from '../../assets/images/why-luxera.webp'
import { BTN_CLS } from '../ui/Button'
import Icon from '../icons/Icon'

const PILLARS = [
  { icon: 'shield', title: 'گواهیِ اصالت', desc: 'برای هر قطعه‌ی جواهر فانتزی' },
  { icon: 'check', title: '۴ روز بازگشت', desc: 'بدون پرسش، بدون هزینه' },
  { icon: 'bag', title: 'کیفیت تضمینی', desc: 'از برندهای معتبر' },
  { icon: 'clock', title: 'ارسال سریع', desc: 'رایگان بالای ۲.۵ میلیون' },
]

const Feature: FC = () => (
  <section className="page-section cv-auto">
    <div className="bg-surface ring-1 ring-inset ring-rule rounded-[var(--radius-lg)] overflow-hidden grid grid-cols-[1.05fr_1fr] max-md:grid-cols-1">
      <div className="py-[clamp(32px,4.5vw,64px)] px-[clamp(24px,4.5vw,64px)] flex flex-col gap-6 justify-center">
        <span className="kicker">Our Promise</span>
        <h2 className="font-heading font-bold text-[clamp(30px,2.8vw,40px)] leading-[1.2] m-0 [&_em]:font-body [&_em]:italic [&_em]:font-normal [&_em]:text-copper-dark">
          جواهراتِ فانتزی، <em>قیمتِ واقعی.</em>
        </h2>
        <p className="text-ink-2 text-[15px] leading-[1.85] m-0 max-w-[48ch]">
          در لوکسرا، بهترین جواهرات فانتزی و اکسسوری مد را برایتان انتخاب می‌کنیم. فلزات بی‌آلرژی،
          روکش‌های با کیفیت، و طرح‌های روز — چون معتقدیم سبک خوب نباید گران باشد.
        </p>
        <div className="grid grid-cols-2 gap-px bg-rule rounded-[var(--radius)] overflow-hidden ring-1 ring-rule">
          {PILLARS.map((p) => (
            <div key={p.title} className="bg-surface p-4 sm:p-5 flex items-start gap-3">
              <span className="w-10 h-10 rounded-full bg-copper/10 grid place-items-center text-copper-dark shrink-0">
                <Icon name={p.icon} size={17} strokeWidth={1.6} />
              </span>
              <div className="min-w-0">
                <h3 className="font-heading text-[14px] font-semibold leading-[1.3] m-0 mb-1 text-ink">
                  {p.title}
                </h3>
                <p className="text-[12px] text-muted m-0 leading-[1.5]">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2.5 mt-2">
          <a href="/about" className={BTN_CLS}>
            داستانِ ما را بخوانید
            <span className="arr">
              <Icon name="arrow-left" size={16} />
            </span>
          </a>
        </div>
      </div>

      <div className="relative min-h-[460px] max-md:min-h-0 max-md:aspect-[4/3] bg-gradient-to-br from-bg-2 to-dust-rose max-md:order-first">
        <img
          src={typeof whyLuxera === 'string' ? whyLuxera : whyLuxera.src}
          alt="چیدمان جواهرات فانتزی لوکسرا"
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
