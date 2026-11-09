import { usePageMeta } from '../hooks/usePageMeta'
import { type FC, lazy, Suspense, useState, useEffect, useMemo, useCallback } from 'react'
import { useAuthStore } from '../store/authStore'
import { useWishlistStore } from '../store/wishlistStore'
import { useUIStore } from '../store/uiStore'
import { BTN_CLS } from '../components/ui/Button'
import { toFa } from '../utils/format'
import purplePickerCSS from 'react-multi-date-picker/styles/colors/purple.css?inline'
import { User, MapPin, Heart, Truck } from 'lucide-react'
import {
  type Tab,
  AVA_MD,
  AVA_SM,
  BTN_MUTE,
  BTN_PRIMARY,
  BTN_SM,
  IcoBag,
  IcoClock,
  IcoGrid,
  IcoHeart,
  IcoLock,
  IcoLogout,
  IcoPin,
  IcoSearch,
  IcoStar,
  IcoUser,
  firstLetter,
} from '../components/account/shared'

// Each tab loads on demand, so the account page opens without downloading all six panes.
const OverviewPane = lazy(() => import('../components/account/OverviewPane'))
const ProfilePane = lazy(() => import('../components/account/ProfilePane'))
const OrdersPane = lazy(() => import('../components/account/OrdersPane'))
const AddressesPane = lazy(() => import('../components/account/AddressesPane'))
const WishlistPane = lazy(() => import('../components/account/WishlistPane'))
const SecurityPane = lazy(() => import('../components/account/SecurityPane'))

const PaneFallback = () => (
  <div
    className="animate-pulse flex flex-col gap-[18px]"
    aria-busy="true"
    aria-label="در حال بارگذاری"
  >
    <div className="h-40 bg-plate rounded-[var(--radius)]" />
    <div className="h-64 bg-plate rounded-[var(--radius)]" />
  </div>
)

const TAB_IDS: readonly Tab[] = [
  'overview',
  'profile',
  'orders',
  'addresses',
  'wishlist',
  'security',
]

/** The tab lives in the URL hash (/account#orders) so it can be linked to and the back button works. */
function readTabFromHash(): Tab {
  if (typeof window === 'undefined') return 'overview'
  const h = window.location.hash.slice(1) as Tab
  return TAB_IDS.includes(h) ? h : 'overview'
}

const NAV_ITEMS = [
  { id: 'overview', icon: <IcoGrid />, label: 'پیش‌خوان', countKey: null },
  { id: 'profile', icon: <IcoUser />, label: 'پروفایل', countKey: null },
  { id: 'orders', icon: <IcoBag />, label: 'سفارش‌ها', countKey: 'orders' },
  { id: 'addresses', icon: <IcoPin />, label: 'آدرس‌ها', countKey: 'addresses' },
  { id: 'wishlist', icon: <IcoHeart />, label: 'علاقه‌مندی‌ها', countKey: 'wishlist' },
  { id: 'security', icon: <IcoLock />, label: 'امنیت و رمز', countKey: null },
] as const

