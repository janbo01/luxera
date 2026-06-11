import { type FC, type ChangeEvent, useState, useRef, useEffect } from 'react'
import Icon from '../icons/Icon'
import { useAuthStore } from '../../store/authStore'
import { useWishlistStore } from '../../store/wishlistStore'
import { useCartStore } from '../../store/cartStore'
import { setCartItem } from '../../api/order'
import { toFa, normalizePhoneInput } from '../../utils/format'

interface Props {
  onClose: () => void
  message?: string
}

type Step = 'phone' | 'otp'

const OTP_LENGTH = 4

const LoginModal: FC<Props> = ({ onClose, message }) => {
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const requestOTP = useAuthStore((s) => s.requestOTP)
  const verifyOTP = useAuthStore((s) => s.verifyOTP)
  const syncWishlist = useWishlistStore((s) => s.syncFromServer)
  const localCartItems = useCartStore((s) => s.items)
  const clearLocalCart = useCartStore((s) => s.clearCart)
  const otpRefs = useRef<Array<HTMLInputElement | null>>(Array(OTP_LENGTH).fill(null))

  useEffect(() => {
    if (step === 'otp') otpRefs.current[0]?.focus()
  }, [step])

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPhone(normalizePhoneInput(e.target.value))
    setError('')
  }

  const handlePhoneSubmit = async () => {
    if (!/^9[0-9]{9}$/.test(phone)) {
      setError('شماره موبایل معتبر وارد کنید')
      return
    }
    setError('')
    setLoading(true)
    try {
      await requestOTP(phone)
      setStep('otp')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطا در ارسال کد')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = async (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return
    const next = [...otp]
    next[index] = value
    setOtp(next)
    if (value && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus()
    }
    if (next.every((d) => d !== '')) {
      setLoading(true)
      setError('')
      try {
        await verifyOTP(phone, next.join(''))
        if (localCartItems.length > 0) {
          await Promise.all(localCartItems.map((item) => setCartItem(item.id, item.qty)))
          clearLocalCart()
        }
        syncWishlist().catch(() => {})
        onClose()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'کد اشتباه است')
        setOtp(Array(OTP_LENGTH).fill(''))
        otpRefs.current[0]?.focus()
      } finally {
        setLoading(false)
      }
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-[rgba(27,15,29,.50)] backdrop-blur-[6px] z-[200] flex items-center justify-center p-6"
      onClick={onClose}
      role="dialog"
      aria-modal
      aria-label="ورود به حساب"
    >
      <div
        className="bg-surface border border-rule rounded-[var(--radius)] pt-[52px] px-10 pb-10 w-full max-w-[420px] relative text-center max-[640px]:pt-10 max-[640px]:px-5 max-[640px]:pb-7"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 left-4 text-muted p-1.5 rounded-full transition-[color,background] hover:text-ink hover:bg-plate"
          onClick={onClose}
          aria-label="بستن"
        >
          <Icon name="close" size={16} />
        </button>

        <div className="font-display italic text-[26px] font-medium tracking-[.2em] text-plum mb-1.5">
          Luxera
        </div>
        <div className="font-body text-[11px] tracking-[.12em] text-muted uppercase mb-7">
          Fine Jewelry
        </div>
        <div className="w-8 h-px bg-dust-rose mx-auto mb-6" />

        {message && (
          <p className="text-[12px] text-sale bg-sale/[.08] border border-sale/25 rounded-lg px-3 py-2 -mt-2 mb-4 text-center leading-[1.7]">
            {message}
          </p>
        )}

        <h2 className="font-heading text-[18px] font-bold text-ink m-0 mb-2">
          {step === 'phone' ? 'ورود / ثبت‌نام' : 'تأیید شماره'}
        </h2>
        <p className="text-[13px] text-muted m-0 mb-7 leading-[1.8]">
          {step === 'phone'
            ? 'با شماره موبایل وارد شوید'
            : `کد ${toFa(OTP_LENGTH)} رقمی ارسال شده به ‎+98${phone} را وارد کنید`}
        </p>

        {step === 'phone' ? (
          <div className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1.5 text-right">
              <div
                className={`flex items-stretch [direction:ltr] border rounded-[10px] overflow-hidden bg-bg transition-[border-color] duration-150 focus-within:border-ink ${error ? 'border-sale' : 'border-rule'}`}
              >
                <span className="flex items-center px-[11px] text-[13px] font-mono tracking-[0.03em] text-muted bg-surface border-r border-rule whitespace-nowrap select-none shrink-0">
                  +98
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="912 345 6789"
                  value={phone}
                  onChange={handlePhoneChange}
                  onKeyDown={(e) => e.key === 'Enter' && handlePhoneSubmit()}
                  maxLength={10}
                  autoFocus
                  className="flex-1 min-w-0 border-none outline-none bg-transparent px-[14px] py-3 text-[14px] text-ink [direction:ltr] font-mono tracking-[0.02em] placeholder:text-muted placeholder:font-body placeholder:tracking-normal"
                />
              </div>
              {error && <span className="text-[12px] text-sale text-center mt-0.5">{error}</span>}
            </div>
            <button
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-[15px] font-body font-medium tracking-[0.01em] border border-plum bg-plum text-bg rounded-full transition-all duration-200 cursor-pointer hover:bg-plum-2 hover:border-plum-2 hover:-translate-y-px w-full h-[50px]"
              onClick={handlePhoneSubmit}
              disabled={loading}
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                'دریافت کد تأیید'
              )}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3.5">
            <div className="flex gap-3 justify-center" dir="ltr">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    otpRefs.current[i] = el
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="w-16 h-[68px] text-center text-[26px] font-mono border-[1.5px] border-rule rounded-[12px] bg-bg text-plum outline-none transition-[border-color,box-shadow] font-semibold disabled:opacity-40 focus:border-plum focus:shadow-[0_0_0_3px_rgba(62,26,53,.10)] max-[640px]:w-14 max-[640px]:h-[60px] max-[640px]:text-[22px]"
                  disabled={loading}
                  dir="ltr"
                />
              ))}
            </div>
            {error && <span className="text-[12px] text-sale text-center block">{error}</span>}
            {loading && <div className="text-[13px] text-muted text-center">در حال تأیید…</div>}
            <button
              className="text-[12px] text-muted text-center mt-1 cursor-pointer transition-colors hover:text-plum bg-transparent border-0 p-0"
              onClick={() => {
                setStep('phone')
                setOtp(Array(OTP_LENGTH).fill(''))
              }}
            >
              تغییر شماره یا ارسال مجدد کد
            </button>
          </div>
        )}

        <p className="text-[11px] text-muted mt-6 leading-[1.8]">
          با ورود،{' '}
          <a
            href="#"
            className="text-plum border-b border-transparent transition-[border-color] hover:border-plum"
          >
            قوانین و مقررات لوکسرا
          </a>{' '}
          را می‌پذیرید.
        </p>
      </div>
    </div>
  )
}

export default LoginModal
