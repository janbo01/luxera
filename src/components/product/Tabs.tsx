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
    <section className="tabs-sect">
      <nav className="tab-bar">
        {TAB_LABELS.map(({ id, label }) => (
          <button
            key={id}
            className={`tab-bar__tab ${activeTab === id ? 'is-active' : ''}`}
            onClick={() => setActiveTab(id)}
          >
            {label}
          </button>
        ))}

      </nav>

      <div className="tab-panels">

        {/* Description */}
        <div className={`tab-panel ${activeTab === 'desc' ? 'is-active' : ''}`}>
          <div>
            <h3 className="tab-panel__lead-h">
              درباره‌ی این قطعه <span className="en">— The Story</span>
            </h3>
            {p.description.split('\n\n').map((para, i) => (
              <p key={i} className="tab-panel__lead-p">{para}</p>
            ))}
          </div>
          <div>
            <h4 className="tab-panel__feat-h">
              <span className="mark"><Icon name="check" size={11} strokeWidth={2.4} /></span>
              ویژگی‌های اصلی
            </h4>
            <ul className="feat-list">
              {p.highlights.map((h, i) => (
                <li key={i}>
                  <span className="feat-list__chk"><Icon name="check" size={11} strokeWidth={2.4} /></span>
                  {h}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Specs */}
        <div className={`tab-panel ${activeTab === 'specs' ? 'is-active' : ''}`}>
          <div>
            <h3 className="tab-panel__lead-h">
              مشخصاتِ فنی <span className="en">— Specifications</span>
            </h3>
            <div className="spec-table">
              {p.specs.map(([k, v], i) => (
                <Fragment key={i}>
                  <span className="k">{k}</span>
                  <span className="v" dir={/[\d۰-۹]/.test(v) ? 'ltr' : undefined}>{v}</span>
                </Fragment>
              ))}
            </div>
          </div>
          <div>
            <h4 className="tab-panel__feat-h">
              <span className="mark"><Icon name="shield" size={13} strokeWidth={2} /></span>
              ساختِ ایران
            </h4>
            <ul className="feat-list">
              <li><span className="feat-list__chk"><Icon name="check" size={11} strokeWidth={2.4} /></span>طراحی و ساخت در کارگاهِ Luxera، تهران</li>
              <li><span className="feat-list__chk"><Icon name="check" size={11} strokeWidth={2.4} /></span>هر قطعه با کدِ یکتای اصالت همراه است</li>
              <li><span className="feat-list__chk"><Icon name="check" size={11} strokeWidth={2.4} /></span>پولیشِ نهایی و کنترلِ کیفیتِ ۳ مرحله‌ای</li>
            </ul>
          </div>
        </div>

        {/* Care */}
        <div className={`tab-panel ${activeTab === 'care' ? 'is-active' : ''}`}>
          <div>
            <h3 className="tab-panel__lead-h">
              نگهداری <span className="en">— Care guide</span>
            </h3>
            <p className="tab-panel__lead-p">برای حفظ درخشش قطعه، چند نکته‌ی ساده را رعایت کنید: قطعه را پیش از حمام، شنا یا ورزش از خود جدا کنید. در تماس با عطر، اسپری مو و موادِ شوینده قرار ندهید. پس از هر بار استفاده، با پارچه‌ای نرم آن را تمیز کنید و در کیسه‌ی مخملیِ همراه نگه دارید.</p>
          </div>
          <div>
            <h4 className="tab-panel__feat-h">
              <span className="mark"><Icon name="info" size={13} strokeWidth={2} /></span>
              توصیه‌های روزمره
            </h4>
            <ul className="feat-list">
              <li><span className="feat-list__chk"><Icon name="check" size={11} strokeWidth={2.4} /></span>پارچه‌ی مخصوصِ پولیش — هر دو هفته یک بار</li>
              <li><span className="feat-list__chk"><Icon name="check" size={11} strokeWidth={2.4} /></span>دور از رطوبت و گرمای مستقیم</li>
              <li><span className="feat-list__chk"><Icon name="check" size={11} strokeWidth={2.4} /></span>نگه‌داری در جعبه‌ی برند، جدا از سایرِ زیورآلات</li>
            </ul>
          </div>
        </div>

        {/* Shipping */}
        <div className={`tab-panel ${activeTab === 'shipping' ? 'is-active' : ''}`}>
          <div>
            <h3 className="tab-panel__lead-h">
              ارسال و بازگشت <span className="en">— Shipping &amp; returns</span>
            </h3>
            <p className="tab-panel__lead-p">سفارش‌های تهران در ۴ تا ۶ ساعت با اسنپ‌باکس به‌دستِ شما می‌رسد. شهرستان‌ها از طریقِ تیپاکس یا پستِ پیشتاز در ۲۴ تا ۷۲ ساعت ارسال می‌شود. سفارش‌های بالای ۲ میلیون تومان شاملِ ارسالِ رایگان هستند.</p>
            <p className="tab-panel__lead-p">شما تا ۱۴ روز پس از دریافتِ قطعه می‌توانید آن را با بسته‌بندیِ اصلی به ما بازگردانید. هزینه‌ی بازگشت در شهرِ تهران رایگان است.</p>
          </div>
          <div>
            <h4 className="tab-panel__feat-h">
              <span className="mark"><Icon name="truck" size={13} strokeWidth={2} /></span>
              روش‌های ارسال
            </h4>
            <ul className="feat-list">
              <li><span className="feat-list__chk"><Icon name="check" size={11} strokeWidth={2.4} /></span>اسنپ‌باکس · تهران · ۴–۶ ساعت</li>
              <li><span className="feat-list__chk"><Icon name="check" size={11} strokeWidth={2.4} /></span>تیپاکس · سراسر ایران · ۲۴–۴۸ ساعت</li>
              <li><span className="feat-list__chk"><Icon name="check" size={11} strokeWidth={2.4} /></span>پستِ پیشتاز · کلِ کشور · ۴۸–۷۲ ساعت</li>
            </ul>
          </div>
        </div>

      </div>
    </section>
  )
}

export default Tabs
