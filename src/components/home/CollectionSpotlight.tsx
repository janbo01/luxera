import { useEffect, useState, type FC } from 'react'
import { listCollections, type ApiCollection } from '../../api/product'
import { useHydrated } from '../../hooks/useHydrated'
import { imgSet } from '../../utils/cdnImage'
import { toFa } from '../../utils/format'
import { BTN_CLS } from '../ui/Button'
import Icon from '../icons/Icon'

/** Editorial split that breaks up the product rows by featuring one collection. */
const CollectionSpotlight: FC = () => {
  const hydrated = useHydrated()
  const [collection, setCollection] = useState<ApiCollection | null>(null)

  useEffect(() => {
    let cancelled = false
    listCollections()
      .then((items) => {
        if (cancelled) return
        setCollection(items.find((c) => c.cover_image_url && c.product_count > 0) ?? null)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  if (!hydrated || !collection) return null

  return (
    <section className="page-section cv-auto" aria-label="کالکشن ویژه">
      <div className="grid grid-cols-2 max-md:grid-cols-1 bg-surface ring-1 ring-inset ring-rule rounded-[var(--radius-lg)] overflow-hidden">
        <div className="p-[clamp(24px,4.5vw,64px)] flex flex-col gap-5 justify-center">
          <span className="kicker">Featured collection</span>
          <h2 className="font-heading font-bold text-[clamp(28px,3.2vw,44px)] leading-[1.15] m-0 text-ink">
            {collection.name_fa}
          </h2>
          {collection.description && (
            <p className="text-ink-2 text-[15px] leading-[1.9] m-0 max-w-[46ch] line-clamp-4">
              {collection.description}
            </p>
          )}
          <p className="text-muted text-[13px] m-0">{toFa(collection.product_count)} قطعه</p>
          <div>
            <a href={`/collections/${collection.slug}`} className={BTN_CLS}>
              مشاهده‌ی کالکشن
              <span className="arr">
                <Icon name="arrow-left" size={16} />
              </span>
            </a>
          </div>
        </div>
        <div className="relative min-h-[360px] max-md:min-h-0 max-md:aspect-[4/3] bg-bg-2 max-md:order-first">
          <img
            {...imgSet(collection.cover_image_url!, {
              widths: [480, 720, 960],
              sizes: '(max-width: 768px) 100vw, 50vw',
            })}
            alt={collection.name_fa}
            width={960}
            height={720}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  )
}

export default CollectionSpotlight
