import { usePageMeta } from '../hooks/usePageMeta'
import type { FC } from 'react'
import { Link } from 'react-router-dom'
import { useWishlistStore } from '../store/wishlistStore'
import { useCartStore } from '../store/cartStore'
import { Illustration } from '../illustrations'
import { toFa } from '../utils/format'
import Icon from '../components/icons/Icon'
import { BTN_CLS, BTN_GHOST_CLS } from '../components/ui/Button'
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
    <div className="px-[clamp(20px,4vw,56px)] pb-[88px] max-w-[1480px] mx-auto">
      {/* Hero */}
      <div className="py-[72px] pb-[52px] border-b border-rule mb-10 max-[760px]:py-12 max-[760px]:pb-9">
        <span className="font-body text-[11px] tracking-[0.2em] text-muted uppercase mb-3.5 block">
          لیست آرزوها
        </span>
        <h1 className="font-heading font-bold text-[clamp(40px,5vw,72px)] leading-[1.05] my-3 text-ink [&_em]:font-heading [&_em]:not-italic [&_em]:text-plum [&_em]:font-normal">
          علاقه‌مندی‌های
          <em> شما</em>
        </h1>
        {items.length > 0 && (
          <p className="text-muted text-sm m-0">
            {toFa(items.length)} قطعه ذخیره شده — وقتی آماده شدید به سبد اضافه کنید
          </p>
        )}
      </div>

      {items.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20 px-6 pb-[120px] text-center">
          <div className="w-[88px] h-[88px] bg-plate rounded-full flex items-center justify-center text-muted mb-7 animate-[wishlist-pulse_3s_ease-in-out_infinite]">
            <Icon name="heart" size={48} />
          </div>
          <h2 className="font-body font-light text-[28px] m-0 mb-3">لیست شما خالی است</h2>
          <p className="text-muted text-sm leading-[1.85] max-w-[36ch] m-0 mb-9">
            روی قلب هر محصول بزنید تا اینجا ذخیره شود.
            <br />
            آن‌هایی را که دوست دارید کنار هم نگه دارید.
          </p>
          <Link to="/category/new" className={BTN_CLS}>
            مشاهده جدیدترین‌ها
            <span className="arr">←</span>
          </Link>
        </div>
      ) : (
        <>
          {/* Toolbar */}
          <div className="flex items-center justify-between text-[13px] text-muted pb-7 border-b border-rule mb-9 font-mono tracking-[0.08em]">
            <span>{toFa(items.length)} قطعه</span>
            <button
              className="inline-flex items-center gap-2 pb-0.5 border-b border-ink bg-transparent text-ink text-[13px] tracking-[0.04em] transition-colors duration-200 cursor-pointer hover:text-plum hover:border-plum"
              onClick={clear}
            >
              پاک‌کردن همه
            </button>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-4 max-[1100px]:grid-cols-3 max-[760px]:grid-cols-2 gap-5 max-[760px]:gap-x-3 max-[760px]:gap-y-5">
            {items.map((product) => (
              <div
                key={product.id}
                className="group flex flex-col bg-surface border border-rule transition-[box-shadow,border-color] duration-300 hover:border-plum hover:[box-shadow:0_8px_32px_rgba(74,34,64,0.08)]"
              >
                <Link
                  to={`/product/${product.slug ?? product.id}`}
                  className="relative bg-plate aspect-[4/5] flex items-center justify-center overflow-hidden no-underline"
                >
                  <Badge label={product.badge} kind={product.badgeKind} />
                  <button
                    className="absolute top-2.5 left-2.5 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center text-muted opacity-0 scale-[0.8] transition-[opacity,transform,color,background] duration-[250ms] z-[4] backdrop-blur-sm group-hover:opacity-100 group-hover:scale-100 hover:text-sale hover:bg-[#fff5f5]"
                    aria-label="حذف از علاقه‌مندی"
                    onClick={(e) => {
                      e.preventDefault()
                      remove(product.id)
                    }}
                  >
                    <Icon name="close" size={12} />
                  </button>
                  <div className="w-[72%] h-auto flex items-center justify-center transition-transform duration-[600ms] text-ink group-hover:scale-[1.04]">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.fa}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Illustration name={product.illus} />
                    )}
                  </div>
                </Link>

                <div className="flex flex-col flex-1 p-4 gap-3">
                  <div className="flex-1">
                    <Link
                      to={`/product/${product.slug ?? product.id}`}
                      className="no-underline text-inherit"
                    >
                      <div className="text-sm font-normal text-ink mb-0.5">{product.fa}</div>
                      <span className="font-display italic text-[11px] text-muted block mb-2">
                        {product.en}
                      </span>
                    </Link>
                    <ProductMeta
                      items={product.meta}
                      className="font-mono text-[10px] tracking-[0.1em] text-muted flex flex-wrap gap-2"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 border-t border-rule pt-3">
                    <PriceDisplay
                      price={product.price}
                      oldPrice={product.oldPrice}
                      className="text-[13px] text-ink flex flex-col gap-0.5"
                      oldClassName="text-muted line-through text-[11px]"
                    />
                    <button
                      className="inline-flex items-center gap-1.5 py-2.5 px-4 bg-ink text-bg text-xs tracking-[0.04em] whitespace-nowrap transition-[background,color] duration-[250ms] shrink-0 hover:bg-plum"
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

          <div className="mt-14 flex justify-center">
            <Link to="/category/new" className={BTN_GHOST_CLS}>
              ادامه‌ی خرید
            </Link>
          </div>
        </>
      )}
    </div>
  )
}

export default WishlistPage
