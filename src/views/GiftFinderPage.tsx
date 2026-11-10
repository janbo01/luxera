import { useCallback, useEffect, useMemo, useState, type FC } from 'react'
import { usePageMeta } from '../hooks/usePageMeta'
import Breadcrumb from '../components/shared/Breadcrumb'
import ProductCard from '../components/product/ProductCard'
import Icon from '../components/icons/Icon'
import { useCartStore } from '../store/cartStore'
import { CATEGORIES } from '../data/categories'
import { listCategories, listProducts, adaptProduct } from '../api/product'
import { formatNumber, toFa } from '../utils/format'
import type { Product } from '../types'

interface Option {
  id: string
  label: string
}

const RECIPIENTS: (Option & { cats: string[] })[] = [
  { id: 'self', label: 'خودم', cats: [] },
  { id: 'mother', label: 'مادر', cats: ['necklaces', 'bracelets', 'sets'] },
  { id: 'partner', label: 'همسر یا پارتنر', cats: ['necklaces', 'earrings', 'sets'] },
  { id: 'friend', label: 'دوست یا خواهر', cats: ['bracelets', 'rings', 'earrings'] },
  { id: 'bride', label: 'عروس', cats: ['bridal', 'sets'] },
]

const OCCASIONS: Option[] = [
  { id: 'birthday', label: 'تولد' },
  { id: 'anniversary', label: 'سالگرد' },
  { id: 'yalda', label: 'یلدا' },
  { id: 'nowruz', label: 'نوروز' },
  { id: 'mothers-day', label: 'روز مادر' },
  { id: 'none', label: 'بدون مناسبت' },
]

const BUDGETS: (Option & { min: number; max: number })[] = [
  { id: 'b1', label: 'تا ۵۰۰ هزار', min: 0, max: 500_000 },
  { id: 'b2', label: '۵۰۰ هزار تا ۱ میلیون', min: 500_000, max: 1_000_000 },
  { id: 'b3', label: '۱ تا ۲ میلیون', min: 1_000_000, max: 2_000_000 },
  { id: 'b4', label: 'بالای ۲ میلیون', min: 2_000_000, max: Infinity },
]

const KEYS = ['for', 'occasion', 'budget'] as const
type Key = (typeof KEYS)[number]
type Answers = Record<Key, string>

function readAnswers(): Answers {
  const empty: Answers = { for: '', occasion: '', budget: '' }
  if (typeof window === 'undefined') return empty
  const q = new URLSearchParams(window.location.search)
  return {
    for: RECIPIENTS.some((o) => o.id === q.get('for')) ? q.get('for')! : '',
    occasion: OCCASIONS.some((o) => o.id === q.get('occasion')) ? q.get('occasion')! : '',
    budget: BUDGETS.some((o) => o.id === q.get('budget')) ? q.get('budget')! : '',
  }
}

