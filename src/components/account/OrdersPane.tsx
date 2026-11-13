import { type FC, useState, useMemo } from 'react'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'
import { formatToman, toFa } from '../../utils/format'
import type { Order } from '../../types'
import {
  BTN_MUTE,
  BTN_PRIMARY,
  BTN_SM,
  IcoBag,
  IcoCheck,
  IcoChevDown,
  IcoCopy,
  IcoInvoice,
  IcoReorder,
  IcoSearch,
  IcoStar,
  IcoTruck,
  PILL_BASE,
  PILL_COLORS,
  SELECT_BG,
  SELECT_CLS,
  STATUS_FA,
  STATUS_PILL,
  TIMELINE_STEPS,
  illusSvg,
} from './shared'

function reorderItems(order: Order, addItem: (p: import('../../types').Product) => void) {
  order.items.forEach((item) => {
    addItem({
      id: item.productId,
      fa: item.name,
      en: item.name,
      cat: '',
      catId: '',
      price: item.price,
      oldPrice: null,
      badge: null,
      illus: item.illus || 'NecklaceB',
      illusAlt: 'NecklaceC',
      meta: [],
    })
  })
}

// ─── Orders Pane ──────────────────────────────────────────────────────────────
const OrdersPane: FC = () => {
  const orders = useAuthStore((s) => s.orders)
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)
  const [expanded, setExpanded] = useState<string | null>(orders[0]?.id ?? null)
  const [filter, setFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [dateRange, setDateRange] = useState('all')

  const filtered = useMemo(() => {
    let result = orders
    if (filter === 'transit')
      result = result.filter((o) => o.status === 'shipped' || o.status === 'processing')
    else if (filter === 'delivered') result = result.filter((o) => o.status === 'delivered')
    else if (filter === 'cancelled') result = result.filter((o) => o.status === 'cancelled')
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.items.some((it) => it.name.toLowerCase().includes(q)) ||
          (o.trackingCode ?? '').toLowerCase().includes(q),
      )
    }
    if (dateRange !== 'all') {
      const now = new Date()
      const months = dateRange === '6m' ? 6 : 12
      const cutoff = new Date(now.getFullYear(), now.getMonth() - months, now.getDate())
      result = result.filter((o) => new Date(o.date) >= cutoff)
    }
    return result
  }, [orders, filter, search, dateRange])

  const chips = useMemo(
    () => [
      { key: 'all', label: 'همه', count: orders.length },
      {
        key: 'transit',
        label: 'در راه',
        count: orders.filter((o) => o.status === 'shipped' || o.status === 'processing').length,
      },
      {
        key: 'delivered',
        label: 'تحویل شده',
        count: orders.filter((o) => o.status === 'delivered').length,
      },
      {
        key: 'cancelled',
        label: 'لغو شده',
        count: orders.filter((o) => o.status === 'cancelled').length,
      },
    ],
    [orders],
  )

  return (
    <div className="flex flex-col gap-3.5">
      {/* Toolbar */}
      <div className="flex items-center gap-2.5 flex-wrap bg-surface border border-rule rounded-[var(--radius)] px-[18px] py-3.5">
        <div className="flex-1 min-w-[220px] flex items-center gap-2 px-3.5 py-2 bg-bg border border-rule rounded-full text-[13px] text-muted">
          <IcoSearch />
          <input
            className="flex-1 bg-transparent border-0 outline-none text-ink text-[13px] text-right font-body"
            placeholder="جستجو بر اساسِ کدِ سفارش، محصول…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {chips.map((c) => (
            <button
              key={c.key}
              className={`px-[13px] py-[7px] rounded-full text-[13px] border transition-all cursor-pointer inline-flex items-center gap-1.5 font-body ${
                filter === c.key
                  ? 'bg-ink text-bg border-ink'
                  : 'bg-bg text-ink-2 border-rule hover:border-ink'
              }`}
              onClick={() => setFilter(c.key)}
            >
              {c.label}
              <span className="font-mono text-[12px] opacity-70">{toFa(c.count)}</span>
            </button>
          ))}
        </div>
        <select
          className={`${SELECT_CLS} w-auto text-[13px]`}
          style={{ backgroundImage: SELECT_BG, padding: '9px 32px 9px 14px' }}
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
        >
          <option value="all">کل تاریخچه</option>
          <option value="6m">۶ ماهِ گذشته</option>
          <option value="12m">۱ سال</option>
        </select>
      </div>

      {/* Order list */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 && (
          <div className="text-center py-14 text-muted text-sm">سفارشی یافت نشد</div>
        )}
        {filtered.map((order) => {
          const isOpen = expanded === order.id
          const steps = TIMELINE_STEPS[order.status]
          const doneIdx = steps.length - 1
          return (
            <article
              key={order.id}
              className="bg-surface border border-rule rounded-[var(--radius)] overflow-hidden"
            >
              {/* Head */}
              <div
                className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-[18px] items-center px-[22px] py-[18px] cursor-pointer transition-colors hover:bg-surface-2 max-[1100px]:grid-cols-[1fr_auto_auto]"
                onClick={() => setExpanded(isOpen ? null : order.id)}
              >
                <div className="flex max-[1100px]:hidden">
                  {order.items.slice(0, 2).map((item, i) => (
                    <span
                      key={i}
                      className="w-[42px] h-[42px] rounded-sm bg-bg-2 grid place-items-center text-ink-2 border-2 border-surface -mr-3 first:mr-0"
                    >
                      <svg
                        viewBox="0 0 100 100"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        className="w-[34px] h-[34px]"
                      >
                        {illusSvg(item.illus)}
                      </svg>
                    </span>
                  ))}
                  {order.items.length > 2 && (
                    <span className="w-[42px] h-[42px] rounded-sm bg-ink text-bg font-mono text-[12px] font-semibold grid place-items-center border-2 border-surface -mr-3">
                      {toFa(order.items.length - 2)}+
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span
                    className="font-mono text-[13px] font-semibold"
                    dir="ltr"
                    style={{ textAlign: 'right' }}
                  >
                    {order.id}
                  </span>
                  <span className="text-[12px] text-muted font-mono">
                    {order.date} · {toFa(order.items.length)} قلم
                  </span>
                </div>
                <span className={`${PILL_BASE} ${PILL_COLORS[STATUS_PILL[order.status]]}`}>
                  {STATUS_FA[order.status]}
                </span>
                <span className="font-heading text-[16px] font-bold max-[1100px]:hidden">
                  {formatToman(order.total)}
                  <small className="text-[13px] font-normal text-muted mr-[3px]">تومان</small>
                </span>
                <span
                  className={`w-9 h-9 rounded-full grid place-items-center transition-[transform,background,color] shrink-0 [&_svg]:w-3.5 [&_svg]:h-3.5 ${
                    isOpen ? 'rotate-180 bg-ink text-bg' : 'bg-bg-2'
                  }`}
                >
                  <IcoChevDown />
                </span>
              </div>

              {/* Body */}
              {isOpen && (
                <div className="border-t border-rule p-6 bg-surface-2">
                  <div className="grid grid-cols-[1fr_280px] gap-7 max-[1100px]:grid-cols-1">
                    {/* Items */}
                    <div>
                      <h3 className="font-heading text-[13px] m-0 mb-2.5 flex items-center gap-2 [&_svg]:w-[13px] [&_svg]:h-[13px]">
                        <IcoBag /> اقلامِ سفارش
                      </h3>
                      <div className="flex flex-col gap-2.5">
                        {order.items.map((item, i) => (
                          <div
                            key={i}
                            className="grid grid-cols-[54px_1fr_auto] gap-3.5 items-center p-3 px-3.5 bg-surface border border-rule rounded-sm"
                          >
                            <div className="w-[54px] h-[54px] rounded-sm bg-bg-2 grid place-items-center text-ink-2 relative shrink-0">
                              <span className="absolute -top-1.5 -left-1.5 min-w-5 h-5 rounded-sm bg-ink text-bg font-mono text-[12px] grid place-items-center px-[5px] border-2 border-surface">
                                {toFa(item.qty)}
                              </span>
                              <svg
                                viewBox="0 0 100 100"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.1"
                                className="w-[38px] h-[38px]"
                              >
                                {illusSvg(item.illus)}
                              </svg>
                            </div>
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <span className="font-heading text-[13px] font-semibold leading-[1.3]">
                                {item.name}
                              </span>
                              <span className="text-[12px] text-muted font-mono">
                                قطعه‌ی جواهری
                              </span>
                            </div>
                            <span className="font-heading text-[13px] font-semibold whitespace-nowrap">
                              {formatToman(item.price)}
                              <small className="text-[13px] font-normal text-muted mr-0.5">ت</small>
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-3.5 flex-wrap">
                        <button
                          className={`${BTN_PRIMARY} ${BTN_SM} [&_svg]:w-[13px] [&_svg]:h-[13px]`}
                          onClick={() => {
                            reorderItems(order, addItem)
                            openCart()
                          }}
                        >
                          <IcoReorder /> سفارشِ مجدد
                        </button>
                        <button
                          className={`${BTN_MUTE} ${BTN_SM} [&_svg]:w-[13px] [&_svg]:h-[13px]`}
                          disabled
                          title="API موجود نیست"
                        >
                          <IcoInvoice /> دانلود فاکتور
                        </button>
                        <button
                          className={`${BTN_MUTE} ${BTN_SM} [&_svg]:w-[13px] [&_svg]:h-[13px]`}
                          disabled
                          title="API موجود نیست"
                        >
                          <IcoStar /> ثبتِ نظر
                        </button>
                        {order.status === 'delivered' && (
                          <button
                            className={`${BTN_MUTE} ${BTN_SM} text-sale`}
                            disabled
                            title="API موجود نیست"
                          >
                            درخواستِ بازگشت
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Timeline */}
                    <div>
                      <div className="bg-surface border border-rule rounded-sm p-[18px_20px]">
                        <h3 className="font-heading text-[13px] font-semibold m-0 mb-3 flex items-center gap-2 [&_svg]:w-[13px] [&_svg]:h-[13px] [&_svg]:text-copper">
                          <IcoTruck /> وضعیتِ ارسال
                        </h3>
                        {steps.map((step, i) => {
                          const isDone = i <= doneIdx
                          return (
                            <div
                              key={i}
                              className="grid grid-cols-[auto_1fr] gap-3.5 pb-3.5 relative last:pb-0"
                            >
                              <span
                                className={`w-[22px] h-[22px] rounded-full border-[1.5px] grid place-items-center shrink-0 z-[1] [&_svg]:w-[11px] [&_svg]:h-[11px] ${
                                  isDone
                                    ? 'bg-ok border-ok text-white'
                                    : 'border-rule bg-bg text-muted'
                                }`}
                              >
                                <IcoCheck />
                              </span>
                              {i < steps.length - 1 && (
                                <span
                                  className={`absolute right-[11px] top-6 bottom-0 w-[1.5px] ${isDone ? 'bg-ok' : 'bg-rule'}`}
                                />
                              )}
                              <div>
                                <div
                                  className={`font-heading text-[13px] font-semibold leading-[1.2] ${isDone ? '' : 'text-muted'}`}
                                >
                                  {step}
                                </div>
                                <div
                                  className="font-mono text-[12px] text-muted mt-0.5"
                                  dir="ltr"
                                  style={{ textAlign: 'right' }}
                                >
                                  {order.date}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      {order.trackingCode && (
                        <div className="mt-2.5 px-3.5 py-[11px] bg-surface border border-rule rounded-sm flex items-center gap-2.5">
                          <span className="text-[13px] text-muted ">رهگیری</span>
                          <span
                            className="font-mono text-[13px] font-semibold flex-1"
                            dir="ltr"
                            style={{ textAlign: 'right' }}
                          >
                            {order.trackingCode}
                          </span>
                          <button
                            className="w-7 h-7 rounded-xs bg-bg-2 grid place-items-center text-ink-2 transition-colors hover:bg-ink hover:text-bg [&_svg]:w-3 [&_svg]:h-3"
                            title="کپی"
                            onClick={() => navigator.clipboard?.writeText(order.trackingCode ?? '')}
                          >
                            <IcoCopy />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </article>
          )
        })}
      </div>
    </div>
  )
}

export default OrdersPane
