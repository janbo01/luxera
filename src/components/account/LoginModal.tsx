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
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal aria-label="ورود به حساب">
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        <button className="login-modal__close" onClick={onClose} aria-label="بستن">
          <Icon name="close" size={16} />
        </button>

        <div className="login-modal__brand">Luxera</div>
        <div className="login-modal__brand-tag">Fine Jewelry</div>
        <div className="login-modal__divider" />
        {message && <p className="login-modal__notice">{message}</p>}
        <h2 className="login-modal__title">
          {step === 'phone' ? 'ورود / ثبت‌نام' : 'تأیید شماره'}
        </h2>
        <p className="login-modal__sub">
          {step === 'phone'
            ? 'با شماره موبایل وارد شوید'
            : `کد ${toFa(OTP_LENGTH)} رقمی ارسال شده به ‎+98${phone} را وارد کنید`}
        </p>

        {step === 'phone' ? (
          <div className="login-modal__form">
            <div className={`login-modal__field${error ? ' is-error' : ''}`}>
              <div className="phone-field">
                <span className="phone-field__prefix">+98</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="912 345 6789"
                  value={phone}
                  onChange={handlePhoneChange}
                  onKeyDown={(e) => e.key === 'Enter' && handlePhoneSubmit()}
                  maxLength={10}
                  autoFocus
                  className="phone-field__input"
                />
              </div>
              {error && <span className="login-modal__error">{error}</span>}
            </div>
            <button
              className="btn login-modal__btn"
              onClick={handlePhoneSubmit}
              disabled={loading}
            >
              {loading ? <span className="spinner" /> : 'دریافت کد تأیید'}
            </button>
          </div>
        ) : (
          <div className="login-modal__form">
            <div className="login-modal__otp">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="login-modal__otp-cell"
                  disabled={loading}
                  dir="ltr"
                />
              ))}
            </div>
            {error && <span className="login-modal__error" style={{ textAlign: 'center', display: 'block' }}>{error}</span>}
            {loading && <div className="login-modal__verifying">در حال تأیید…</div>}
            <button
              className="btn--link login-modal__resend"
              onClick={() => { setStep('phone'); setOtp(Array(OTP_LENGTH).fill('')) }}
            >
              تغییر شماره یا ارسال مجدد کد
            </button>
          </div>
        )}

        <p className="login-modal__terms">
          با ورود، <a href="#">قوانین و مقررات لوکسرا</a> را می‌پذیرید.
        </p>
      </div>
    </div>
  )
}

export default LoginModal
