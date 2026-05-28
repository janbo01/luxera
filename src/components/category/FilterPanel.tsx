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

const Chev: FC<{ open: boolean }> = ({ open }) => (
  <span
    className="inline-flex text-muted transition-transform duration-200 flex-shrink-0"
    style={{ transform: open ? '' : 'rotate(-90deg)' }}
  >
    <Icon name="chevron-down" size={18} />
  </span>
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
    () => new Set(['price', 'material', 'color'])
  )

  const toggleSection = (s: string) =>
    setOpenSections((prev) => {
      const next = new Set(prev)
      if (next.has(s)) next.delete(s); else next.add(s)
      return next
    })

  return (
    <aside className={`sticky top-24 self-start max-h-[calc(100vh-110px)] overflow-y-auto px-2 pt-5 pb-2 ${isOpen ? 'relative' : ''}`}>
      {isOpen && (
        <button
          onClick={onClose}
          aria-label="بستن"
          className="absolute top-4 start-4 w-9 h-9 rounded-full grid place-items-center bg-bg-2"
        >
          <Icon name="close" size={16} />
        </button>
      )}

      {/* Price range */}
      <div className="py-[18px] border-b border-rule">
        <div
          className="flex items-center justify-between cursor-pointer mb-0 select-none [&:has(+div)]:mb-3.5"
          onClick={() => toggleSection('price')}
        >
          <h4 className="font-heading text-[14px] font-semibold m-0 flex items-center gap-2">
            محدوده‌ی قیمت <span className="font-mono text-[11px] text-muted font-normal">تومان</span>
          </h4>
          <Chev open={openSections.has('price')} />
        </div>
        {openSections.has('price') && (
          <div className="mt-3.5 flex flex-col gap-2.5">
            <div className="flex gap-2">
              <label className="flex-1 flex flex-col gap-1 text-[11px] text-muted font-mono tracking-[0.04em]">
                از
                <input
                  type="number" min={0} max={priceMax} value={priceMin}
                  onChange={(e) => onPriceMinChange(Math.min(Number(e.target.value), priceMax))}
                  className="bg-bg border border-rule rounded-[8px] px-2.5 py-2 text-[13px] text-ink text-end font-body w-full outline-none focus:border-ink transition-colors duration-200"
                />
              </label>
              <label className="flex-1 flex flex-col gap-1 text-[11px] text-muted font-mono tracking-[0.04em]">
                تا
                <input
                  type="number" min={priceMin} max={MAX_PRICE} value={priceMax}
                  onChange={(e) => onPriceMaxChange(Math.max(Number(e.target.value), priceMin))}
                  className="bg-bg border border-rule rounded-[8px] px-2.5 py-2 text-[13px] text-ink text-end font-body w-full outline-none focus:border-ink transition-colors duration-200"
                />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Material */}
      {availableMaterials.length > 0 && (
        <div className="py-[18px] border-b border-rule">
          <div
            className="flex items-center justify-between cursor-pointer select-none mb-0 [&:has(+div)]:mb-3.5"
            onClick={() => toggleSection('material')}
          >
            <h4 className="font-heading text-[14px] font-semibold m-0 flex items-center gap-2">
              جنس <span className="font-mono text-[11px] text-muted font-normal">{toFa(availableMaterials.length)}</span>
            </h4>
            <Chev open={openSections.has('material')} />
          </div>
          {openSections.has('material') && (
            <div className="flex flex-col gap-2.5">
              {availableMaterials.map((m) => (
                <label key={m} className="flex items-center gap-2.5 py-1.5 text-[13px] cursor-pointer text-ink-2 hover:text-ink transition-colors duration-200">
                  <input
                    type="checkbox"
                    checked={materials.includes(m)}
                    onChange={() => onToggleMaterial(m)}
                    className="w-4 h-4 rounded-[4px] border-[1.5px] border-rule bg-transparent cursor-pointer flex-shrink-0 accent-ink"
                  />
                  <span className="flex-1">{m}</span>
                  <span className="font-mono text-[11px] text-muted">{toFa(materialCounts[m] ?? 0)}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Color */}
      {availableColors.length > 0 && (
        <div className="py-[18px] border-b border-rule">
          <div
            className="flex items-center justify-between cursor-pointer select-none mb-0 [&:has(+div)]:mb-3.5"
            onClick={() => toggleSection('color')}
          >
            <h4 className="font-heading text-[14px] font-semibold m-0 flex items-center gap-2">
              رنگ <span className="font-mono text-[11px] text-muted font-normal">{toFa(availableColors.length)}</span>
            </h4>
            <Chev open={openSections.has('color')} />
          </div>
          {openSections.has('color') && (
            <div className="grid [grid-template-columns:repeat(5,1fr)] gap-2">
              {availableColors.map(({ id, name, hex_code }) => (
                <span
                  key={id}
                  className={`aspect-square rounded-full cursor-pointer border-2 relative grid place-items-center transition-transform duration-200 hover:scale-[1.08] ${selectedColorIds.includes(id) ? 'border-ink after:absolute after:w-1.5 after:h-1.5 after:rounded-full after:bg-white after:[mix-blend-mode:difference]' : 'border-transparent'}`}
                  style={{ background: hexToSwatch(hex_code) }}
                  title={name}
                  onClick={() => onToggleColor(id)}
                  role="button"
                  aria-label={name}
                  aria-pressed={selectedColorIds.includes(id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* In-stock toggle */}
      <div className="py-[18px] border-b border-rule">
        <label className="flex items-center justify-between cursor-pointer text-[13px] py-2">
          <span>فقط موجود در انبار</span>
          <div className="relative">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => onInStockChange(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-8 h-[18px] rounded-full bg-bg-2 peer-checked:bg-ink transition-colors duration-200 relative after:absolute after:top-[2px] after:right-[2px] after:w-[14px] after:h-[14px] after:rounded-full after:bg-white after:transition-transform after:duration-200 peer-checked:after:translate-x-[-14px]" />
          </div>
        </label>
      </div>

      {/* Apply row */}
      <div className="pt-[15px] flex gap-2">
        <button
          className="flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-[11px] text-[13px] font-medium tracking-[0.01em] border border-ink bg-transparent text-ink rounded-full transition-all duration-200 hover:bg-ink hover:text-bg"
          onClick={onReset}
        >
          پاک کردن همه
        </button>
        <button
          className="flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-[11px] text-[13px] font-medium tracking-[0.01em] border border-ink bg-ink text-bg rounded-full transition-all duration-200 hover:bg-plum hover:border-plum"
          onClick={onClose}
        >
          اعمال فیلترها
        </button>
      </div>
    </aside>
  )
}

export default FilterPanel
