import { type FC, type ChangeEvent, useCallback } from 'react'
import Icon from '../icons/Icon'
import { toFa, normalizePhoneInput, toLocalPhone } from '../../utils/format'
import { PROVINCES, CITIES_BY_PROVINCE } from '../../data/locations'
import type { AddressForm, Address } from '../../types'

interface AddressStepProps {
  addr: AddressForm
  savedAddresses: Address[]
  selectedAdr: string | null
  orderNotes: string
  addrValid: boolean
  onSelectSaved: (adr: Address) => void
  onAddNew: () => void
  onAddrChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
  onNotesChange: (v: string) => void
  onNext: () => void
}

const AddressStep: FC<AddressStepProps> = ({
  addr,
  savedAddresses,
  selectedAdr,
  orderNotes,
  addrValid,
  onSelectSaved,
  onAddNew,
  onAddrChange,
  onNotesChange,
  onNext,
}) => {
  const handlePhoneChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const syntheticEvent = { ...e, target: { ...e.target, name: 'phone', value: normalizePhoneInput(e.target.value) } } as ChangeEvent<HTMLInputElement>
    onAddrChange(syntheticEvent)
  }, [onAddrChange])

  return (
  <section className="co-pane active">
    <div className="co-pane-head">
      <h2>
        <span className="co-pane-head__ic"><Icon name="location" size={18} strokeWidth={1.8} /></span>
        آدرسِ تحویل
      </h2>
      <span className="co-pane-head__hint">
        <Icon name="shield" size={14} strokeWidth={1.8} />
        اطلاعات شما محرمانه می‌ماند
      </span>
    </div>

    {/* Address book */}
    <div className="adr-book">
      {savedAddresses.map((adr) => (
        <div
          key={adr.id}
          className={`adr-card${selectedAdr === adr.id ? ' on' : ''}`}
          onClick={() => onSelectSaved(adr)}
        >
          <span className="adr-card__check">
            <Icon name="check" size={16} strokeWidth={2.5} />
          </span>
          <span className="adr-card__tag">{adr.label}{adr.isDefault ? ' · پیش‌فرض' : ''}</span>
          <span className="adr-card__who">{adr.fullName} · {adr.phone}</span>
          <span className="adr-card__where">{adr.city}، {adr.street}</span>
        </div>
      ))}
      <div className="adr-card add" onClick={onAddNew}>
        <span className="adr-card__add-ic"><Icon name="plus" size={18} strokeWidth={1.8} /></span>
        <span className="adr-card__add-lbl">افزودنِ آدرسِ جدید</span>
      </div>
    </div>

    <div className="book-divider">یا اطلاعات جدید را وارد کنید</div>

    <div className="co-form-grid">
      <div className="co-field full">
        <label htmlFor="addr-label">برچسب <span className="opt">(اختیاری)</span></label>
        <div className="co-wrap">
          <span className="ic"><Icon name="tag" size={16} strokeWidth={1.8} /></span>
          <input id="addr-label" name="label" className="co-input with-ic"
            value={addr.label} onChange={onAddrChange} placeholder="مثلاً: خانه، محل کار، انبار…" />
        </div>
      </div>

      <div className="co-field">
        <label htmlFor="addr-name">نام و نام خانوادگی <span className="req">*</span></label>
        <div className="co-wrap">
          <span className="ic"><Icon name="user" size={16} strokeWidth={1.8} /></span>
          <input id="addr-name" name="name" className="co-input with-ic"
            value={addr.name} onChange={onAddrChange} placeholder="مثلاً سارا محمدی" />
        </div>
      </div>

      <div className="co-field">
        <label htmlFor="addr-phone">شماره‌ی موبایل <span className="req">*</span></label>
        <div className="phone-field">
          <span className="phone-field__prefix">+98</span>
          <input
            id="addr-phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            dir="ltr"
            placeholder="912 345 6789"
            value={toLocalPhone(addr.phone)}
            onChange={handlePhoneChange}
            maxLength={10}
            className="phone-field__input"
          />
        </div>
        {addr.phone && (
          <span className="co-help ok">
            <Icon name="check" size={12} strokeWidth={2} />
            با ایرانسل تأیید شد
          </span>
        )}
      </div>

      <div className="co-field">
        <label htmlFor="addr-province">استان <span className="req">*</span></label>
        <select id="addr-province" name="province" className="co-select"
          value={addr.province} onChange={onAddrChange}>
          <option value="">انتخاب استان</option>
          {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div className="co-field">
        <label htmlFor="addr-city">شهر <span className="req">*</span></label>
        <select id="addr-city" name="city" className="co-select"
          value={addr.city} onChange={onAddrChange} disabled={!addr.province}>
          <option value="">{addr.province ? 'انتخاب شهر' : 'ابتدا استان را انتخاب کنید'}</option>
          {(CITIES_BY_PROVINCE[addr.province] ?? []).map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="co-field full">
        <label htmlFor="addr-street">آدرسِ دقیق <span className="req">*</span></label>
        <textarea id="addr-street" name="street" className="co-textarea"
          value={addr.street} onChange={onAddrChange}
          placeholder="خیابان، کوچه، پلاک، واحد" />
      </div>

      <div className="co-field">
        <label htmlFor="addr-postal">
          کد پستی <span className="req">*</span>
          <span className="opt">(۱۰ رقم)</span>
        </label>
        <div className="co-wrap">
          <span className="ic"><Icon name="mail" size={16} strokeWidth={1.8} /></span>
          <input id="addr-postal" name="postal" className="co-input with-ic"
            value={addr.postal} onChange={onAddrChange}
            placeholder="۱۴۳۴۹۸۷۶۵۴" maxLength={10} dir="ltr" />
        </div>
      </div>

      <div className="co-field full">
        <label htmlFor="order-notes">
          یادداشتِ سفارش <span className="opt">(اختیاری)</span>
        </label>
        <textarea id="order-notes" className="co-textarea"
          value={orderNotes}
          onChange={(e) => onNotesChange(e.target.value.slice(0, 300))}
          placeholder="مثلاً: تماس قبل از تحویل، رنگ دلخواه بسته‌بندی…" />
        <div className="co-count">{toFa(orderNotes.length)} / ۳۰۰</div>
      </div>
    </div>

    <div className="co-pane-actions">
      <div className="co-pane-actions__left">
        <Icon name="shield" size={14} strokeWidth={1.8} />
        ذخیره به‌عنوان آدرس پیش‌فرض
      </div>
      <button className="co-btn co-btn--primary" disabled={!addrValid} onClick={onNext}>
        ادامه — روش ارسال
        <Icon name="arrow-left" size={16} strokeWidth={1.8} />
      </button>
    </div>
  </section>
  )
}

export default AddressStep
