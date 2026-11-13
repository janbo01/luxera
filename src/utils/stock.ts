/** A product is sold out only when the API says so; an unknown count is treated as in stock. */
export function isSoldOut(p: { stockCount?: number }): boolean {
  return p.stockCount === 0
}

/** Same as isSoldOut, for raw API rows (`stock_count`). */
export function isApiSoldOut(p: { stock_count?: number }): boolean {
  return p.stock_count === 0
}

/** Stable re-order that keeps the incoming order but moves sold-out products to the end. */
export function soldOutLast<T extends { stockCount?: number }>(list: T[]): T[] {
  if (!list.some(isSoldOut)) return list
  return [...list.filter((p) => !isSoldOut(p)), ...list.filter(isSoldOut)]
}

/**
 * Merchandising rails (home "new in", category tabs) fetch this many rows and keep the
 * first RAIL_SIZE in stock, so a run of sold-out newest items doesn't empty the rail.
 */
export const RAIL_FETCH = 30
export const RAIL_SIZE = 10
