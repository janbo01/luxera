import { usePageMeta } from '../hooks/usePageMeta'
import { useEffect, useState, type FC } from 'react'
import { batchProducts } from '../api/product'
import { StockNotifyForm } from '../components/product/StockNotifyForm'
import { useWishlistStore } from '../store/wishlistStore'
import { useCartStore } from '../store/cartStore'
import { toFa } from '../utils/format'
import Icon from '../components/icons/Icon'
import { BTN_CLS, BTN_GHOST_CLS } from '../components/ui/Button'
import ProductCard from '../components/product/ProductCard'
import PageHeader from '../components/shared/PageHeader'

const WishlistPage: FC = () => {
  usePageMeta({ title: 'علاقه‌مندی‌ها' })
  const { items, clear, refreshLive } = useWishlistStore()
  const addItem = useCartStore((s) => s.addItem)

  // Fetch today's prices once so a drop since saving can be shown on the card.
  useEffect(() => {
    const ids = useWishlistStore.getState().items.map((i) => i.id)
    if (!ids.length) return
    batchProducts(ids)
      .then((rows) =>
        refreshLive(
          Object.fromEntries(
            rows.map((r) => [r.id, { price: parseFloat(r.price), stockCount: r.stock_count }]),
          ),
        ),
      )
      .catch(() => {})
  }, [refreshLive])

  const [confirmClear, setConfirmClear] = useState(false)

  return (
    <div className="px-[clamp(20px,4vw,56px)] pb-[88px] max-w-[1480px] mx-auto">
      <div className="-mx-[clamp(20px,4vw,56px)] mb-8 border-b border-rule">
        <PageHeader
          as="h2"
          crumbs={[{ label: 'علاقه‌مندی‌ها' }]}
          title="علاقه‌مندی‌های شما"
          description={
            items.length > 0
              ? 'قطعه‌هایی که ذخیره کرده‌اید. اگر قیمتی پایین آمده باشد، روی کارت نشان داده می‌شود.'
              : undefined
          }
          meta={items.length > 0 ? <span>{toFa(items.length)} قطعه</span> : undefined}
        />
      </div>

      {items.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20 px-6 pb-[120px] text-center">
          <div className="w-[88px] h-[88px] bg-plate rounded-full flex items-center justify-center text-muted mb-7 animate-[wishlist-pulse_3s_ease-in-out_infinite]">
            <Icon name="heart" size={48} />
          </div>
          <h2 className="font-heading font-bold text-[26px] m-0 mb-3">لیست شما خالی است</h2>
          <p className="text-muted text-sm leading-[1.85] max-w-[36ch] m-0 mb-9">
            روی قلب هر محصول بزنید تا اینجا ذخیره شود.
            <br />
            آن‌هایی را که دوست دارید کنار هم نگه دارید.
          </p>
          <a href="/category/new" className={BTN_CLS}>
            مشاهده جدیدترین‌ها
            <span className="arr">←</span>
          </a>
        </div>
      ) : (
        <>
          {/* The same card as every other grid; a price drop since saving shows as a sale. */}
          <div className="products grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-[clamp(12px,1.5vw,22px)] gap-y-[clamp(28px,3vw,44px)]">
            {items.map((product) => {
              const dropped = product.savedPrice != null && product.price < product.savedPrice
              const shown = dropped
                ? {
                    ...product,
                    oldPrice: product.savedPrice!,
                    badge: 'کاهش قیمت',
                    badgeKind: 'sale' as const,
                  }
                : product
              return (
                <div key={product.id} className="flex flex-col gap-3">
                  <ProductCard product={shown} onAdd={addItem} />
                  {/* Sold out: the wishlist is where intent is highest, so offer the restock alert here */}
                  {product.stockCount === 0 && <StockNotifyForm productId={product.id} />}
                </div>
              )
            })}
          </div>

          <div className="mt-14 pt-6 border-t border-rule flex flex-wrap items-center justify-between gap-4">
            <a href="/category/new" className={BTN_GHOST_CLS}>
              ادامه‌ی خرید
            </a>
            {confirmClear ? (
              <span
                className="inline-flex items-center gap-2 text-[13.5px] text-ink-2"
                role="group"
              >
                همه‌ی {toFa(items.length)} قطعه حذف شود؟
                <button
                  type="button"
                  className="min-h-11 px-4 rounded-full bg-ink text-bg"
                  onClick={() => {
                    clear()
                    setConfirmClear(false)
                  }}
                >
                  بله، حذف کن
                </button>
                <button
                  type="button"
                  className="min-h-11 px-4 rounded-full border border-rule"
                  onClick={() => setConfirmClear(false)}
                >
                  انصراف
                </button>
              </span>
            ) : (
              <button
                type="button"
                className="min-h-11 px-2 text-[13.5px] text-muted underline underline-offset-4 hover:text-ink"
                onClick={() => setConfirmClear(true)}
              >
                پاک‌کردن همه
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default WishlistPage
