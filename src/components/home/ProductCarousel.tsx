import { useEffect, useState, memo, type FC, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../product/ProductCard'
import SectionHeader from '../shared/SectionHeader'
import CarouselArrows from '../shared/CarouselArrows'
import { useCartStore } from '../../store/cartStore'
import { listProducts, listCategories, adaptProduct } from '../../api/product'
import { useCarousel } from '../../hooks/useCarousel'
import { BTN_GHOST_CLS } from '../ui/Button'
import Icon from '../icons/Icon'
import { CATEGORIES } from '../../data/categories'
import type { Product } from '../../types'

interface ProductCarouselProps {
  kicker: string
  title: ReactNode
  link: string
  sectionId: string
  catSlug?: string
}

const CARD_W = 'clamp(210px,23vw,290px)'

const SkeletonCard = () => (
  <div
    className="animate-pulse flex-shrink-0 border border-rule overflow-hidden bg-surface rounded-[var(--radius)]"
    style={{ width: CARD_W }}
  >
    <div className="aspect-square bg-plate" />
    <div className="px-4 pt-4 pb-5 flex flex-col gap-3">
      <div className="h-4 bg-plate rounded w-4/5" />
      <div className="h-5 bg-plate rounded w-1/2" />
    </div>
  </div>
)

const SKELETONS = Array.from({ length: 5 }, (_, i) => <SkeletonCard key={i} />)

const CAT_FA_MAP = new Map(CATEGORIES.map((c) => [c.id, c.fa]))

async function resolveCategoryId(slug: string): Promise<string | undefined> {
  if (slug === 'new') return undefined
  const cats = await listCategories()
  const fa = CAT_FA_MAP.get(slug)
  return cats.find((c) => c.name === fa)?.id
}

const ProductCarousel: FC<ProductCarouselProps> = ({ kicker, title, link, sectionId, catSlug }) => {
  const addItem = useCartStore((s) => s.addItem)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { trackRef, canPrev, canNext, scroll } = useCarousel(products.length)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const categoryId = catSlug ? await resolveCategoryId(catSlug) : undefined
        const { items } = await listProducts({ categoryId, limit: 10 })
        setProducts(items.map((p) => adaptProduct(p)))
      } catch {
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [catSlug])

  return (
    <section className="page-section" id={sectionId}>
      <SectionHeader
        kicker={kicker}
        title={title}
        aside={
          <div className="flex items-center gap-3 self-start sm:self-end">
            <CarouselArrows
              canPrev={canPrev}
              canNext={canNext}
              onScroll={scroll}
              prevLabel="محصول قبلی"
              nextLabel="محصول بعدی"
            />
            <Link to={link} className={BTN_GHOST_CLS}>
              مشاهده‌ی همه
              <span className="arr">
                <Icon name="arrow-left" size={16} />
              </span>
            </Link>
          </div>
        }
      />
      <div
        ref={trackRef}
        className="flex gap-5 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-2 [direction:rtl]"
      >
        {loading
          ? SKELETONS
          : products.map((product, i) => (
              <div key={product.id} className="snap-start flex-shrink-0" style={{ width: CARD_W }}>
                <ProductCard product={product} onAdd={addItem} priority={i < 2} />
              </div>
            ))}
      </div>
    </section>
  )
}

export default memo(ProductCarousel)
