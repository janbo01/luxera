import { type FC, useState, useEffect, useMemo } from 'react'
import { useAuthStore } from '../../store/authStore'
import { useWishlistStore } from '../../store/wishlistStore'
import { formatToman, toFa } from '../../utils/format'
import {
  CARD,
  CARD_H,
  CARD_H3,
  IC_CIR,
  IC_MD,
  IcoArrowLeft,
  IcoBag,
  IcoClock,
  IcoEmail,
  IcoHeart,
  IcoInfo,
  IcoInvoice,
  IcoLightning,
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
} from './shared'

const OverviewPane: FC<PaneProps> = ({ setTab }) => {
  const orders = useAuthStore((s) => s.orders)
  const wishCount = useWishlistStore((s) => s.items.length)
  const [loyaltyBalance, setLoyaltyBalance] = useState<number | null>(null)
  const inTransit = useMemo(
    () => orders.filter((o) => o.status === 'shipped' || o.status === 'processing').length,
    [orders],
  )

  const thisMonthOrders = useMemo(() => {
    const now = new Date()
    return orders.filter((o) => {
      const d = new Date(o.date)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length
  }, [orders])

  useEffect(() => {
    import('../../api/user').then(({ getLoyaltyBalance }) => {
      getLoyaltyBalance()
        .then(setLoyaltyBalance)
        .catch(() => {})
    })
  }, [])

  const kpis = useMemo(
    () => [
      {
        icon: <IcoBag />,
        value: toFa(orders.length),
        label: 'سفارش‌های کل',
        extra: thisMonthOrders > 0 ? `+${toFa(thisMonthOrders)} این ماه` : null,
      },
      {
        icon: <IcoTruck />,
        value: toFa(inTransit),
        label: 'در حالِ ارسال',
        extra: inTransit > 0 ? 'در راه' : null,
      },
      {
        icon: <IcoHeart />,
        value: toFa(wishCount),
        unit: 'قطعه',
        label: 'علاقه‌مندی‌ها',
        extra: null,
      },
      {
        icon: <IcoStar />,
        value: loyaltyBalance === null ? '…' : toFa(loyaltyBalance),
        unit: loyaltyBalance !== null ? 'امتیاز' : undefined,
        muted: loyaltyBalance === null,
        label: 'امتیازِ شما',
        extra: null,
      },
    ],
    [orders.length, thisMonthOrders, inTransit, wishCount, loyaltyBalance],
  )

  return (
    <div className="flex flex-col gap-[18px]">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3.5 max-[1100px]:grid-cols-2">
        {kpis.map((k, i) => (
          <div
            key={i}
            className="bg-surface border border-rule rounded-[var(--radius)] px-[22px] py-5 flex flex-col gap-4 relative overflow-hidden after:content-[''] after:absolute after:-left-[10%] after:-bottom-[30%] after:w-[60%] after:h-[60%] after:bg-[radial-gradient(circle,rgba(196,135,58,.06),transparent_60%)] after:pointer-events-none"
          >
            <div className="flex justify-between items-start gap-2">
              <span className={IC_MD}>{k.icon}</span>
              {k.extra && (
                <span className="font-mono text-[12px] text-ok bg-ok/10 px-[7px] py-[3px] rounded-full">
                  {k.extra}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <div
                className={`font-heading text-[30px] font-bold leading-none flex items-baseline gap-[5px] ${k.muted ? 'text-muted text-[22px]' : 'text-ink'}`}
              >
                {k.value}
                {k.unit && (
                  <small className="font-body text-[13px] font-normal text-muted mr-0.5">
                    {k.unit}
                  </small>
                )}
              </div>
              <div className="text-[13px] text-muted font-body leading-[1.4]">{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1.5fr_1fr] gap-[18px] max-[1100px]:grid-cols-1">
        {/* Recent orders */}
        <div className={CARD}>
          <div className={CARD_H}>
            <h2 className={CARD_H3}>
              <span className={IC_CIR}>
                <IcoClock />
              </span>{' '}
              سفارش‌های اخیر
            </h2>
            <button
              className="text-[13px] text-copper font-body bg-transparent border-0 cursor-pointer hover:underline hover:underline-offset-[3px]"
              onClick={() => setTab('orders')}
            >
              همه‌ی سفارش‌ها →
            </button>
          </div>
          <div className="flex flex-col">
            {orders.slice(0, 3).map((order) => (
              <div
                key={order.id}
                className="grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center px-6 py-3.5 border-b border-rule last:border-b-0"
              >
                <div className="flex">
                  {order.items.slice(0, 2).map((item, i) => (
                    <span
                      key={i}
                      className="w-[42px] h-[42px] rounded-sm bg-bg-2 grid place-items-center text-ink-2 border-2 border-surface -mr-3 first:mr-0 [&_svg]:w-[34px] [&_svg]:h-[34px]"
                    >
                      <svg
                        viewBox="0 0 100 100"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.4"
                      >
                        {illusSvg(item.illus)}
                      </svg>
                    </span>
                  ))}
                  {order.items.length > 2 && (
                    <span className="w-[42px] h-[42px] rounded-sm bg-ink text-bg font-mono text-[12px] font-semibold grid place-items-center border-2 border-surface -mr-3">
                      +{toFa(order.items.length - 2)}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="font-mono text-[12px] text-muted">
                    {order.id} · {order.date}
                  </span>
                  <span className="font-heading text-sm font-semibold leading-[1.3] whitespace-nowrap overflow-hidden text-ellipsis">
                    {order.items[0].name}
                    {order.items.length > 1 ? ` + ${toFa(order.items.length - 1)} قطعه` : ''}
                  </span>
                </div>
                <span className={`${PILL_BASE} ${PILL_COLORS[STATUS_PILL[order.status]]}`}>
                  {STATUS_FA[order.status]}
                </span>
                <span className="font-heading text-sm font-bold whitespace-nowrap">
                  {formatToman(order.total)}
                  <small className="text-[13px] font-normal text-muted mr-[3px]">ت</small>
                </span>
              </div>
            ))}
            {orders.length === 0 && (
              <div className="py-8 px-6 text-center text-muted text-sm">
                هنوز سفارشی ثبت نشده است
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className={CARD}>
          <div className={CARD_H}>
            <h2 className={CARD_H3}>
              <span className={IC_CIR}>
                <IcoLightning />
              </span>{' '}
              دسترسیِ سریع
            </h2>
          </div>
          <div className="p-2.5">
            {[
              {
                icon: <IcoEmail />,
                title: 'پیگیریِ سفارش',
                desc: 'با کدِ رهگیری',
                tab: 'orders' as Tab,
              },
              {
                icon: <IcoReorder />,
                title: 'درخواستِ بازگشت',
                desc: '۴ روز فرصت دارید',
                tab: 'orders' as Tab,
              },
              {
                icon: <IcoInfo />,
                title: 'تماس با پشتیبانی',
                desc: 'پاسخگویی روزانه ۹–۲۱',
                tab: null,
              },
              {
                icon: <IcoInvoice />,
                title: 'گارانتی و اصالت',
                desc: 'گواهی‌های دیجیتالِ شما',
                tab: null,
              },
            ].map((item, i) => (
              <button
                key={i}
                className="flex items-center gap-3 px-3.5 py-3 rounded-sm transition-colors w-full text-right hover:bg-bg-2"
                onClick={() => item.tab && setTab(item.tab)}
              >
                <span className="w-9 h-9 rounded-lg bg-bg-2 grid place-items-center text-copper shrink-0 [&_svg]:w-4 [&_svg]:h-4">
                  {item.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-heading text-[13px] font-semibold leading-[1.2]">
                    {item.title}
                  </div>
                  <div className="text-[13px] text-muted mt-0.5 leading-[1.3]">{item.desc}</div>
                </div>
                <span className="text-muted [&_svg]:w-3.5 [&_svg]:h-3.5">
                  <IcoArrowLeft />
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OverviewPane
