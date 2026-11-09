import type { OrderStatus } from '../../types'
import {
  LayoutGrid,
  User,
  ShoppingBag,
  MapPin,
  Heart,
  CreditCard,
  Lock,
  LogOut,
  Star,
  Truck,
  Check,
  ChevronDown,
  ArrowRight,
  Search,
  Clock,
  Plus,
  Pencil,
  Trash2,
  Home,
  Building2,
  Copy,
  RefreshCw,
  FileText,
  Bell,
  Mail,
  Phone,
  Zap,
  Info,
} from 'lucide-react'
import { IconWhatsApp } from '../icons/BrandIcons'

export type Tab = 'overview' | 'profile' | 'orders' | 'addresses' | 'wishlist' | 'security'

export const STATUS_PILL: Record<OrderStatus, string> = {
  pending: 'proc',
  processing: 'proc',
  shipped: 'shipped',
  delivered: 'deliv',
  cancelled: 'cancel',
}
export const STATUS_FA: Record<OrderStatus, string> = {
  pending: 'در انتظار',
  processing: 'در حالِ آماده‌سازی',
  shipped: 'در راه',
  delivered: 'تحویل شد',
  cancelled: 'لغو شده',
}
export const TIMELINE_STEPS: Record<OrderStatus, string[]> = {
  pending: ['ثبتِ سفارش'],
  processing: ['ثبتِ سفارش', 'آماده‌سازی'],
  shipped: ['ثبتِ سفارش', 'آماده‌سازی', 'ارسال شد'],
  delivered: ['ثبتِ سفارش', 'آماده‌سازی', 'ارسال شد', 'تحویلِ موفق'],
  cancelled: ['ثبتِ سفارش', 'لغو شده'],
}

// ── Reusable style constants ───────────────────────────────────────────────────
export const PILL_COLORS: Record<string, string> = {
  deliv: 'bg-ok/[.12] text-ok',
  shipped: 'bg-[rgba(54,86,201,.12)] text-[#3656C9]',
  proc: 'bg-[rgba(185,130,35,.14)] text-[#B98223]',
  cancel: 'bg-sale/[.10] text-sale',
}
export const PILL_BASE =
  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[12px] uppercase font-medium whitespace-nowrap before:content-[""] before:w-[5px] before:h-[5px] before:rounded-full before:bg-current before:shrink-0'

export const IC_MD =
  'w-[38px] h-[38px] rounded-sm bg-bg-2 grid place-items-center text-copper shrink-0 [&_svg]:w-[18px] [&_svg]:h-[18px]'
export const IC_CIR =
  'w-8 h-8 rounded-full bg-bg-2 grid place-items-center text-copper shrink-0 [&_svg]:w-3.5 [&_svg]:h-3.5'
export const IC_SECT =
  'w-8 h-8 rounded-full bg-bg-2 grid place-items-center text-copper shrink-0 [&_svg]:w-4 [&_svg]:h-4'

export const AVA_SM =
  'w-[38px] h-[38px] rounded-full bg-gradient-to-br from-plum to-copper grid place-items-center text-white font-heading font-bold text-sm shrink-0 overflow-hidden'
export const AVA_MD =
  'w-16 h-16 rounded-full bg-gradient-to-br from-plum to-copper grid place-items-center text-white font-heading font-bold text-2xl shrink-0 shadow-[0_0_0_4px_var(--color-bg),0_0_0_5px_var(--color-rule)] overflow-hidden'
export const AVA_LG =
  'w-[72px] h-[72px] rounded-full bg-gradient-to-br from-plum to-copper grid place-items-center text-white font-heading font-bold text-[28px] shrink-0'

export const INPUT_CLS =
  'bg-bg border border-rule rounded-sm px-4 py-3 text-[15px] text-ink outline-none w-full transition-[border-color] focus:border-ink placeholder:text-muted placeholder:font-light disabled:opacity-50 disabled:cursor-not-allowed'
export const SELECT_BG = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%237A6555' stroke-width='1.8' stroke-linecap='round'><path d='m6 9 6 6 6-6'/></svg>")`
export const SELECT_CLS = `${INPUT_CLS} appearance-none cursor-pointer bg-no-repeat bg-[position:left_14px_center] bg-[length:14px] pl-[38px]`

export const CARD = 'bg-surface border border-rule rounded-[var(--radius)] overflow-hidden'
export const CARD_H =
  'px-6 py-5 pb-4 border-b border-rule flex justify-between items-center gap-3.5'
