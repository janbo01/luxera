import { usePageMeta } from '../hooks/usePageMeta'
import { type FC, useState, useEffect, useMemo, useRef } from 'react'
import { useAuthStore } from '../store/authStore'
import { useWishlistStore } from '../store/wishlistStore'
import { useCartStore } from '../store/cartStore'
import { formatToman, toFa } from '../utils/format'
import type { Order, OrderStatus, Address } from '../types'
import { Modal } from '../components/ui/Modal'
import { PROVINCES, CITIES_BY_PROVINCE } from '../data/locations'
import purplePickerCSS from 'react-multi-date-picker/styles/colors/purple.css?inline'
import DatePicker from 'react-multi-date-picker'
import type { DateObject } from 'react-multi-date-picker'
import persian from 'react-date-object/calendars/persian'
import persian_fa from 'react-date-object/locales/persian_fa'
import {
  LayoutGrid, User, ShoppingBag, MapPin, Heart, CreditCard, Lock,
  LogOut, Star, Truck, Check, ChevronDown, ArrowRight, Search,
  Clock, Plus, Pencil, Trash2, Home, Building2, Copy, RefreshCw,
  FileText, Bell, Mail, Phone, Zap, Info,
} from 'lucide-react'
import { IconWhatsApp } from '../components/icons/BrandIcons'

type Tab = 'overview' | 'profile' | 'orders' | 'addresses' | 'wishlist' | 'security'

const STATUS_PILL: Record<OrderStatus, string> = {
  pending: 'proc', processing: 'proc', shipped: 'shipped', delivered: 'deliv', cancelled: 'cancel',
}
const STATUS_FA: Record<OrderStatus, string> = {
  pending: 'در انتظار', processing: 'در حالِ آماده‌سازی', shipped: 'در راه', delivered: 'تحویل شد', cancelled: 'لغو شده',
}
const TIMELINE_STEPS: Record<OrderStatus, string[]> = {
  pending: ['ثبتِ سفارش'],
  processing: ['ثبتِ سفارش', 'آماده‌سازی'],
  shipped: ['ثبتِ سفارش', 'آماده‌سازی', 'ارسال شد'],
  delivered: ['ثبتِ سفارش', 'آماده‌سازی', 'ارسال شد', 'تحویلِ موفق'],
  cancelled: ['ثبتِ سفارش', 'لغو شده'],
}

// ── Reusable style constants ───────────────────────────────────────────────────
const PILL_COLORS: Record<string, string> = {
  deliv:   'bg-ok/[.12] text-ok',
  shipped: 'bg-[rgba(54,86,201,.12)] text-[#3656C9]',
  proc:    'bg-[rgba(185,130,35,.14)] text-[#B98223]',
  cancel:  'bg-sale/[.10] text-sale',
}
const PILL_BASE = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[10px] tracking-[.1em] uppercase font-medium whitespace-nowrap before:content-[""] before:w-[5px] before:h-[5px] before:rounded-full before:bg-current before:shrink-0'

const IC_MD   = 'w-[38px] h-[38px] rounded-[10px] bg-bg-2 grid place-items-center text-copper shrink-0 [&_svg]:w-[18px] [&_svg]:h-[18px]'
const IC_CIR  = 'w-8 h-8 rounded-full bg-bg-2 grid place-items-center text-copper shrink-0 [&_svg]:w-3.5 [&_svg]:h-3.5'
const IC_SECT = 'w-8 h-8 rounded-full bg-bg-2 grid place-items-center text-copper shrink-0 [&_svg]:w-4 [&_svg]:h-4'

const AVA_SM = 'w-[38px] h-[38px] rounded-full bg-gradient-to-br from-plum to-copper grid place-items-center text-white font-heading font-bold text-sm shrink-0 overflow-hidden'
const AVA_MD = 'w-16 h-16 rounded-full bg-gradient-to-br from-plum to-copper grid place-items-center text-white font-heading font-bold text-2xl shrink-0 shadow-[0_0_0_4px_var(--color-bg),0_0_0_5px_var(--color-rule)] overflow-hidden'
const AVA_LG = 'w-[72px] h-[72px] rounded-full bg-gradient-to-br from-plum to-copper grid place-items-center text-white font-heading font-bold text-[28px] shrink-0'

const INPUT_CLS  = 'bg-bg border border-rule rounded-[10px] px-4 py-3 text-sm text-ink outline-none w-full transition-[border-color] focus:border-ink placeholder:text-muted placeholder:font-light disabled:opacity-50 disabled:cursor-not-allowed'
const SELECT_BG  = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%237A6555' stroke-width='1.8' stroke-linecap='round'><path d='m6 9 6 6 6-6'/></svg>")`
const SELECT_CLS = `${INPUT_CLS} appearance-none cursor-pointer bg-no-repeat bg-[position:left_14px_center] bg-[length:14px] pl-[38px]`

const CARD      = 'bg-surface border border-rule rounded-[var(--radius)] overflow-hidden'
const CARD_H    = 'px-6 py-5 pb-4 border-b border-rule flex justify-between items-center gap-3.5'
const CARD_H3   = 'font-heading text-[16px] font-semibold m-0 flex items-center gap-2.5'
const SECTION_H = 'px-7 py-[22px] pb-[18px] border-b border-rule'
const SECTION_B = 'px-7 py-6 pb-7 max-[640px]:p-4'
const F_FIELD   = 'flex flex-col gap-[7px] min-w-0'
const F_LABEL   = 'text-[12px] font-medium text-ink-2 flex items-center gap-1.5'

const BTN_PRIMARY = 'inline-flex items-center gap-2.5 px-[22px] py-[13px] rounded-full bg-ink text-bg font-medium text-sm border-0 cursor-pointer transition-[transform,background] hover:bg-plum hover:-translate-y-px font-body whitespace-nowrap'
const BTN_MUTE    = 'inline-flex items-center gap-2.5 px-[22px] py-[13px] rounded-full bg-bg-2 text-ink-2 font-medium text-sm border border-rule cursor-pointer transition-all hover:bg-bg hover:text-ink hover:border-ink font-body whitespace-nowrap'
const BTN_SM      = 'px-3.5 py-2 text-xs'

function firstLetter(name?: string | null) {
  return name?.trim()?.[0] ?? '؟'
}

