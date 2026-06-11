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
export const formatNumber = (n: number): string => toFa(n.toLocaleString('en-US'))

/** Number with Farsi digits, thousands separators, and " تومان" suffix. */
export const formatToman = (n: number): string => formatNumber(n) + ' تومان'

export const formatPaddedIndex = (n: number): string => toFa(String(n).padStart(2, '0'))
