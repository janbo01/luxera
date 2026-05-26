import { usePageMeta } from '../hooks/usePageMeta'
import type { FC } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/icons/Icon'

const NotFoundPage: FC = () => {
  usePageMeta({ title: 'صفحه یافت نشد' })
  return (
  <div className="not-found">
    <div className="not-found__icon">
      <Icon name="search" size={48} />
    </div>
    <h1 className="not-found__code">۴۰۴</h1>
    <h2 className="not-found__title">صفحه پیدا نشد</h2>
    <p className="not-found__body">
      صفحه‌ای که دنبالش می‌گردید وجود ندارد یا جابه‌جا شده است.
    </p>
    <div className="not-found__actions">
      <Link to="/" className="btn">
        بازگشت به خانه
        <span className="arr">←</span>
      </Link>
      <Link to="/category/new" className="btn btn--ghost">
        مشاهده محصولات
      </Link>
    </div>
  </div>
)
}

export default NotFoundPage
