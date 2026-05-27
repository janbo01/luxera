import { type FC } from 'react'
import Icon from '../icons/Icon'
import { CircleCheck } from 'lucide-react'
import { formatToman } from '../../utils/format'
import type { PaymentOption } from '../../data/checkout'
import type { PaymentGateway } from '../../types'

interface PaymentStepProps {
  gateway: PaymentGateway
  availableOptions: PaymentOption[]
  total: number
  paying?: boolean
  payError?: string
  onSelectGateway: (id: PaymentGateway) => void
  onBack: () => void
  onPay: () => void
}

const PaymentStep: FC<PaymentStepProps> = ({
  gateway,
  availableOptions,
  total,
  paying = false,
  payError,
  onSelectGateway,
  onBack,
  onPay,
}) => (
  <section className="co-pane active">
    <div className="co-pane-head">
      <h2>
        <span className="co-pane-head__ic"><Icon name="card" size={18} strokeWidth={1.8} /></span>
        درگاهِ پرداخت
      </h2>
      <span className="co-pane-head__hint">
        <Icon name="shield" size={14} strokeWidth={1.8} />
        تمامِ تراکنش‌ها از طریقِ درگاهِ امن انجام می‌شود
      </span>
    </div>

    <div className="co-pay-list">
      {availableOptions.map((p) => (
        <div
          key={p.id}
          className={`co-pay${gateway === p.id ? ' on' : ''}`}
          onClick={() => onSelectGateway(p.id)}
        >
          <span className="co-pay-radio" />
          <span className={`co-pay-logo ${p.logoClass}`}>{p.logoChar}</span>
          <span className="co-pay-info">
            <span className="co-pay-name">{p.name} <span className="en">{p.en}</span></span>
            <span className="co-pay-sub">{p.sub}</span>
          </span>
        </div>
      ))}
    </div>

    <div className="co-trust-row">
      <div className="co-trust-item">
        <span className="ic"><Icon name="shield" size={18} strokeWidth={1.8} /></span>
        <div><strong>پرداختِ امن</strong>رمزنگاری ۲۵۶ بیتی SSL</div>
      </div>
      <div className="co-trust-item">
        <span className="ic"><Icon name="truck" size={18} strokeWidth={1.8} /></span>
        <div><strong>ارسالِ تضمینی</strong>بیمه‌ی کاملِ مرسوله</div>
      </div>
      <div className="co-trust-item">
        <span className="ic">
          <CircleCheck size={18} strokeWidth={1.7} />
        </span>
        <div><strong>اصالتِ کالا</strong>گارانتی کیفیت همراهِ سفارش</div>
      </div>
      <div className="co-trust-item">
        <span className="ic"><Icon name="refresh" size={18} strokeWidth={1.8} /></span>
        <div><strong>۱۴ روز بازگشت</strong>بدونِ پرسش، بدونِ هزینه</div>
      </div>
    </div>

    {payError && <p className="co-pay-error">{payError}</p>}

    <div className="co-pane-actions">
      <button className="co-btn co-btn--mute" onClick={onBack} disabled={paying}>
        <Icon name="arrow-right" size={16} strokeWidth={1.8} />
        ویرایش ارسال
      </button>
      <button className="co-btn co-btn--pay" onClick={onPay} disabled={paying}>
        {paying ? 'در حال پردازش…' : `پرداخت — ${formatToman(total)}`}
        {!paying && <Icon name="arrow-left" size={16} strokeWidth={1.8} />}
      </button>
    </div>
  </section>
)

export default PaymentStep
