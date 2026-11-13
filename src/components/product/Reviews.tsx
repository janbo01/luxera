import { useState, useEffect, useCallback, useMemo, type FC } from 'react'
import Stars from './Stars'
import { Star } from 'lucide-react'
import ReviewForm from './ReviewForm'
import Icon from '../icons/Icon'
import { toFa } from '../../utils/format'
import { useAuthStore } from '../../store/authStore'
import { useUIStore } from '../../store/uiStore'
import { listComments, type ApiCommentResponse } from '../../api/product'

interface ReviewsProps {
  productId?: string
  rating?: number
  reviewCount?: number
}

interface ReviewItem {
  id: string
  rating: number
  body: string
  createdAt: string
}

type FilterKey = 'all' | 'positive' | 'critical'
type SortKey = 'newest' | 'highest' | 'lowest'

/** Products rarely have more than a few dozen reviews, so one request usually gets them all
 *  (which keeps the star breakdown honest). The list then reveals them a few at a time. */
const PAGE_SIZE = 100
const STEP = 8

const FILTERS: { key: FilterKey; label: string; test: (r: ReviewItem) => boolean }[] = [
  { key: 'all', label: 'همه', test: () => true },
  { key: 'positive', label: 'راضی', test: (r) => r.rating >= 4 },
  { key: 'critical', label: 'انتقادی', test: (r) => r.rating <= 3 },
]

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'newest', label: 'تازه‌ترین' },
  { key: 'highest', label: 'بیشترین امتیاز' },
  { key: 'lowest', label: 'کمترین امتیاز' },
]

const toItem = (c: ApiCommentResponse): ReviewItem => ({
  id: c.id,
  rating: c.rating ?? 5,
  body: c.content,
  createdAt: c.created_at,
})

const faDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })

