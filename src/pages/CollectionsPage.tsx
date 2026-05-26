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

      <section className="section">
        <div className="section__head">
          <div>
            <span className="section__kicker">COLLECTIONS</span>
            <h1 className="section__title">
              کالکشن‌های <em>منتخب</em>
            </h1>
          </div>
          <p className="section__lede">
            مجموعه‌های دستچین‌شده برای هر مناسبت و سلیقه‌ای
          </p>
        </div>

        {loading ? (
          <div className="coll-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ background: 'var(--color-surface)', borderRadius: 12, minHeight: 200, opacity: 0.5 }} />
            ))}
          </div>
        ) : collections.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--ink-light)' }}>هیچ کالکشنی یافت نشد.</p>
        ) : (
          <div className="coll-grid">
            {collections.map((col) => (
              <Link
                key={col.slug}
                to={`/collections/${col.slug}`}
                className={`coll-card ${toneClass(col.tone, 'coll-card')}`}
                style={toneStyle(col.tone)}
                aria-label={`مشاهده کالکشن ${col.name_fa}، ${toFa(col.product_count)} محصول`}
              >
                {col.badge && (
                  <span className="coll-card__badge">{col.badge}</span>
                )}
                {col.cover_image_url ? (
                  <div className="coll-card__cover">
                    <img src={col.cover_image_url} alt={col.name_fa} className="img-cover" />
                  </div>
                ) : (
                  <div className="coll-card__art" aria-hidden>
                    <span className="coll-card__art-letter">
                      {(col.name_en ?? col.name_fa).charAt(0)}
                    </span>
                  </div>
                )}
                <div className="coll-card__foot">
                  <span className="coll-card__name">{col.name_fa}</span>
                  <span className="coll-card__count">
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
