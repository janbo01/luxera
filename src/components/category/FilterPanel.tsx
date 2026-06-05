import { useState, type FC } from 'react'
import { toFa } from '../../utils/format'
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
}

const SectionLabel: FC<{ children: React.ReactNode; count?: number }> = ({ children, count }) => (
  <div className="flex items-center justify-between mb-4">
    <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted select-none">
      {children}
    </span>
    {count !== undefined && (
      <span className="text-[10px] font-mono text-muted/60">{toFa(count)}</span>
    )}
  </div>
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
}) => {
  const [openSections, setOpenSections] = useState(
    () => new Set(['price', 'material', 'color', 'stock'])
  )

  const toggleSection = (s: string) =>
    setOpenSections((prev) => {
      const next = new Set(prev)
      if (next.has(s)) next.delete(s); else next.add(s)
      return next
    })

  const inputCls = [
    'w-full bg-transparent border-b border-rule px-1 py-2',
    'text-[13px] text-ink font-mono text-end outline-none',
    'transition-[border-color] duration-200 focus:border-ink',
    '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
  ].join(' ')

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-40 hidden max-[1100px]:block bg-ink/40 backdrop-blur-[2px] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={[
          // Desktop: sticky card
          'sticky top-24 self-start max-h-[calc(100vh-110px)] overflow-y-auto',
          'bg-surface border border-rule rounded-[18px]',
          'px-5 pt-5 pb-5',
          // Mobile: fixed bottom-sheet
          'max-[1100px]:fixed max-[1100px]:bottom-0 max-[1100px]:inset-x-0 max-[1100px]:top-auto',
          'max-[1100px]:max-h-[82vh] max-[1100px]:z-50 max-[1100px]:overflow-y-auto',
          'max-[1100px]:bg-surface max-[1100px]:px-5 max-[1100px]:pt-3',
          'max-[1100px]:[padding-bottom:calc(32px+env(safe-area-inset-bottom,0px))]',
          'max-[1100px]:rounded-t-[22px] max-[1100px]:rounded-b-none',
          'max-[1100px]:border-x-0 max-[1100px]:border-b-0',
          'max-[1100px]:shadow-[0_-16px_56px_rgba(26,15,29,0.18)]',
          'max-[1100px]:transition-transform max-[1100px]:duration-300',
          'max-[1100px]:[transition-timing-function:cubic-bezier(.2,.7,.2,1)]',
          !isOpen
            ? 'max-[1100px]:translate-y-[calc(100%+4px)] max-[1100px]:pointer-events-none'
            : 'max-[1100px]:translate-y-0',
        ].join(' ')}
      >
        {/* Drag handle — mobile only */}
        <div
          className="hidden max-[1100px]:flex justify-center mb-4 mt-1 cursor-pointer shrink-0"
          onClick={onClose}
          role="button"
          aria-label="بستن فیلترها"
        >
          <div className="w-8 h-[3px] rounded-full bg-rule" />
        </div>

        {/* Mobile header */}
        <div className="hidden max-[1100px]:flex items-center justify-between mb-5 pb-4 border-b border-rule">
          <h2 className="font-heading text-[15px] font-semibold m-0">فیلترها</h2>
          <button
            onClick={onClose}
            aria-label="بستن"
            className="w-7 h-7 rounded-full grid place-items-center bg-bg-2 cursor-pointer border-none"
          >
            <Icon name="close" size={12} />
          </button>
        </div>

        {/* Desktop panel title */}
        <div className="hidden max-[1100px]:hidden [display:flex] items-center justify-between mb-5 pb-4 border-b border-rule">
          <span className="font-heading text-[13px] font-semibold text-ink">فیلترها</span>
          <button
            onClick={onReset}
            aria-label="پاک کردن فیلترها"
            className="text-[10px] font-mono tracking-[0.12em] uppercase text-copper hover:text-ink transition-colors duration-200 bg-transparent border-none cursor-pointer"
          >
            پاک کردن
          </button>
        </div>

        {/* Price range */}
        <section className="mb-5 pb-5 border-b border-rule">
          <button
            className="w-full flex items-center justify-between mb-0 cursor-pointer bg-transparent border-none p-0 text-right"
            onClick={() => toggleSection('price')}
            aria-expanded={openSections.has('price')}
            aria-label="فیلتر قیمت"
          >
            <SectionLabel>قیمت · تومان</SectionLabel>
            <span
              className="text-muted transition-transform duration-200 flex-shrink-0 -mt-4"
              style={{ transform: openSections.has('price') ? '' : 'rotate(-90deg)' }}
            >
              <Icon name="chevron-down" size={14} />
            </span>
          </button>
          {openSections.has('price') && (
            <div className="flex gap-4">
              <label className="flex-1 flex flex-col gap-1.5">
                <span className="text-[10px] font-mono tracking-[0.12em] text-muted uppercase">از</span>
                <input
                  type="number" min={0} max={priceMax} value={priceMin}
                  onChange={(e) => onPriceMinChange(Math.min(Number(e.target.value), priceMax))}
                  className={inputCls}
                />
              </label>
              <div className="w-px bg-rule self-end mb-2" />
              <label className="flex-1 flex flex-col gap-1.5">
                <span className="text-[10px] font-mono tracking-[0.12em] text-muted uppercase">تا</span>
                <input
                  type="number" min={priceMin} max={MAX_PRICE} value={priceMax}
                  onChange={(e) => onPriceMaxChange(Math.max(Number(e.target.value), priceMin))}
                  className={inputCls}
                />
              </label>
            </div>
          )}
        </section>

        {/* Material */}
        {availableMaterials.length > 0 && (
          <section className="mb-5 pb-5 border-b border-rule">
            <button
              className="w-full flex items-center justify-between cursor-pointer bg-transparent border-none p-0 text-right"
              onClick={() => toggleSection('material')}
              aria-expanded={openSections.has('material')}
              aria-label="فیلتر جنس"
            >
              <SectionLabel count={availableMaterials.length}>جنس</SectionLabel>
              <span
                className="text-muted transition-transform duration-200 flex-shrink-0 -mt-4"
                style={{ transform: openSections.has('material') ? '' : 'rotate(-90deg)' }}
              >
                <Icon name="chevron-down" size={14} />
              </span>
            </button>
            {openSections.has('material') && (
              <div className="flex flex-col gap-0">
                {availableMaterials.map((m) => (
                  <label
                    key={m}
                    className="flex items-center gap-3 py-2.5 text-[13px] cursor-pointer text-ink-2 hover:text-ink transition-colors duration-150 border-b border-rule/50 last:border-b-0"
                  >
                    <span
                      className={`w-4 h-4 rounded-[4px] border flex-shrink-0 grid place-items-center transition-all duration-150 ${materials.includes(m) ? 'bg-ink border-ink' : 'bg-transparent border-rule'}`}
                      onClick={() => onToggleMaterial(m)}
                    >
                      {materials.includes(m) && (
                        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                          <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </span>
                    <input type="checkbox" checked={materials.includes(m)} onChange={() => onToggleMaterial(m)} className="sr-only" />
                    <span className="flex-1 font-body">{m}</span>
                    <span className="font-mono text-[11px] text-muted">{toFa(materialCounts[m] ?? 0)}</span>
                  </label>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Color */}
        {availableColors.length > 0 && (
          <section className="mb-5 pb-5 border-b border-rule">
            <button
              className="w-full flex items-center justify-between cursor-pointer bg-transparent border-none p-0 text-right"
              onClick={() => toggleSection('color')}
              aria-expanded={openSections.has('color')}
              aria-label="فیلتر رنگ"
            >
              <SectionLabel count={availableColors.length}>رنگ</SectionLabel>
              <span
                className="text-muted transition-transform duration-200 flex-shrink-0 -mt-4"
                style={{ transform: openSections.has('color') ? '' : 'rotate(-90deg)' }}
              >
                <Icon name="chevron-down" size={14} />
              </span>
            </button>
            {openSections.has('color') && (
              <div className="grid [grid-template-columns:repeat(6,1fr)] gap-2.5">
                {availableColors.map(({ id, name, hex_code }) => {
                  const active = selectedColorIds.includes(id)
                  return (
                    <button
                      key={id}
                      className={`aspect-square rounded-full cursor-pointer border-none p-0 relative transition-all duration-200 hover:scale-110 focus:outline-none ${active ? 'ring-2 ring-offset-2 ring-ink ring-offset-[var(--color-surface)] scale-105' : ''}`}
                      style={{ background: hexToSwatch(hex_code) }}
                      title={name}
                      onClick={() => onToggleColor(id)}
                      aria-label={name}
                      aria-pressed={active}
                    />
                  )
                })}
              </div>
            )}
          </section>
        )}

        {/* In-stock toggle */}
        <section className="mb-5 pb-5 border-b border-rule">
          <label className="flex items-center justify-between cursor-pointer py-0.5 gap-4">
            <span className="text-[13px] font-body text-ink-2">فقط موجود در انبار</span>
            <div className="relative flex-shrink-0">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => onInStockChange(e.target.checked)}
                className="sr-only peer"
              />
              <div className={`w-[38px] h-[22px] rounded-full transition-colors duration-200 relative ${inStockOnly ? 'bg-copper' : 'bg-bg-2'}`}>
                <div className={`absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200 ${inStockOnly ? 'right-[3px]' : 'right-[calc(100%-19px)]'}`} />
              </div>
            </div>
          </label>
        </section>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            className="flex-1 py-[10px] text-[12px] font-mono tracking-[0.1em] uppercase text-muted hover:text-ink transition-colors duration-200 bg-transparent border border-rule rounded-full cursor-pointer hover:border-ink"
            onClick={onReset}
          >
            پاک کردن
          </button>
          <button
            className="flex-1 py-[10px] text-[12px] font-mono tracking-[0.1em] uppercase bg-ink text-bg rounded-full cursor-pointer border-none transition-colors duration-200 hover:bg-plum"
            onClick={onClose}
          >
            اعمال
          </button>
        </div>
      </aside>
    </>
  )
}

export default FilterPanel
