import { useState, useRef } from 'react'
import { subscribeStockNotification } from '../../api/product'
import { toE164 } from '../../api/user'
import { normalizePhoneInput } from '../../utils/format'
import Icon from '../icons/Icon'

interface StockNotifyFormProps {
  productId: string
}

export function StockNotifyForm({ productId }: StockNotifyFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const phoneRef = useRef<HTMLInputElement>(null)

  const open = () => {
    setIsOpen(true)
    setTimeout(() => phoneRef.current?.focus(), 50)
  }

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (!/^9\d{9}$/.test(phone)) {
      setError('شماره موبایل معتبر نیست')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await subscribeStockNotification(productId, toE164(phone))
      setDone(true)
    } catch {
      setError('خطا در ثبت درخواست')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <p
        className="text-center text-[14px] text-plum font-medium p-3.5 border border-rule animate-[luxera-rise_300ms_cubic-bezier(.2,.7,.2,1)_both] m-0"
        role="status"
      >
        ✓ اطلاع خواهیم داد!
      </p>
    )
  }

  if (!isOpen) {
    return (
      <button
        className="w-full flex items-center justify-center gap-2 border border-rule rounded-[10px] py-3.5 text-[14px] font-body text-muted cursor-pointer transition-all duration-200 hover:border-plum hover:text-plum"
        onClick={open}
      >
        <Icon name="bag" size={16} />
        اطلاع‌رسانی وقتی موجود شد
      </button>
    )
  }

  return (
    <form
      className="p-4 bg-surface border border-rule rounded-[10px] flex flex-col gap-2.5"
      id="notify-form"
      onSubmit={handleSubmit}
      noValidate
    >
      <p className="text-[13px] text-muted m-0">شماره موبایل را وارد کنید تا اطلاع دهیم</p>
      <div className="flex gap-2 items-stretch">
        <div className="flex-1 flex items-center border border-rule rounded-[8px] bg-surface overflow-hidden focus-within:border-ink transition-colors duration-200">
          <span className="px-3 text-[13px] font-mono text-muted border-e border-rule self-stretch flex items-center">
            +98
          </span>
          <input
            ref={phoneRef}
            type="tel"
            inputMode="numeric"
            placeholder="912 345 6789"
            value={phone}
            onChange={(e) => setPhone(normalizePhoneInput(e.target.value))}
            className="flex-1 px-3 py-2.5 font-body text-[14px] text-ink bg-transparent outline-none placeholder:text-muted"
            aria-label="شماره موبایل"
            aria-invalid={!!error}
            maxLength={10}
          />
        </div>
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-[18px] py-2.5 text-xs font-medium tracking-[0.01em] border border-ink bg-ink text-bg rounded-full transition-all duration-200 hover:bg-plum hover:border-plum"
          disabled={submitting}
        >
          {submitting ? '...' : 'ثبت'}
        </button>
      </div>
      {error && <p className="text-[12px] text-sale m-0">{error}</p>}
      <button
        type="button"
        className="text-[12px] text-muted self-start hover:text-ink transition-colors duration-200"
        onClick={() => {
          setIsOpen(false)
          setError('')
        }}
      >
        × انصراف
      </button>
    </form>
  )
}
