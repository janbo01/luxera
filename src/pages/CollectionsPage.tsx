import { usePageMeta } from '../hooks/usePageMeta'
import { useEffect, useState, useRef, type FC } from 'react'
import { Link } from 'react-router-dom'
import Breadcrumb from '../components/shared/Breadcrumb'
import { toFa } from '../utils/format'
import { listCollections, type ApiCollection } from '../api/product'
import { toneStyle, toneClass } from '../utils/toneStyle'
import { useInitialData } from '../context/initialData'

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

const CollectionsPage: FC = () => {
  usePageMeta({ title: 'مجموعه‌های اختصاصی جواهرات لوکسرا' })

  const { collections: serverCollections } = useInitialData()
  const initial = getInitialCollections(serverCollections)

  const [collections, setCollections] = useState<ApiCollection[]>(() => initial ?? [])
  const [loading, setLoading] = useState(!initial)
  const seededRef = useRef(!!initial)

  useEffect(() => {
    if (seededRef.current) { seededRef.current = false; return }
    listCollections()
      .then(setCollections)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <Breadcrumb items={[
        { label: 'خانه', to: '/' },
        { label: 'کالکشن‌ها' },
      ]} />

      <section className="py-[88px] px-[clamp(20px,4vw,56px)] max-w-[1480px] mx-auto">

        {/* ── Section header ── */}
        <header className="relative mb-14">
          {/* Ghost numeral watermark */}
          {!loading && collections.length > 0 && (
            <span
              className="absolute top-0 start-0 font-display italic font-light leading-[0.8] pointer-events-none select-none text-ink"
              style={{ fontSize: 'clamp(80px,10vw,160px)', opacity: 0.04 }}
              aria-hidden
            >
              {String(collections.length).padStart(2, '0')}
            </span>
          )}
          <div className="relative flex items-end justify-between gap-6 pb-8 border-b border-rule">
            <div>
              <span className="font-mono text-[10px] tracking-[0.22em] text-muted uppercase mb-4 block">
                COLLECTIONS · لوکسرا
              </span>
              <h1 className="font-heading font-bold leading-[1.05] tracking-[-0.01em] m-0 text-ink" style={{ fontSize: 'clamp(36px,4.5vw,60px)' }}>
                کالکشن‌های{' '}
                <em className="text-plum font-normal not-italic font-display italic">منتخب</em>
              </h1>
            </div>
            <p className="max-w-[38ch] text-ink-2 text-[13px] leading-[2] max-[768px]:hidden">
              مجموعه‌های دستچین‌شده برای هر مناسبت و سلیقه‌ای
            </p>
          </div>
        </header>

        {/* ── Grid ── */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={`bg-surface/60 rounded-[var(--radius-sm)] animate-pulse ${i === 0 ? 'col-span-2 lg:col-span-2' : 'col-span-1'}`}
                style={{ aspectRatio: i === 0 ? '3/2' : '3/4' }}
              />
            ))}
          </div>
        ) : collections.length === 0 ? (
          <p className="text-center text-muted py-20">هیچ کالکشنی یافت نشد.</p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {collections.map((col, i) => {
              const total = collections.length
              const isWide = i === 0 || (i > 0 && i % 3 === 0)
              // Solo card spans the full grid; last card in an odd list fills the row
              const isFullRow = total === 1 || (isWide && i === total - 1 && total % 3 === 1)
              const colSpan = isFullRow
                ? 'col-span-2 lg:col-span-3'
                : isWide
                  ? 'col-span-2 lg:col-span-2'
                  : 'col-span-1'
              const ratio = isFullRow ? '16/7' : isWide ? '3/2' : '3/4'
              return (
                <Link
                  key={col.slug}
                  to={`/collections/${col.slug}`}
                  className={[
                    'group relative overflow-hidden rounded-[var(--radius-sm)] cursor-pointer animate-rise',
                    colSpan,
                    toneClass(col.tone, 'coll-card'),
                  ].join(' ')}
                  style={{
                    ...toneStyle(col.tone),
                    aspectRatio: ratio,
                    animationDelay: `${i * 90}ms`,
                  } as React.CSSProperties}
                  aria-label={`مشاهده کالکشن ${col.name_fa}، ${toFa(col.product_count)} محصول`}
                >
                  {/* Background: cover image or decorative letter */}
                  {col.cover_image_url ? (
                    <img
                      src={col.cover_image_url}
                      alt={col.name_fa}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out will-change-transform group-hover:scale-[1.04]"
                      aria-hidden
                    />
                  ) : (
                    <span
                      className="absolute inset-0 flex items-center justify-center font-display italic font-light leading-none select-none pointer-events-none transition-transform duration-700 group-hover:scale-[1.08]"
                      style={{ fontSize: 'clamp(120px,16vw,240px)', opacity: 0.12 }}
                      aria-hidden
                    >
                      {(col.name_en ?? col.name_fa).charAt(0)}
                    </span>
                  )}

                  {/* Gradient veil — deepens on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent transition-opacity duration-500 group-hover:opacity-[1.15]" />

                  {/* Badge */}
                  {col.badge && (
                    <span className="absolute top-4 end-4 font-mono text-[9px] tracking-[0.2em] uppercase z-10 bg-white/15 border border-white/25 backdrop-blur-[6px] px-3 py-1.5">
                      {col.badge}
                    </span>
                  )}

                  {/* Info panel */}
                  <div className="absolute bottom-0 inset-x-0 z-10">
                    {/* Description — slides up on hover */}
                    {col.description && (
                      <div className="overflow-hidden px-5">
                        <p
                          className="text-[12px] leading-relaxed pb-1 translate-y-full opacity-0 transition-all duration-[380ms] ease-out group-hover:translate-y-0 group-hover:opacity-80"
                        >
                          {col.description}
                        </p>
                      </div>
                    )}

                    {/* Name + count + arrow */}
                    <div className="px-5 py-4 flex items-center justify-between gap-3">
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="font-heading text-[16px] font-bold leading-snug truncate">
                          {col.name_fa}
                        </span>
                        <span className="font-mono text-[10px] opacity-55 tracking-[0.12em]">
                          {toFa(col.product_count)} محصول
                        </span>
                      </div>
                      {/* RTL arrow — scales in on hover */}
                      <span
                        className="shrink-0 w-8 h-8 rounded-full border border-current/30 flex items-center justify-center opacity-0 scale-75 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:scale-100"
                        aria-hidden
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M7 2.5L3.5 6L7 9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M3.5 6H10.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </>
  )
}

export default CollectionsPage
