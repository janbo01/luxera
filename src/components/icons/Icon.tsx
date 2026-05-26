import type { FC } from 'react'
import {
  Search, User, Heart, ShoppingBag, Globe, Menu, X, Plus, Minus,
  ArrowLeft, ArrowRight, ArrowUp, Sparkles, Check, Truck, Shield,
  MapPin, Clock, Pencil, LogOut, Trash2, ChevronDown, ChevronUp,
  ChevronLeft, ChevronRight, Folder, SlidersHorizontal, LayoutGrid,
  Home, Share2, Gift, CreditCard, Phone, Mail, RefreshCw,
  Tag, Lock, Building2, Copy, FileText, Bell, Zap, Info, Link,
  MessageCircle, type LucideProps,
} from 'lucide-react'

interface IconProps {
  name: string
  size?: number
  strokeWidth?: number
  className?: string
}

type LucideIcon = FC<LucideProps>

const ICONS: Record<string, LucideIcon> = {
  'search':        Search,
  'user':          User,
  'heart':         Heart,
  'bag':           ShoppingBag,
  'globe':         Globe,
  'menu':          Menu,
  'close':         X,
  'x':             X,
  'plus':          Plus,
  'minus':         Minus,
  'arrow':         ArrowLeft,
  'arrow-left':    ArrowLeft,
  'arrow-right':   ArrowRight,
  'arrow-up':      ArrowUp,
  'spark':         Sparkles,
  'check':         Check,
  'truck':         Truck,
  'shield':        Shield,
  'location':      MapPin,
  'map-pin':       MapPin,
  'clock':         Clock,
  'edit':          Pencil,
  'logout':        LogOut,
  'trash':         Trash2,
  'chevron-down':  ChevronDown,
  'chevron-up':    ChevronUp,
  'chevron-left':  ChevronLeft,
  'chevron-right': ChevronRight,
  'folder':        Folder,
  'sliders':       SlidersHorizontal,
  'collection':    LayoutGrid,
  'home':          Home,
  'share':         Share2,
  'gift':          Gift,
  'card':          CreditCard,
  'phone':         Phone,
  'mail':          Mail,
  'refresh':       RefreshCw,
  'tag':           Tag,
  'lock':          Lock,
  'office':        Building2,
  'copy':          Copy,
  'invoice':       FileText,
  'bell':          Bell,
  'zap':           Zap,
  'lightning':     Zap,
  'info':          Info,
  'link':          Link,
  'whatsapp':      MessageCircle,
  'message':       MessageCircle,
}

const FILLED = new Set(['heart-filled', 'star'])

const Icon: FC<IconProps> = ({ name, size = 18, strokeWidth = 1.6, className }) => {
  if (FILLED.has(name)) {
    const key = name === 'heart-filled' ? 'heart' : name
    const Comp = ICONS[key]
    if (!Comp) return null
    return <Comp size={size} strokeWidth={0} fill="currentColor" className={className} />
  }

  const Comp = ICONS[name]
  if (!Comp) return null
  return <Comp size={size} strokeWidth={strokeWidth} className={className} />
}

export default Icon