const Reviews: FC<ReviewsProps> = ({ productId, rating, reviewCount }) => {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const openLogin = useUIStore((s) => s.openLogin)

  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [total, setTotal] = useState(reviewCount ?? 0)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [loadingMore, setLoadingMore] = useState(false)
  const [filter, setFilter] = useState<FilterKey>('all')
  const [sort, setSort] = useState<SortKey>('newest')
  const [shown, setShown] = useState(STEP)
  // Stays true while a signed-out visitor logs in, so the form opens once they're in.
  const [wantsForm, setWantsForm] = useState(false)
  const [thanks, setThanks] = useState(false)

  const load = useCallback(() => {
    if (!productId) return
    setStatus('loading')
    listComments(productId, { limit: PAGE_SIZE })
      .then((res) => {
        setReviews(res.items.map(toItem))
        setTotal(res.total ?? res.items.length)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [productId])

  useEffect(() => {
    // load() sets state after the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  const fetchMore = async () => {
    if (!productId) return
    setLoadingMore(true)
    try {
      const res = await listComments(productId, { limit: PAGE_SIZE, offset: reviews.length })
      setReviews((prev) => [...prev, ...res.items.map(toItem)])
      setTotal(res.total ?? total)
    } finally {
      setLoadingMore(false)
    }
  }

  const chooseFilter = (key: FilterKey) => {
    setFilter(key)
    setShown(STEP)
  }

  const startWriting = () => {
    setThanks(false)
    setWantsForm(true)
    if (!isLoggedIn) openLogin('برای نوشتن نظر وارد حساب کاربری شوید.')
  }

  const formOpen = wantsForm && isLoggedIn && !!productId
  const allLoaded = reviews.length >= total

  // The product's own rating is the store-wide figure; fall back to the loaded reviews.
  const average = useMemo(() => {
    if (rating && rating > 0) return rating
    if (!reviews.length) return 0
    return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
  }, [rating, reviews])

  const breakdown = useMemo(
    () =>
      [5, 4, 3, 2, 1].map((stars) => {
        const count = reviews.filter((r) => r.rating === stars).length
        return { stars, count, pct: reviews.length ? (count / reviews.length) * 100 : 0 }
      }),
    [reviews],
  )

  const counts = useMemo(
    () => Object.fromEntries(FILTERS.map((f) => [f.key, reviews.filter(f.test).length])),
    [reviews],
  ) as Record<FilterKey, number>

  const visible = useMemo(() => {
    const test = FILTERS.find((f) => f.key === filter)!.test
    const list = reviews.filter(test)
    if (sort === 'highest') return [...list].sort((a, b) => b.rating - a.rating)
    if (sort === 'lowest') return [...list].sort((a, b) => a.rating - b.rating)
    return list
  }, [reviews, filter, sort])

  const hasReviews = status === 'ready' && total > 0
  // Hidden on this page of the list, plus (unfiltered only) any not fetched yet.
  const hiddenHere = Math.max(0, visible.length - shown)
  const moreCount = hiddenHere + (filter === 'all' ? Math.max(0, total - reviews.length) : 0)

  const showMore = async () => {
    if (hiddenHere < STEP && !allLoaded && filter === 'all') await fetchMore()
    setShown((n) => n + STEP)
  }
  const showToolbar = hasReviews && reviews.length > 2

  const writeButton = !formOpen && (
    <button
      type="button"
      onClick={startWriting}
      className="inline-flex items-center gap-2 min-h-11 px-5 rounded-full text-[14px] font-medium bg-ink text-bg border border-ink transition-colors duration-200 hover:bg-plum hover:border-plum"
    >
      <Icon name="edit" size={15} strokeWidth={1.6} />
      {isLoggedIn ? 'نوشتن نظر' : 'ورود و نوشتن نظر'}
    </button>
  )

  return (
    <section
      className="py-14 md:py-16 px-[var(--pad)] bg-surface mt-12"
      id="reviews"
      aria-labelledby="reviews-title"
    >
      <div className="max-w-[1480px] mx-auto">
        {/* Header: title + the one action */}
        <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
          <div>
            <h2
              id="reviews-title"
              className="font-heading font-bold text-[clamp(26px,3.2vw,38px)] leading-[1.15] m-0 text-ink"
            >
              نظر خریداران
            </h2>
          </div>
          {hasReviews && writeButton}
        </div>

        {thanks && (
          <p
            role="status"
            className="m-0 mb-6 flex items-center gap-2 text-[14px] text-ok bg-ok/10 rounded-[var(--radius-sm)] px-4 py-3"
          >
            <Icon name="check" size={15} strokeWidth={2} />
            نظر شما ثبت شد. ممنون که تجربه‌تان را نوشتید.
          </p>
        )}

        {formOpen && (
          <div className="mb-8 max-w-[640px]">
            <ReviewForm
              productId={productId}
              onCancel={() => setWantsForm(false)}
              onSaved={() => {
                setWantsForm(false)
                setThanks(true)
                load()
              }}
            />
          </div>
        )}

        {status === 'loading' && (
          <div className="py-12 grid place-items-center" aria-label="در حال بارگذاری نظرها">
            <span className="inline-block w-5 h-5 rounded-full border-2 border-rule border-t-ink animate-[spin_0.7s_linear_infinite]" />
          </div>
        )}

        {status === 'error' && (
          <div className="py-10 text-center flex flex-col items-center gap-3">
            <p className="m-0 text-[14px] text-ink-2">نظرها بارگذاری نشد.</p>
            <button
              type="button"
              onClick={load}
              className="min-h-11 px-5 rounded-full border border-rule text-[13px] text-ink hover:border-ink"
            >
              تلاش دوباره
            </button>
          </div>
        )}

        {/* Empty: one calm card instead of filters with nothing to filter */}
        {status === 'ready' && total === 0 && !formOpen && (
          <div className="bg-bg rounded-[var(--radius)] border border-rule px-6 py-10 md:py-12 flex flex-col items-center text-center gap-3">
            <span className="w-14 h-14 rounded-full bg-bg-2 grid place-items-center text-copper">
              <Star size={22} strokeWidth={1.4} aria-hidden="true" />
            </span>
            <h3 className="m-0 font-heading text-[19px] font-semibold text-ink">
              هنوز نظری ثبت نشده
            </h3>
            <p className="m-0 max-w-[42ch] text-[14px] leading-[1.8] text-ink-2">
              اگر این محصول را خریده‌اید، اولین نفری باشید که از تجربه‌اش می‌نویسد.
            </p>
            <div className="mt-2">{writeButton}</div>
          </div>
        )}

        {hasReviews && (
          <div className="grid md:grid-cols-[280px_minmax(0,1fr)] gap-8 md:gap-12 items-start">
            {/* Summary */}
            <aside
              className="md:sticky md:top-24 bg-bg rounded-[var(--radius)] border border-rule p-5"
              aria-label="خلاصه‌ی امتیازها"
            >
              <div className="flex items-center gap-4">
                <span className="font-heading text-[44px] font-bold text-ink leading-none [font-variant-numeric:tabular-nums]">
                  {toFa(average.toFixed(1))}
                </span>
                <div className="flex flex-col gap-1">
                  <span className="text-copper inline-flex">
                    <Stars value={average} size={16} />
                  </span>
                  <span className="text-[12px] text-muted">از {toFa(total)} نظر</span>
                </div>
              </div>

              {allLoaded && (
                <ul className="list-none m-0 p-0 mt-5 flex flex-col gap-2">
                  {breakdown.map((r) => (
                    <li
                      key={r.stars}
                      className="grid grid-cols-[auto_1fr_2em] gap-3 items-center text-[12px] text-muted [font-variant-numeric:tabular-nums]"
                    >
                      <span className="text-ink-2 whitespace-nowrap">{toFa(r.stars)} ستاره</span>
                      <span
                        className="h-1.5 bg-bg-2 rounded-full overflow-hidden"
                        aria-hidden="true"
                      >
                        <span
                          className="block h-full bg-copper rounded-full"
                          style={{ width: `${r.pct}%` }}
                        />
                      </span>
                      <span className="text-end">{toFa(r.count)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </aside>

            {/* List */}
            <div className="min-w-0">
              {showToolbar && (
                <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
                  <div className="flex gap-2 flex-wrap" role="group" aria-label="فیلتر نظرها">
                    {FILTERS.filter((f) => f.key === 'all' || counts[f.key] > 0).map((f) => (
                      <button
                        key={f.key}
                        type="button"
                        aria-pressed={filter === f.key}
                        onClick={() => chooseFilter(f.key)}
                        className={`inline-flex items-center gap-2 h-11 ps-4 pe-2 rounded-full text-[13.5px] leading-none border transition-colors duration-150 ${
                          filter === f.key
                            ? 'bg-ink text-bg border-ink'
                            : 'bg-bg text-ink-2 border-rule hover:border-ink'
                        }`}
                      >
                        <span>{f.label}</span>
                        <span
                          className={`min-w-7 h-7 px-1.5 grid place-items-center rounded-full text-[12px] [font-variant-numeric:tabular-nums] ${
                            filter === f.key ? 'bg-bg/15 text-bg' : 'bg-bg-2 text-ink-2'
                          }`}
                        >
                          {toFa(counts[f.key])}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <span id="reviews-sort-label" className="text-[13px] text-muted">
                      ترتیب
                    </span>
                    {/* The native select sits invisibly on top, so the box hugs the chosen
                        label (a visible select is as wide as its longest option). */}
                    <span className="relative inline-flex items-center gap-2 h-11 ps-4 pe-3 rounded-full border border-rule bg-bg text-[13.5px] leading-none text-ink transition-colors duration-150 hover:border-ink has-[:focus-visible]:border-ink has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink">
                      <span aria-hidden="true">{SORTS.find((x) => x.key === sort)!.label}</span>
                      <Icon name="chevron-down" size={15} strokeWidth={1.8} />
                      <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value as SortKey)}
                        aria-labelledby="reviews-sort-label"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      >
                        {SORTS.map((x) => (
                          <option key={x.key} value={x.key}>
                            {x.label}
                          </option>
                        ))}
                      </select>
                    </span>
                  </div>
                </div>
              )}

              <ul className="list-none m-0 p-0 bg-bg rounded-[var(--radius)] border border-rule divide-y divide-rule">
                {visible.slice(0, shown).map((r) => (
                  <li key={r.id} className="p-5 md:p-6">
                    <article className="flex flex-col gap-2.5">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-copper inline-flex">
                          <Stars value={r.rating} size={14} />
                        </span>
                        <time dateTime={r.createdAt} className="text-[12px] text-muted">
                          {faDate(r.createdAt)}
                        </time>
                      </div>
                      <p className="m-0 text-[15px] leading-[1.9] text-ink whitespace-pre-line">
                        {r.body}
                      </p>
                    </article>
                  </li>
                ))}
              </ul>

              {moreCount > 0 && (
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={showMore}
                    disabled={loadingMore}
                    className="min-h-11 px-6 rounded-full border border-rule text-[13.5px] text-ink-2 transition-colors duration-200 hover:bg-ink hover:text-bg hover:border-ink disabled:opacity-60"
                  >
                    {loadingMore ? 'در حال بارگذاری…' : `نمایش ${toFa(moreCount)} نظر دیگر`}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default Reviews
