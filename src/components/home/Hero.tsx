import { useState, useCallback, type FC } from 'react'
import HeroSlider, { type SlideInfo } from './HeroSlider'
import Icon from '../icons/Icon'
import { formatNumber } from '../../utils/format'

const TICKER_ITEMS = [
  'جواهرات فانتزی',
  'بی‌آلرژی',
  'روکش ماندگار',
  'دست‌ساز در تهران',
  'ارسال یک‌روزه',
  'گارانتی اصالت',
  'طراحی اختصاصی',
]

function fmtPrice(raw?: string): string {
  const n = Number(raw)
  return raw && !isNaN(n) ? formatNumber(n) : (raw ?? '')
}

const Hero: FC = () => {
  const [slide, setSlide] = useState<SlideInfo>({ name: '' })
  const handleSlide = useCallback((info: SlideInfo) => setSlide(info), [])

  return (
  <section className="hero">
    <div className="hero__grid">
      {/* ── Left: Dark stage with product illustration ── */}
      <div className="hero__stage">
        <div className="hero__stage-product">
          <HeroSlider onSlide={handleSlide} />
        </div>

        <div className="hero__stage-meta">
          <div>
            <div className="hero__stage-name">{slide.name}</div>
          </div>
          {slide.price && (
            <div className="hero__stage-price">
              {slide.oldPrice && (
                <span className="hero__stage-was">{fmtPrice(slide.oldPrice)}</span>
              )}
              <span className="hero__stage-now">{fmtPrice(slide.price)}<small>تومان</small></span>
            </div>
          )}
        </div>
      </div>

      {/* ── Right: Cream copy panel ── */}
      <div className="hero__copy">
        <span className="kicker anim-in delay-1">New Arrivals · پاییز ۱۴۰۴</span>
        <h1 className="hero__headline anim-in delay-2">
          استایلِ امروز،<br />
          <span className="hero__accent">قیمتِ واقعی</span>.
        </h1>
        <p className="hero__lede anim-in delay-3">
          جواهرات فانتزی و اکسسوری مد از بهترین برندها — گردنبند،
          دستبند، انگشتر و گوشواره برای هر سبک و هر مناسبت.
          کیفیت خوب، بدون پرداخت هزینه‌ی گزاف.
        </p>
        <div className="hero__cta-row anim-in delay-4">
          <button className="btn">
            مشاهده‌ی محصولات
            <span className="arr"><Icon name="arrow-left" size={16} /></span>
          </button>
          <button className="btn btn--ghost">بیشتر بدانید</button>
        </div>
        <div className="hero__stats anim-in delay-5">
          <div className="hero__stat">
            <div className="hero__stat-v">۱۴ <small>روز</small></div>
            <div className="hero__stat-l">ضمانت بازگشت کالا</div>
          </div>
          <div className="hero__stat">
            <div className="hero__stat-v">رایگان</div>
            <div className="hero__stat-l">ارسال بالای ۵۰۰ هزار</div>
          </div>
          <div className="hero__stat">
            <div className="hero__stat-v">۲۰۰+ <small>مدل</small></div>
            <div className="hero__stat-l">محصول موجود</div>
          </div>
        </div>
      </div>
    </div>

    {/* ── Ticker ── */}
    <div className="hero__ticker">
      <div className="hero__ticker-track">
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
          <span key={i}><i className="star">✦</i> {item}</span>
        ))}
      </div>
    </div>
  </section>
  )
}

export default Hero
