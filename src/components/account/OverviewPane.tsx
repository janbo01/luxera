import { type FC, type ReactNode, useState, useEffect, useMemo } from 'react'
import { useAuthStore } from '../../store/authStore'
import { useWishlistStore } from '../../store/wishlistStore'
import { formatToman, toFa } from '../../utils/format'
import {
  CARD,
  CARD_H,
  CARD_H3,
  IC_CIR,
  IcoArrowLeft,
  IcoBag,
  IcoClock,
  IcoHeart,
  IcoInfo,
  IcoPin,
  IcoReorder,
  IcoStar,
  IcoTruck,
  PILL_BASE,
  PILL_COLORS,
  type PaneProps,
  STATUS_FA,
  STATUS_PILL,
  type Tab,
  illusSvg,
  orderLabel,
} from './shared'

interface Stat {
  icon: ReactNode
  value: string
  label: string
  note?: string | null
  tab?: Tab
}

/** A link row: switches tab inside the account, or leaves for another page. */
interface QuickLink {
  icon: ReactNode
  title: string
  desc: string
  tab?: Tab
  href?: string
}

const QUICK_LINKS: QuickLink[] = [
  { icon: <IcoTruck />, title: 'پیگیری سفارش', desc: 'وضعیت و کد رهگیری مرسوله', tab: 'orders' },
  { icon: <IcoPin />, title: 'آدرس‌ها', desc: 'برای خرید سریع‌تر', tab: 'addresses' },
  {
    icon: <IcoReorder />,
    title: 'بازگشت کالا',
    desc: 'شرایط و مراحل بازگشت',
    href: '/shipping#returns',
  },
  {
    icon: <IcoInfo />,
    title: 'تماس با پشتیبانی',
    desc: 'پیام بگذارید یا تماس بگیرید',
    href: '/contact',
  },
]

const ROW_CLS =
  'flex items-center gap-3 w-full min-h-14 px-3.5 py-2.5 rounded-sm text-start transition-colors hover:bg-bg-2'

