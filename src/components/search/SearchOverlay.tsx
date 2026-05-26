import { useEffect, useRef, type FC } from 'react'
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
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 50)
  }, [isOpen])

  // Close on Escape
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

  const highlight = (text: string) => {
    if (!query.trim()) return text
    const re = new RegExp(`(${query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(re)
    return parts.map((part, i) =>
      re.test(part) ? <mark key={i} className="search-highlight">{part}</mark> : part
    )
  }

  const showRecents = query.trim().length < 2
  const hasResults = results.products.length > 0 || results.categories.length > 0

  if (!isOpen) return null

  return (
    <div className="search-overlay" role="dialog" aria-label="جستجو" aria-modal>
      <div className="search-overlay__backdrop" onClick={close} aria-hidden />

      <div className="search-overlay__panel">
        {/* Input row */}
        <div className="search-overlay__input-row">
          <Icon name="search" size={18} className="search-overlay__icon" />
          <input
            ref={inputRef}
            className="search-overlay__input"
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
            <button
              className="search-overlay__clear"
              onClick={() => setQuery('')}
              aria-label="پاک کردن"
            >
              <Icon name="close" size={14} />
            </button>
          )}
          <button className="search-overlay__close" onClick={close} aria-label="بستن جستجو">
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Results / Recents */}
        <div className="search-overlay__results" id="search-listbox" role="listbox">
          {showRecents ? (
            recentSearches.length > 0 ? (
              <>
                <div className="search-overlay__section-head">
                  <span>جستجوهای اخیر</span>
                  <button className="search-overlay__clear-all" onClick={clearRecent}>
                    پاک کردن همه
                  </button>
                </div>
                {recentSearches.map((r) => (
                  <div key={r} className="search-overlay__recent-row" role="option" aria-selected="false">
                    <button
                      className="search-overlay__recent-btn"
                      onClick={() => { setQuery(r); handleSubmit(r) }}
                    >
                      <Icon name="clock" size={14} className="search-overlay__recent-icon" />
                      <span>{r}</span>
                    </button>
                    <button
                      className="search-overlay__remove-recent"
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
                  <div className="search-overlay__section-label">محصولات</div>
                  {results.products.map((p) => (
                    <button
                      key={p.id}
                      className="search-overlay__product-row"
                      role="option"
                      aria-selected="false"
                      onClick={() => { commit(query); close(); navigate(`/product/${p.id}`) }}
                    >
                      <div className="search-overlay__thumb">
                        <Illustration name={p.illus} />
                      </div>
                      <span className="search-overlay__product-name">
                        {highlight(p.fa)}
                      </span>
                      <span className="search-overlay__product-price">
                        {formatToman(p.price)}
                      </span>
                    </button>
                  ))}
                </>
              )}

              {results.categories.length > 0 && (
                <>
                  <div className="search-overlay__section-label">دسته‌بندی‌ها</div>
                  {results.categories.map((c) => (
                    <button
                      key={c.id}
                      className="search-overlay__cat-row"
                      role="option"
                      aria-selected="false"
                      onClick={() => { commit(query); close(); navigate(`/category/${c.id}`) }}
                    >
                      <Icon name="folder" size={16} className="search-overlay__cat-icon" />
                      <span>{highlight(c.fa)}</span>
                      <Icon name="chevron-left" size={12} className="search-overlay__cat-arrow" />
                    </button>
                  ))}
                </>
              )}

              <button
                className="search-overlay__view-all"
                onClick={() => handleSubmit(query)}
              >
                <span>مشاهده همه نتایج برای «{query}»</span>
                <Icon name="arrow-left" size={14} />
              </button>
            </>
          ) : (
            <div className="search-overlay__no-results">
              <div className="search-overlay__no-results-illus">
                <Illustration name="SearchEmpty" />
              </div>
              <p>نتیجه‌ای برای «{query}» یافت نشد</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SearchOverlay
