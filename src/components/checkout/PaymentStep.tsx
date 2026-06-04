import { type FC } from 'react'
import Icon from '../icons/Icon'
import { CircleCheck } from 'lucide-react'
import { formatToman } from '../../utils/format'
import type { PaymentOption } from '../../data/checkout'
import type { PaymentGateway } from '../../types'

const PAY_LOGO_STYLE: Record<string, string> = {
  zp:   'bg-[#D4F0E0] text-ok',
  sep:  'bg-[#DCE7F8] text-[#3656C9]',
  cod:  'bg-bg-2 text-ink-2',
  inst: 'bg-[#FFE4D0] text-copper',
  mock: 'bg-bg-2 text-ink-2',
}

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
  <section className="bg-surface rounded-[var(--radius)] border border-rule px-9 pt-9 pb-8 max-[640px]:px-5 max-[640px]:py-6">

    {/* Pane header */}
    <div className="flex items-end justify-between gap-4 mb-7 pb-5 border-b border-rule">
      <h2 className="font-heading text-[22px] font-semibold m-0 leading-[1.2] flex items-center gap-3">
        <span className="w-8 h-8 rounded-full bg-bg-2 grid place-items-center text-copper shrink-0 [&_svg]:w-[18px] [&_svg]:h-[18px]">
          <Icon name="card" size={18} strokeWidth={1.8} />
        </span>
        درگاهِ پرداخت
      </h2>
      <span className="flex items-center gap-1.5 text-[12px] text-muted [&_svg]:w-3 [&_svg]:h-3 [&_svg]:text-ok">
        <Icon name="shield" size={14} strokeWidth={1.8} />
        تمامِ تراکنش‌ها از طریقِ درگاهِ امن انجام می‌شود
      </span>
    </div>

    {/* Payment options */}
    <div className="grid grid-cols-2 gap-3 max-[1100px]:grid-cols-1">
      {availableOptions.map((p) => {
        const isOn = gateway === p.id
        return (
          <div
            key={p.id}
            className={`relative px-5 py-[18px] border rounded-[12px] cursor-pointer transition-all flex items-center gap-3.5 hover:border-ink-2 ${
              isOn ? 'border-ink shadow-[0_0_0_1px_var(--ink)] bg-surface-2' : 'bg-bg border-rule'
            }`}
            onClick={() => onSelectGateway(p.id)}
          >
            {/* Radio */}
            <span className={`w-[20px] h-[20px] rounded-full border-[1.5px] bg-white grid place-items-center shrink-0 transition-colors ${isOn ? 'border-ink' : 'border-rule'}`}>
              <span className={`w-[9px] h-[9px] rounded-full bg-ink transition-transform duration-150 ${isOn ? 'scale-100' : 'scale-0'}`} />
            </span>
            {/* Logo */}
            <span className={`w-[42px] h-[42px] rounded-[9px] grid place-items-center font-display italic text-[18px] font-medium shrink-0 ${PAY_LOGO_STYLE[p.logoClass] ?? 'bg-bg-2 text-ink-2'}`}>
              {p.logoChar}
            </span>
            {/* Info */}
            <span className="flex-1 flex flex-col gap-0.5 min-w-0">
              <span className="font-heading text-[15px] font-semibold flex items-center gap-2.5">
                {p.name}
                <span className="font-display italic text-[12px] text-muted font-normal">{p.en}</span>
              </span>
              <span className="text-[12px] text-muted">{p.sub}</span>
            </span>
          </div>
        )
      })}
    </div>

    {/* Trust badges */}
    <div className="grid grid-cols-4 gap-3 mt-[22px] pt-[22px] border-t border-rule max-[1100px]:grid-cols-2">
      {[
        { icon: <Icon name="shield" size={18} strokeWidth={1.8} />, title: 'پرداختِ امن', sub: 'رمزنگاری ۲۵۶ بیتی SSL' },
        { icon: <Icon name="truck" size={18} strokeWidth={1.8} />, title: 'ارسالِ تضمینی', sub: 'بیمه‌ی کاملِ مرسوله' },
        { icon: <CircleCheck size={18} strokeWidth={1.7} />, title: 'اصالتِ کالا', sub: 'گارانتی کیفیت همراهِ سفارش' },
        { icon: <Icon name="refresh" size={18} strokeWidth={1.8} />, title: '۴ روز بازگشت', sub: 'بدونِ پرسش، بدونِ هزینه' },
      ].map(({ icon, title, sub }) => (
        <div key={title} className="flex items-start gap-2.5 text-[12px] text-ink-2 leading-[1.5]">
          <span className="w-8 h-8 rounded-full bg-surface-2 grid place-items-center text-copper shrink-0 [&_svg]:w-[15px] [&_svg]:h-[15px]">
            {icon}
          </span>
          <div>
            <strong className="font-heading text-[13px] font-semibold block text-ink">{title}</strong>
            {sub}
          </div>
        </div>
      ))}
    </div>

    {payError && (
      <p className="mt-4 text-[13px] text-sale font-mono">{payError}</p>
    )}

    {/* Actions */}
    <div className="flex justify-between items-center gap-3.5 mt-7 pt-6 border-t border-rule max-[640px]:flex-col-reverse max-[640px]:items-stretch">
      <button className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full font-medium text-sm tracking-[0.01em] bg-bg-2 text-ink-2 border border-rule cursor-pointer transition-[transform,background,color,border-color,opacity] duration-200 hover:enabled:-translate-y-px hover:enabled:bg-bg hover:enabled:text-ink hover:enabled:border-ink disabled:opacity-50 disabled:cursor-not-allowed max-[640px]:justify-center" onClick={onBack} disabled={paying}>
        <Icon name="arrow-right" size={16} strokeWidth={1.8} />
        ویرایش ارسال
      </button>
      <button className="inline-flex items-center gap-2.5 px-7 py-4 rounded-full font-medium text-sm tracking-[0.01em] bg-plum text-bg border-none cursor-pointer transition-[transform,background,opacity] duration-200 hover:enabled:-translate-y-px hover:enabled:bg-plum-2 disabled:opacity-60 disabled:cursor-not-allowed max-[640px]:justify-center" onClick={onPay} disabled={paying}>
        {paying ? 'در حال پردازش…' : `پرداخت — ${formatToman(total)}`}
        {!paying && <Icon name="arrow-left" size={16} strokeWidth={1.8} />}
      </button>
    </div>

  </section>
)

export default PaymentStep
