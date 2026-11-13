import { type FC } from 'react'
import { useWishlistStore } from '../../store/wishlistStore'
import { useCartStore } from '../../store/cartStore'
import { formatToman, toFa } from '../../utils/format'
import {
  BTN_MUTE,
  BTN_SM,
  CARD,
  IC_SECT,
  IcoBag,
  IcoHeart,
  IcoHeartFill,
  SECTION_B,
  SECTION_H,
  illusSvg,
} from './shared'

const WishlistPane: FC = () => {
  const { items, remove } = useWishlistStore()
  const addToCart = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)

  return (
    <div className="flex flex-col gap-[18px]">
      <div className={CARD}>
        <div className={`${SECTION_H} flex justify-between items-end`}>
          <div>
            <h2 className="font-heading text-[18px] font-semibold m-0 flex items-center gap-3">
              <span className={IC_SECT}>
                <IcoHeart />
              </span>{' '}
              علاقه‌مندی‌های من
            </h2>
            <p className="m-0 mt-1.5 text-[13px] text-muted mr-11">
              قطعاتی که برای بعد نگه داشته‌اید — {toFa(items.length)} مورد
            </p>
          </div>
          {items.length > 0 && (
            <button
              className={`${BTN_MUTE} ${BTN_SM}`}
              onClick={() => {
                items.forEach(addToCart)
                openCart()
              }}
            >
              انتقال همه به سبد
            </button>
          )}
        </div>
        <div className={SECTION_B}>
          {items.length === 0 ? (
            <div className="text-center py-14 text-muted text-sm">
              هیچ محصولی در علاقه‌مندی‌ها نیست
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3.5 max-[1100px]:grid-cols-3 max-[640px]:grid-cols-2">
              {items.map((product) => (
                <article
                  key={product.id}
                  className="bg-surface border border-rule rounded-[var(--radius)] overflow-hidden flex flex-col relative transition-[transform,box-shadow] duration-[250ms] group hover:-translate-y-[3px] hover:shadow-[0_16px_40px_-28px_color-mix(in_srgb,var(--color-ink)_30%,transparent)]"
                >
                  <div className="aspect-square bg-gradient-to-bl from-bg-2 to-plate grid place-items-center text-ink-2 relative overflow-hidden">
                    <svg
                      viewBox="0 0 100 100"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth=".9"
                      className="w-[55%] h-[55%]"
                    >
                      {illusSvg(product.illus)}
                    </svg>
                    <button
                      className="absolute top-2.5 left-2.5 w-8 h-8 rounded-full bg-surface/[.92] grid place-items-center text-sale backdrop-blur-[8px] cursor-pointer [&_svg]:w-3.5 [&_svg]:h-3.5"
                      onClick={() => remove(product.id)}
                    >
                      <IcoHeartFill />
                    </button>
                    <button
                      className="absolute bottom-2.5 left-2.5 right-2.5 bg-ink/95 text-bg py-2 rounded-lg text-[13px] font-medium flex justify-center gap-1.5 items-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 cursor-pointer font-body [&_svg]:w-3 [&_svg]:h-3"
                      onClick={() => addToCart(product)}
                    >
                      <IcoBag /> افزودن به سبد
                    </button>
                  </div>
                  <div className="p-3.5 px-4">
                    <span className="font-mono text-[12px] uppercase text-muted">
                      {product.cat}
                    </span>
                    <h3 className="font-heading text-sm font-semibold leading-[1.3] mt-1">
                      {product.fa}
                    </h3>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-heading text-sm font-bold">
                        {formatToman(product.price)}
                        <small className="text-[13px] text-muted font-normal mr-[3px]">ت</small>
                      </span>
                      <span
                        className={`font-mono text-[12px] inline-flex items-center gap-1 ${product.oldPrice ? 'text-sale' : 'text-ok'} before:content-[''] before:w-[5px] before:h-[5px] before:rounded-full before:bg-current`}
                      >
                        موجود
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default WishlistPane
