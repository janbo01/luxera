const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']

/** Strip non-digits, remove leading +98 or 0, clamp to 10 chars (Iranian mobile format). */
export function normalizePhoneInput(raw: string): string {
  const d = raw.replace(/\D/g, '')
  let local = d
  if (local.startsWith('98') && local.length >= 12) local = local.slice(2)
  else if (local.startsWith('0')) local = local.slice(1)
  return local.slice(0, 10)
}

/** Display a stored phone (E.164 or local) as a 10-digit local number. */
export function toLocalPhone(phone: string): string {
  const d = phone.replace(/\D/g, '')
  if (d.startsWith('98') && d.length === 12) return d.slice(2)
  if (d.startsWith('0') && d.length === 11) return d.slice(1)
  return d
}

export const toFa = (n: string | number): string =>
  String(n).replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)] ?? d)

/** Number with Farsi digits and thousands separators, no currency suffix. */
export const formatNumber = (n: number): string =>
  Number.isFinite(n) ? toFa(n.toLocaleString('en-US')) : '—'

/** Number with Farsi digits, thousands separators, and " تومان" suffix. */
export const formatToman = (n: number): string => formatNumber(n) + ' تومان'

export const formatPaddedIndex = (n: number): string => toFa(String(n).padStart(2, '0'))

// Jalali calendar parts in Tehran time — fixed zone so the server render and the
// visitor's browser agree (no hydration mismatch for visitors abroad).
function jalaliParts(date: Date): { year: number; month: number } {
  const parts = new Intl.DateTimeFormat('en-US-u-ca-persian-nu-latn', {
    year: 'numeric',
    month: 'numeric',
    timeZone: 'Asia/Tehran',
  }).formatToParts(date)
  const num = (type: string) => Number(parts.find((p) => p.type === type)?.value)
  return { year: num('year'), month: num('month') }
}

const JALALI_SEASONS = ['بهار', 'تابستان', 'پاییز', 'زمستان']

/** Current Jalali year in Farsi digits, e.g. "۱۴۰۵". */
export const jalaliYear = (date: Date = new Date()): string => toFa(jalaliParts(date).year)

/** Current Jalali season and year, e.g. "پاییز ۱۴۰۵". */
export function jalaliSeason(date: Date = new Date()): string {
  const { year, month } = jalaliParts(date)
  return `${JALALI_SEASONS[Math.floor((month - 1) / 3)] ?? ''} ${toFa(year)}`.trim()
}
