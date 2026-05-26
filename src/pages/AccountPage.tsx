import { usePageMeta } from '../hooks/usePageMeta'
import { type FC, useState, useEffect, useMemo, useRef } from 'react'
import { useAuthStore } from '../store/authStore'
import { useWishlistStore } from '../store/wishlistStore'
import { useCartStore } from '../store/cartStore'
import { formatToman, toFa } from '../utils/format'
import type { Order, OrderStatus, Address } from '../types'
import { Modal } from '../components/ui/Modal'
import { PROVINCES, CITIES_BY_PROVINCE } from '../data/locations'
import 'react-multi-date-picker/styles/colors/purple.css'
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
  pending: 'proc',
  processing: 'proc',
  shipped: 'shipped',
  delivered: 'deliv',
  cancelled: 'cancel',
}
const STATUS_FA: Record<OrderStatus, string> = {
  pending: 'در انتظار',
  processing: 'در حالِ آماده‌سازی',
  shipped: 'در راه',
  delivered: 'تحویل شد',
  cancelled: 'لغو شده',
}
const TIMELINE_STEPS: Record<OrderStatus, string[]> = {
  pending: ['ثبتِ سفارش'],
  processing: ['ثبتِ سفارش', 'آماده‌سازی'],
  shipped: ['ثبتِ سفارش', 'آماده‌سازی', 'ارسال شد'],
  delivered: ['ثبتِ سفارش', 'آماده‌سازی', 'ارسال شد', 'تحویلِ موفق'],
  cancelled: ['ثبتِ سفارش', 'لغو شده'],
}

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
  const orders = useAuthStore((s) => s.orders)
  const wishCount = useWishlistStore((s) => s.items.length)
  const inTransit = orders.filter((o) => o.status === 'shipped' || o.status === 'processing').length

  const thisMonthOrders = useMemo(() => {
    const now = new Date()
    return orders.filter((o) => {
      const d = new Date(o.date)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length
  }, [orders])

  return (
    <div className="pane active">
      <div className="kpis">
        <div className="kpi">
          <div className="kpi-top"><span className="ic"><IcoBag /></span>{thisMonthOrders > 0 && <span className="delta">+{toFa(thisMonthOrders)} این ماه</span>}</div>
          <div className="kpi-body"><div className="v">{toFa(orders.length)}</div><div className="lbl">سفارش‌های کل</div></div>
        </div>
        <div className="kpi">
          <div className="kpi-top"><span className="ic"><IcoTruck /></span>{inTransit > 0 && <span className="delta">در راه</span>}</div>
          <div className="kpi-body"><div className="v">{toFa(inTransit)}</div><div className="lbl">در حالِ ارسال</div></div>
        </div>
        <div className="kpi">
          <div className="kpi-top"><span className="ic"><IcoHeart /></span></div>
          <div className="kpi-body"><div className="v">{toFa(wishCount)}<small>قطعه</small></div><div className="lbl">علاقه‌مندی‌ها</div></div>
        </div>
        <div className="kpi">
          <div className="kpi-top"><span className="ic"><IcoStar /></span></div>
          <div className="kpi-body"><div className="v muted">—</div><div className="lbl">امتیازِ شما</div></div>
        </div>
      </div>

      <div className="split-2">
        <div className="card">
          <div className="card-h">
            <h3><span className="ic"><IcoClock /></span> سفارش‌های اخیر</h3>
            <button className="all" onClick={() => setTab('orders')}>همه‌ی سفارش‌ها →</button>
          </div>
          <div className="mini-orders">
            {orders.slice(0, 3).map((order) => (
              <div key={order.id} className="mini-order">
                <div className="thumbs">
                  {order.items.slice(0, 2).map((item, i) => (
                    <span key={i} className="th">
                      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor">{illusSvg(item.illus)}</svg>
                    </span>
                  ))}
                  {order.items.length > 2 && <span className="th more">+{toFa(order.items.length - 2)}</span>}
                </div>
                <div className="meta">
                  <span className="id">{order.id} · {order.date}</span>
                  <span className="name">{order.items[0].name}{order.items.length > 1 ? ` + ${toFa(order.items.length - 1)} قطعه` : ''}</span>
                </div>
                <span className={`pill ${STATUS_PILL[order.status]}`}>{STATUS_FA[order.status]}</span>
                <span className="price">{formatToman(order.total)}<small>ت</small></span>
              </div>
            ))}
            {orders.length === 0 && (
              <div style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--muted)', fontSize: '14px' }}>
                هنوز سفارشی ثبت نشده است
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-h">
            <h3><span className="ic"><IcoLightning /></span> دسترسیِ سریع</h3>
          </div>
          <div className="q-list">
            {[
              { icon: <IcoEmail />, title: 'پیگیریِ سفارش', desc: 'با کدِ رهگیری', tab: 'orders' as Tab },
              { icon: <IcoReorder />, title: 'درخواستِ بازگشت', desc: '۱۴ روز فرصت دارید', tab: 'orders' as Tab },
              { icon: <IcoInfo />, title: 'تماس با پشتیبانی', desc: 'پاسخگویی روزانه ۹–۲۱', tab: null },
              { icon: <IcoInvoice />, title: 'گارانتی و اصالت', desc: 'گواهی‌های دیجیتالِ شما', tab: null },
            ].map((item, i) => (
              <button key={i} className="q-item" onClick={() => item.tab && setTab(item.tab)}>
                <span className="ic">{item.icon}</span>
                <div className="t">
                  <div className="tt">{item.title}</div>
                  <div className="td">{item.desc}</div>
                </div>
                <span className="arr"><IcoArrowLeft /></span>
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
    name: profile?.name?.split(' ')[0] ?? '',
    family: profile?.name?.split(' ').slice(1).join(' ') ?? '',
    email: profile?.email ?? '',
    phone: profile?.phone ?? '',
    birthdate: profile?.birthDate ?? '',
    gender: profile?.gender ?? '',
    nationalId: profile?.nationalId ?? '',
  })
  const [notifs, setNotifs] = useState({ email: true, sms: true, offers: false, whatsapp: true })
  const [saved, setSaved] = useState(false)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSave = () => {
    updateProfile({
      ...profile!,
      name: `${form.name} ${form.family}`.trim(),
      email: form.email,
      phone: form.phone,
      birthDate: form.birthdate,
      gender: form.gender,
      nationalId: form.nationalId,
    })
      .then(() => { setSaved(true); setTimeout(() => setSaved(false), 2000) })
      .catch(() => {})
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarLoading(true)
    uploadAvatar(file).finally(() => { setAvatarLoading(false) })
  }

  const handleDeleteAvatar = () => {
    setAvatarLoading(true)
    deleteAvatar().finally(() => { setAvatarLoading(false) })
  }

  return (
    <div className="pane active" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div className="section">
        <div className="section-h">
          <h2><span className="ic"><IcoUser /></span> اطلاعاتِ شخصی</h2>
          <p>این اطلاعات روی فاکتورها و رسیدِ تحویلِ سفارش استفاده می‌شود.</p>
        </div>
        <div className="avatar-row">
          {profile?.avatarUrl
            ? <img src={profile.avatarUrl} alt="avatar" className="ava-lg" style={{ objectFit: 'cover', borderRadius: '50%' }} />
            : <span className="ava-lg">{firstLetter(profile?.name)}</span>
          }
          <div className="t">
            <h4>عکسِ پروفایل</h4>
            <p>JPG یا PNG · حداکثر ۲ مگابایت · ۴۰۰×۴۰۰ پیکسل</p>
          </div>
          <div className="ax">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />
            <button
              className="btn btn-mute btn-sm"
              disabled={avatarLoading}
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarLoading ? '...' : 'بارگذاریِ عکس'}
            </button>
            {profile?.avatarUrl && (
              <button
                className="btn btn-sm"
                style={{ color: 'var(--sale)' }}
                disabled={avatarLoading}
                onClick={handleDeleteAvatar}
              >
                حذف
              </button>
            )}
          </div>
        </div>
        <div className="section-b">
          <div className="form-grid">
            <div className="f-field">
              <label>نام <span className="req">*</span></label>
              <input className="f-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="f-field">
              <label>نامِ خانوادگی <span className="req">*</span></label>
              <input className="f-input" value={form.family} onChange={(e) => setForm((f) => ({ ...f, family: e.target.value }))} />
            </div>
            <div className="f-field">
              <label>ایمیل <span className="verified"><IcoCheck />تأیید شده</span></label>
              <input className="f-input" dir="ltr" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="f-field">
              <label>موبایل <span className="verified"><IcoCheck />تأیید شده</span></label>
              <input className="f-input" dir="ltr" value={toFa(form.phone)} disabled />
            </div>
            <div className="f-field">
              <label>تاریخِ تولد <span className="opt">(اختیاری)</span></label>
              <DatePicker
                calendar={persian}
                locale={persian_fa}
                value={form.birthdate ? (() => { const d = new Date(form.birthdate); return isNaN(d.getTime()) ? '' : d })() : ''}
                onChange={(date: DateObject | null) => {
                  setForm((f) => ({ ...f, birthdate: date ? date.toDate().toISOString().split('T')[0] : '' }))
                }}
                inputClass="f-input"
                containerStyle={{ width: '100%' }}
                maxDate={new Date()}
                format="YYYY/MM/DD"
                placeholder="انتخاب تاریخِ تولد"
                calendarPosition="bottom-right"
                arrow={false}
              />
            </div>
            <div className="f-field">
              <label>جنسیت <span className="opt">(اختیاری)</span></label>
              <select className="f-select" value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}>
                <option value="">انتخاب کنید</option>
                {GENDER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="f-field full">
              <label>کدِ ملی <span className="opt">(برای صدورِ فاکتورِ رسمی)</span></label>
              <input className="f-input" placeholder="۰۰۸۷۶۵۴۳۲۱" value={form.nationalId} onChange={(e) => setForm((f) => ({ ...f, nationalId: e.target.value }))} />
            </div>
          </div>
        </div>
        <div className="section-actions">
          <span className="hint">آخرین تغییر: {profile?.updatedAt ? new Date(profile.updatedAt).toLocaleDateString('fa-IR') : '—'}</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-mute btn-sm">لغو</button>
            <button className="btn btn-primary btn-sm" onClick={handleSave}>
              {saved ? '✓ ذخیره شد' : 'ذخیره‌ی تغییرات'}
            </button>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-h">
          <h2><span className="ic"><IcoBell /></span> اعلان‌ها و ارتباطات</h2>
          <p>کنترل کنید چه پیام‌هایی از ما دریافت کنید.</p>
        </div>
        <div className="section-b">
          {([
            { key: 'email', icon: <IcoEmail />, title: 'خبرنامه‌ی ایمیلی', desc: 'هر دو هفته یک ایمیل با جدیدترین قطعات و پیشنهادها' },
            { key: 'sms', icon: <IcoPhone />, title: 'پیامکِ سفارش', desc: 'وضعیتِ ارسال و تحویل از طریقِ SMS' },
            { key: 'offers', icon: <IcoStar />, title: 'پیشنهادهای ویژه', desc: 'دسترسیِ زودهنگام و تخفیف‌های اعضای طلایی' },
            { key: 'whatsapp', icon: <IcoWhatsApp />, title: 'پیام‌رسانِ واتس‌اپ', desc: 'پشتیبانی و اطلاع‌رسانی از طریقِ واتس‌اپ' },
          ] as const).map(({ key, icon, title, desc }) => (
            <div key={key} className="toggle-row">
              <span className="ic">{icon}</span>
              <div className="t"><h4>{title}</h4><p>{desc}</p></div>
              <label className="sw-toggle">
                <input type="checkbox" checked={notifs[key]} onChange={(e) => setNotifs((n) => ({ ...n, [key]: e.target.checked }))} />
                <span className="sl"></span>
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
    addItem({
      id: item.productId,
      fa: item.name,
      en: item.name,
      cat: '',
      catId: '',
      price: item.price,
      oldPrice: null,
      badge: null,
      illus: item.illus || 'NecklaceB',
      illusAlt: 'NecklaceC',
      meta: [],
    })
  })
}

// ─── Orders Pane ──────────────────────────────────────────────────────────────
const OrdersPane: FC = () => {
  const orders = useAuthStore((s) => s.orders)
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)
  const [expanded, setExpanded] = useState<string | null>(orders[0]?.id ?? null)
  const [filter, setFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [dateRange, setDateRange] = useState('all')

  const filtered = useMemo(() => {
    let result = orders
    if (filter === 'transit') result = result.filter((o) => o.status === 'shipped' || o.status === 'processing')
    else if (filter === 'delivered') result = result.filter((o) => o.status === 'delivered')
    else if (filter === 'cancelled') result = result.filter((o) => o.status === 'cancelled')

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter((o) =>
        o.id.toLowerCase().includes(q) ||
        o.items.some((it) => it.name.toLowerCase().includes(q)) ||
        (o.trackingCode ?? '').toLowerCase().includes(q)
      )
    }

    if (dateRange !== 'all') {
      const now = new Date()
      const months = dateRange === '6m' ? 6 : 12
      const cutoff = new Date(now.getFullYear(), now.getMonth() - months, now.getDate())
      result = result.filter((o) => new Date(o.date) >= cutoff)
    }

    return result
  }, [orders, filter, search, dateRange])

  return (
    <div className="pane active" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div className="orders-toolbar">
        <div className="search">
          <IcoSearch />
          <input
            placeholder="جستجو بر اساسِ کدِ سفارش، محصول…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="chips">
          <button className={`chip${filter === 'all' ? ' on' : ''}`} onClick={() => setFilter('all')}>همه <span className="n">{toFa(orders.length)}</span></button>
          <button className={`chip${filter === 'transit' ? ' on' : ''}`} onClick={() => setFilter('transit')}>در راه <span className="n">{toFa(orders.filter((o) => o.status === 'shipped' || o.status === 'processing').length)}</span></button>
          <button className={`chip${filter === 'delivered' ? ' on' : ''}`} onClick={() => setFilter('delivered')}>تحویل شده <span className="n">{toFa(orders.filter((o) => o.status === 'delivered').length)}</span></button>
          <button className={`chip${filter === 'cancelled' ? ' on' : ''}`} onClick={() => setFilter('cancelled')}>لغو شده <span className="n">{toFa(orders.filter((o) => o.status === 'cancelled').length)}</span></button>
        </div>
        <select
          className="f-select"
          style={{ width: 'auto', fontSize: '13px', padding: '9px 32px 9px 14px' }}
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
        >
          <option value="all">کل تاریخچه</option>
          <option value="6m">۶ ماهِ گذشته</option>
          <option value="12m">۱ سال</option>
        </select>
      </div>

      <div className="order-list">
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '56px 0', color: 'var(--muted)', fontSize: '14px' }}>
            سفارشی یافت نشد
          </div>
        )}
        {filtered.map((order) => {
          const isOpen = expanded === order.id
          const steps = TIMELINE_STEPS[order.status]
          const doneIdx = steps.length - 1
          return (
            <article key={order.id} className={`order${isOpen ? ' open' : ''}`}>
              <div className="order-head" onClick={() => setExpanded(isOpen ? null : order.id)}>
                <div className="id-block">
                  <span className="id">{order.id}</span>
                  <span className="date">{order.date} · {toFa(order.items.length)} قلم</span>
                </div>
                <div className="thumbs">
                  {order.items.slice(0, 2).map((item, i) => (
                    <span key={i} className="th">
                      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor">{illusSvg(item.illus)}</svg>
                    </span>
                  ))}
                  {order.items.length > 2 && <span className="th more">{toFa(order.items.length - 2)}+</span>}
                </div>
                <span className={`pill ${STATUS_PILL[order.status]}`}>{STATUS_FA[order.status]}</span>
                <span className="total">{formatToman(order.total)}<small>تومان</small></span>
                <span className="chev"><IcoChevDown /></span>
              </div>

              {isOpen && (
                <div className="order-body">
                  <div className="ob-grid">
                    <div>
                      <h4 style={{ fontFamily: 'var(--persian-heading)', fontSize: '13px', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <IcoBag /> اقلامِ سفارش
                      </h4>
                      <div className="ob-items">
                        {order.items.map((item, i) => (
                          <div key={i} className="ob-item">
                            <div className="th">
                              <span className="q">{toFa(item.qty)}</span>
                              <svg viewBox="0 0 100 100" fill="none" stroke="currentColor">{illusSvg(item.illus)}</svg>
                            </div>
                            <div className="info">
                              <span className="nm">{item.name}</span>
                              <span className="sub">قطعه‌ی جواهری</span>
                            </div>
                            <span className="price">{formatToman(item.price)}<small>ت</small></span>
                          </div>
                        ))}
                      </div>
                      <div className="ob-acts">
                        <button className="btn btn-primary" onClick={() => { reorderItems(order, addItem); openCart() }}><IcoReorder /> سفارشِ مجدد</button>
                        <button className="btn btn-mute" disabled title="API موجود نیست"><IcoInvoice /> دانلود فاکتور</button>
                        <button className="btn btn-mute" disabled title="API موجود نیست"><IcoStar /> ثبتِ نظر</button>
                        {order.status === 'delivered' && (
                          <button className="btn btn-mute" disabled style={{ color: 'var(--sale)' }} title="API موجود نیست">درخواستِ بازگشت</button>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="timeline">
                        <h4><IcoTruck /> وضعیتِ ارسال</h4>
                        {steps.map((step, i) => (
                          <div key={i} className={`tl-step${i < doneIdx ? ' done' : i === doneIdx ? ' done' : ''}`}>
                            <span className="dot"><IcoCheck /></span>
                            {i < steps.length - 1 && <span className="ln"></span>}
                            <div>
                              <div className="nm">{step}</div>
                              <div className="ts">{order.date}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {order.trackingCode && (
                        <div className="tracking">
                          <span className="l">رهگیری</span>
                          <span className="v">{order.trackingCode}</span>
                          <button title="کپی" onClick={() => navigator.clipboard?.writeText(order.trackingCode ?? '')}><IcoCopy /></button>
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
    if (!form.fullName.trim()) { setError('نام گیرنده الزامی است'); return }
    if (!form.phone.trim()) { setError('شماره تماس الزامی است'); return }
    if (!form.province) { setError('استان را انتخاب کنید'); return }
    if (!form.city.trim()) { setError('شهر الزامی است'); return }
    if (!form.street.trim()) { setError('آدرس الزامی است'); return }
    if (!form.postalCode.trim()) { setError('کد پستی الزامی است'); return }
    setLoading(true)
    setError('')
    try {
      if (isEdit) {
        await updateAddress(initial!.id, form)
      } else {
        await addAddress(form)
      }
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطا در ذخیره‌ی آدرس')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal onClose={onClose} ariaLabel={isEdit ? 'ویرایش آدرس' : 'آدرسِ جدید'}>
      <div className="addr-modal">
        <div className="addr-modal__head">
          <div className="addr-modal__title-wrap">
            <span className="addr-modal__icon"><IcoPin /></span>
            <h2 className="addr-modal__title">{isEdit ? 'ویرایشِ آدرس' : 'آدرسِ جدید'}</h2>
          </div>
          <button className="addr-modal__close" onClick={onClose} aria-label="بستن"><span>✕</span></button>
        </div>

        <div className="addr-modal__body">
          <div className="f-field">
            <label>برچسب <span className="opt">(اختیاری)</span></label>
            <input
              className="f-input"
              value={form.label}
              placeholder="مثلاً: خانه، محل کار، انبار…"
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
            />
          </div>

          <div className="addr-modal__section">
            <p className="addr-modal__section-label">اطلاعاتِ گیرنده</p>
            <div className="form-grid">
              <div className="f-field">
                <label>نام گیرنده <span className="req">*</span></label>
                <input className="f-input" value={form.fullName} placeholder="مثال: زهرا رضایی" onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} />
              </div>
              <div className="f-field">
                <label>شماره تماس <span className="req">*</span></label>
                <input className="f-input" dir="ltr" value={form.phone} placeholder="09123456789" onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
              </div>
            </div>
          </div>

          <div className="addr-modal__section">
            <p className="addr-modal__section-label">آدرس</p>
            <div className="form-grid">
              <div className="f-field">
                <label>استان <span className="req">*</span></label>
                <select className="f-select" value={form.province} onChange={(e) => setForm((f) => ({ ...f, province: e.target.value, city: '' }))}>
                  <option value="">انتخاب کنید</option>
                  {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="f-field">
                <label>شهر <span className="req">*</span></label>
                <select className="f-select" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} disabled={!form.province}>
                  <option value="">{form.province ? 'انتخاب شهر' : 'ابتدا استان را انتخاب کنید'}</option>
                  {(CITIES_BY_PROVINCE[form.province] ?? []).map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="f-field full">
                <label>آدرس کامل <span className="req">*</span></label>
                <input className="f-input" value={form.street} placeholder="خیابان، کوچه، پلاک، واحد" onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))} />
              </div>
              <div className="f-field">
                <label>کد پستی <span className="req">*</span></label>
                <input className="f-input" dir="ltr" value={form.postalCode} placeholder="1234567890" maxLength={10} onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))} />
              </div>
            </div>
          </div>

          <label className="addr-default-toggle">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
            />
            <span className="addr-default-toggle__box"></span>
            <span className="addr-default-toggle__text">تنظیم به‌عنوانِ آدرسِ پیش‌فرض</span>
          </label>

          {error && <p className="addr-modal__error">{error}</p>}
        </div>

        <div className="addr-modal__foot">
          <button className="btn btn-mute btn-sm" onClick={onClose} disabled={loading}>لغو</button>
          <button className="btn btn-primary btn-sm" onClick={handleSubmit} disabled={loading}>
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
    <div className="pane active">
      {modal.open && (
        <AddressModal
          initial={modal.address}
          onClose={() => setModal({ open: false })}
        />
      )}
      <div className="section" style={{ paddingBottom: 0 }}>
        <div className="section-h" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: 0 }}>
          <div>
            <h2><span className="ic"><IcoPin /></span> آدرس‌های من</h2>
            <p>برای ارسالِ سریع‌تر، می‌توانید چند آدرس ذخیره کنید.</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setModal({ open: true })}><IcoPlus /> آدرسِ جدید</button>
        </div>
        <div className="section-b" style={{ paddingTop: '8px' }}>
          <div className="adr-grid">
            {addresses.map((addr) => (
              <div key={addr.id} className={`adr${addr.isDefault ? ' def' : ''}`}>
                <div className="adr-head">
                  <span className="adr-tag">{addrIcon(addr.label)} {addr.label}</span>
                  {addr.isDefault && (
                    <span className="def-badge"><IcoStar /> پیش‌فرض</span>
                  )}
                </div>
                <div className="adr-body">
                  <div className="adr-name">
                    <span className="pin"><IcoPin /></span>
                    {addr.fullName}
                  </div>
                  <div className="adr-line">{addr.province}، {addr.city}، {addr.street}</div>
                  <div className="adr-meta">
                    <span><IcoPhone />{toFa(addr.phone)}</span>
                    <span><IcoCard />{toFa(addr.postalCode)}</span>
                  </div>
                </div>
                <div className="adr-foot">
                  {addr.isDefault
                    ? <button className="set-def" style={{ opacity: 0.45, cursor: 'default' }}>آدرسِ پیش‌فرض</button>
                    : <button className="set-def" onClick={() => { setDefaultAddress(addr.id) }}>تنظیم به‌عنوانِ پیش‌فرض</button>
                  }
                  <div className="acts">
                    <button className="adr-btn" onClick={() => setModal({ open: true, address: addr })}><IcoEdit />ویرایش</button>
                    <button className="adr-btn danger" onClick={() => { removeAddress(addr.id) }}><IcoTrash /></button>
                  </div>
                </div>
              </div>
            ))}
            <button className="adr-add" onClick={() => setModal({ open: true })}>
              <span className="ic"><IcoPlus /></span>
              <span className="ll">افزودنِ آدرسِ جدید</span>
              <span className="ss">می‌توانید تا ۵ آدرس داشته باشید</span>
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
  const openCart = useCartStore((s) => s.openCart)

  return (
    <div className="pane active">
      <div className="section">
        <div className="section-h" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h2><span className="ic"><IcoHeart /></span> علاقه‌مندی‌های من</h2>
            <p>قطعاتی که برای بعد نگه داشته‌اید — {toFa(items.length)} مورد</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {items.length > 0 && (
              <button className="btn btn-mute btn-sm" onClick={() => { items.forEach(addToCart); openCart() }}>
                انتقال همه به سبد
              </button>
            )}
          </div>
        </div>
        <div className="section-b">
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '56px 0', color: 'var(--muted)' }}>
              <div style={{ fontSize: '14px' }}>هیچ محصولی در علاقه‌مندی‌ها نیست</div>
            </div>
          ) : (
            <div className="wish-grid">
              {items.map((product) => (
                <article key={product.id} className="wish">
                  <div className="ph">
                    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor">{illusSvg(product.illus)}</svg>
                    <button className="heart" onClick={() => remove(product.id)}><IcoHeartFill /></button>
                    <button className="add-cart" onClick={() => addToCart(product)}>
                      <IcoBag /> افزودن به سبد
                    </button>
                  </div>
                  <div className="body">
                    <span className="cat-lbl">{product.cat}</span>
                    <h4 className="nm">{product.fa}</h4>
                    <div className="pr">
                      <span className="now">{formatToman(product.price)}<small>ت</small></span>
                      <span className={`stock${product.oldPrice ? ' low' : ''}`}>موجود</span>
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
    <div className="pane active">
      <div className="section">
        <div className="section-h">
          <h2><span className="ic"><IcoLock /></span> امنیت و رمز</h2>
          <p>تنظیمات امنیتی و رمزِ ورودِ حساب خود را مدیریت کنید.</p>
        </div>
        <div className="section-b">
          {([
            { key: 'twofa', title: 'تأییدِ دو مرحله‌ای', desc: 'ارسالِ کدِ تأیید به موبایل هنگامِ ورود' },
            { key: 'biometric', title: 'ورود بیومتریک', desc: 'استفاده از اثرِ انگشت یا تشخیصِ چهره' },
            { key: 'alerts', title: 'اعلانِ ورود جدید', desc: 'اطلاع‌رسانی از هر ورودِ جدید به حساب' },
          ] as const).map(({ key, title, desc }) => (
            <div key={key} className="toggle-row">
              <span className="ic"><IcoLock /></span>
              <div className="t"><h4>{title}</h4><p>{desc}</p></div>
              <label className="sw-toggle">
                <input type="checkbox" checked={sec[key]} onChange={(e) => setSec((s) => ({ ...s, [key]: e.target.checked }))} />
                <span className="sl"></span>
              </label>
            </div>
          ))}
        </div>
        <div className="section-actions">
          <span className="hint">آخرین ورود: امروز · ۱۰:۴۵</span>
          <button className="btn btn-mute btn-sm">تغییرِ رمزِ ورود</button>
        </div>
      </div>

      <div className="section">
        <div className="section-h">
          <h2><span className="ic" style={{ color: 'var(--sale)' }}><IcoLogout /></span> خروج از حساب</h2>
          <p>از تمامِ دستگاه‌ها خارج شوید.</p>
        </div>
        <div className="section-b">
          <button className="btn btn-mute btn-sm" style={{ color: 'var(--sale)' }} onClick={() => { logout() }}>
            <IcoLogout /> خروج از همه‌ی دستگاه‌ها
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main AccountPage ─────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'overview', icon: <IcoGrid />, label: 'پیش‌خوان', countKey: null },
  { id: 'profile', icon: <IcoUser />, label: 'پروفایل', countKey: null },
  { id: 'orders', icon: <IcoBag />, label: 'سفارش‌ها', countKey: 'orders' },
  { id: 'addresses', icon: <IcoPin />, label: 'آدرس‌ها', countKey: 'addresses' },
  { id: 'wishlist', icon: <IcoHeart />, label: 'علاقه‌مندی‌ها', countKey: 'wishlist' },
  { id: 'security', icon: <IcoLock />, label: 'امنیت و رمز', countKey: null },
] as const

const AccountPage: FC = () => {
  usePageMeta({ title: 'حساب کاربری' })
  const [tab, setTab] = useState<Tab>('overview')
  const { profile, logout, orders, addresses, fetchOrders, fetchAddresses, isLoggedIn } = useAuthStore()

  const createdAt = profile?.createdAt
  const memberSince = useMemo(() => {
    if (!createdAt) return null
    return new Date(createdAt).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long' })
  }, [createdAt])

  useEffect(() => {
    if (!isLoggedIn) return
    fetchOrders().catch(() => {})
    fetchAddresses().catch(() => {})
  }, [isLoggedIn, fetchOrders, fetchAddresses])
  const wishCount = useWishlistStore((s) => s.items.length)

  const counts: Record<string, number> = {
    orders: orders.length,
    addresses: addresses.length,
    wishlist: wishCount,
  }

  return (
    <div className="acc-page-wrap anim-in">
      <section className="intro">
        <div className="wrap">
          <div className="left">
            <div className="ava">
              {profile?.avatarUrl
                ? <img src={profile.avatarUrl} alt="avatar" className="img-cover" />
                : firstLetter(profile?.name)
              }
            </div>
            <div className="who">
              <span className="kicker">حسابِ کاربری</span>
              <h1 style={{ marginTop: '4px' }}>
                خوش آمدید، <em>{profile?.name?.split(' ')[0]}</em>
              </h1>
              <div className="meta">
                {memberSince && <><span className="lvl"><IcoStar />عضو</span><span className="sep">·</span></>}
                {memberSince && <><span>عضو از {memberSince}</span><span className="sep">·</span></>}
                <span>{toFa(orders.length)} سفارش</span>
              </div>
            </div>
          </div>
          <div className="actions">
            <button className="btn btn-mute btn-sm" onClick={() => setTab('orders')}>
              <IcoClock /> تاریخچه‌ی سفارش‌ها
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setTab('overview')}>
              <IcoSearch /> پیش‌خوان
            </button>
          </div>
        </div>
      </section>

      <main className="dash">
        <div className="wrap">
          <div className="dash-grid">
            <aside className="aside">
              <div className="aside-head">
                <span className="ava-sm">
                  {profile?.avatarUrl
                    ? <img src={profile.avatarUrl} alt="avatar" className="img-cover" />
                    : firstLetter(profile?.name)
                  }
                </span>
                <div className="info">
                  <span className="name">{profile?.name}</span>
                  <span className="phn">{toFa(profile?.phone ?? '')}</span>
                </div>
              </div>
              <nav className="aside-nav">
                {NAV_ITEMS.map(({ id, icon, label, countKey }) => (
                  <button
                    key={id}
                    className={`nav-item${tab === id ? ' on' : ''}`}
                    onClick={() => setTab(id as Tab)}
                  >
                    <span className="ic">{icon}</span>
                    <span className="lbl">{label}</span>
                    {countKey && counts[countKey] > 0 && (
                      <span className="n">{toFa(counts[countKey])}</span>
                    )}
                  </button>
                ))}
                <hr />
                <button className="nav-item logout" onClick={() => { logout() }}>
                  <span className="ic"><IcoLogout /></span>
                  <span className="lbl">خروج از حساب</span>
                </button>
              </nav>
            </aside>

            <div className="panes-wrap">
              {tab === 'overview' && <OverviewPane setTab={setTab} />}
              {tab === 'profile' && <ProfilePane />}
              {tab === 'orders' && <OrdersPane />}
              {tab === 'addresses' && <AddressesPane />}
              {tab === 'wishlist' && <WishlistPane />}
              {tab === 'security' && <SecurityPane />}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AccountPage
