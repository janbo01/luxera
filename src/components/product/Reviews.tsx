import { useState, useEffect, useCallback, useMemo, type FC } from 'react'
import Stars from './Stars'
import Icon from '../icons/Icon'
import { toFa } from '../../utils/format'
import { useAuthStore } from '../../store/authStore'
import { listComments, createComment, type ApiCommentResponse } from '../../api/product'
import type { Review, ReviewBreakdown } from '../../types'

interface ReviewsProps {
  productId?: string
  rating?: number
  reviewCount?: number
}

const FILTERS = ['همه', 'تأیید‌شده', 'پنج ستاره', 'انتقادی']
const AVATARS = ['plum', 'sage', 'saffron', 'teal', 'copper']

const AVA_BG: Record<string, string> = {
  plum:    'bg-[linear-gradient(135deg,var(--color-plum-dark),var(--color-plum))]',
  sage:    'bg-[linear-gradient(135deg,#2E1F16,var(--color-ink))]',
  saffron: 'bg-[linear-gradient(135deg,var(--color-copper),#9B6B2E)]',
  teal:    'bg-[linear-gradient(135deg,#24303e,#1B2630)]',
  rose:    'bg-[linear-gradient(135deg,#a04860,#7A3F22)]',
  copper:  'bg-[var(--color-bg-2)] text-ink',
}

function apiCommentToReview(c: ApiCommentResponse, idx: number): Review & { id: string } {
  return {
    id: c.id,
    name: `کاربر ${c.user_id.slice(0, 4)}`,
    date: new Date(c.created_at).toLocaleDateString('fa-IR'),
    avatar: AVATARS[idx % AVATARS.length],
    rating: c.rating ?? 5,
    verified: true,
    title: '',
    body: c.content,
    attrs: {},
    helpful: 0,
    replies: 0,
  }
}

function computeBreakdown(reviews: Review[]): ReviewBreakdown[] {
  const total = reviews.length
  return [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => r.rating === stars).length
    return { stars, count, pct: total > 0 ? Math.round((count / total) * 100) : 0 }
  })
}

function filterReviews<T extends Review>(reviews: T[], filter: string): T[] {
  if (filter === 'تأیید‌شده') return reviews.filter((r) => r.verified)
  if (filter === 'پنج ستاره') return reviews.filter((r) => r.rating === 5)
  if (filter === 'انتقادی') return reviews.filter((r) => r.rating <= 3)
  return reviews
}