export const CARD_H3 = 'font-heading text-[16px] font-semibold m-0 flex items-center gap-2.5'
export const SECTION_H = 'px-7 py-[22px] pb-[18px] border-b border-rule'
export const SECTION_B = 'px-7 py-6 pb-7 max-[640px]:p-4'
export const F_FIELD = 'flex flex-col gap-[7px] min-w-0'
export const F_LABEL = 'text-[14px] font-medium text-ink flex items-center gap-1.5'

export const BTN_PRIMARY =
  'inline-flex items-center gap-2.5 px-[22px] py-[13px] rounded-full bg-ink text-bg font-medium text-sm border-0 cursor-pointer transition-[transform,background] hover:bg-plum hover:-translate-y-px font-body whitespace-nowrap'
export const BTN_MUTE =
  'inline-flex items-center gap-2.5 px-[22px] py-[13px] rounded-full bg-bg-2 text-ink-2 font-medium text-sm border border-rule cursor-pointer transition-all hover:bg-bg hover:text-ink hover:border-ink font-body whitespace-nowrap'
export const BTN_SM = 'px-3.5 py-2 text-xs'

export function firstLetter(name?: string | null) {
  return name?.trim()?.[0] ?? '؟'
}

export function illusSvg(illus: string) {
  if (illus?.includes('necklace') || illus?.includes('moonlight') || illus?.includes('phoenix'))
    return (
      <>
        <path d="M22 30 Q50 75 78 30" />
        <circle cx="50" cy="58" r="5" />
      </>
    )
  if (illus?.includes('bracelet') || illus?.includes('star'))
    return (
      <>
        <ellipse cx="50" cy="50" rx="30" ry="13" />
        <ellipse cx="50" cy="50" rx="24" ry="9" />
      </>
    )
  if (illus?.includes('ring') || illus?.includes('rose'))
    return (
      <>
        <circle cx="50" cy="55" r="13" />
        <path d="M44 41 L50 33 L56 41 Z" />
      </>
    )
  if (illus?.includes('earring') || illus?.includes('diamond'))
    return (
      <>
        <path d="M35 25c0 6 6 10 6 16M65 25c0 6 6 10 6 16" />
        <circle cx="35" cy="52" r="5" />
        <circle cx="65" cy="52" r="5" />
      </>
    )
  return (
    <>
      <path d="M22 30 Q50 75 78 30" />
      <circle cx="50" cy="58" r="5" />
    </>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────
export const SW = 1.6
export const IcoGrid = () => <LayoutGrid size={18} strokeWidth={SW} />
export const IcoUser = () => <User size={18} strokeWidth={SW} />
export const IcoBag = () => <ShoppingBag size={18} strokeWidth={SW} />
export const IcoPin = () => <MapPin size={18} strokeWidth={SW} />
export const IcoHeart = () => <Heart size={18} strokeWidth={SW} />
export const IcoHeartFill = () => <Heart size={18} strokeWidth={0} fill="currentColor" />
export const IcoCard = () => <CreditCard size={18} strokeWidth={SW} />
export const IcoLock = () => <Lock size={18} strokeWidth={SW} />
export const IcoLogout = () => <LogOut size={18} strokeWidth={SW} />
export const IcoStar = () => <Star size={18} strokeWidth={0} fill="currentColor" />
export const IcoTruck = () => <Truck size={18} strokeWidth={SW} />
export const IcoCheck = () => <Check size={18} strokeWidth={SW} />
export const IcoChevDown = () => <ChevronDown size={18} strokeWidth={SW} />
export const IcoArrowLeft = () => <ArrowRight size={18} strokeWidth={SW} />
export const IcoSearch = () => <Search size={18} strokeWidth={SW} />
export const IcoClock = () => <Clock size={18} strokeWidth={SW} />
export const IcoPlus = () => <Plus size={18} strokeWidth={SW} />
export const IcoEdit = () => <Pencil size={18} strokeWidth={SW} />
export const IcoTrash = () => <Trash2 size={18} strokeWidth={SW} />
export const IcoHome = () => <Home size={18} strokeWidth={SW} />
export const IcoOffice = () => <Building2 size={18} strokeWidth={SW} />
export const IcoCopy = () => <Copy size={18} strokeWidth={SW} />
export const IcoReorder = () => <RefreshCw size={18} strokeWidth={SW} />
export const IcoInvoice = () => <FileText size={18} strokeWidth={SW} />
export const IcoBell = () => <Bell size={18} strokeWidth={SW} />
export const IcoEmail = () => <Mail size={18} strokeWidth={SW} />
export const IcoPhone = () => <Phone size={18} strokeWidth={SW} />
export const IcoWhatsApp = () => <IconWhatsApp size={18} />
export const IcoLightning = () => <Zap size={18} strokeWidth={SW} />
export const IcoInfo = () => <Info size={18} strokeWidth={SW} />

export interface PaneProps {
  setTab: (t: Tab) => void
}
