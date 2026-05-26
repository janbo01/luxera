import { usePageMeta } from '../hooks/usePageMeta'
import type { FC } from 'react'
import { Link } from 'react-router-dom'
import { useWishlistStore } from '../store/wishlistStore'
import { useCartStore } from '../store/cartStore'
import { Illustration } from '../illustrations'
import { toFa } from '../utils/format'
import Icon from '../components/icons/Icon'
import Badge from '../components/shared/Badge'
import PriceDisplay from '../components/shared/PriceDisplay'
import ProductMeta from '../components/shared/ProductMeta'

const WishlistPage: FC = () => {
  usePageMeta({ title: 'علاقه‌مندی‌ها' })
  const { items, remove, clear } = useWishlistStore()
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)

  const handleMoveToCart = (product: (typeof items)[number]) => {
    addItem(product)
    remove(product.id)
    openCart()
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-page__hero">
        <span className="section__kicker">لیست آرزوها</span>
        <h1 className="wishlist-page__title">
          علاقه‌مندی‌های
          <em> شما</em>
        </h1>
        {items.length > 0 && (
          <p className="wishlist-page__sub">
            {toFa(items.length)} قطعه ذخیره شده — وقتی آماده شدید به سبد اضافه کنید
          </p>
        )}
      </div>

      {items.length === 0 ? (
        <div className="wishlist-empty">
          <div className="wishlist-empty__icon">
            <Icon name="heart" size={48} />
          </div>
          <h2>لیست شما خالی است</h2>
          <p>روی قلب هر محصول بزنید تا اینجا ذخیره شود.<br />آن‌هایی را که دوست دارید کنار هم نگه دارید.</p>
          <Link to="/category/new" className="btn">
            مشاهده جدیدترین‌ها
            <span className="arr">←</span>
          </Link>
        </div>
      ) : (
        <>
          <div className="wishlist-toolbar">
            <span>{toFa(items.length)} قطعه</span>
            <button className="btn--link" onClick={clear}>پاک‌کردن همه</button>
          </div>

          <div className="wishlist-grid">
            {items.map((product) => (
              <div key={product.id} className="wcard">
                <Link to={`/product/${product.id}`} className="wcard__media">
                  <Badge label={product.badge} kind={product.badgeKind} />
                  <button
                    className="wcard__remove"
                    aria-label="حذف از علاقه‌مندی"
                    onClick={(e) => { e.preventDefault(); remove(product.id) }}
                  >
                    <Icon name="close" size={12} />
                  </button>
                  <div className="wcard__art">
                    {product.imageUrl
                      ? <img src={product.imageUrl} alt={product.fa} className="img-cover" />
                      : <Illustration name={product.illus} />}
                  </div>
                </Link>

                <div className="wcard__body">
                  <div className="wcard__info">
                    <Link to={`/product/${product.id}`}>
                      <div className="wcard__name">{product.fa}</div>
                      <span className="wcard__name-en">{product.en}</span>
                    </Link>
                    <ProductMeta items={product.meta} className="wcard__meta" />
                  </div>

                  <div className="wcard__foot">
                    <PriceDisplay
                      price={product.price}
                      oldPrice={product.oldPrice}
                      className="wcard__price"
                      oldClassName="wcard__price-old"
                    />
                    <button
                      className="wcard__cta"
                      onClick={() => handleMoveToCart(product)}
                    >
                      <Icon name="bag" size={13} />
                      افزودن به سبد
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="wishlist-page__actions">
            <Link to="/category/new" className="btn btn--ghost">
              ادامه‌ی خرید
            </Link>
          </div>
        </>
      )}
    </div>
  )
}

export default WishlistPage