const Reviews: FC<ReviewsProps> = ({ productId, rating, reviewCount }) => {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const [activeFilter, setActiveFilter] = useState('همه')
  const [reviews, setReviews] = useState<(Review & { id: string })[]>([])
  const [total, setTotal] = useState(reviewCount ?? 0)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formContent, setFormContent] = useState('')
  const [formRating, setFormRating] = useState(5)
  const [formHover, setFormHover] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const loadComments = useCallback(() => {
    if (!productId) return
    listComments(productId, { limit: 20 })
      .then((res) => {
        setReviews(res.items.map((c, i) => apiCommentToReview(c, i)))
        setTotal(res.total)
      })
      .catch(() => {
        setReviews([])
      })
      .finally(() => setLoading(false))
  }, [productId])

  useEffect(() => {
    loadComments()
  }, [loadComments])

  const handleSubmit = async () => {
    if (!productId || !formContent.trim()) return
    setSubmitting(true)
    setFormError('')
    try {
      await createComment(productId, formContent.trim(), formRating)
      setFormContent('')
      setFormRating(5)
      setShowForm(false)
      loadComments()
    } catch (e) {
      setFormError((e as { message?: string })?.message ?? 'خطا در ثبت نظر')
    } finally {
      setSubmitting(false)
    }
  }

  const displayRating = rating ?? 0
  const breakdown = useMemo(() => computeBreakdown(reviews), [reviews])
  const filtered = useMemo(() => filterReviews(reviews, activeFilter), [reviews, activeFilter])

  return (
    <section className="py-16 px-[var(--pad)] bg-surface mt-12" id="reviews">
      <div className="max-w-[1480px] mx-auto">
        <div className="grid [grid-template-columns:320px_1fr] gap-12 items-start max-md:grid-cols-1 max-md:gap-8">

          {/* Summary column */}
          <div className="sticky top-24 max-md:relative max-md:top-0">
            <div className="flex flex-col gap-1.5 mb-6">
              <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-copper-dark">Customer reviews</span>
              <h2 className="font-heading font-bold text-[clamp(32px,3.5vw,48px)] leading-[1.1] m-0 text-ink">
                تجربه‌ی <em className="font-body italic font-normal text-copper-dark">مشتریان</em>
              </h2>
              <span className="font-display italic text-[14px] text-muted">What our clients say.</span>
            </div>

            <div className="flex items-baseline gap-3.5 my-[18px] mb-2">
              <span className="font-heading text-[48px] font-bold text-ink leading-none">
                {displayRating > 0 ? toFa(displayRating.toFixed(1)) : '—'}
              </span>
              <div className="flex flex-col gap-1.5 pb-1.5">
                <Stars value={displayRating} size={16} />
                <span className="text-[11px] text-muted font-mono tracking-[0.06em]">
                  بر اساسِ {toFa(total)} نظرِ ثبت‌شده
                </span>
              </div>
            </div>

            {!loading && reviews.length > 0 && (
              <div className="flex flex-col gap-2 mt-[18px]">
                {breakdown.map((r) => (
                  <div key={r.stars} className="grid [grid-template-columns:30px_1fr_36px] gap-2.5 items-center font-mono text-[11px] text-muted">
                    <span className="inline-flex items-center gap-1 text-ink-2">
                      {toFa(r.stars)} <Icon name="star" size={10} />
                    </span>
                    <div className="h-1.5 bg-bg-2 rounded-full overflow-hidden">
                      <div className="h-full bg-ink rounded-full" style={{ width: r.pct + '%' }} />
                    </div>
                    <span className="text-start">{toFa(r.count)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 p-[18px] bg-bg rounded-[12px] text-[13px] text-ink-2 leading-[1.7]">
              <p className="m-0 mb-3">تجربه‌ی خود را با خریداران آینده در میان بگذارید. هر نظر تأیید‌شده با کدِ منحصر به مشتریِ خریدار همراه است.</p>
              {isLoggedIn ? (
                <button
                  className="inline-flex items-center gap-2.5 px-5 py-2.5 text-[13px] font-medium bg-ink text-bg rounded-full border border-ink transition-all duration-200 hover:bg-plum hover:border-plum"
                  onClick={() => setShowForm((v) => !v)}
                >
                  {showForm ? 'انصراف' : 'نوشتن نظر'}
                  <Icon name="arrow-up" size={14} strokeWidth={1.6} />
                </button>
              ) : (
                <p className="text-[13px] text-muted m-0">
                  برای ثبت نظر ابتدا وارد حساب کاربری شوید.
                </p>
              )}
            </div>

            {showForm && isLoggedIn && (
              <div className="mt-5 flex flex-col gap-3">
                <div className="flex gap-1 [direction:ltr]">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="p-0.5 transition-colors duration-150"
                      style={{ color: star <= (formHover || formRating) ? 'var(--color-copper)' : 'rgba(26,17,10,0.2)' }}
                      onClick={() => setFormRating(star)}
                      onMouseEnter={() => setFormHover(star)}
                      onMouseLeave={() => setFormHover(0)}
                      aria-label={`${star} ستاره`}
                    >
                      <Icon name="star" size={22} />
                    </button>
                  ))}
                </div>
                <textarea
                  className="w-full border border-rule rounded-[8px] p-3 font-body text-[14px] text-ink bg-surface resize-none outline-none focus:border-ink transition-colors duration-200 placeholder:text-muted"
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="نظر خود را بنویسید…"
                  rows={4}
                />
                {formError && (
                  <span className="text-[13px] text-sale">{formError}</span>
                )}
                <button
                  className={`self-start inline-flex items-center gap-2.5 px-5 py-2.5 text-[13px] font-medium bg-ink text-bg rounded-full border border-ink transition-all duration-200 hover:bg-plum hover:border-plum ${submitting ? 'opacity-60' : ''}`}
                  onClick={handleSubmit}
                  disabled={submitting || !formContent.trim()}
                >
                  {submitting ? 'در حال ارسال…' : 'ثبت نظر'}
                </button>
              </div>
            )}
          </div>

          {/* Reviews list column */}
          <div>
            <div className="flex items-center gap-2.5 flex-wrap mb-[22px]">
              <span className="font-mono text-[11px] text-muted tracking-[0.14em] uppercase me-1.5">فیلتر</span>
              {FILTERS.map((f) => (
                <button
                  key={f}
                  className={`px-3.5 py-1.5 rounded-full text-[12px] border font-body transition-all duration-150 ${f === activeFilter ? 'bg-ink text-bg border-ink' : 'border-rule text-ink-2 hover:border-ink-2'}`}
                  onClick={() => setActiveFilter(f)}
                >
                  {f}
                </button>
              ))}
              <span className="flex-1" />
              <span className="inline-flex items-center gap-2 px-3.5 py-2 border border-rule rounded-full text-[12px] bg-bg font-body">
                مرتب: تازه‌ترین ▾
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3.5 max-md:grid-cols-1">
              {loading && (
                <div className="col-span-2 py-10 text-center">
                  <span className="inline-block w-4 h-4 rounded-full border-2 border-rule border-t-ink animate-[spin_0.7s_linear_infinite]" />
                </div>
              )}
              {!loading && filtered.length === 0 && (
                <p className="col-span-2 text-[13px] text-muted py-6 text-center">هنوز نظری برای این فیلتر ثبت نشده.</p>
              )}
              {!loading && filtered.map((review) => (
                <article key={review.id} className="p-5 bg-bg rounded-[var(--radius)] border border-rule flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-full flex-shrink-0 grid place-items-center text-bg font-heading text-[14px] font-bold overflow-hidden ${AVA_BG[review.avatar] ?? 'bg-bg-2'}`}>
                      {review.name.charAt(0)}
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <span className="font-heading text-[14px] font-semibold flex items-center gap-2 flex-wrap">
                        {review.name}
                        {review.verified && (
                          <span className="inline-flex items-center gap-1 font-mono text-[9px] text-ok bg-[rgba(31,138,91,.1)] px-[7px] py-0.5 rounded-full tracking-[0.04em]">
                            <Icon name="check" size={9} strokeWidth={2.4} />
                            تأیید‌شده
                          </span>
                        )}
                      </span>
                      <span className="font-mono text-[10px] text-muted tracking-[0.06em]">{review.date}</span>
                    </div>
                    <Stars value={review.rating} size={11} />
                  </div>
                  {review.title && (
                    <h3 className="font-heading font-medium text-[16px] m-0 text-ink">{review.title}</h3>
                  )}
                  <p className="text-[14px] leading-[1.85] text-ink-2 m-0">{review.body}</p>
                </article>
              ))}
            </div>

            {!loading && total > reviews.length && (
              <div className="mt-7 flex justify-center">
                <button className="inline-flex items-center gap-2 px-6 py-3 border border-rule rounded-full text-[13px] text-ink-2 font-body transition-all duration-200 hover:bg-ink hover:text-bg hover:border-ink">
                  نمایش {toFa(total - reviews.length)} نظر دیگر
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  )
}

export default Reviews