const AccountPage: FC = () => {
  usePageMeta({ title: 'ورود به حساب کاربری و پیگیری سفارش' })
  const [tab, setTabState] = useState<Tab>(readTabFromHash)
  const setTab = useCallback((t: Tab) => {
    window.location.hash = t === 'overview' ? '' : t
    setTabState(t)
  }, [])
  useEffect(() => {
    const onHash = () => setTabState(readTabFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  const profile = useAuthStore((s) => s.profile)
  const logout = useAuthStore((s) => s.logout)
  const orders = useAuthStore((s) => s.orders)
  const addresses = useAuthStore((s) => s.addresses)
  const fetchOrders = useAuthStore((s) => s.fetchOrders)
  const fetchAddresses = useAuthStore((s) => s.fetchAddresses)
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)

  const createdAt = profile?.createdAt
  const memberSince = useMemo(() => {
    if (!createdAt) return null
    return new Date(createdAt).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long' })
  }, [createdAt])

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = purplePickerCSS
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  useEffect(() => {
    if (!isLoggedIn) return
    fetchOrders().catch(() => {})
    fetchAddresses().catch(() => {})
  }, [isLoggedIn, fetchOrders, fetchAddresses])
  const wishCount = useWishlistStore((s) => s.items.length)

  const counts = useMemo<Record<string, number>>(
    () => ({ orders: orders.length, addresses: addresses.length, wishlist: wishCount }),
    [orders.length, addresses.length, wishCount],
  )

  // Signed-out visitors get a clear sign-in screen rather than an empty dashboard
  // full of "…" placeholders behind a modal.
  if (!isLoggedIn) return <GuestAccount />

  return (
    <div className="min-h-[60vh] animate-rise">
      {/* Intro band */}
      <section className="py-9 pb-7">
        <div className="max-w-[1480px] mx-auto px-[clamp(20px,4vw,56px)]">
          <div className="flex justify-between items-end gap-8 flex-wrap max-[640px]:flex-col max-[640px]:items-start">
            <div className="flex items-center gap-[18px]">
              <div className={AVA_MD}>
                {profile?.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  firstLetter(profile?.name)
                )}
              </div>
              <div>
                <span className="font-body text-[13px] text-copper-dark inline-flex items-center gap-2.5 before:content-[''] before:block before:w-[22px] before:h-px before:bg-current before:opacity-60">
                  حسابِ کاربری
                </span>
                <h1 className="mt-1 font-heading text-[clamp(24px,3vw,36px)] font-bold m-0 leading-[1.1] tracking-[-0.01em]">
                  خوش آمدید،{' '}
                  <em className="font-display italic font-normal text-copper">
                    {profile?.name?.split(' ')[0]}
                  </em>
                </h1>
                <div className="flex items-center gap-2.5 mt-1.5 text-[13px] text-muted flex-wrap">
                  {memberSince && (
                    <>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-[3px] bg-copper/[.12] text-copper rounded-full text-[12px] font-medium [&_svg]:w-[11px] [&_svg]:h-[11px]">
                        <IcoStar />
                        عضو
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
              <button
                className={`${BTN_MUTE} ${BTN_SM} [&_svg]:w-3.5 [&_svg]:h-3.5`}
                onClick={() => setTab('orders')}
              >
                <IcoClock /> تاریخچه‌ی سفارش‌ها
              </button>
              <button
                className={`${BTN_PRIMARY} ${BTN_SM} [&_svg]:w-3.5 [&_svg]:h-3.5`}
                onClick={() => setTab('overview')}
              >
                <IcoSearch /> پیش‌خوان
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard */}
      <section className="pb-20">
        <div className="max-w-[1480px] mx-auto px-[clamp(20px,4vw,56px)]">
          <div className="grid grid-cols-[260px_1fr] gap-6 items-start max-[1100px]:grid-cols-1">
            {/* Sidebar */}
            <aside className="sticky top-24 bg-surface rounded-[var(--radius)] border border-rule overflow-hidden max-[1100px]:static">
              <div className="py-[18px] px-5 pb-4 border-b border-rule flex items-center gap-3">
                <span className={AVA_SM}>
                  {profile?.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    firstLetter(profile?.name)
                  )}
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="font-heading text-sm font-semibold leading-[1.2] whitespace-nowrap overflow-hidden text-ellipsis">
                    {profile?.name}
                  </span>
                  <span
                    className="font-mono text-[12px] text-muted"
                    dir="ltr"
                    style={{ textAlign: 'right' }}
                  >
                    {toFa(profile?.phone ?? '')}
                  </span>
                </div>
              </div>
              <nav className="p-2 max-[1100px]:flex max-[1100px]:flex-wrap">
                {NAV_ITEMS.map(({ id, icon, label, countKey }) => (
                  <button
                    key={id}
                    className={`flex items-center gap-3 px-[13px] py-[11px] rounded-sm text-sm transition-[background,color] cursor-pointer w-full text-right font-body max-[1100px]:w-auto max-[1100px]:flex-none ${
                      tab === id ? 'bg-ink text-bg' : 'text-ink-2 hover:bg-bg-2 hover:text-ink'
                    }`}
                    onClick={() => setTab(id as Tab)}
                  >
                    <span
                      className={`w-8 h-8 rounded-lg grid place-items-center shrink-0 transition-[color,background] [&_svg]:w-[15px] [&_svg]:h-[15px] ${
                        tab === id ? 'bg-white/[.12] text-copper' : 'bg-bg-2 text-ink-2'
                      }`}
                    >
                      {icon}
                    </span>
                    <span className="flex-1">{label}</span>
                    {countKey && counts[countKey] > 0 && (
                      <span
                        className={`font-mono text-[12px] px-[7px] py-[2px] rounded-full ${
                          tab === id ? 'bg-white/[.18] text-bg' : 'bg-bg-2 text-ink-2'
                        }`}
                      >
                        {toFa(counts[countKey])}
                      </span>
                    )}
                  </button>
                ))}
                <hr className="h-px bg-rule border-0 my-2 max-[1100px]:w-full" />
                <button
                  className="flex items-center gap-3 px-[13px] py-[11px] rounded-sm text-sm text-sale transition-[background,color] cursor-pointer w-full text-right font-body max-[1100px]:w-auto max-[1100px]:flex-none hover:bg-bg-2"
                  onClick={() => logout()}
                >
                  <span className="w-8 h-8 rounded-lg bg-sale/[.08] grid place-items-center text-sale shrink-0 [&_svg]:w-[15px] [&_svg]:h-[15px]">
                    <IcoLogout />
                  </span>
                  <span className="flex-1">خروج از حساب</span>
                </button>
              </nav>
            </aside>

            {/* Panes */}
            <div>
              <Suspense fallback={<PaneFallback />}>
                {tab === 'overview' && <OverviewPane setTab={setTab} />}
                {tab === 'profile' && <ProfilePane />}
                {tab === 'orders' && <OrdersPane />}
                {tab === 'addresses' && <AddressesPane />}
                {tab === 'wishlist' && <WishlistPane />}
                {tab === 'security' && <SecurityPane />}
              </Suspense>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

const GUEST_PERKS = [
  { icon: Truck, text: 'پیگیری لحظه‌ای سفارش‌ها' },
  { icon: Heart, text: 'ذخیره‌ی علاقه‌مندی‌ها روی همه‌ی دستگاه‌ها' },
  { icon: MapPin, text: 'ثبت آدرس برای خرید سریع‌تر' },
] as const

function GuestAccount() {
  const openLogin = useUIStore((s) => s.openLogin)

  // Open the sign-in dialog straight away — that's why the visitor came here.
  useEffect(() => {
    openLogin()
  }, [openLogin])

  return (
    <section className="max-w-[560px] mx-auto px-[clamp(20px,4vw,56px)] py-16 max-md:py-10 text-center animate-rise">
      <span className="w-16 h-16 mx-auto rounded-full bg-copper/10 text-copper-dark grid place-items-center">
        <User size={28} strokeWidth={1.5} aria-hidden="true" />
      </span>
      <h2 className="font-heading font-bold text-[clamp(24px,3vw,30px)] text-ink mt-5 mb-2">
        ورود به حساب کاربری
      </h2>
      <p className="text-[15.5px] leading-[1.9] text-ink-2 m-0 mb-7">
        برای دیدن سفارش‌ها، آدرس‌ها و اطلاعات حساب، با شماره‌ی موبایل خود وارد شوید.
      </p>
      <button
        type="button"
        className={`${BTN_CLS} w-full justify-center`}
        onClick={() => openLogin()}
      >
        ورود / ثبت‌نام
      </button>
      <ul className="list-none p-0 m-0 mt-9 grid gap-3 text-start">
        {GUEST_PERKS.map(({ icon: PerkIcon, text }) => (
          <li
            key={text}
            className="flex items-center gap-3 px-4 py-3.5 rounded-[var(--radius)] bg-surface border border-rule text-[14.5px] text-ink-2"
          >
            <PerkIcon
              size={18}
              strokeWidth={1.7}
              className="text-copper-dark shrink-0"
              aria-hidden="true"
            />
            {text}
          </li>
        ))}
      </ul>
    </section>
  )
}

export default AccountPage
