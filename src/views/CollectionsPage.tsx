import { usePageMeta } from '../hooks/usePageMeta'
import { useEffect, useState, useRef, type FC } from 'react'
import Breadcrumb from '../components/shared/Breadcrumb'
import { toFa } from '../utils/format'
import { listCollections, getCollectionBySlug, type ApiCollection } from '../api/product'
import PageIntro from '../components/shared/PageIntro'
import Icon from '../components/icons/Icon'
import { toneStyle, toneClass } from '../utils/toneStyle'
import { imgSet } from '../utils/cdnImage'
import type { ServerInitialData } from '../context/initialData'

declare global {
  interface Window {
    __COLLECTIONS_INITIAL__?: ApiCollection[]
  }
}

function getInitialCollections(serverCollections: unknown): ApiCollection[] | null {
  if (Array.isArray(serverCollections) && serverCollections.length > 0) {
    return serverCollections as ApiCollection[]
  }
  if (typeof window !== 'undefined' && Array.isArray(window.__COLLECTIONS_INITIAL__)) {
    return window.__COLLECTIONS_INITIAL__
  }
  return null
}

interface CollectionsPageProps {
  initialData?: ServerInitialData
}

const CollectionsPage: FC<CollectionsPageProps> = ({ initialData }) => {
  usePageMeta({ title: 'مجموعه‌های اختصاصی جواهرات لوکسرا' })

  const { collections: serverCollections } = initialData ?? {}
  const initial = getInitialCollections(serverCollections)

  const [collections, setCollections] = useState<ApiCollection[]>(() => initial ?? [])
  const [loading, setLoading] = useState(!initial)
  const seededRef = useRef(!!initial)

  useEffect(() => {
    if (seededRef.current) {
      seededRef.current = false
      return
    }
    listCollections()
      .then(setCollections)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <Breadcrumb items={[{ label: 'خانه', to: '/' }, { label: 'کالکشن‌ها' }]} />

      <div className="max-w-[var(--maxw)] mx-auto px-[var(--pad)] pb-[clamp(56px,7vw,96px)]">
        <PageIntro
          kicker="Collections"
          title={
            <>
              کالکشن‌های <em>منتخب</em>
            </>
          }
          description="مجموعه‌های دستچین‌شده برای هر مناسبت و سلیقه‌ای — هر کالکشن، یک داستان."
          meta={
            !loading && collections.length > 0 ? (
              <span>{toFa(collections.length)} کالکشن</span>
            ) : undefined
          }
        />

        <h2 className="sr-only">مجموعه‌های لوکسرا</h2>
        <div className="mt-8 md:mt-12">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-10">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/3] bg-plate rounded-[var(--radius)]" />
                  <div className="h-5 bg-plate rounded w-1/2 mt-4" />
                  <div className="h-4 bg-plate rounded w-1/4 mt-2" />
                </div>
              ))}
            </div>
          ) : collections.length === 0 ? (
            <p className="text-center text-muted py-20">هیچ کالکشنی یافت نشد.</p>
          ) : (
            <div
              className={`grid sm:grid-cols-2 gap-x-5 gap-y-10 ${collections.length > 2 ? 'lg:grid-cols-3' : 'lg:max-w-[1000px]'}`}
            >
              {collections.map((col, i) => (
                <CollectionCard key={col.slug} col={col} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

interface CollectionCardProps {
  col: ApiCollection
  index: number
}

// Without a cover image, the card previews the collection's own products as a
// 1 + 2 mosaic — fetched lazily per card, so the list itself stays one request.
const CollectionCard: FC<CollectionCardProps> = ({ col, index }) => {
  const [previews, setPreviews] = useState<string[]>([])

  useEffect(() => {
    if (col.cover_image_url) return
    let cancelled = false
    getCollectionBySlug(col.slug)
      .then((d) => {
        if (cancelled) return
        setPreviews(
          d.products
            .map((p) => p.image_url)
            .filter((u): u is string => !!u)
            .slice(0, 3),
        )
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [col.slug, col.cover_image_url])

  const eager = index < 3

  return (
    <a
      href={`/collections/${col.slug}`}
      className="group flex flex-col animate-rise"
      style={{ animationDelay: `${Math.min(index, 6) * 80}ms` }}
      aria-label={`مشاهده کالکشن ${col.name_fa}، ${toFa(col.product_count)} محصول`}
    >
      <div
        className={[
          'relative aspect-[4/3] rounded-[var(--radius)] overflow-hidden ring-1 ring-inset ring-rule transition-shadow duration-300 group-hover:shadow-[var(--shadow-lift)]',
          toneClass(col.tone, 'coll-card'),
        ].join(' ')}
        style={toneStyle(col.tone)}
      >
        {col.cover_image_url ? (
          <img
            {...imgSet(col.cover_image_url, {
              widths: [480, 640, 960],
              ratio: 4 / 3,
              sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
            })}
            alt=""
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-[var(--ease-lux)] group-hover:scale-[1.04]"
          />
        ) : previews.length > 0 ? (
          <div
            className={`absolute inset-1.5 grid gap-1.5 ${previews.length > 1 ? 'grid-cols-[1.6fr_1fr] grid-rows-2' : ''}`}
          >
            {previews.map((src, i) => (
              <div
                key={src}
                className={`relative overflow-hidden rounded-[calc(var(--radius)-6px)] bg-bg-2 ${i === 0 && previews.length > 1 ? 'row-span-2' : ''} ${previews.length === 2 && i === 1 ? 'row-span-2' : ''}`}
              >
                <img
                  {...imgSet(src, {
                    widths: [240, 480, 640],
                    ratio: 1,
                    sizes: '(max-width: 640px) 60vw, 25vw',
                  })}
                  alt=""
                  loading={eager ? 'eager' : 'lazy'}
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-[var(--ease-lux)] group-hover:scale-[1.05]"
                />
              </div>
            ))}
          </div>
        ) : (
          <span
            className="absolute inset-0 grid place-items-center font-display italic font-light leading-none select-none opacity-20 text-[clamp(96px,12vw,160px)]"
            aria-hidden
          >
            {(col.name_en ?? col.name_fa).charAt(0)}
          </span>
        )}

        {col.badge && (
          <span className="absolute top-3 end-3 z-10 font-mono text-[10px] tracking-[0.14em] uppercase bg-surface/90 text-ink backdrop-blur-[6px] rounded-full px-3 py-1.5 shadow-[var(--shadow-soft)]">
            {col.badge}
          </span>
        )}
      </div>

      <div className="flex items-start justify-between gap-3 pt-4">
        <div className="min-w-0">
          {col.name_en && (
            <div className="font-display italic text-[13px] text-copper-dark leading-none mb-1.5">
              {col.name_en}
            </div>
          )}
          <h3 className="font-heading text-[19px] md:text-[21px] font-bold leading-snug m-0 text-ink transition-colors duration-200 group-hover:text-plum">
            {col.name_fa}
          </h3>
          <p className="text-[12.5px] text-muted m-0 mt-1">
            {toFa(col.product_count)} محصول
            {col.description ? <span className="line-clamp-1 mt-1">{col.description}</span> : null}
          </p>
        </div>
        <span
          className="shrink-0 mt-1 w-11 h-11 rounded-full border border-rule bg-surface grid place-items-center text-ink transition-all duration-300 group-hover:bg-ink group-hover:text-bg group-hover:border-ink group-hover:-translate-x-1"
          aria-hidden
        >
          <Icon name="arrow-left" size={16} />
        </span>
      </div>
    </a>
  )
}

export default CollectionsPage
