import { useEffect, useRef, useMemo, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../icons/Icon'
import { Illustration } from '../../illustrations'
import { useSearchStore } from '../../store/searchStore'
import { useBodyLock } from '../../hooks/useBodyLock'
import { formatToman } from '../../utils/format'

const SearchOverlay: FC = () => {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

  const {
    isOpen, query, results, recentSearches,
    close, setQuery, commit, removeRecent, clearRecent,
  } = useSearchStore()

  useBodyLock(isOpen)

  useEffect(() => {
    if (!isOpen) return
    const id = setTimeout(() => inputRef.current?.focus(), 50)
    return () => clearTimeout(id)
  }, [isOpen])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [close])

  const handleSubmit = (q: string) => {
    if (!q.trim()) return
    commit(q)
    close()
    navigate(`/search?q=${encodeURIComponent(q.trim())}`)
  }

  const highlightRe = useMemo(() => {
    const trimmed = query.trim()
    if (!trimmed) return null
    return new RegExp(`(${trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  }, [query])

  const highlight = (text: string) => {
    if (!highlightRe) return text
    const parts = text.split(highlightRe)
    return parts.map((part, i) =>
      highlightRe.test(part)
        ? <mark key={i} className="bg-[rgba(61,43,32,.1)] text-plum rounded-[2px] px-0.5">{part}</mark>
        : part
    )
  }

  const showRecents = query.trim().length < 2
  const hasResults = results.products.length > 0 || results.categories.length > 0

  if (!isOpen) return null

  const rowHover = 'hover:bg-[var(--color-bg-2)]'
  const iconBtn = 'flex items-center justify-center w-8 h-8 text-muted rounded-full transition-colors duration-200 hover:text-ink hover:bg-bg-2 flex-shrink-0'

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center animate-[overlay-in_200ms_ease_both]" role="dialog" aria-label="جستجو" aria-modal>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[rgba(26,15,29,0.6)] backdrop-blur-[8px]"
        onClick={close}
        aria-hidden
      />

      {/* Panel */}
      <div className="relative w-full max-w-[720px] bg-surface rounded-b-[8px] shadow-[0_16px_48px_rgba(26,15,29,0.14)] animate-[panel-drop_280ms_cubic-bezier(.2,.7,.2,1)_both] max-h-[90dvh] flex flex-col">
        {/* Input row */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-rule">
          <Icon name="search" size={18} className="text-muted flex-shrink-0" />
          <input
            ref={inputRef}
            className="flex-1 bg-transparent border-none outline-none font-body text-[18px] font-extralight text-ink placeholder:text-muted direction-rtl"
            type="text"
            placeholder="دنبال چه می‌گردید؟"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit(query)}
            aria-label="جستجو در محصولات"
            aria-autocomplete="list"
            aria-controls="search-listbox"
          />
          {query && (
            <button className={iconBtn} onClick={() => setQuery('')} aria-label="پاک کردن">
              <Icon name="close" size={14} />
            </button>
          )}
          <button className={`${iconBtn} me-1`} onClick={close} aria-label="بستن جستجو">
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Results */}
        <div className="overflow-y-auto max-h-[72vh]" id="search-listbox" role="listbox">
          {showRecents ? (
            recentSearches.length > 0 ? (
              <>
                <div className="flex items-center justify-between px-6 py-3.5 pt-[14px] label-mono">
                  <span>جستجوهای اخیر</span>
                  <button
                    className="font-body text-[12px] text-muted tracking-normal normal-case border-b border-transparent transition-colors duration-200 hover:text-plum hover:border-plum"
                    onClick={clearRecent}
                  >
                    پاک کردن همه
                  </button>
                </div>
                {recentSearches.map((r) => (
                  <div
                    key={r}
                    className={`flex items-center gap-2 px-6 border-b border-rule h-[52px] transition-colors duration-150 ${rowHover} last:border-b-0`}
                    role="option"
                    aria-selected="false"
                  >
                    <button
                      className="flex-1 flex items-center gap-2.5 text-[14px] text-ink-2 text-end"
                      onClick={() => { setQuery(r); handleSubmit(r) }}
                    >
                      <Icon name="clock" size={14} className="text-muted opacity-70 flex-shrink-0" />
                      <span>{r}</span>
                    </button>
                    <button
                      className="w-6 h-6 flex items-center justify-center text-muted opacity-0 hover:opacity-100 hover:text-ink transition-all duration-200 flex-shrink-0 group-hover:opacity-100"
                      onClick={() => removeRecent(r)}
                      aria-label="حذف از جستجوهای اخیر"
                    >
                      <Icon name="close" size={12} />
                    </button>
                  </div>
                ))}
              </>
            ) : null
          ) : hasResults ? (
            <>
              {results.products.length > 0 && (
                <>
                  <div className="px-6 py-3.5 label-mono">محصولات</div>
                  {results.products.map((p) => (
                    <button
                      key={p.id}
                      className={`flex items-center gap-3.5 w-full px-6 py-2 h-[58px] text-end border-b border-rule transition-colors duration-150 ${rowHover} last:border-b-0`}
                      role="option"
                      aria-selected="false"
                      onClick={() => { commit(query); close(); navigate(`/product/${p.id}`) }}
                    >
                      <div className="w-10 h-10 bg-bg-2 rounded-[4px] flex items-center justify-center flex-shrink-0 overflow-hidden text-ink [&>svg]:w-[80%] [&>svg]:h-auto">
                        <Illustration name={p.illus} />
                      </div>
                      <span className="flex-1 text-[14px] text-ink overflow-hidden text-ellipsis whitespace-nowrap">
                        {highlight(p.fa)}
                      </span>
                      <span className="font-mono text-[12px] text-ink-2 whitespace-nowrap flex-shrink-0">
                        {formatToman(p.price)}
                      </span>
                    </button>
                  ))}
                </>
              )}

              {results.categories.length > 0 && (
                <>
                  <div className="px-6 py-3.5 label-mono">دسته‌بندی‌ها</div>
                  {results.categories.map((c) => (
                    <button
                      key={c.id}
                      className={`flex items-center gap-3 w-full px-6 h-[48px] text-end text-[13px] text-ink-2 border-b border-rule transition-colors duration-150 ${rowHover} hover:text-ink last:border-b-0`}
                      role="option"
                      aria-selected="false"
                      onClick={() => { commit(query); close(); navigate(`/category/${c.id}`) }}
                    >
                      <Icon name="folder" size={16} className="text-muted flex-shrink-0" />
                      <span className="flex-1">{highlight(c.fa)}</span>
                      <Icon name="chevron-left" size={12} className="text-muted flex-shrink-0" />
                    </button>
                  ))}
                </>
              )}

              <button
                className={`flex items-center justify-between w-full px-6 py-4 text-[13px] text-plum border-t border-rule transition-colors duration-200 font-body ${rowHover}`}
                onClick={() => handleSubmit(query)}
              >
                <span>مشاهده همه نتایج برای «{query}»</span>
                <Icon name="arrow-left" size={14} />
              </button>
            </>
          ) : (
            <div className="py-12 px-6 text-center flex flex-col items-center gap-3">
              <div className="w-[100px] h-[100px] text-muted opacity-50 [&>svg]:w-full [&>svg]:h-auto">
                <Illustration name="SearchEmpty" />
              </div>
              <p className="text-[15px] text-ink-2 m-0">نتیجه‌ای برای «{query}» یافت نشد</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SearchOverlay