const Group: FC<{
  title: string
  step: number
  options: Option[]
  value: string
  onChange: (id: string) => void
}> = ({ title, step, options, value, onChange }) => (
  <fieldset className="border-0 p-0 m-0 min-w-0">
    <legend className="font-heading font-semibold text-[18px] mb-3 flex items-center gap-2.5">
      <span className="w-7 h-7 rounded-full bg-ink text-bg grid place-items-center text-[13px] font-body">
        {toFa(step)}
      </span>
      {title}
    </legend>
    <div role="radiogroup" aria-label={title} className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(value === o.id ? '' : o.id)}
          className={`min-h-11 px-5 rounded-full text-[14px] cursor-pointer transition-colors duration-150 ${value === o.id ? 'bg-plum text-bg' : 'bg-surface ring-1 ring-inset ring-rule text-ink-2 hover:ring-ink'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  </fieldset>
)

const GiftFinderPage: FC = () => {
  usePageMeta({
    title: 'راهنمای انتخاب هدیه',
    description: 'هدیه‌ی مناسب جواهر فانتزی را بر اساس گیرنده، مناسبت و بودجه پیدا کنید.',
    canonical: '/gift',
  })
  const addItem = useCartStore((s) => s.addItem)
  // This page only renders in the browser (client:only), so the shared link can be read up front.
  const [answers, setAnswers] = useState<Answers>(readAnswers)
  const [pool, setPool] = useState<Product[]>([])
  const [catIdBySlug, setCatIdBySlug] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let cancelled = false
    void Promise.all([listProducts({ limit: 60 }), listCategories()])
      .then(([{ items }, cats]) => {
        if (cancelled) return
        setPool(items.filter((p) => p.stock_count !== 0).map((p) => adaptProduct(p)))
        const byName = new Map(cats.map((c) => [c.name, c.id]))
        const map: Record<string, string> = {}
        for (const c of CATEGORIES) {
          const id = byName.get(c.fa)
          if (id) map[c.id] = id
        }
        setCatIdBySlug(map)
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  const set = useCallback((key: Key, value: string) => {
    setAnswers((prev) => {
      const next = { ...prev, [key]: value }
      const q = new URLSearchParams()
      KEYS.forEach((k) => next[k] && q.set(k, next[k]))
      const qs = q.toString()
      window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname)
      return next
    })
    setCopied(false)
  }, [])

  const touched = KEYS.some((k) => answers[k])

  const results = useMemo(() => {
    const budget = BUDGETS.find((b) => b.id === answers.budget)
    const recipient = RECIPIENTS.find((r) => r.id === answers.for)
    const preferred = new Set((recipient?.cats ?? []).map((s) => catIdBySlug[s]).filter(Boolean))
    const inBudget = pool.filter((p) => !budget || (p.price >= budget.min && p.price < budget.max))
    if (preferred.size === 0) return inBudget.slice(0, 12)
    const first = inBudget.filter((p) => preferred.has(p.catId))
    const rest = inBudget.filter((p) => !preferred.has(p.catId))
    return (first.length >= 4 ? first : [...first, ...rest]).slice(0, 12)
  }, [pool, answers.budget, answers.for, catIdBySlug])

  const headline = useMemo(() => {
    const r = RECIPIENTS.find((x) => x.id === answers.for)
    const o = OCCASIONS.find((x) => x.id === answers.occasion)
    const b = BUDGETS.find((x) => x.id === answers.budget)
    const parts = [
      r && r.id !== 'self' ? `برای ${r.label}` : r ? 'برای خودتان' : '',
      o && o.id !== 'none' ? `به مناسبت ${o.label}` : '',
      b ? `در بودجه‌ی ${b.label} تومان` : '',
    ].filter(Boolean)
    return parts.join('، ')
  }, [answers])

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
    } catch {
      window.prompt?.('لینک را کپی کنید', window.location.href)
    }
  }

  return (
    <>
      <Breadcrumb items={[{ label: 'خانه', to: '/' }, { label: 'راهنمای هدیه' }]} />
      <div className="max-w-[var(--maxw)] mx-auto px-[var(--pad)] pb-[clamp(56px,7vw,96px)]">
        <header className="py-[clamp(32px,5vw,64px)] max-w-[60ch]">
          <span className="kicker mb-3">راهنمای هدیه</span>
          <h1 className="font-heading font-bold text-[clamp(32px,4.4vw,60px)] leading-[1.1] m-0 mb-4">
            هدیه‌ی مناسب را پیدا کنید
          </h1>
          <p className="m-0 text-muted text-[15px] leading-[1.9]">
            هر سه پرسش اختیاری است. هر چه بیشتر پاسخ بدهید، پیشنهادها دقیق‌تر می‌شود.
          </p>
        </header>

        <div className="grid gap-8 pb-10 border-b border-rule">
          <Group
            step={1}
            title="هدیه برای چه کسی است؟"
            options={RECIPIENTS}
            value={answers.for}
            onChange={(v) => set('for', v)}
          />
          <Group
            step={2}
            title="برای کدام مناسبت؟"
            options={OCCASIONS}
            value={answers.occasion}
            onChange={(v) => set('occasion', v)}
          />
          <Group
            step={3}
            title="بودجه‌ی شما چقدر است؟"
            options={BUDGETS}
            value={answers.budget}
            onChange={(v) => set('budget', v)}
          />
        </div>

        <section className="pt-10" aria-live="polite">
          <div className="flex items-end justify-between gap-4 flex-wrap mb-8">
            <div className="min-w-0">
              <h2 className="font-heading font-bold text-[24px] m-0">
                {touched ? 'پیشنهادهای ما' : 'پیشنهادهای محبوب'}
              </h2>
              {headline && <p className="m-0 mt-1.5 text-muted text-[14px]">{headline}</p>}
            </div>
            {touched && (
              <button
                type="button"
                onClick={copyLink}
                className="inline-flex items-center gap-2 min-h-11 px-4 rounded-full ring-1 ring-inset ring-rule bg-surface text-[13.5px] text-ink-2 cursor-pointer hover:ring-ink"
              >
                <Icon name={copied ? 'check' : 'link'} size={14} />
                {copied ? 'لینک کپی شد' : 'کپی لینک این پیشنهادها'}
              </button>
            )}
          </div>

          {loading ? (
            <div className="products-grid" aria-busy="true">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-plate rounded-[var(--radius)]" />
                  <div className="h-4 bg-plate rounded w-4/5 mt-3.5" />
                </div>
              ))}
            </div>
          ) : results.length > 0 ? (
            <div className="products-grid">
              {results.map((p, i) => (
                <ProductCard key={p.id} product={p} onAdd={addItem} priority={i < 4} />
              ))}
            </div>
          ) : (
            <div className="p-8 bg-surface rounded-[var(--radius)] border border-rule text-center">
              <p className="m-0 mb-4 text-ink-2">
                در بودجه‌ی انتخابی قطعه‌ای پیدا نشد
                {answers.budget &&
                  ` (${formatNumber(BUDGETS.find((b) => b.id === answers.budget)!.min)} تومان به بالا را امتحان کنید)`}
                .
              </p>
              <button
                type="button"
                className="min-h-11 px-5 rounded-full border border-ink text-ink cursor-pointer"
                onClick={() => set('budget', '')}
              >
                حذف محدودیت بودجه
              </button>
            </div>
          )}
        </section>
      </div>
    </>
  )
}

export default GiftFinderPage
