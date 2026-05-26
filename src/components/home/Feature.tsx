import type { FC } from 'react'
import whyLuxera from '../../assets/images/why-luxera.png'
import Icon from '../icons/Icon'

const PILLARS = [
  { icon: 'shield',  title: 'گواهیِ اصالت',    desc: 'برای هر قطعه از طلا و نقره' },
  { icon: 'check',   title: '۱۴ روز بازگشت',   desc: 'بدون پرسش، بدون هزینه' },
  { icon: 'bag',     title: 'دست‌ساز',          desc: 'در کارگاه طراحی لوکسرا' },
  { icon: 'clock',   title: 'ارسال یک‌روزه',   desc: 'در تهران، رایگان' },
]

const Feature: FC = () => (
  <section className="section" style={{ paddingTop: 0 }}>
    <div className="feature">
      <div className="feature__body">
        <span className="kicker">Our Atelier</span>
        <h3>
          جواهراتِ فانتزی، <em>قیمتِ واقعی.</em>
        </h3>
        <p>
          در لوکسرا، بهترین جواهرات فانتزی و اکسسوری مد را برایتان انتخاب
          می‌کنیم. فلزات بی‌آلرژی، روکش‌های با کیفیت، و طرح‌های روز —
          چون معتقدیم سبک خوب نباید گران باشد.
        </p>
        <div className="feature__pillars">
          {PILLARS.map((p) => (
            <div key={p.title} className="feature__pillar">
              <span className="feature__pillar-ic"><Icon name={p.icon} size={22} strokeWidth={1.6} /></span>
              <div>
                <h4>{p.title}</h4>
                <p>{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <a href="/about" className="btn">
            داستانِ ما را بخوانید
            <span className="arr"><Icon name="arrow-left" size={16} /></span>
          </a>
        </div>
      </div>

      <div className="feature__visual">
        <img src={whyLuxera} alt="Fashion jewelry flat lay" className="feature__visual-img" width="1200" height="800" />
      </div>
    </div>
  </section>
)

export default Feature