const OverviewPane: FC<PaneProps> = ({ setTab }) => {
  const orders = useAuthStore((s) => s.orders)
  const wishCount = useWishlistStore((s) => s.items.length)
  const [loyaltyBalance, setLoyaltyBalance] = useState<number | null>(null)

  const inTransit = useMemo(
    () => orders.filter((o) => o.status === 'shipped' || o.status === 'processing').length,
    [orders],
  )

  useEffect(() => {
    import('../../api/user').then(({ getLoyaltyBalance }) => {
      getLoyaltyBalance()
        .then(setLoyaltyBalance)
        .catch(() => {})
    })
  }, [])

  const stats: Stat[] = [
    { icon: <IcoBag />, value: toFa(orders.length), label: 'سفارش', tab: 'orders' },
    {
      icon: <IcoTruck />,
      value: toFa(inTransit),
      label: 'در راه',
      note: inTransit > 0 ? 'پیگیری' : null,
      tab: 'orders',
    },
    { icon: <IcoHeart />, value: toFa(wishCount), label: 'علاقه‌مندی', tab: 'wishlist' },
    {
      icon: <IcoStar />,
      value: loyaltyBalance === null ? '–' : toFa(loyaltyBalance),
      label: 'امتیاز باشگاه',
    },
  ]

  return (
    <div className="flex flex-col gap-5">
      {/* Stats: tappable where there is somewhere to go */}
      <ul className="list-none m-0 p-0 grid grid-cols-4 gap-3 max-[1100px]:grid-cols-2">
        {stats.map((s) => {
          const body = (
            <>
              <span className="w-10 h-10 rounded-full bg-bg-2 grid place-items-center text-copper shrink-0 [&_svg]:w-[18px] [&_svg]:h-[18px]">
                {s.icon}
              </span>
              <span className="flex flex-col gap-1 min-w-0">
                <span className="text-[26px] font-bold leading-none text-ink [font-variant-numeric:tabular-nums]">
                  {s.value}
                </span>
                <span className="text-[13px] text-muted">{s.label}</span>
              </span>
              {s.note && (
                <span className="ms-auto self-start text-[12px] text-ok bg-ok/10 px-2 py-1 rounded-full">
                  {s.note}
                </span>
              )}
            </>
          )
          const cls =
            'h-full flex items-center gap-3.5 bg-surface border border-rule rounded-[var(--radius)] p-4'
          return (
            <li key={s.label}>
              {s.tab ? (
                <button
                  type="button"
                  onClick={() => setTab(s.tab!)}
                  className={`${cls} w-full text-start transition-colors hover:border-ink-2`}
                >
                  {body}
                </button>
              ) : (
                <div className={cls}>{body}</div>
              )}
            </li>
          )
        })}
      </ul>

      <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] gap-5 items-start max-[1100px]:grid-cols-1">
        {/* Recent orders */}
        <section className={CARD} aria-labelledby="recent-orders">
          <div className={CARD_H}>
            <h3 id="recent-orders" className={CARD_H3}>
              <span className={IC_CIR}>
                <IcoClock />
              </span>
              سفارش‌های اخیر
            </h3>
            {orders.length > 0 && (
              <button
                type="button"
                className="inline-flex items-center gap-1.5 min-h-11 text-[13px] text-copper-dark hover:underline hover:underline-offset-[3px] [&_svg]:w-3.5 [&_svg]:h-3.5"
                onClick={() => setTab('orders')}
              >
                همه‌ی سفارش‌ها
                <IcoArrowLeft />
              </button>
            )}
          </div>

          {orders.length === 0 ? (
            <div className="py-10 px-6 flex flex-col items-center text-center gap-3">
              <p className="m-0 text-[15px] text-ink">هنوز سفارشی ثبت نکرده‌اید.</p>
              <a
                href="/category/new"
                className="inline-flex items-center gap-2 min-h-11 px-5 rounded-full bg-ink text-bg text-[14px] font-medium hover:bg-plum [&_svg]:w-3.5 [&_svg]:h-3.5"
              >
                دیدن تازه‌ترین‌ها
                <IcoArrowLeft />
              </a>
            </div>
          ) : (
            <ul className="list-none m-0 p-2">
              {orders.slice(0, 3).map((order) => (
                <li key={order.id}>
                  <button
                    type="button"
                    onClick={() => setTab('orders')}
                    className="w-full text-start grid grid-cols-[auto_minmax(0,1fr)_auto] gap-x-3.5 gap-y-1.5 items-center p-3.5 rounded-sm transition-colors hover:bg-bg-2"
                  >
                    <span className="row-span-2 max-sm:row-span-3 w-12 h-12 rounded-sm bg-bg-2 grid place-items-center text-ink-2 [&_svg]:w-9 [&_svg]:h-9">
                      <svg
                        viewBox="0 0 100 100"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        aria-hidden="true"
                      >
                        {illusSvg(order.items[0]?.illus ?? '')}
                      </svg>
                    </span>
                    <span className="font-heading text-[15px] font-semibold text-ink truncate max-sm:col-span-2 max-sm:order-1">
                      {order.items[0]?.name ?? 'سفارش'}
                      {order.items.length > 1 && (
                        <span className="font-body font-normal text-[13px] text-muted">
                          {' '}
                          و {toFa(order.items.length - 1)} کالای دیگر
                        </span>
                      )}
                    </span>
                    <span className="text-[14px] font-bold text-ink whitespace-nowrap [font-variant-numeric:tabular-nums] max-sm:order-3">
                      {formatToman(order.total)}
                    </span>
                    <span className="flex flex-wrap gap-x-3 gap-y-0.5 text-[12px] text-muted [font-variant-numeric:tabular-nums] max-sm:col-span-2 max-sm:order-2">
                      <span>سفارش {orderLabel(order)}</span>
                      <span>{order.date}</span>
                    </span>
                    <span
                      className={`${PILL_BASE} ${PILL_COLORS[STATUS_PILL[order.status]]} justify-self-end max-sm:order-4`}
                    >
                      {STATUS_FA[order.status]}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Quick links */}
        <section className={CARD} aria-labelledby="quick-links">
          <div className={CARD_H}>
            <h3 id="quick-links" className={CARD_H3}>
              راهنما و میان‌برها
            </h3>
          </div>
          <ul className="list-none m-0 p-2">
            {QUICK_LINKS.map((q) => {
              const body = (
                <>
                  <span className="w-9 h-9 rounded-full bg-bg-2 grid place-items-center text-copper shrink-0 [&_svg]:w-4 [&_svg]:h-4">
                    {q.icon}
                  </span>
                  <span className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <span className="text-[14px] font-semibold text-ink">{q.title}</span>
                    <span className="text-[13px] text-muted">{q.desc}</span>
                  </span>
                  <span className="text-muted [&_svg]:w-4 [&_svg]:h-4">
                    <IcoArrowLeft />
                  </span>
                </>
              )
              return (
                <li key={q.title}>
                  {q.href ? (
                    <a href={q.href} className={ROW_CLS}>
                      {body}
                    </a>
                  ) : (
                    <button type="button" onClick={() => setTab(q.tab!)} className={ROW_CLS}>
                      {body}
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      </div>
    </div>
  )
}

export default OverviewPane