function illusSvg(illus: string) {
  if (illus?.includes('necklace') || illus?.includes('moonlight') || illus?.includes('phoenix'))
    return <><path d="M22 30 Q50 75 78 30"/><circle cx="50" cy="58" r="5"/></>
  if (illus?.includes('bracelet') || illus?.includes('star'))
    return <><ellipse cx="50" cy="50" rx="30" ry="13"/><ellipse cx="50" cy="50" rx="24" ry="9"/></>
  if (illus?.includes('ring') || illus?.includes('rose'))
    return <><circle cx="50" cy="55" r="13"/><path d="M44 41 L50 33 L56 41 Z"/></>
  if (illus?.includes('earring') || illus?.includes('diamond'))
    return <><path d="M35 25c0 6 6 10 6 16M65 25c0 6 6 10 6 16"/><circle cx="35" cy="52" r="5"/><circle cx="65" cy="52" r="5"/></>
  return <><path d="M22 30 Q50 75 78 30"/><circle cx="50" cy="58" r="5"/></>
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const SW = 1.6
const IcoGrid      = () => <LayoutGrid  size={18} strokeWidth={SW} />
const IcoUser      = () => <User        size={18} strokeWidth={SW} />
const IcoBag       = () => <ShoppingBag size={18} strokeWidth={SW} />
const IcoPin       = () => <MapPin      size={18} strokeWidth={SW} />
const IcoHeart     = () => <Heart       size={18} strokeWidth={SW} />
const IcoHeartFill = () => <Heart       size={18} strokeWidth={0}  fill="currentColor" />
const IcoCard      = () => <CreditCard  size={18} strokeWidth={SW} />
const IcoLock      = () => <Lock        size={18} strokeWidth={SW} />
const IcoLogout    = () => <LogOut      size={18} strokeWidth={SW} />
const IcoStar      = () => <Star        size={18} strokeWidth={0}  fill="currentColor" />
const IcoTruck     = () => <Truck       size={18} strokeWidth={SW} />
const IcoCheck     = () => <Check       size={18} strokeWidth={SW} />
const IcoChevDown  = () => <ChevronDown size={18} strokeWidth={SW} />
const IcoArrowLeft = () => <ArrowRight  size={18} strokeWidth={SW} />
const IcoSearch    = () => <Search      size={18} strokeWidth={SW} />
const IcoClock     = () => <Clock       size={18} strokeWidth={SW} />
const IcoPlus      = () => <Plus        size={18} strokeWidth={SW} />
const IcoEdit      = () => <Pencil      size={18} strokeWidth={SW} />
const IcoTrash     = () => <Trash2      size={18} strokeWidth={SW} />
const IcoHome      = () => <Home        size={18} strokeWidth={SW} />
const IcoOffice    = () => <Building2   size={18} strokeWidth={SW} />
const IcoCopy      = () => <Copy        size={18} strokeWidth={SW} />
const IcoReorder   = () => <RefreshCw   size={18} strokeWidth={SW} />
const IcoInvoice   = () => <FileText    size={18} strokeWidth={SW} />
const IcoBell      = () => <Bell        size={18} strokeWidth={SW} />
const IcoEmail     = () => <Mail        size={18} strokeWidth={SW} />
const IcoPhone     = () => <Phone       size={18} strokeWidth={SW} />
const IcoWhatsApp  = () => <IconWhatsApp size={18} />
const IcoLightning = () => <Zap         size={18} strokeWidth={SW} />
const IcoInfo      = () => <Info        size={18} strokeWidth={SW} />

// ─── Overview Pane ────────────────────────────────────────────────────────────
interface PaneProps { setTab: (t: Tab) => void }

const OverviewPane: FC<PaneProps> = ({ setTab }) => {
  const orders   = useAuthStore((s) => s.orders)
  const wishCount = useWishlistStore((s) => s.items.length)
  const inTransit = orders.filter((o) => o.status === 'shipped' || o.status === 'processing').length

  const thisMonthOrders = useMemo(() => {
    const now = new Date()
    return orders.filter((o) => {
      const d = new Date(o.date)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length
  }, [orders])

  const kpis = [
    { icon: <IcoBag />, value: toFa(orders.length), label: 'سفارش‌های کل', extra: thisMonthOrders > 0 ? `+${toFa(thisMonthOrders)} این ماه` : null },
    { icon: <IcoTruck />, value: toFa(inTransit), label: 'در حالِ ارسال', extra: inTransit > 0 ? 'در راه' : null },
    { icon: <IcoHeart />, value: toFa(wishCount), unit: 'قطعه', label: 'علاقه‌مندی‌ها', extra: null },
    { icon: <IcoStar />, value: '—', muted: true, label: 'امتیازِ شما', extra: null },
  ]

  return (
    <div className="flex flex-col gap-[18px]">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3.5 max-[1100px]:grid-cols-2">
        {kpis.map((k, i) => (
          <div key={i} className="bg-surface border border-rule rounded-[var(--radius)] px-[22px] py-5 flex flex-col gap-4 relative overflow-hidden after:content-[''] after:absolute after:-left-[10%] after:-bottom-[30%] after:w-[60%] after:h-[60%] after:bg-[radial-gradient(circle,rgba(196,135,58,.06),transparent_60%)] after:pointer-events-none">
            <div className="flex justify-between items-start gap-2">
              <span className={IC_MD}>{k.icon}</span>
              {k.extra && <span className="font-mono text-[10px] text-ok bg-ok/10 px-[7px] py-[3px] rounded-full tracking-[.04em]">{k.extra}</span>}
            </div>
            <div className="flex flex-col gap-1">
              <div className={`font-heading text-[30px] font-bold leading-none flex items-baseline gap-[5px] ${k.muted ? 'text-muted text-[22px]' : 'text-ink'}`}>
                {k.value}
                {k.unit && <small className="font-body text-[13px] font-normal text-muted mr-0.5">{k.unit}</small>}
              </div>
              <div className="text-[12px] text-muted font-body leading-[1.4]">{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1.5fr_1fr] gap-[18px] max-[1100px]:grid-cols-1">
        {/* Recent orders */}
        <div className={CARD}>
          <div className={CARD_H}>
            <h3 className={CARD_H3}><span className={IC_CIR}><IcoClock /></span> سفارش‌های اخیر</h3>
            <button className="text-[12px] text-copper font-body bg-transparent border-0 cursor-pointer hover:underline hover:underline-offset-[3px]" onClick={() => setTab('orders')}>همه‌ی سفارش‌ها →</button>
          </div>
          <div className="flex flex-col">
            {orders.slice(0, 3).map((order) => (
              <div key={order.id} className="grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center px-6 py-3.5 border-b border-rule last:border-b-0">
                <div className="flex">
                  {order.items.slice(0, 2).map((item, i) => (
                    <span key={i} className="w-[42px] h-[42px] rounded-[9px] bg-bg-2 grid place-items-center text-ink-2 border-2 border-surface -mr-3 first:mr-0 [&_svg]:w-[34px] [&_svg]:h-[34px]">
                      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.4">{illusSvg(item.illus)}</svg>
                    </span>
                  ))}
                  {order.items.length > 2 && (
                    <span className="w-[42px] h-[42px] rounded-[9px] bg-ink text-bg font-mono text-[11px] font-semibold grid place-items-center border-2 border-surface -mr-3">
                      +{toFa(order.items.length - 2)}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="font-mono text-[11px] text-muted tracking-[.04em]">{order.id} · {order.date}</span>
                  <span className="font-heading text-sm font-semibold leading-[1.3] whitespace-nowrap overflow-hidden text-ellipsis">
                    {order.items[0].name}{order.items.length > 1 ? ` + ${toFa(order.items.length - 1)} قطعه` : ''}
                  </span>
                </div>
                <span className={`${PILL_BASE} ${PILL_COLORS[STATUS_PILL[order.status]]}`}>{STATUS_FA[order.status]}</span>
                <span className="font-heading text-sm font-bold whitespace-nowrap">
                  {formatToman(order.total)}<small className="text-[11px] font-normal text-muted mr-[3px]">ت</small>
                </span>
              </div>
            ))}
            {orders.length === 0 && (
              <div className="py-8 px-6 text-center text-muted text-sm">هنوز سفارشی ثبت نشده است</div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className={CARD}>
          <div className={CARD_H}>
            <h3 className={CARD_H3}><span className={IC_CIR}><IcoLightning /></span> دسترسیِ سریع</h3>
          </div>
          <div className="p-2.5">
            {[
              { icon: <IcoEmail />, title: 'پیگیریِ سفارش', desc: 'با کدِ رهگیری', tab: 'orders' as Tab },
              { icon: <IcoReorder />, title: 'درخواستِ بازگشت', desc: '۱۴ روز فرصت دارید', tab: 'orders' as Tab },
              { icon: <IcoInfo />, title: 'تماس با پشتیبانی', desc: 'پاسخگویی روزانه ۹–۲۱', tab: null },
              { icon: <IcoInvoice />, title: 'گارانتی و اصالت', desc: 'گواهی‌های دیجیتالِ شما', tab: null },
            ].map((item, i) => (
              <button key={i} className="flex items-center gap-3 px-3.5 py-3 rounded-[10px] transition-colors w-full text-right hover:bg-bg-2" onClick={() => item.tab && setTab(item.tab)}>
                <span className="w-9 h-9 rounded-lg bg-bg-2 grid place-items-center text-copper shrink-0 [&_svg]:w-4 [&_svg]:h-4">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-heading text-[13px] font-semibold leading-[1.2]">{item.title}</div>
                  <div className="text-[11px] text-muted mt-0.5 leading-[1.3]">{item.desc}</div>
                </div>
                <span className="text-muted [&_svg]:w-3.5 [&_svg]:h-3.5"><IcoArrowLeft /></span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Profile Pane ─────────────────────────────────────────────────────────────
const GENDER_OPTIONS = [
  { value: 'female', label: 'زن' },
  { value: 'male', label: 'مرد' },
  { value: 'other', label: 'ترجیح می‌دهم نگویم' },
]

const ProfilePane: FC = () => {
  const { profile, updateProfile, uploadAvatar, deleteAvatar } = useAuthStore()
  const [form, setForm] = useState({
    name:       profile?.name?.split(' ')[0] ?? '',
    family:     profile?.name?.split(' ').slice(1).join(' ') ?? '',
    email:      profile?.email ?? '',
    phone:      profile?.phone ?? '',
    birthdate:  profile?.birthDate ?? '',
    gender:     profile?.gender ?? '',
    nationalId: profile?.nationalId ?? '',
  })
  const [notifs, setNotifs] = useState({ email: true, sms: true, offers: false, whatsapp: true })
  const [saved, setSaved] = useState(false)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSave = () => {
    updateProfile({ ...profile!, name: `${form.name} ${form.family}`.trim(), email: form.email, phone: form.phone, birthDate: form.birthdate, gender: form.gender, nationalId: form.nationalId })
      .then(() => { setSaved(true); setTimeout(() => setSaved(false), 2000) })
      .catch(() => {})
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarLoading(true)
    uploadAvatar(file).finally(() => setAvatarLoading(false))
  }

  const handleDeleteAvatar = () => {
    setAvatarLoading(true)
    deleteAvatar().finally(() => setAvatarLoading(false))
  }

  return (
    <div className="flex flex-col gap-[18px]">
      {/* Personal info */}
      <div className={CARD}>
        <div className={SECTION_H}>
          <h2 className="font-heading text-[18px] font-semibold m-0 flex items-center gap-3">
            <span className={IC_SECT}><IcoUser /></span> اطلاعاتِ شخصی
          </h2>
          <p className="m-0 mt-1.5 text-[13px] text-muted mr-11">این اطلاعات روی فاکتورها و رسیدِ تحویلِ سفارش استفاده می‌شود.</p>
        </div>
        <div className="flex items-center gap-[18px] px-7 py-5 bg-surface-2 border-b border-rule">
          {profile?.avatarUrl
            ? <img src={profile.avatarUrl} alt="avatar" className={`${AVA_LG} object-cover`} />
            : <span className={AVA_LG}>{firstLetter(profile?.name)}</span>
          }
          <div className="flex-1">
            <h4 className="font-heading text-sm font-semibold m-0">عکسِ پروفایل</h4>
            <p className="m-0 mt-0.5 text-[12px] text-muted">JPG یا PNG · حداکثر ۲ مگابایت · ۴۰۰×۴۰۰ پیکسل</p>
          </div>
          <div className="flex gap-2">
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleAvatarChange} />
            <button className={`${BTN_MUTE} ${BTN_SM}`} disabled={avatarLoading} onClick={() => fileInputRef.current?.click()}>
              {avatarLoading ? '...' : 'بارگذاریِ عکس'}
            </button>
            {profile?.avatarUrl && (
              <button className={`${BTN_MUTE} ${BTN_SM} text-sale`} disabled={avatarLoading} onClick={handleDeleteAvatar}>حذف</button>
            )}
          </div>
        </div>
        <div className={SECTION_B}>
          <div className="grid grid-cols-2 gap-[18px]">
            <div className={F_FIELD}>
              <label className={F_LABEL}>نام <span className="text-sale">*</span></label>
              <input className={INPUT_CLS} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className={F_FIELD}>
              <label className={F_LABEL}>نامِ خانوادگی <span className="text-sale">*</span></label>
              <input className={INPUT_CLS} value={form.family} onChange={(e) => setForm((f) => ({ ...f, family: e.target.value }))} />
            </div>
            <div className={F_FIELD}>
              <label className={F_LABEL}>ایمیل <span className="mr-auto inline-flex items-center gap-1 font-mono text-[10px] text-ok tracking-[.04em] [&_svg]:w-[11px] [&_svg]:h-[11px]"><IcoCheck />تأیید شده</span></label>
              <input className={INPUT_CLS} dir="ltr" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div className={F_FIELD}>
              <label className={F_LABEL}>موبایل <span className="mr-auto inline-flex items-center gap-1 font-mono text-[10px] text-ok tracking-[.04em] [&_svg]:w-[11px] [&_svg]:h-[11px]"><IcoCheck />تأیید شده</span></label>
              <input className={INPUT_CLS} dir="ltr" value={toFa(form.phone)} disabled />
            </div>
            <div className={F_FIELD}>
              <label className={F_LABEL}>تاریخِ تولد <span className="mr-auto font-mono text-[10px] text-muted font-normal tracking-[.04em]">(اختیاری)</span></label>
              <DatePicker
                calendar={persian} locale={persian_fa}
                value={form.birthdate ? (() => { const d = new Date(form.birthdate); return isNaN(d.getTime()) ? '' : d })() : ''}
                onChange={(date: DateObject | null) => setForm((f) => ({ ...f, birthdate: date ? date.toDate().toISOString().split('T')[0] : '' }))}
                inputClass={INPUT_CLS} containerStyle={{ width: '100%' }}
                maxDate={new Date()} format="YYYY/MM/DD" placeholder="انتخاب تاریخِ تولد"
                calendarPosition="bottom-right" arrow={false}
              />
            </div>
            <div className={F_FIELD}>
              <label className={F_LABEL}>جنسیت <span className="mr-auto font-mono text-[10px] text-muted font-normal tracking-[.04em]">(اختیاری)</span></label>
              <select className={SELECT_CLS} style={{ backgroundImage: SELECT_BG }} value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}>
                <option value="">انتخاب کنید</option>
                {GENDER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className={`${F_FIELD} col-span-2`}>
              <label className={F_LABEL}>کدِ ملی <span className="mr-auto font-mono text-[10px] text-muted font-normal tracking-[.04em]">(برای صدورِ فاکتورِ رسمی)</span></label>
              <input className={INPUT_CLS} placeholder="۰۰۸۷۶۵۴۳۲۱" value={form.nationalId} onChange={(e) => setForm((f) => ({ ...f, nationalId: e.target.value }))} />
            </div>
          </div>
        </div>
        <div className="px-7 py-[18px] bg-surface-2 border-t border-rule flex justify-between items-center gap-3">
          <span className="text-[11px] text-muted">آخرین تغییر: {profile?.updatedAt ? new Date(profile.updatedAt).toLocaleDateString('fa-IR') : '—'}</span>
          <div className="flex gap-2">
            <button className={`${BTN_MUTE} ${BTN_SM}`}>لغو</button>
            <button className={`${BTN_PRIMARY} ${BTN_SM}`} onClick={handleSave}>
              {saved ? '✓ ذخیره شد' : 'ذخیره‌ی تغییرات'}
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className={CARD}>
        <div className={SECTION_H}>
          <h2 className="font-heading text-[18px] font-semibold m-0 flex items-center gap-3">
            <span className={IC_SECT}><IcoBell /></span> اعلان‌ها و ارتباطات
          </h2>
          <p className="m-0 mt-1.5 text-[13px] text-muted mr-11">کنترل کنید چه پیام‌هایی از ما دریافت کنید.</p>
        </div>
        <div className={SECTION_B}>
          {([
            { key: 'email',    icon: <IcoEmail />,    title: 'خبرنامه‌ی ایمیلی',    desc: 'هر دو هفته یک ایمیل با جدیدترین قطعات و پیشنهادها' },
            { key: 'sms',      icon: <IcoPhone />,    title: 'پیامکِ سفارش',         desc: 'وضعیتِ ارسال و تحویل از طریقِ SMS' },
            { key: 'offers',   icon: <IcoStar />,     title: 'پیشنهادهای ویژه',      desc: 'دسترسیِ زودهنگام و تخفیف‌های اعضای طلایی' },
            { key: 'whatsapp', icon: <IcoWhatsApp />, title: 'پیام‌رسانِ واتس‌اپ', desc: 'پشتیبانی و اطلاع‌رسانی از طریقِ واتس‌اپ' },
          ] as const).map(({ key, icon, title, desc }) => (
            <div key={key} className="flex items-start gap-3.5 py-3.5 border-t border-rule first:border-t-0 first:pt-0">
              <span className="w-[34px] h-[34px] rounded-full bg-bg-2 grid place-items-center text-copper shrink-0 [&_svg]:w-[15px] [&_svg]:h-[15px]">{icon}</span>
              <div className="flex-1">
                <h4 className="font-heading text-[13px] font-semibold m-0">{title}</h4>
                <p className="m-0 mt-0.5 text-[11px] text-muted">{desc}</p>
              </div>
              {/* Toggle switch using peer */}
              <label className="relative w-9 h-5 shrink-0 cursor-pointer mt-0.5">
                <input type="checkbox" className="sr-only peer" checked={notifs[key]} onChange={(e) => setNotifs((n) => ({ ...n, [key]: e.target.checked }))} />
                <span className="absolute inset-0 bg-bg-2 rounded-full transition-colors peer-checked:bg-ink after:content-[''] after:absolute after:top-0.5 after:right-0.5 after:w-4 after:h-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:-translate-x-4" />
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function reorderItems(order: Order, addItem: (p: import('../types').Product) => void) {
  order.items.forEach((item) => {
    addItem({ id: item.productId, fa: item.name, en: item.name, cat: '', catId: '', price: item.price, oldPrice: null, badge: null, illus: item.illus || 'NecklaceB', illusAlt: 'NecklaceC', meta: [] })
  })
}

// ─── Orders Pane ──────────────────────────────────────────────────────────────
const OrdersPane: FC = () => {
  const orders    = useAuthStore((s) => s.orders)
  const addItem   = useCartStore((s) => s.addItem)
  const openCart  = useCartStore((s) => s.openCart)
  const [expanded, setExpanded] = useState<string | null>(orders[0]?.id ?? null)
  const [filter,    setFilter]    = useState<string>('all')
  const [search,    setSearch]    = useState('')
  const [dateRange, setDateRange] = useState('all')

  const filtered = useMemo(() => {
    let result = orders
    if (filter === 'transit')   result = result.filter((o) => o.status === 'shipped' || o.status === 'processing')
    else if (filter === 'delivered') result = result.filter((o) => o.status === 'delivered')
    else if (filter === 'cancelled') result = result.filter((o) => o.status === 'cancelled')
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter((o) => o.id.toLowerCase().includes(q) || o.items.some((it) => it.name.toLowerCase().includes(q)) || (o.trackingCode ?? '').toLowerCase().includes(q))
    }
    if (dateRange !== 'all') {
      const now = new Date(); const months = dateRange === '6m' ? 6 : 12
      const cutoff = new Date(now.getFullYear(), now.getMonth() - months, now.getDate())
      result = result.filter((o) => new Date(o.date) >= cutoff)
    }
    return result
  }, [orders, filter, search, dateRange])

  const chips = [
    { key: 'all',       label: 'همه',         count: orders.length },
    { key: 'transit',   label: 'در راه',       count: orders.filter((o) => o.status === 'shipped' || o.status === 'processing').length },
    { key: 'delivered', label: 'تحویل شده',   count: orders.filter((o) => o.status === 'delivered').length },
    { key: 'cancelled', label: 'لغو شده',     count: orders.filter((o) => o.status === 'cancelled').length },
  ]

  return (
    <div className="flex flex-col gap-3.5">
      {/* Toolbar */}
      <div className="flex items-center gap-2.5 flex-wrap bg-surface border border-rule rounded-[var(--radius)] px-[18px] py-3.5">
        <div className="flex-1 min-w-[220px] flex items-center gap-2 px-3.5 py-2 bg-bg border border-rule rounded-full text-[13px] text-muted">
          <IcoSearch />
          <input
            className="flex-1 bg-transparent border-0 outline-none text-ink text-[13px] text-right font-body"
            placeholder="جستجو بر اساسِ کدِ سفارش، محصول…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {chips.map((c) => (
            <button
              key={c.key}
              className={`px-[13px] py-[7px] rounded-full text-[12px] border transition-all cursor-pointer inline-flex items-center gap-1.5 font-body ${
                filter === c.key ? 'bg-ink text-bg border-ink' : 'bg-bg text-ink-2 border-rule hover:border-ink'
              }`}
              onClick={() => setFilter(c.key)}
            >
              {c.label}
              <span className="font-mono text-[10px] opacity-70">{toFa(c.count)}</span>
            </button>
          ))}
        </div>
        <select
          className={`${SELECT_CLS} w-auto text-[13px]`}
          style={{ backgroundImage: SELECT_BG, padding: '9px 32px 9px 14px' }}
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
        >
          <option value="all">کل تاریخچه</option>
          <option value="6m">۶ ماهِ گذشته</option>
          <option value="12m">۱ سال</option>
        </select>
      </div>

      {/* Order list */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 && (
          <div className="text-center py-14 text-muted text-sm">سفارشی یافت نشد</div>
        )}
        {filtered.map((order) => {
          const isOpen  = expanded === order.id
          const steps   = TIMELINE_STEPS[order.status]
          const doneIdx = steps.length - 1
          return (
            <article key={order.id} className="bg-surface border border-rule rounded-[var(--radius)] overflow-hidden">
              {/* Head */}
              <div
                className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-[18px] items-center px-[22px] py-[18px] cursor-pointer transition-colors hover:bg-surface-2 max-[1100px]:grid-cols-[1fr_auto_auto]"
                onClick={() => setExpanded(isOpen ? null : order.id)}
              >
                <div className="flex max-[1100px]:hidden">
                  {order.items.slice(0, 2).map((item, i) => (
                    <span key={i} className="w-[42px] h-[42px] rounded-[9px] bg-bg-2 grid place-items-center text-ink-2 border-2 border-surface -mr-3 first:mr-0">
                      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-[34px] h-[34px]">{illusSvg(item.illus)}</svg>
                    </span>
                  ))}
                  {order.items.length > 2 && (
                    <span className="w-[42px] h-[42px] rounded-[9px] bg-ink text-bg font-mono text-[11px] font-semibold grid place-items-center border-2 border-surface -mr-3">
                      {toFa(order.items.length - 2)}+
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="font-mono text-[13px] font-semibold tracking-[.04em]" dir="ltr" style={{ textAlign: 'right' }}>{order.id}</span>
                  <span className="text-[11px] text-muted font-mono tracking-[.04em]">{order.date} · {toFa(order.items.length)} قلم</span>
                </div>
                <span className={`${PILL_BASE} ${PILL_COLORS[STATUS_PILL[order.status]]}`}>{STATUS_FA[order.status]}</span>
                <span className="font-heading text-[16px] font-bold max-[1100px]:hidden">
                  {formatToman(order.total)}<small className="text-[11px] font-normal text-muted mr-[3px]">تومان</small>
                </span>
                <span className={`w-9 h-9 rounded-full grid place-items-center transition-[transform,background,color] shrink-0 [&_svg]:w-3.5 [&_svg]:h-3.5 ${
                  isOpen ? 'rotate-180 bg-ink text-bg' : 'bg-bg-2'
                }`}>
                  <IcoChevDown />
                </span>
              </div>

              {/* Body */}
              {isOpen && (
                <div className="border-t border-rule p-6 bg-surface-2">
                  <div className="grid grid-cols-[1fr_280px] gap-7 max-[1100px]:grid-cols-1">
                    {/* Items */}
                    <div>
                      <h4 className="font-heading text-[13px] m-0 mb-2.5 flex items-center gap-2 [&_svg]:w-[13px] [&_svg]:h-[13px]">
                        <IcoBag /> اقلامِ سفارش
                      </h4>
                      <div className="flex flex-col gap-2.5">
                        {order.items.map((item, i) => (
                          <div key={i} className="grid grid-cols-[54px_1fr_auto] gap-3.5 items-center p-3 px-3.5 bg-surface border border-rule rounded-[10px]">
                            <div className="w-[54px] h-[54px] rounded-[9px] bg-bg-2 grid place-items-center text-ink-2 relative shrink-0">
                              <span className="absolute -top-1.5 -left-1.5 min-w-[18px] h-[18px] rounded-[9px] bg-ink text-bg font-mono text-[10px] grid place-items-center px-[5px] border-2 border-surface">
                                {toFa(item.qty)}
                              </span>
                              <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.1" className="w-[38px] h-[38px]">{illusSvg(item.illus)}</svg>
                            </div>
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <span className="font-heading text-[13px] font-semibold leading-[1.3]">{item.name}</span>
                              <span className="text-[11px] text-muted font-mono tracking-[.04em]">قطعه‌ی جواهری</span>
                            </div>
                            <span className="font-heading text-[13px] font-semibold whitespace-nowrap">
                              {formatToman(item.price)}<small className="text-[10px] font-normal text-muted mr-0.5">ت</small>
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-3.5 flex-wrap">
                        <button className={`${BTN_PRIMARY} ${BTN_SM} [&_svg]:w-[13px] [&_svg]:h-[13px]`} onClick={() => { reorderItems(order, addItem); openCart() }}><IcoReorder /> سفارشِ مجدد</button>
                        <button className={`${BTN_MUTE} ${BTN_SM} [&_svg]:w-[13px] [&_svg]:h-[13px]`} disabled title="API موجود نیست"><IcoInvoice /> دانلود فاکتور</button>
                        <button className={`${BTN_MUTE} ${BTN_SM} [&_svg]:w-[13px] [&_svg]:h-[13px]`} disabled title="API موجود نیست"><IcoStar /> ثبتِ نظر</button>
                        {order.status === 'delivered' && (
                          <button className={`${BTN_MUTE} ${BTN_SM} text-sale`} disabled title="API موجود نیست">درخواستِ بازگشت</button>
                        )}
                      </div>
                    </div>

                    {/* Timeline */}
                    <div>
                      <div className="bg-surface border border-rule rounded-[10px] p-[18px_20px]">
                        <h4 className="font-heading text-[13px] font-semibold m-0 mb-3 flex items-center gap-2 [&_svg]:w-[13px] [&_svg]:h-[13px] [&_svg]:text-copper">
                          <IcoTruck /> وضعیتِ ارسال
                        </h4>
                        {steps.map((step, i) => {
                          const isDone = i <= doneIdx
                          return (
                            <div key={i} className="grid grid-cols-[auto_1fr] gap-3.5 pb-3.5 relative last:pb-0">
                              <span className={`w-[22px] h-[22px] rounded-full border-[1.5px] grid place-items-center shrink-0 z-[1] [&_svg]:w-[11px] [&_svg]:h-[11px] ${
                                isDone ? 'bg-ok border-ok text-white' : 'border-rule bg-bg text-muted'
                              }`}>
                                <IcoCheck />
                              </span>
                              {i < steps.length - 1 && (
                                <span className={`absolute right-[11px] top-6 bottom-0 w-[1.5px] ${isDone ? 'bg-ok' : 'bg-rule'}`} />
                              )}
                              <div>
                                <div className={`font-heading text-[13px] font-semibold leading-[1.2] ${isDone ? '' : 'text-muted'}`}>{step}</div>
                                <div className="font-mono text-[10px] text-muted tracking-[.04em] mt-0.5" dir="ltr" style={{ textAlign: 'right' }}>{order.date}</div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      {order.trackingCode && (
                        <div className="mt-2.5 px-3.5 py-[11px] bg-surface border border-rule rounded-[10px] flex items-center gap-2.5">
                          <span className="text-[10px] text-muted font-mono tracking-[.08em] uppercase">رهگیری</span>
                          <span className="font-mono text-[13px] font-semibold flex-1 tracking-[.04em]" dir="ltr" style={{ textAlign: 'right' }}>{order.trackingCode}</span>
                          <button
                            className="w-7 h-7 rounded-[6px] bg-bg-2 grid place-items-center text-ink-2 transition-colors hover:bg-ink hover:text-bg [&_svg]:w-3 [&_svg]:h-3"
                            title="کپی"
                            onClick={() => navigator.clipboard?.writeText(order.trackingCode ?? '')}
                          >
                            <IcoCopy />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </article>
          )
        })}
      </div>
    </div>
  )
}

// ─── Address Modal ─────────────────────────────────────────────────────────────
interface AddressModalProps {
  initial?: Address
  onClose: () => void
}

const AddressModal: FC<AddressModalProps> = ({ initial, onClose }) => {
  const { addAddress, updateAddress } = useAuthStore()
  const [form, setForm] = useState({
    label:      initial?.label ?? 'خانه',
    fullName:   initial?.fullName ?? '',
    phone:      initial?.phone ?? '',
    province:   initial?.province ?? '',
    city:       initial?.city ?? '',
    street:     initial?.street ?? '',
    postalCode: initial?.postalCode ?? '',
    isDefault:  initial?.isDefault ?? false,
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const isEdit = !!initial

  const handleSubmit = async () => {
    if (!form.fullName.trim()) { setError('نام گیرنده الزامی است'); return }
    if (!form.phone.trim())    { setError('شماره تماس الزامی است'); return }
    if (!form.province)        { setError('استان را انتخاب کنید'); return }
    if (!form.city.trim())     { setError('شهر الزامی است'); return }
    if (!form.street.trim())   { setError('آدرس الزامی است'); return }
    if (!form.postalCode.trim()){ setError('کد پستی الزامی است'); return }
    setLoading(true); setError('')
    try {
      if (isEdit) await updateAddress(initial!.id, form)
      else        await addAddress(form)
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
            <span className="w-8 h-8 rounded-[10px] bg-copper/[.12] grid place-items-center text-copper shrink-0 [&_svg]:w-[15px] [&_svg]:h-[15px]"><IcoPin /></span>
            <h2 className="m-0 text-[15px] font-heading font-bold text-ink">{isEdit ? 'ویرایشِ آدرس' : 'آدرسِ جدید'}</h2>
          </div>
          <button className="w-[30px] h-[30px] rounded-lg bg-transparent cursor-pointer text-muted text-[13px] grid place-items-center transition-[background,color] hover:bg-bg-2 hover:text-ink" onClick={onClose} aria-label="بستن">✕</button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto max-h-[calc(90vh-148px)] flex flex-col gap-[22px]">
          <div className={F_FIELD}>
            <label className={F_LABEL}>برچسب <span className="mr-auto font-mono text-[10px] text-muted font-normal tracking-[.04em]">(اختیاری)</span></label>
            <input className={INPUT_CLS} value={form.label} placeholder="مثلاً: خانه، محل کار، انبار…" onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} />
          </div>

          <div className="flex flex-col gap-2.5">
            <p className="m-0 text-[11px] font-mono tracking-[.1em] uppercase text-muted font-medium">اطلاعاتِ گیرنده</p>
            <div className="grid grid-cols-2 gap-[18px]">
              <div className={F_FIELD}>
                <label className={F_LABEL}>نام گیرنده <span className="text-sale">*</span></label>
                <input className={INPUT_CLS} value={form.fullName} placeholder="مثال: زهرا رضایی" onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} />
              </div>
              <div className={F_FIELD}>
                <label className={F_LABEL}>شماره تماس <span className="text-sale">*</span></label>
                <input className={INPUT_CLS} dir="ltr" value={form.phone} placeholder="09123456789" onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <p className="m-0 text-[11px] font-mono tracking-[.1em] uppercase text-muted font-medium">آدرس</p>
            <div className="grid grid-cols-2 gap-[18px]">
              <div className={F_FIELD}>
                <label className={F_LABEL}>استان <span className="text-sale">*</span></label>
                <select className={SELECT_CLS} style={{ backgroundImage: SELECT_BG }} value={form.province} onChange={(e) => setForm((f) => ({ ...f, province: e.target.value, city: '' }))}>
                  <option value="">انتخاب کنید</option>
                  {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className={F_FIELD}>
                <label className={F_LABEL}>شهر <span className="text-sale">*</span></label>
                <select className={SELECT_CLS} style={{ backgroundImage: SELECT_BG }} value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} disabled={!form.province}>
                  <option value="">{form.province ? 'انتخاب شهر' : 'ابتدا استان را انتخاب کنید'}</option>
                  {(CITIES_BY_PROVINCE[form.province] ?? []).map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className={`${F_FIELD} col-span-2`}>
                <label className={F_LABEL}>آدرس کامل <span className="text-sale">*</span></label>
                <input className={INPUT_CLS} value={form.street} placeholder="خیابان، کوچه، پلاک، واحد" onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))} />
              </div>
              <div className={F_FIELD}>
                <label className={F_LABEL}>کد پستی <span className="text-sale">*</span></label>
                <input className={INPUT_CLS} dir="ltr" value={form.postalCode} placeholder="1234567890" maxLength={10} onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))} />
              </div>
            </div>
          </div>

          {/* Default toggle */}
          <label className={`flex items-center gap-2.5 cursor-pointer py-3 px-3.5 rounded-[10px] border-[1.5px] transition-[border-color,background] select-none ${form.isDefault ? 'border-ink bg-surface' : 'border-rule bg-bg'}`}>
            <input type="checkbox" className="sr-only" checked={form.isDefault} onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))} />
            <span className={`w-[18px] h-[18px] rounded-[5px] border-[1.5px] shrink-0 grid place-items-center transition-all ${form.isDefault ? 'border-ink bg-ink' : 'border-rule bg-bg'}`}>
              <span className={`w-[9px] h-[9px] rounded-[3px] transition-colors ${form.isDefault ? 'bg-bg' : 'bg-transparent'}`} />
            </span>
            <span className="text-[13px] text-ink-2">تنظیم به‌عنوانِ آدرسِ پیش‌فرض</span>
          </label>

          {error && <p className="m-0 text-sale text-[13px]">{error}</p>}
        </div>

        {/* Foot */}
        <div className="flex gap-2 flex-row-reverse justify-start px-6 py-4 border-t border-rule">
          <button className={`${BTN_MUTE} ${BTN_SM}`} onClick={onClose} disabled={loading}>لغو</button>
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
      {modal.open && <AddressModal initial={modal.address} onClose={() => setModal({ open: false })} />}
      <div className={CARD}>
        <div className={`${SECTION_H} flex justify-between items-end border-b-0`}>
          <div>
            <h2 className="font-heading text-[18px] font-semibold m-0 flex items-center gap-3"><span className={IC_SECT}><IcoPin /></span> آدرس‌های من</h2>
            <p className="m-0 mt-1.5 text-[13px] text-muted mr-11">برای ارسالِ سریع‌تر، می‌توانید چند آدرس ذخیره کنید.</p>
          </div>
          <button className={`${BTN_PRIMARY} ${BTN_SM} [&_svg]:w-[14px] [&_svg]:h-[14px]`} onClick={() => setModal({ open: true })}><IcoPlus /> آدرسِ جدید</button>
        </div>
        <div className="px-7 py-2 pb-7 max-[640px]:p-4">
          <div className="grid grid-cols-2 gap-3.5 max-[640px]:grid-cols-1">
            {addresses.map((addr) => (
              <div key={addr.id} className={`relative p-[22px] bg-surface border rounded-[var(--radius)] flex flex-col gap-3.5 transition-[border-color,box-shadow] ${
                addr.isDefault ? 'border-ink shadow-[inset_0_0_0_1px_var(--color-ink)]' : 'border-rule'
              }`}>
                <div className="flex items-center justify-between gap-2.5">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-[5px] rounded-full font-mono text-[10px] tracking-[.12em] uppercase font-medium [&_svg]:w-[11px] [&_svg]:h-[11px] ${
                    addr.isDefault ? 'bg-ink text-bg' : 'bg-bg-2 text-ink-2'
                  }`}>
                    {addrIcon(addr.label)} {addr.label}
                  </span>
                  {addr.isDefault && (
                    <span className="inline-flex items-center gap-[5px] px-2.5 py-1 bg-copper/[.12] text-copper rounded-full font-mono text-[10px] tracking-[.12em] uppercase [&_svg]:w-2.5 [&_svg]:h-2.5">
                      <IcoStar /> پیش‌فرض
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="font-heading text-[15px] font-semibold flex items-center gap-2">
                    <span className="text-copper inline-grid place-items-center [&_svg]:w-3.5 [&_svg]:h-3.5"><IcoPin /></span>
                    {addr.fullName}
                  </div>
                  <div className="text-[13px] text-ink-2 leading-[1.7]">{addr.province}، {addr.city}، {addr.street}</div>
                  <div className="flex gap-2.5 flex-wrap text-[12px] text-muted pt-1.5 border-t border-dashed border-rule">
                    <span className="inline-flex items-center gap-1.5 font-mono tracking-[.04em] [&_svg]:w-[11px] [&_svg]:h-[11px]" dir="ltr"><IcoPhone />{toFa(addr.phone)}</span>
                    <span className="inline-flex items-center gap-1.5 font-mono tracking-[.04em] [&_svg]:w-[11px] [&_svg]:h-[11px]" dir="ltr"><IcoCard />{toFa(addr.postalCode)}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center gap-2.5 pt-3 border-t border-rule">
                  {addr.isDefault
                    ? <button className="text-[12px] text-copper bg-transparent border-0 p-[7px_0] cursor-default opacity-45 font-body">آدرسِ پیش‌فرض</button>
                    : <button className="text-[12px] text-copper bg-transparent border-0 p-[7px_0] cursor-pointer font-body hover:underline hover:underline-offset-[3px]" onClick={() => setDefaultAddress(addr.id)}>تنظیم به‌عنوانِ پیش‌فرض</button>
                  }
                  <div className="flex gap-1.5">
                    <button className="inline-flex items-center gap-1.5 px-3 py-[7px] rounded-lg text-[12px] bg-bg text-ink-2 border border-rule transition-all cursor-pointer font-body hover:bg-ink hover:text-bg hover:border-ink [&_svg]:w-3 [&_svg]:h-3" onClick={() => setModal({ open: true, address: addr })}><IcoEdit />ویرایش</button>
                    <button className="inline-flex items-center gap-1.5 px-3 py-[7px] rounded-lg text-[12px] bg-bg text-ink-2 border border-rule transition-all cursor-pointer font-body hover:bg-sale hover:text-white hover:border-sale [&_svg]:w-3 [&_svg]:h-3" onClick={() => removeAddress(addr.id)}><IcoTrash /></button>
                  </div>
                </div>
              </div>
            ))}
            <button
              className="flex items-center justify-center gap-2.5 flex-col border-[1.5px] border-dashed border-rule bg-transparent cursor-pointer min-h-[240px] transition-all text-ink-2 rounded-[var(--radius)] font-body hover:border-ink hover:bg-surface"
              onClick={() => setModal({ open: true })}
            >
              <span className="w-12 h-12 rounded-full bg-bg-2 grid place-items-center text-copper [&_svg]:w-5 [&_svg]:h-5"><IcoPlus /></span>
              <span className="font-heading text-sm font-semibold">افزودنِ آدرسِ جدید</span>
              <span className="text-[11px] text-muted">می‌توانید تا ۵ آدرس داشته باشید</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Wishlist Pane ────────────────────────────────────────────────────────────
const WishlistPane: FC = () => {
  const { items, remove } = useWishlistStore()
  const addToCart = useCartStore((s) => s.addItem)
  const openCart  = useCartStore((s) => s.openCart)

  return (
    <div className="flex flex-col gap-[18px]">
      <div className={CARD}>
        <div className={`${SECTION_H} flex justify-between items-end`}>
          <div>
            <h2 className="font-heading text-[18px] font-semibold m-0 flex items-center gap-3"><span className={IC_SECT}><IcoHeart /></span> علاقه‌مندی‌های من</h2>
            <p className="m-0 mt-1.5 text-[13px] text-muted mr-11">قطعاتی که برای بعد نگه داشته‌اید — {toFa(items.length)} مورد</p>
          </div>
          {items.length > 0 && (
            <button className={`${BTN_MUTE} ${BTN_SM}`} onClick={() => { items.forEach(addToCart); openCart() }}>انتقال همه به سبد</button>
          )}
        </div>
        <div className={SECTION_B}>
          {items.length === 0 ? (
            <div className="text-center py-14 text-muted text-sm">هیچ محصولی در علاقه‌مندی‌ها نیست</div>
          ) : (
            <div className="grid grid-cols-4 gap-3.5 max-[1100px]:grid-cols-3 max-[640px]:grid-cols-2">
              {items.map((product) => (
                <article key={product.id} className="bg-surface border border-rule rounded-[var(--radius)] overflow-hidden flex flex-col relative transition-[transform,box-shadow] duration-[250ms] group hover:-translate-y-[3px] hover:shadow-[0_16px_40px_-28px_rgba(27,15,29,.25)]">
                  <div className="aspect-square bg-gradient-to-bl from-[#EFE5D5] to-[#E6D8C2] grid place-items-center text-ink-2 relative overflow-hidden">
                    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth=".9" className="w-[55%] h-[55%]">{illusSvg(product.illus)}</svg>
                    <button className="absolute top-2.5 left-2.5 w-8 h-8 rounded-full bg-surface/[.92] grid place-items-center text-sale backdrop-blur-[8px] cursor-pointer [&_svg]:w-3.5 [&_svg]:h-3.5" onClick={() => remove(product.id)}>
                      <IcoHeartFill />
                    </button>
                    <button
                      className="absolute bottom-2.5 left-2.5 right-2.5 bg-[rgba(27,15,29,.94)] text-bg py-2 rounded-lg text-[12px] font-medium flex justify-center gap-1.5 items-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 cursor-pointer font-body [&_svg]:w-3 [&_svg]:h-3"
                      onClick={() => addToCart(product)}
                    >
                      <IcoBag /> افزودن به سبد
                    </button>
                  </div>
                  <div className="p-3.5 px-4">
                    <span className="font-mono text-[10px] tracking-[.14em] uppercase text-muted">{product.cat}</span>
                    <h4 className="font-heading text-sm font-semibold leading-[1.3] mt-1">{product.fa}</h4>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-heading text-sm font-bold">
                        {formatToman(product.price)}<small className="text-[10px] text-muted font-normal mr-[3px]">ت</small>
                      </span>
                      <span className={`font-mono text-[10px] inline-flex items-center gap-1 ${product.oldPrice ? 'text-[#B98223]' : 'text-ok'} before:content-[''] before:w-[5px] before:h-[5px] before:rounded-full before:bg-current`}>
                        موجود
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Security Pane ────────────────────────────────────────────────────────────
const SecurityPane: FC = () => {
  const { logout } = useAuthStore()
  const [sec, setSec] = useState({ twofa: true, biometric: false, alerts: true })

  return (
    <div className="flex flex-col gap-[18px]">
      <div className={CARD}>
        <div className={SECTION_H}>
          <h2 className="font-heading text-[18px] font-semibold m-0 flex items-center gap-3"><span className={IC_SECT}><IcoLock /></span> امنیت و رمز</h2>
          <p className="m-0 mt-1.5 text-[13px] text-muted mr-11">تنظیمات امنیتی و رمزِ ورودِ حساب خود را مدیریت کنید.</p>
        </div>
        <div className={SECTION_B}>
          {([
            { key: 'twofa',     title: 'تأییدِ دو مرحله‌ای',  desc: 'ارسالِ کدِ تأیید به موبایل هنگامِ ورود' },
            { key: 'biometric', title: 'ورود بیومتریک',        desc: 'استفاده از اثرِ انگشت یا تشخیصِ چهره' },
            { key: 'alerts',    title: 'اعلانِ ورود جدید',     desc: 'اطلاع‌رسانی از هر ورودِ جدید به حساب' },
          ] as const).map(({ key, title, desc }) => (
            <div key={key} className="flex items-start gap-3.5 py-3.5 border-t border-rule first:border-t-0 first:pt-0">
              <span className="w-[34px] h-[34px] rounded-full bg-bg-2 grid place-items-center text-copper shrink-0 [&_svg]:w-[15px] [&_svg]:h-[15px]"><IcoLock /></span>
              <div className="flex-1">
                <h4 className="font-heading text-[13px] font-semibold m-0">{title}</h4>
                <p className="m-0 mt-0.5 text-[11px] text-muted">{desc}</p>
              </div>
              <label className="relative w-9 h-5 shrink-0 cursor-pointer mt-0.5">
                <input type="checkbox" className="sr-only peer" checked={sec[key]} onChange={(e) => setSec((s) => ({ ...s, [key]: e.target.checked }))} />
                <span className="absolute inset-0 bg-bg-2 rounded-full transition-colors peer-checked:bg-ink after:content-[''] after:absolute after:top-0.5 after:right-0.5 after:w-4 after:h-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:-translate-x-4" />
              </label>
            </div>
          ))}
        </div>
        <div className="px-7 py-[18px] bg-surface-2 border-t border-rule flex justify-between items-center gap-3">
          <span className="text-[11px] text-muted">آخرین ورود: امروز · ۱۰:۴۵</span>
          <button className={`${BTN_MUTE} ${BTN_SM}`}>تغییرِ رمزِ ورود</button>
        </div>
      </div>

      <div className={CARD}>
        <div className={SECTION_H}>
          <h2 className="font-heading text-[18px] font-semibold m-0 flex items-center gap-3">
            <span className={`${IC_SECT} text-sale`}><IcoLogout /></span> خروج از حساب
          </h2>
          <p className="m-0 mt-1.5 text-[13px] text-muted mr-11">از تمامِ دستگاه‌ها خارج شوید.</p>
        </div>
        <div className={SECTION_B}>
          <button className={`${BTN_MUTE} ${BTN_SM} text-sale [&_svg]:w-[14px] [&_svg]:h-[14px]`} onClick={() => logout()}>
            <IcoLogout /> خروج از همه‌ی دستگاه‌ها
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main AccountPage ─────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'overview',   icon: <IcoGrid />,  label: 'پیش‌خوان',         countKey: null },
  { id: 'profile',    icon: <IcoUser />,  label: 'پروفایل',           countKey: null },
  { id: 'orders',     icon: <IcoBag />,   label: 'سفارش‌ها',          countKey: 'orders' },
  { id: 'addresses',  icon: <IcoPin />,   label: 'آدرس‌ها',           countKey: 'addresses' },
  { id: 'wishlist',   icon: <IcoHeart />, label: 'علاقه‌مندی‌ها',     countKey: 'wishlist' },
  { id: 'security',   icon: <IcoLock />,  label: 'امنیت و رمز',       countKey: null },
] as const

const AccountPage: FC = () => {
  usePageMeta({ title: 'حساب کاربری' })
  const [tab, setTab] = useState<Tab>('overview')
  const { profile, logout, orders, addresses, fetchOrders, fetchAddresses, isLoggedIn } = useAuthStore()

  const createdAt    = profile?.createdAt
  const memberSince  = useMemo(() => {
    if (!createdAt) return null
    return new Date(createdAt).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long' })
  }, [createdAt])

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = purplePickerCSS
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [])

  useEffect(() => {
    if (!isLoggedIn) return
    fetchOrders().catch(() => {})
    fetchAddresses().catch(() => {})
  }, [isLoggedIn, fetchOrders, fetchAddresses])
  const wishCount = useWishlistStore((s) => s.items.length)

  const counts: Record<string, number> = { orders: orders.length, addresses: addresses.length, wishlist: wishCount }

  return (
    <div className="min-h-[60vh] animate-rise">
      {/* Intro band */}
      <section className="py-9 pb-7">
        <div className="max-w-[1480px] mx-auto px-[clamp(20px,4vw,56px)]">
          <div className="flex justify-between items-end gap-8 flex-wrap max-[640px]:flex-col max-[640px]:items-start">
            <div className="flex items-center gap-[18px]">
              <div className={AVA_MD}>
                {profile?.avatarUrl
                  ? <img src={profile.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                  : firstLetter(profile?.name)
                }
              </div>
              <div>
                <span className="font-display italic font-normal text-sm tracking-[.04em] text-copper inline-flex items-center gap-2.5 before:content-[''] before:block before:w-[22px] before:h-px before:bg-current before:opacity-60">
                  حسابِ کاربری
                </span>
                <h1 className="mt-1 font-heading text-[clamp(24px,3vw,36px)] font-bold m-0 leading-[1.1] tracking-[-0.01em]">
                  خوش آمدید، <em className="font-display italic font-normal text-copper">{profile?.name?.split(' ')[0]}</em>
                </h1>
                <div className="flex items-center gap-2.5 mt-1.5 text-[13px] text-muted flex-wrap">
                  {memberSince && (
                    <>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-[3px] bg-copper/[.12] text-copper rounded-full font-mono text-[10px] tracking-[.14em] uppercase font-medium [&_svg]:w-[11px] [&_svg]:h-[11px]">
                        <IcoStar />عضو
                      </span>
                      <span className="text-rule">·</span>
                      <span>عضو از {memberSince}</span>
                      <span className="text-rule">·</span>
                    </>
                  )}
                  <span>{toFa(orders.length)} سفارش</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              <button className={`${BTN_MUTE} ${BTN_SM} [&_svg]:w-3.5 [&_svg]:h-3.5`} onClick={() => setTab('orders')}><IcoClock /> تاریخچه‌ی سفارش‌ها</button>
              <button className={`${BTN_PRIMARY} ${BTN_SM} [&_svg]:w-3.5 [&_svg]:h-3.5`} onClick={() => setTab('overview')}><IcoSearch /> پیش‌خوان</button>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard */}
      <main className="pb-20">
        <div className="max-w-[1480px] mx-auto px-[clamp(20px,4vw,56px)]">
          <div className="grid grid-cols-[260px_1fr] gap-6 items-start max-[1100px]:grid-cols-1">
            {/* Sidebar */}
            <aside className="sticky top-24 bg-surface rounded-[var(--radius)] border border-rule overflow-hidden max-[1100px]:static">
              <div className="py-[18px] px-5 pb-4 border-b border-rule flex items-center gap-3">
                <span className={AVA_SM}>
                  {profile?.avatarUrl
                    ? <img src={profile.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                    : firstLetter(profile?.name)
                  }
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="font-heading text-sm font-semibold leading-[1.2] whitespace-nowrap overflow-hidden text-ellipsis">{profile?.name}</span>
                  <span className="font-mono text-[11px] text-muted tracking-[.04em]" dir="ltr" style={{ textAlign: 'right' }}>{toFa(profile?.phone ?? '')}</span>
                </div>
              </div>
              <nav className="p-2 max-[1100px]:flex max-[1100px]:flex-wrap">
                {NAV_ITEMS.map(({ id, icon, label, countKey }) => (
                  <button
                    key={id}
                    className={`flex items-center gap-3 px-[13px] py-[11px] rounded-[10px] text-sm transition-[background,color] cursor-pointer w-full text-right font-body max-[1100px]:w-auto max-[1100px]:flex-none ${
                      tab === id ? 'bg-ink text-bg' : 'text-ink-2 hover:bg-bg-2 hover:text-ink'
                    }`}
                    onClick={() => setTab(id as Tab)}
                  >
                    <span className={`w-8 h-8 rounded-lg grid place-items-center shrink-0 transition-[color,background] [&_svg]:w-[15px] [&_svg]:h-[15px] ${
                      tab === id ? 'bg-white/[.12] text-copper' : 'bg-bg-2 text-ink-2'
                    }`}>
                      {icon}
                    </span>
                    <span className="flex-1">{label}</span>
                    {countKey && counts[countKey] > 0 && (
                      <span className={`font-mono text-[10px] tracking-[.04em] px-[7px] py-[2px] rounded-full ${
                        tab === id ? 'bg-white/[.18] text-bg' : 'bg-bg-2 text-ink-2'
                      }`}>
                        {toFa(counts[countKey])}
                      </span>
                    )}
                  </button>
                ))}
                <hr className="h-px bg-rule border-0 my-2 max-[1100px]:w-full" />
                <button
                  className="flex items-center gap-3 px-[13px] py-[11px] rounded-[10px] text-sm text-sale transition-[background,color] cursor-pointer w-full text-right font-body max-[1100px]:w-auto max-[1100px]:flex-none hover:bg-bg-2"
                  onClick={() => logout()}
                >
                  <span className="w-8 h-8 rounded-lg bg-sale/[.08] grid place-items-center text-sale shrink-0 [&_svg]:w-[15px] [&_svg]:h-[15px]"><IcoLogout /></span>
                  <span className="flex-1">خروج از حساب</span>
                </button>
              </nav>
            </aside>

            {/* Panes */}
            <div>
              {tab === 'overview'   && <OverviewPane  setTab={setTab} />}
              {tab === 'profile'    && <ProfilePane />}
              {tab === 'orders'     && <OrdersPane />}
              {tab === 'addresses'  && <AddressesPane />}
              {tab === 'wishlist'   && <WishlistPane />}
              {tab === 'security'   && <SecurityPane />}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AccountPage
