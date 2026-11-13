import { useId, useState, type FC, type FormEvent } from 'react'
import { Star } from 'lucide-react'
import { Button } from '../ui/Button'
import { toFa } from '../../utils/format'
import { createComment } from '../../api/product'

const RATING_LABELS = ['', 'ضعیف', 'متوسط', 'خوب', 'خیلی خوب', 'عالی']
const MIN_LENGTH = 10

interface ReviewFormProps {
  productId: string
  onCancel: () => void
  onSaved: () => void
}

/** Star picker + text box. Stars are a radio group so arrow keys work. */
const ReviewForm: FC<ReviewFormProps> = ({ productId, onCancel, onSaved }) => {
  const textId = useId()
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const shown = hover || rating
  const trimmed = content.trim()

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!rating) return setError('لطفاً امتیاز خود را انتخاب کنید.')
    if (trimmed.length < MIN_LENGTH)
      return setError(`نظر باید دست‌کم ${toFa(MIN_LENGTH)} حرف باشد.`)
    setSubmitting(true)
    setError('')
    try {
      await createComment(productId, trimmed, rating)
      onSaved()
    } catch (err) {
      setError((err as { message?: string })?.message ?? 'ثبت نظر ناموفق بود. دوباره تلاش کنید.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={submit}
      className="bg-bg rounded-[var(--radius)] border border-rule p-5 md:p-6 flex flex-col gap-5"
      noValidate
    >
      <fieldset className="m-0 p-0 border-0">
        <legend className="text-[14px] font-medium text-ink mb-2">امتیاز شما</legend>
        <div className="flex items-center gap-3 flex-wrap">
          <div
            role="radiogroup"
            aria-label="امتیاز"
            className="flex"
            onMouseLeave={() => setHover(0)}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <label
                key={n}
                className={`w-11 h-11 grid place-items-center cursor-pointer transition-colors duration-150 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ink rounded-full ${
                  n <= shown ? 'text-copper' : 'text-rule'
                }`}
                onMouseEnter={() => setHover(n)}
              >
                <input
                  type="radio"
                  name="rating"
                  value={n}
                  checked={rating === n}
                  onChange={() => setRating(n)}
                  className="sr-only"
                  aria-label={`${toFa(n)} ستاره، ${RATING_LABELS[n]}`}
                />
                <Star
                  size={26}
                  strokeWidth={1.4}
                  fill={n <= shown ? 'currentColor' : 'none'}
                  aria-hidden="true"
                />
              </label>
            ))}
          </div>
          <span className="text-[13px] text-muted min-w-[5em]" aria-live="polite">
            {shown ? RATING_LABELS[shown] : 'انتخاب کنید'}
          </span>
        </div>
      </fieldset>

      <div className="flex flex-col gap-2">
        <label htmlFor={textId} className="text-[14px] font-medium text-ink">
          نظر شما
        </label>
        <textarea
          id={textId}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          placeholder="از کیفیت، اندازه یا بسته‌بندی بگویید…"
          className="w-full border border-rule rounded-[var(--radius-sm)] p-3 font-body text-[15px] leading-[1.8] text-ink bg-surface resize-y outline-none focus:border-ink transition-colors duration-200 placeholder:text-muted"
        />
      </div>

      {error && (
        <p className="m-0 text-[13px] text-sale" role="alert">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <Button type="submit" variant="small" isLoading={submitting}>
          {submitting ? 'در حال ثبت…' : 'ثبت نظر'}
        </Button>
        <button
          type="button"
          onClick={onCancel}
          className="min-h-11 px-4 text-[13px] text-ink-2 hover:text-ink"
        >
          انصراف
        </button>
      </div>
    </form>
  )
}

export default ReviewForm
