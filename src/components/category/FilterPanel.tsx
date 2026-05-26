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
    style={{
      display: 'inline-flex',
      color: 'var(--muted)',
      transition: 'transform .2s',
      transform: open ? '' : 'rotate(-90deg)',
      flexShrink: 0,
    }}
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
    <aside className={`aside${isOpen ? ' open' : ''}`}>
      {isOpen && (
        <button
          onClick={onClose}
          aria-label="بستن"
          style={{ position: 'absolute', top: 16, left: 16, width: 36, height: 36, borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'var(--bg-2)', border: 'none', cursor: 'pointer' }}
        >
          <Icon name="close" size={16} />
        </button>
      )}

      {/* Price range */}
      <div className="fgroup">
        <div className="hd" onClick={() => toggleSection('price')}>
          <h4>محدوده‌ی قیمت <span className="n">تومان</span></h4>
          <Chev open={openSections.has('price')} />
        </div>
        {openSections.has('price') && (
          <div className="body">
            <div className="range-inputs">
              <label>
                از
                <input
                  type="number" min={0} max={priceMax} value={priceMin}
                  onChange={(e) => onPriceMinChange(Math.min(Number(e.target.value), priceMax))}
                />
              </label>
              <label>
                تا
                <input
                  type="number" min={priceMin} max={MAX_PRICE} value={priceMax}
                  onChange={(e) => onPriceMaxChange(Math.max(Number(e.target.value), priceMin))}
                />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Material */}
      {availableMaterials.length > 0 && (
        <div className="fgroup">
          <div className="hd" onClick={() => toggleSection('material')}>
            <h4>جنس <span className="n">{toFa(availableMaterials.length)}</span></h4>
            <Chev open={openSections.has('material')} />
          </div>
          {openSections.has('material') && (
            <div className="body">
              {availableMaterials.map((m) => (
                <label key={m} className="opt">
                  <input
                    type="checkbox"
                    checked={materials.includes(m)}
                    onChange={() => onToggleMaterial(m)}
                  />
                  <span className="lbl">{m}</span>
                  <span className="n">{toFa(materialCounts[m] ?? 0)}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Color */}
      {availableColors.length > 0 && (
        <div className="fgroup">
          <div className="hd" onClick={() => toggleSection('color')}>
            <h4>رنگ <span className="n">{toFa(availableColors.length)}</span></h4>
            <Chev open={openSections.has('color')} />
          </div>
          {openSections.has('color') && (
            <div className="body">
              <div className="swatch-grid">
                {availableColors.map(({ id, name, hex_code }) => (
                  <span
                    key={id}
                    className={`sw${selectedColorIds.includes(id) ? ' on' : ''}`}
                    style={{ background: hexToSwatch(hex_code) }}
                    title={name}
                    onClick={() => onToggleColor(id)}
                    role="button"
                    aria-label={name}
                    aria-pressed={selectedColorIds.includes(id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* In-stock toggle */}
      <div className="fgroup">
        <div className="body" style={{ gap: 0 }}>
          <label className="toggle">
            <span>فقط موجود در انبار</span>
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => onInStockChange(e.target.checked)}
            />
            <span className="sw-tg" />
          </label>
        </div>
      </div>

      <div className="apply">
        <button
          className="btn btn--ghost"
          onClick={onReset}
          style={{ flex: 1, justifyContent: 'center', padding: '11px 14px', fontSize: '13px' }}
        >
          پاک کردن همه
        </button>
        <button
          className="btn"
          onClick={onClose}
          style={{ flex: 1, justifyContent: 'center', padding: '11px 14px', fontSize: '13px' }}
        >
          اعمال فیلترها
        </button>
      </div>
    </aside>
  )
}

export default FilterPanel
