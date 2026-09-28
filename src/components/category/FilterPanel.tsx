import { useState, type FC } from 'react'
import { formatNumber, toFa } from '../../utils/format'
import Icon from '../icons/Icon'
import type { ApiColor } from '../../api/product'
import { hexToSwatch } from '../../utils/colorSwatch'

export const MAX_PRICE = 3_000_000

interface FilterPanelProps {
  isOpen: boolean
  onClose: () => void
  priceMin: number
  priceMax: number
  materials: string[]
  selectedColorIds: string[]
  inStockOnly: boolean
  availableMaterials: string[]
  materialCounts: Record<string, number>
  availableColors: ApiColor[]
  onPriceMinChange: (v: number) => void
  onPriceMaxChange: (v: number) => void
  onToggleMaterial: (m: string) => void
  onToggleColor: (id: string) => void
  onInStockChange: (v: boolean) => void
  onReset: () => void
  /** Products matching the current filters — shown on the mobile apply button. */
  resultCount?: number
}

/** Accepts Persian/Arabic or Latin digits (and separators) typed by the user. */
function parseAmount(raw: string): number {
  const latin = raw
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[^0-9]/g, '')
  return latin ? Number(latin) : 0
}

const PRICE_PRESETS: { label: string; min: number; max: number }[] = [
  { label: 'زیر ۲۵۰ هزار', min: 0, max: 250_000 },
  { label: '۲۵۰ تا ۵۰۰ هزار', min: 250_000, max: 500_000 },
  { label: '۵۰۰ هزار تا ۱ میلیون', min: 500_000, max: 1_000_000 },
  { label: 'بالای ۱ میلیون', min: 1_000_000, max: MAX_PRICE },
]

interface SectionProps {
  id: string
  title: string
  meta?: string
  open: boolean
  onToggle: (id: string) => void
  children: React.ReactNode
}

const Section: FC<SectionProps> = ({ id, title, meta, open, onToggle, children }) => (
  <section className="py-4 border-b border-rule last-of-type:border-b-0">
    <button
      className="w-full min-h-[40px] flex items-center justify-between gap-3 cursor-pointer text-start"
      onClick={() => onToggle(id)}
      aria-expanded={open}
    >
      <span className="font-heading text-[14px] font-semibold text-ink">
        {title}
        {meta && <span className="font-body font-normal text-[12px] text-muted ms-2">{meta}</span>}
      </span>
      <Icon
        name="chevron-down"
        size={15}
        className={`text-muted transition-transform duration-200 ${open ? '' : 'rotate-90'}`}
      />
    </button>
    {open && <div className="pt-3">{children}</div>}
  </section>
)

