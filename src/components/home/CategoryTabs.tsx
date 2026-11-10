import { useState, type FC } from 'react'
import ProductCarousel from './ProductCarousel'

const TABS = [
  { id: 'necklaces', label: 'گردنبند', kicker: 'گردنبندهای منتخب' },
  { id: 'rings', label: 'انگشتر', kicker: 'انگشترهای منتخب' },
  { id: 'earrings', label: 'گوشواره', kicker: 'گوشواره‌های منتخب' },
  { id: 'bracelets', label: 'دستبند', kicker: 'دستبندهای منتخب' },
] as const

/**
 * One carousel with category tabs, replacing four stacked per-category carousels.
 * Each tab keeps its own sectionId, so the server-injected products for it still load instantly.
 */
const CategoryTabs: FC = () => {
  const [active, setActive] = useState<(typeof TABS)[number]['id']>('necklaces')
  const tab = TABS.find((t) => t.id === active) ?? TABS[0]

  return (
    <ProductCarousel
      key={tab.id}
      sectionId={tab.id}
      kicker={tab.kicker}
      title={
        <>
          کلکسیون <em>{tab.label}</em>
        </>
      }
      link={`/category/${tab.id}`}
      catSlug={tab.id}
      subHeader={
        <div
          role="tablist"
          aria-label="دسته‌بندی محصولات"
          className="flex gap-2 overflow-x-auto scrollbar-none mb-6 -mt-3"
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              id={`home-tab-${t.id}`}
              aria-selected={t.id === active}
              aria-controls={t.id}
              onClick={() => setActive(t.id)}
              className={`shrink-0 min-h-11 px-5 rounded-full text-[14px] cursor-pointer transition-colors duration-150 ${t.id === active ? 'bg-ink text-bg' : 'bg-surface ring-1 ring-inset ring-rule text-ink-2 hover:ring-ink'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      }
    />
  )
}

export default CategoryTabs
