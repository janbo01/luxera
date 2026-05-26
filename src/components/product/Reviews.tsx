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
    <section className="reviews-sect" id="reviews">
      <div className="rev-inner">
        <div className="rev-grid">

          {/* Summary column */}
          <div className="rev-summary">
            <div className="rev-summary__titles">
              <span className="rev-summary__eyebrow">Customer reviews</span>
              <h2>تجربه‌ی <em>مشتریان</em></h2>
              <span className="rev-summary__sub">What our clients say.</span>
            </div>

            <div className="rev-big">
              <span className="rev-big__num">{displayRating > 0 ? toFa(displayRating.toFixed(1)) : '—'}</span>
              <div className="rev-big__stars">
                <Stars value={displayRating} size={16} />
                <span className="rev-big__cnt">بر اساسِ {toFa(total)} نظرِ ثبت‌شده</span>
              </div>
            </div>

            {!loading && reviews.length > 0 && (
              <div className="rev-bars">
                {breakdown.map((r) => (
                  <div key={r.stars} className="rev-bar">
                    <span className="s">{toFa(r.stars)} <Icon name="star" size={10} /></span>
                    <div className="track"><div className="fill" style={{ width: r.pct + '%' }} /></div>
                    <span className="n">{toFa(r.count)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="rev-cta">
              <p>تجربه‌ی خود را با خریداران آینده در میان بگذارید. هر نظر تأیید‌شده با کدِ منحصر به مشتریِ خریدار همراه است.</p>
              {isLoggedIn ? (
                <button className="rev-cta__btn" onClick={() => setShowForm((v) => !v)}>
                  {showForm ? 'انصراف' : 'نوشتن نظر'}
                  <Icon name="arrow-up" size={14} strokeWidth={1.6} />
                </button>
              ) : (
                <p className="rev-cta__hint">
                  برای ثبت نظر ابتدا وارد حساب کاربری شوید.
                </p>
              )}
            </div>

            {showForm && isLoggedIn && (
              <div className="rev-form">
                <div className="rev-form__stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="rev-star-btn"
                      style={{ color: star <= (formHover || formRating) ? 'var(--copper)' : 'var(--ink-20)' }}
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
                  className="rev-form__textarea"
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="نظر خود را بنویسید…"
                  rows={4}
                />
                {formError && (
                  <span className="rev-form__error">{formError}</span>
                )}
                <button
                  className={`rev-cta__btn rev-form__submit${submitting ? ' is-submitting' : ''}`}
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
            <div className="rev-filter">
              <span className="l">فیلتر</span>
              {FILTERS.map((f) => (
                <button
                  key={f}
                  className={`rev-fchip ${f === activeFilter ? 'is-active' : ''}`}
                  onClick={() => setActiveFilter(f)}
                >
                  {f}
                </button>
              ))}
              <span className="rev-filter__spacer" />
              <span className="rev-sort">مرتب: تازه‌ترین ▾</span>
            </div>

            <div className="rev-list">
              {loading && (
                <div className="rev-loading">
                  <span className="spinner" />
                </div>
              )}
              {!loading && filtered.length === 0 && (
                <p className="rev-empty">هنوز نظری برای این فیلتر ثبت نشده.</p>
              )}
              {!loading && filtered.map((review) => (
                <article key={review.id} className="rev">
                  <div className="rev__head">
                    <div className={`rev__ava rev__ava--${review.avatar}`}>
                      {review.name.charAt(0)}
                    </div>
                    <div className="rev__who">
                      <span className="rev__nm">
                        {review.name}
                        {review.verified && (
                          <span className="rev__badge-v">
                            <Icon name="check" size={9} strokeWidth={2.4} />
                            تأیید‌شده
                          </span>
                        )}
                      </span>
                      <span className="rev__meta">{review.date}</span>
                    </div>
                    <Stars value={review.rating} size={11} />
                  </div>
                  {review.title && (
                    <h4 className="rev__title">{review.title}</h4>
                  )}
                  <p className="rev__body">{review.body}</p>
                </article>
              ))}
            </div>

            {!loading && total > reviews.length && (
              <div className="rev-more">
                <button className="rev-more__btn">نمایش {toFa(total - reviews.length)} نظر دیگر</button>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  )
}

export default Reviews
