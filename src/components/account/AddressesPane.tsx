import { type FC, useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { toFa } from '../../utils/format'
import type { Address } from '../../types'
import { Modal } from '../ui/Modal'
import { PROVINCES, CITIES_BY_PROVINCE } from '../../data/locations'
import {
  BTN_MUTE,
  BTN_PRIMARY,
  BTN_SM,
  CARD,
  F_FIELD,
  F_LABEL,
  IC_SECT,
  INPUT_CLS,
  IcoCard,
  IcoEdit,
  IcoHome,
  IcoOffice,
  IcoPhone,
  IcoPin,
  IcoPlus,
  IcoStar,
  IcoTrash,
  SECTION_H,
  SELECT_BG,
  SELECT_CLS,
} from './shared'

interface AddressModalProps {
  initial?: Address
  onClose: () => void
}

const AddressModal: FC<AddressModalProps> = ({ initial, onClose }) => {
  const { addAddress, updateAddress } = useAuthStore()
  const [form, setForm] = useState({
    label: initial?.label ?? 'خانه',
    fullName: initial?.fullName ?? '',
    phone: initial?.phone ?? '',
    province: initial?.province ?? '',
    city: initial?.city ?? '',
    street: initial?.street ?? '',
    postalCode: initial?.postalCode ?? '',
    isDefault: initial?.isDefault ?? false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const isEdit = !!initial

  const handleSubmit = async () => {
    if (!form.fullName.trim()) {
      setError('نام گیرنده الزامی است')
      return
    }
    if (!form.phone.trim()) {
      setError('شماره تماس الزامی است')
      return
    }
    if (!form.province) {
      setError('استان را انتخاب کنید')
      return
    }
    if (!form.city.trim()) {
      setError('شهر الزامی است')
      return
    }
    if (!form.street.trim()) {
      setError('آدرس الزامی است')
      return
    }
    if (!form.postalCode.trim()) {
      setError('کد پستی الزامی است')
      return
    }
    setLoading(true)
    setError('')
    try {
      if (isEdit) await updateAddress(initial!.id, form)
      else await addAddress(form)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطا در ذخیره‌ی آدرس')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal onClose={onClose} ariaLabel={isEdit ? 'ویرایش آدرس' : 'آدرسِ جدید'}>
      <div className="flex flex-col">
        {/* Head */}
        <div className="flex items-center justify-between px-6 py-5 pb-[18px] border-b border-rule">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-sm bg-copper/[.12] grid place-items-center text-copper shrink-0 [&_svg]:w-[15px] [&_svg]:h-[15px]">
              <IcoPin />
            </span>
            <h2 className="m-0 text-[15px] font-heading font-bold text-ink">
              {isEdit ? 'ویرایشِ آدرس' : 'آدرسِ جدید'}
            </h2>
          </div>
          <button
            className="w-[30px] h-[30px] rounded-lg bg-transparent cursor-pointer text-muted text-[13px] grid place-items-center transition-[background,color] hover:bg-bg-2 hover:text-ink"
            onClick={onClose}
            aria-label="بستن"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto max-h-[calc(90vh-148px)] flex flex-col gap-[22px]">
          <div className={F_FIELD}>
            <label className={F_LABEL}>
              برچسب{' '}
              <span className="mr-auto font-mono text-[12px] text-muted font-normal">
                (اختیاری)
              </span>
            </label>
            <input
              className={INPUT_CLS}
              value={form.label}
              placeholder="مثلاً: خانه، محل کار، انبار…"
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
            />
          </div>

          <div className="flex flex-col gap-2.5">
            <p className="m-0 text-[13px] text-muted font-medium">اطلاعاتِ گیرنده</p>
            <div className="grid grid-cols-2 gap-[18px]">
              <div className={F_FIELD}>
                <label className={F_LABEL}>
                  نام گیرنده <span className="text-sale">*</span>
                </label>
                <input
                  className={INPUT_CLS}
                  value={form.fullName}
                  placeholder="مثال: زهرا رضایی"
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                />
              </div>
              <div className={F_FIELD}>
                <label className={F_LABEL}>
                  شماره تماس <span className="text-sale">*</span>
                </label>
                <input
                  className={INPUT_CLS}
                  dir="ltr"
                  value={form.phone}
                  placeholder="09123456789"
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <p className="m-0 text-[13px] text-muted font-medium">آدرس</p>
            <div className="grid grid-cols-2 gap-[18px]">
              <div className={F_FIELD}>
                <label className={F_LABEL}>
                  استان <span className="text-sale">*</span>
                </label>
                <select
                  className={SELECT_CLS}
                  style={{ backgroundImage: SELECT_BG }}
                  value={form.province}
                  onChange={(e) => setForm((f) => ({ ...f, province: e.target.value, city: '' }))}
                >
                  <option value="">انتخاب کنید</option>
                  {PROVINCES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div className={F_FIELD}>
                <label className={F_LABEL}>
                  شهر <span className="text-sale">*</span>
                </label>
                <select
                  className={SELECT_CLS}
                  style={{ backgroundImage: SELECT_BG }}
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  disabled={!form.province}
                >
                  <option value="">
                    {form.province ? 'انتخاب شهر' : 'ابتدا استان را انتخاب کنید'}
                  </option>
                  {(CITIES_BY_PROVINCE[form.province] ?? []).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className={`${F_FIELD} col-span-2`}>
                <label className={F_LABEL}>
                  آدرس کامل <span className="text-sale">*</span>
                </label>
                <input
                  className={INPUT_CLS}
                  value={form.street}
                  placeholder="خیابان، کوچه، پلاک، واحد"
                  onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))}
                />
              </div>
              <div className={F_FIELD}>
                <label className={F_LABEL}>
                  کد پستی <span className="text-sale">*</span>
                </label>
                <input
                  className={INPUT_CLS}
                  dir="ltr"
                  value={form.postalCode}
                  placeholder="1234567890"
                  maxLength={10}
                  onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Default toggle */}
          <label
            className={`flex items-center gap-2.5 cursor-pointer py-3 px-3.5 rounded-sm border-[1.5px] transition-[border-color,background] select-none ${form.isDefault ? 'border-ink bg-surface' : 'border-rule bg-bg'}`}
          >
            <input
              type="checkbox"
              className="sr-only"
              checked={form.isDefault}
              onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
            />
            <span
              className={`w-[18px] h-[18px] rounded-xs border-[1.5px] shrink-0 grid place-items-center transition-all ${form.isDefault ? 'border-ink bg-ink' : 'border-rule bg-bg'}`}
            >
              <span
                className={`w-[9px] h-[9px] rounded-xs transition-colors ${form.isDefault ? 'bg-bg' : 'bg-transparent'}`}
              />
            </span>
            <span className="text-[13px] text-ink-2">تنظیم به‌عنوانِ آدرسِ پیش‌فرض</span>
          </label>

          {error && <p className="m-0 text-sale text-[13px]">{error}</p>}
        </div>

        {/* Foot */}
        <div className="flex gap-2 flex-row-reverse justify-start px-6 py-4 border-t border-rule">
          <button className={`${BTN_MUTE} ${BTN_SM}`} onClick={onClose} disabled={loading}>
            لغو
          </button>
          <button className={`${BTN_PRIMARY} ${BTN_SM}`} onClick={handleSubmit} disabled={loading}>
            {loading ? '...' : isEdit ? 'ذخیره‌ی تغییرات' : 'افزودنِ آدرس'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Addresses Pane ───────────────────────────────────────────────────────────
const AddressesPane: FC = () => {
  const { addresses, removeAddress, setDefaultAddress } = useAuthStore()
  const [modal, setModal] = useState<{ open: boolean; address?: Address }>({ open: false })

  const addrIcon = (label: string) => {
    if (label?.includes('کار') || label?.includes('office')) return <IcoOffice />
    return <IcoHome />
  }

  return (
    <div className="flex flex-col gap-[18px]">
      {modal.open && (
        <AddressModal initial={modal.address} onClose={() => setModal({ open: false })} />
      )}
      <div className={CARD}>
        <div className={`${SECTION_H} flex justify-between items-end border-b-0`}>
          <div>
            <h2 className="font-heading text-[18px] font-semibold m-0 flex items-center gap-3">
              <span className={IC_SECT}>
                <IcoPin />
              </span>{' '}
              آدرس‌های من
            </h2>
            <p className="m-0 mt-1.5 text-[13px] text-muted mr-11">
              برای ارسالِ سریع‌تر، می‌توانید چند آدرس ذخیره کنید.
            </p>
          </div>
          <button
            className={`${BTN_PRIMARY} ${BTN_SM} [&_svg]:w-[14px] [&_svg]:h-[14px]`}
            onClick={() => setModal({ open: true })}
          >
            <IcoPlus /> آدرسِ جدید
          </button>
        </div>
        <div className="px-7 py-2 pb-7 max-[640px]:p-4">
          <div className="grid grid-cols-2 gap-3.5 max-[640px]:grid-cols-1">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`relative p-[22px] bg-surface border rounded-[var(--radius)] flex flex-col gap-3.5 transition-[border-color,box-shadow] ${
                  addr.isDefault
                    ? 'border-ink shadow-[inset_0_0_0_1px_var(--color-ink)]'
                    : 'border-rule'
                }`}
              >
                <div className="flex items-center justify-between gap-2.5">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-[5px] rounded-full text-[12px] font-medium [&_svg]:w-[11px] [&_svg]:h-[11px] ${
                      addr.isDefault ? 'bg-ink text-bg' : 'bg-bg-2 text-ink-2'
                    }`}
                  >
                    {addrIcon(addr.label)} {addr.label}
                  </span>
                  {addr.isDefault && (
                    <span className="inline-flex items-center gap-[5px] px-2.5 py-1 bg-copper/[.12] text-copper rounded-full text-[13px] [&_svg]:w-2.5 [&_svg]:h-2.5">
                      <IcoStar /> پیش‌فرض
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="font-heading text-[15px] font-semibold flex items-center gap-2">
                    <span className="text-copper inline-grid place-items-center [&_svg]:w-3.5 [&_svg]:h-3.5">
                      <IcoPin />
                    </span>
                    {addr.fullName}
                  </div>
                  <div className="text-[13px] text-ink-2 leading-[1.7]">
                    {addr.province}، {addr.city}، {addr.street}
                  </div>
                  <div className="flex gap-2.5 flex-wrap text-[13px] text-muted pt-1.5 border-t border-dashed border-rule">
                    <span
                      className="inline-flex items-center gap-1.5 font-mono [&_svg]:w-[11px] [&_svg]:h-[11px]"
                      dir="ltr"
                    >
                      <IcoPhone />
                      {toFa(addr.phone)}
                    </span>
                    <span
                      className="inline-flex items-center gap-1.5 font-mono [&_svg]:w-[11px] [&_svg]:h-[11px]"
                      dir="ltr"
                    >
                      <IcoCard />
                      {toFa(addr.postalCode)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center gap-2.5 pt-3 border-t border-rule">
                  {addr.isDefault ? (
                    <button className="text-[13px] text-copper bg-transparent border-0 p-[7px_0] cursor-default opacity-45 font-body">
                      آدرسِ پیش‌فرض
                    </button>
                  ) : (
                    <button
                      className="text-[13px] text-copper bg-transparent border-0 p-[7px_0] cursor-pointer font-body hover:underline hover:underline-offset-[3px]"
                      onClick={() => setDefaultAddress(addr.id)}
                    >
                      تنظیم به‌عنوانِ پیش‌فرض
                    </button>
                  )}
                  <div className="flex gap-1.5">
                    <button
                      className="inline-flex items-center gap-1.5 px-3 py-[7px] rounded-lg text-[13px] bg-bg text-ink-2 border border-rule transition-all cursor-pointer font-body hover:bg-ink hover:text-bg hover:border-ink [&_svg]:w-3 [&_svg]:h-3"
                      onClick={() => setModal({ open: true, address: addr })}
                    >
                      <IcoEdit />
                      ویرایش
                    </button>
                    <button
                      className="inline-flex items-center gap-1.5 px-3 py-[7px] rounded-lg text-[13px] bg-bg text-ink-2 border border-rule transition-all cursor-pointer font-body hover:bg-sale hover:text-white hover:border-sale [&_svg]:w-3 [&_svg]:h-3"
                      onClick={() => removeAddress(addr.id)}
                    >
                      <IcoTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button
              className="flex items-center justify-center gap-2.5 flex-col border-[1.5px] border-dashed border-rule bg-transparent cursor-pointer min-h-[240px] transition-all text-ink-2 rounded-[var(--radius)] font-body hover:border-ink hover:bg-surface"
              onClick={() => setModal({ open: true })}
            >
              <span className="w-12 h-12 rounded-full bg-bg-2 grid place-items-center text-copper [&_svg]:w-5 [&_svg]:h-5">
                <IcoPlus />
              </span>
              <span className="font-heading text-sm font-semibold">افزودنِ آدرسِ جدید</span>
              <span className="text-[13px] text-muted">می‌توانید تا ۵ آدرس داشته باشید</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddressesPane
