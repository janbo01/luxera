import { usePageMeta } from '../hooks/usePageMeta'
import { useEffect, useState, type FC } from 'react'
import { Link } from 'react-router-dom'
import Breadcrumb from '../components/shared/Breadcrumb'
import { toFa } from '../utils/format'
import { listCollections, type ApiCollection } from '../api/product'
import { toneStyle, toneClass } from '../utils/toneStyle'

const CollectionsPage: FC = () => {
  usePageMeta({ title: 'مجموعه‌ها' })
  const [collections, setCollections] = useState<ApiCollection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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

      <section className="py-[88px] px-[clamp(20px,4vw,56px)]">
        {/* Section header */}
        <div className="flex items-end justify-between mb-12 gap-6">
          <div>
            <span className="font-body text-[11px] tracking-[0.2em] text-muted uppercase mb-3.5 block">
              COLLECTIONS
            </span>
            <h1 className="font-heading font-bold text-[clamp(32px,4vw,56px)] leading-[1.05] tracking-[-0.005em] m-0 max-w-[18ch] text-ink [&_em]:text-plum [&_em]:font-normal [&_em]:not-italic">
              کالکشن‌های <em>منتخب</em>
            </h1>
          </div>
          <p className="max-w-[46ch] text-ink-2 text-sm leading-[1.85]">
            مجموعه‌های دستچین‌شده برای هر مناسبت و سلیقه‌ای
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-surface rounded-[4px] min-h-[200px] opacity-50" />
            ))}
          </div>
        ) : collections.length === 0 ? (
          <p className="text-center text-muted">هیچ کالکشنی یافت نشد.</p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4 max-[768px]:grid-cols-2 max-[480px]:grid-cols-1">
            {collections.map((col) => (
              <Link
                key={col.slug}
                to={`/collections/${col.slug}`}
                className={`relative aspect-[4/5] rounded-[4px] overflow-hidden cursor-pointer flex flex-col justify-end transition-[filter,transform] duration-300 ${toneClass(col.tone, 'coll-card')}`}
                style={toneStyle(col.tone)}
                aria-label={`مشاهده کالکشن ${col.name_fa}، ${toFa(col.product_count)} محصول`}
              >
                {col.badge && (
                  <span className="absolute top-3 right-3 font-mono text-[10px] tracking-[0.18em] bg-white/12 border border-white/28 px-2.5 py-1.5 backdrop-blur-[4px] text-[inherit]">
                    {col.badge}
                  </span>
                )}
                {col.cover_image_url ? (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <img src={col.cover_image_url} alt={col.name_fa} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden>
                    <span className="font-display italic text-[160px] font-normal opacity-[0.08] leading-none select-none">
                      {(col.name_en ?? col.name_fa).charAt(0)}
                    </span>
                  </div>
                )}
                <div className="relative px-5 py-4 bg-black/[0.22] backdrop-blur-[8px] flex flex-col gap-1">
                  <span className="text-lg font-normal">{col.name_fa}</span>
                  <span className="font-mono text-[11px] opacity-70">
                    {toFa(col.product_count)} محصول
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  )
}

export default CollectionsPage
