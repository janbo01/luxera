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

const SELECT_BG = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%237A6555' stroke-width='1.8' stroke-linecap='round'><path d='m6 9 6 6 6-6'/></svg>")`

const inputCls = 'bg-bg border border-rule rounded-[10px] px-4 py-[13px] text-sm text-ink transition-all font-body w-full outline-none placeholder:text-muted placeholder:font-light focus:border-ink focus:bg-white focus:shadow-[0_0_0_4px_rgba(27,15,29,.06)]'
const selectCls = 'appearance-none bg-bg border border-rule rounded-[10px] px-4 py-[13px] pl-[38px] text-sm text-ink font-body w-full outline-none cursor-pointer bg-no-repeat bg-[position:left_14px_center] bg-[length:14px] focus:border-ink focus:bg-white focus:shadow-[0_0_0_4px_rgba(27,15,29,.06)] disabled:opacity-50'
const textareaCls = `${inputCls} resize-y min-h-24 leading-[1.7]`
const fieldCls = 'flex flex-col gap-2 min-w-0'
const labelCls = 'text-[13px] font-medium text-ink flex items-center gap-1.5'
const reqSpan = <span className="text-sale text-[14px] leading-none">*</span>
const optCls = 'font-mono text-[10px] text-muted font-normal tracking-[.04em]'

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
  <section className="bg-surface rounded-[14px] border border-rule px-9 pt-9 pb-8 max-[640px]:px-5 max-[640px]:py-6">

    {/* Pane header */}
    <div className="flex items-end justify-between gap-4 mb-7 pb-5 border-b border-rule">
      <h2 className="font-heading text-[22px] font-semibold m-0 leading-[1.2] flex items-center gap-3">
        <span className="w-8 h-8 rounded-full bg-bg-2 grid place-items-center text-copper shrink-0 [&_svg]:w-[18px] [&_svg]:h-[18px]">
          <Icon name="location" size={18} strokeWidth={1.8} />
        </span>
        آدرسِ تحویل
      </h2>
      <span className="flex items-center gap-1.5 text-[12px] text-muted [&_svg]:w-3 [&_svg]:h-3 [&_svg]:text-ok">
        <Icon name="shield" size={14} strokeWidth={1.8} />
        اطلاعات شما محرمانه می‌ماند
      </span>
    </div>

    {/* Address book */}
    <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2.5 mb-[22px] max-[1100px]:grid-cols-2 max-[640px]:grid-cols-1">
      {savedAddresses.map((adr) => {
        const isOn = selectedAdr === adr.id
        return (
          <div
            key={adr.id}
            className={`relative px-4 pt-4 pb-4 border rounded-[10px] cursor-pointer transition-[border-color,background,box-shadow] flex flex-col gap-1.5 text-right hover:border-ink-2 ${
              isOn ? 'border-ink bg-surface-2 shadow-[inset_0_0_0_1px_var(--ink)]' : 'border-rule bg-bg'
            }`}
            onClick={() => onSelectSaved(adr)}
          >
            {/* Check circle */}
            <span className={`absolute top-3 left-3 w-5 h-5 rounded-full border-[1.5px] grid place-items-center transition-all [&_svg]:w-2.5 [&_svg]:h-2.5 [&_svg]:stroke-[2.5] ${
              isOn ? 'bg-ink border-ink text-bg [&_svg]:opacity-100' : 'bg-white border-rule text-white [&_svg]:opacity-0'
            }`}>
              <Icon name="check" size={16} strokeWidth={2.5} />
            </span>
            <span className="font-mono text-[10px] tracking-[.12em] uppercase text-copper">
              {adr.label}{adr.isDefault ? ' · پیش‌فرض' : ''}
            </span>
            <span className="font-heading text-[14px] font-semibold">{adr.fullName} · {adr.phone}</span>
            <span className="text-[12px] text-ink-2 leading-[1.5] line-clamp-2">{adr.city}، {adr.street}</span>
          </div>
        )
      })}
      {/* Add new card */}
      <div
        className="relative px-4 py-4 border border-dashed border-rule rounded-[10px] bg-bg cursor-pointer grid place-items-center text-muted text-center gap-1.5 hover:border-ink-2 transition-colors"
        onClick={onAddNew}
      >
        <span className="w-8 h-8 rounded-full bg-bg-2 grid place-items-center text-ink [&_svg]:w-4 [&_svg]:h-4">
          <Icon name="plus" size={18} strokeWidth={1.8} />
        </span>
        <span className="text-[13px] font-medium text-ink-2">افزودنِ آدرسِ جدید</span>
      </div>
    </div>

    {/* Divider */}
    <div className="flex items-center gap-3.5 my-[22px] font-mono text-[11px] tracking-[.18em] uppercase text-muted before:content-[''] before:flex-1 before:h-px before:bg-rule after:content-[''] after:flex-1 after:h-px after:bg-rule">
      یا اطلاعات جدید را وارد کنید
    </div>

    {/* Form grid */}
    <div className="grid grid-cols-2 gap-[18px] max-[1100px]:grid-cols-1">

      {/* Label (optional) */}
      <div className={`${fieldCls} col-span-full`}>
        <label htmlFor="addr-label" className={labelCls}>
          برچسب <span className={optCls}>(اختیاری)</span>
        </label>
        <div className="relative">
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none [&_svg]:w-4 [&_svg]:h-4">
            <Icon name="tag" size={16} strokeWidth={1.8} />
          </span>
          <input id="addr-label" name="label" className={`${inputCls} pr-[42px]`}
            value={addr.label} onChange={onAddrChange} placeholder="مثلاً: خانه، محل کار، انبار…" />
        </div>
      </div>

      {/* Full name */}
      <div className={fieldCls}>
        <label htmlFor="addr-name" className={labelCls}>
          نام و نام خانوادگی {reqSpan}
        </label>
        <div className="relative">
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none [&_svg]:w-4 [&_svg]:h-4">
            <Icon name="user" size={16} strokeWidth={1.8} />
          </span>
          <input id="addr-name" name="name" className={`${inputCls} pr-[42px]`}
            value={addr.name} onChange={onAddrChange} placeholder="مثلاً سارا محمدی" />
        </div>
      </div>

      <div className={fieldCls}>
        <label htmlFor="addr-phone" className={labelCls}>
          شماره‌ی موبایل {reqSpan}
        </label>
        <div className="flex items-stretch [direction:ltr] border border-rule rounded-[10px] overflow-hidden bg-bg transition-[border-color] duration-150 focus-within:border-ink">
          <span className="flex items-center px-[11px] text-[13px] font-mono tracking-[0.03em] text-muted bg-surface border-r border-rule whitespace-nowrap select-none shrink-0">+98</span>
          <input
            id="addr-phone" name="phone" type="tel" inputMode="numeric"
            dir="ltr" placeholder="912 345 6789"
            value={toLocalPhone(addr.phone)} onChange={handlePhoneChange}
            maxLength={10}
            className="flex-1 min-w-0 border-none outline-none bg-transparent px-[14px] py-3 text-[14px] text-ink [direction:ltr] font-mono tracking-[0.02em] placeholder:text-muted placeholder:font-body placeholder:tracking-normal"
          />
        </div>
        {addr.phone && (
          <span className="flex items-center gap-1.5 text-[11px] text-ok font-mono tracking-[.04em] -mt-0.5 [&_svg]:w-3 [&_svg]:h-3">
            <Icon name="check" size={12} strokeWidth={2} />
            با ایرانسل تأیید شد
          </span>
        )}
      </div>

      {/* Province */}
      <div className={fieldCls}>
        <label htmlFor="addr-province" className={labelCls}>استان {reqSpan}</label>
        <select id="addr-province" name="province" className={selectCls}
          style={{ backgroundImage: SELECT_BG }}
          value={addr.province} onChange={onAddrChange}>
          <option value="">انتخاب استان</option>
          {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* City */}
      <div className={fieldCls}>
        <label htmlFor="addr-city" className={labelCls}>شهر {reqSpan}</label>
        <select id="addr-city" name="city" className={selectCls}
          style={{ backgroundImage: SELECT_BG }}
          value={addr.city} onChange={onAddrChange} disabled={!addr.province}>
          <option value="">{addr.province ? 'انتخاب شهر' : 'ابتدا استان را انتخاب کنید'}</option>
          {(CITIES_BY_PROVINCE[addr.province] ?? []).map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Street */}
      <div className={`${fieldCls} col-span-full`}>
        <label htmlFor="addr-street" className={labelCls}>آدرسِ دقیق {reqSpan}</label>
        <textarea id="addr-street" name="street" className={textareaCls}
          value={addr.street} onChange={onAddrChange}
          placeholder="خیابان، کوچه، پلاک، واحد" />
      </div>

      {/* Postal code */}
      <div className={fieldCls}>
        <label htmlFor="addr-postal" className={labelCls}>
          کد پستی {reqSpan}
          <span className={optCls}>(۱۰ رقم)</span>
        </label>
        <div className="relative">
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none [&_svg]:w-4 [&_svg]:h-4">
            <Icon name="mail" size={16} strokeWidth={1.8} />
          </span>
          <input id="addr-postal" name="postal" className={`${inputCls} pr-[42px]`}
            value={addr.postal} onChange={onAddrChange}
            placeholder="۱۴۳۴۹۸۷۶۵۴" maxLength={10} dir="ltr" />
        </div>
      </div>

      {/* Order notes */}
      <div className={`${fieldCls} col-span-full`}>
        <label htmlFor="order-notes" className={labelCls}>
          یادداشتِ سفارش <span className={optCls}>(اختیاری)</span>
        </label>
        <textarea id="order-notes" className={textareaCls}
          value={orderNotes}
          onChange={(e) => onNotesChange(e.target.value.slice(0, 300))}
          placeholder="مثلاً: تماس قبل از تحویل، رنگ دلخواه بسته‌بندی…" />
        <div className="font-mono text-[10px] text-muted text-left mt-1 tracking-[.04em]">
          {toFa(orderNotes.length)} / ۳۰۰
        </div>
      </div>
    </div>

    {/* Actions */}
    <div className="flex justify-between items-center gap-3.5 mt-7 pt-6 border-t border-rule max-[640px]:flex-col-reverse max-[640px]:items-stretch">
      <div className="flex items-center gap-3.5 text-[12px] text-muted [&_svg]:w-3.5 [&_svg]:h-3.5 [&_svg]:text-ok">
        <Icon name="shield" size={14} strokeWidth={1.8} />
        ذخیره به‌عنوان آدرس پیش‌فرض
      </div>
      <button className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full font-medium text-sm tracking-[0.01em] bg-ink text-bg border-none cursor-pointer transition-[transform,background,color,border-color,opacity] duration-200 hover:enabled:-translate-y-px hover:enabled:bg-plum disabled:opacity-50 disabled:cursor-not-allowed max-[640px]:justify-center" disabled={!addrValid} onClick={onNext}>
        ادامه — روش ارسال
        <Icon name="arrow-left" size={16} strokeWidth={1.8} />
      </button>
    </div>

  </section>
  )
}

export default AddressStep
