import { useEffect, useState, type FC } from 'react'
import { Link } from 'react-router-dom'
import { CATEGORIES } from '../../data/categories'
import SectionHeader from '../shared/SectionHeader'
import { listCategories, type ApiCategory } from '../../api/product'
import Icon from '../icons/Icon'

const CAT_COLOR: Record<string, string> = {
  necklaces: 'c1',
  bracelets: 'c2',
  rings: 'c3',
  earrings: 'c4',
  sets: 'c5',
}

const CategoriesSection: FC = () => {
  const [apiCats, setApiCats] = useState<ApiCategory[]>([])

  useEffect(() => {
    listCategories().then(setApiCats).catch(() => {})
  }, [])

  const apiByName = new Map(apiCats.map((c) => [c.name, c]))
  const visibleCats = CATEGORIES.filter(
    (c) => !['bridal', 'new', 'mens'].includes(c.id) && apiByName.has(c.fa),
  )

  return (
    <section className="section">
      <SectionHeader
        kicker="Browse by category"
        title={<>هر استایل،<br /><em>هر مناسبت</em></>}
        aside={
          <a href="/categories" className="btn btn--ghost" style={{ alignSelf: 'flex-end' }}>
            همه‌ی دسته‌بندی‌ها
            <span className="arr"><Icon name="arrow-left" size={16} /></span>
          </a>
        }
      />

      <div className="cats">
        {visibleCats.map((cat) => {
          const apiCat = apiByName.get(cat.fa)
          const imgSrc = apiCat?.image_url
          return (
            <Link
              key={cat.id}
              to={`/category/${cat.id}`}
              className={`cat ${CAT_COLOR[cat.id] ?? ''}`}
            >
              <span className="cat__num">{cat.num}</span>

              <span className="cat__arrow">
                <Icon name="arrow-left" size={16} />
              </span>

              {imgSrc && (
                <img src={imgSrc} alt={cat.fa} className="cat__img" aria-hidden="true" width="400" height="500" />
              )}

              <div className="cat__name">{cat.fa}</div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export default CategoriesSection