const FilterPanel: FC<FilterPanelProps> = ({
  isOpen,
  onClose,
  priceMin,
  priceMax,
  materials,
  selectedColorIds,
  inStockOnly,
  availableMaterials,
  materialCounts,
  availableColors,
  onPriceMinChange,
  onPriceMaxChange,
  onToggleMaterial,
  onToggleColor,
  onInStockChange,
  onReset,
  resultCount,
}) => {
  const [openSections, setOpenSections] = useState(
    () => new Set(['price', 'material', 'color', 'stock']),
  )

  const toggleSection = (s: string) =>
    setOpenSections((prev) => {
      const next = new Set(prev)
      if (next.has(s)) next.delete(s)
      else next.add(s)
      return next
    })

  const inputCls =
    'w-full h-11 bg-bg rounded-[10px] ring-1 ring-inset ring-rule px-3 text-[14px] text-ink text-start outline-none transition-shadow duration-200 focus:ring-2 focus:ring-plum [font-feature-settings:"tnum"]'

  const activePreset = PRICE_PRESETS.find((p) => p.min === priceMin && p.max === priceMax)
  const priceChanged = priceMin > 0 || priceMax < MAX_PRICE
  const activeCount =
    selectedColorIds.length + materials.length + (priceChanged ? 1 : 0) + (inStockOnly ? 1 : 0)

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-[115] hidden max-[1100px]:block bg-ink/40 backdrop-blur-[2px] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        aria-label="فیلترها"
        className={[
          // Desktop: sticky card
          'sticky top-24 self-start max-h-[calc(100vh-110px)] overflow-y-auto scrollbar-none',
          'bg-surface ring-1 ring-inset ring-rule rounded-[var(--radius-lg)] px-5 pt-4 pb-5',
          // Mobile: fixed bottom-sheet
          'max-[1100px]:fixed max-[1100px]:bottom-0 max-[1100px]:inset-x-0 max-[1100px]:top-auto',
          // Above the bottom nav (z-100) and the page's sticky filter bar (z-110)
          'max-[1100px]:max-h-[85vh] max-[1100px]:z-[120] max-[1100px]:px-5 max-[1100px]:pt-2 max-[1100px]:pb-0',
          'max-[1100px]:rounded-t-[24px] max-[1100px]:rounded-b-none max-[1100px]:ring-0',
          'max-[1100px]:shadow-[0_-16px_56px_color-mix(in_srgb,var(--color-ink)_18%,transparent)]',
          'max-[1100px]:transition-transform max-[1100px]:duration-300 max-[1100px]:ease-[var(--ease-lux)]',
          !isOpen
            ? 'max-[1100px]:translate-y-[calc(100%+4px)] max-[1100px]:pointer-events-none'
            : 'max-[1100px]:translate-y-0',
        ].join(' ')}
      >
        {/* Drag handle — mobile only */}
        <button
          className="hidden max-[1100px]:flex justify-center py-2 cursor-pointer w-full"
          onClick={onClose}
          aria-label="بستن فیلترها"
        >
          <span className="w-10 h-1 rounded-full bg-plate" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-rule">
          <h3 className="font-heading text-[16px] font-bold m-0 text-ink flex items-center gap-2">
            فیلترها
            {activeCount > 0 && (
              <span className="min-w-5 h-5 px-1.5 rounded-full bg-plum text-bg text-[11px] font-body grid place-items-center">
                {toFa(activeCount)}
              </span>
            )}
          </h3>
          <div className="flex items-center gap-1">
            {activeCount > 0 && (
              <button
                onClick={onReset}
                className="min-h-[40px] px-2 text-[12.5px] text-plum hover:text-ink transition-colors cursor-pointer"
              >
                پاک کردن همه
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="بستن"
              className="hidden max-[1100px]:grid w-10 h-10 rounded-full place-items-center bg-bg-2 cursor-pointer"
            >
              <Icon name="close" size={14} />
            </button>
          </div>
        </div>

        {/* Price */}
        <Section
          id="price"
          title="قیمت"
          meta="تومان"
          open={openSections.has('price')}
          onToggle={toggleSection}
        >
          <div className="flex flex-wrap gap-1.5 mb-3">
            {PRICE_PRESETS.map((p) => {
              const on = activePreset === p
              return (
                <button
                  key={p.label}
                  onClick={() => {
                    if (on) {
                      onPriceMinChange(0)
                      onPriceMaxChange(MAX_PRICE)
                    } else {
                      // Widen max first so the min clamp never fights the old max.
                      onPriceMaxChange(p.max)
                      onPriceMinChange(p.min)
                    }
                  }}
                  aria-pressed={on}
                  className={`min-h-[36px] px-3 rounded-full text-[12.5px] border transition-colors duration-150 cursor-pointer ${on ? 'bg-ink text-bg border-ink' : 'bg-bg border-rule text-ink-2 hover:border-ink'}`}
                >
                  {p.label}
                </button>
              )
            })}
          </div>
          <div className="flex items-center gap-2">
            <label className="flex-1 min-w-0">
              <span className="sr-only">حداقل قیمت</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="از"
                value={priceMin > 0 ? formatNumber(priceMin) : ''}
                onChange={(e) => onPriceMinChange(Math.min(parseAmount(e.target.value), priceMax))}
                className={inputCls}
              />
            </label>
            <span className="text-muted text-[12px]" aria-hidden>
              تا
            </span>
            <label className="flex-1 min-w-0">
              <span className="sr-only">حداکثر قیمت</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder={formatNumber(MAX_PRICE)}
                value={priceMax < MAX_PRICE ? formatNumber(priceMax) : ''}
                onChange={(e) => {
                  const v = parseAmount(e.target.value)
                  onPriceMaxChange(v === 0 ? MAX_PRICE : Math.max(v, priceMin))
                }}
                className={inputCls}
              />
            </label>
          </div>
        </Section>

        {/* Material */}
        {availableMaterials.length > 0 && (
          <Section
            id="material"
            title="جنس"
            open={openSections.has('material')}
            onToggle={toggleSection}
          >
            <div className="flex flex-col">
              {availableMaterials.map((m) => {
                const on = materials.includes(m)
                return (
                  <label
                    key={m}
                    className="flex items-center gap-3 min-h-[40px] text-[13.5px] cursor-pointer text-ink-2 hover:text-ink"
                  >
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => onToggleMaterial(m)}
                      className="w-[18px] h-[18px] accent-[var(--color-ink)] cursor-pointer"
                    />
                    <span className="flex-1">{m}</span>
                    <span className="text-[12px] text-muted">{toFa(materialCounts[m] ?? 0)}</span>
                  </label>
                )
              })}
            </div>
          </Section>
        )}

        {/* Color */}
        {availableColors.length > 0 && (
          <Section
            id="color"
            title="رنگ"
            meta={selectedColorIds.length ? `${toFa(selectedColorIds.length)} انتخاب` : undefined}
            open={openSections.has('color')}
            onToggle={toggleSection}
          >
            <div className="flex flex-wrap gap-1">
              {availableColors.map(({ id, name, hex_code }) => {
                const active = selectedColorIds.includes(id)
                return (
                  <button
                    key={id}
                    className="w-10 h-10 grid place-items-center rounded-full cursor-pointer group/sw"
                    title={name}
                    onClick={() => onToggleColor(id)}
                    aria-label={name}
                    aria-pressed={active}
                  >
                    <span
                      className={`w-7 h-7 rounded-full ring-1 ring-inset ring-ink/10 grid place-items-center transition-all duration-200 group-hover/sw:scale-110 ${active ? 'outline-2 outline-offset-2 outline-ink [outline-style:solid]' : ''}`}
                      style={{ background: hexToSwatch(hex_code) }}
                    >
                      {active && (
                        <span className="w-4 h-4 rounded-full bg-surface/90 grid place-items-center text-ink">
                          <Icon name="check" size={10} strokeWidth={3} />
                        </span>
                      )}
                    </span>
                  </button>
                )
              })}
            </div>
          </Section>
        )}

        {/* In-stock toggle */}
        <section className="py-4">
          <label className="flex items-center justify-between cursor-pointer min-h-[40px] gap-4">
            <span className="font-heading text-[14px] font-semibold text-ink">
              فقط کالاهای موجود
            </span>
            <span className="relative flex-shrink-0">
              <input
                type="checkbox"
                role="switch"
                checked={inStockOnly}
                onChange={(e) => onInStockChange(e.target.checked)}
                className="sr-only peer"
              />
              <span
                className={`block w-11 h-6 rounded-full transition-colors duration-200 relative peer-focus-visible:outline-2 peer-focus-visible:outline-plum peer-focus-visible:[outline-style:solid] peer-focus-visible:outline-offset-2 ${inStockOnly ? 'bg-plum' : 'bg-plate'}`}
              >
                <span
                  className={`absolute top-[3px] w-[18px] h-[18px] rounded-full bg-surface shadow-[var(--shadow-soft)] transition-all duration-200 ${inStockOnly ? 'right-[3px]' : 'right-[calc(100%-21px)]'}`}
                />
              </span>
            </span>
          </label>
        </section>

        {/* Mobile apply bar — filters already apply live; this just closes the sheet */}
        <div className="hidden max-[1100px]:flex sticky bottom-0 -mx-5 px-5 pt-3 [padding-bottom:calc(12px+env(safe-area-inset-bottom,0px))] bg-surface border-t border-rule gap-2">
          <button
            className="min-h-[48px] px-5 text-[13.5px] text-ink-2 border border-rule rounded-full cursor-pointer hover:border-ink disabled:opacity-40"
            onClick={onReset}
            disabled={activeCount === 0}
          >
            پاک کردن
          </button>
          <button
            className="flex-1 min-h-[48px] text-[14px] font-medium bg-ink text-bg rounded-full cursor-pointer transition-colors hover:bg-plum"
            onClick={onClose}
          >
            {resultCount !== undefined ? `نمایش ${toFa(resultCount)} محصول` : 'نمایش نتایج'}
          </button>
        </div>
      </aside>
    </>
  )
}

export default FilterPanel
