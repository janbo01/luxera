import { useState, useEffect, useRef } from 'react'
import Icon from '../icons/Icon'
import { IconTelegram, IconWhatsApp } from '../icons/BrandIcons'

interface ShareRowProps {
  productName: string
}

const SHARE_BTN =
  'w-[48px] h-[48px] rounded-full border border-rule grid place-items-center text-ink-2 transition-all duration-200 hover:bg-ink hover:text-bg hover:border-ink'

export function ShareRow({ productName }: ShareRowProps) {
  const [toastVisible, setToastVisible] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current)
    },
    [],
  )

  const showToast = () => {
    setToastVisible(true)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastVisible(false), 2500)
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      showToast()
    } catch {
      // Clipboard API is unavailable (e.g. an insecure context); don't claim success.
    }
  }

  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title: `${productName} — Luxera`,
        text: `${productName} را در لوکسرا ببینید`,
        url: window.location.href,
      })
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') handleCopyLink()
    }
  }

  const handleTelegram = () => {
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(productName + ' | لوکسرا')}`,
      '_blank',
      'noopener,noreferrer',
    )
  }

  const handleWhatsApp = () => {
    window.open(
      `https://api.whatsapp.com/send/?text=${encodeURIComponent(productName + ' | لوکسرا\n' + window.location.href)}`,
      '_blank',
      'noopener,noreferrer',
    )
  }

  return (
    <>
      <div className="mt-[22px] flex items-center gap-2.5 pt-[18px] border-t border-rule">
        <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted me-auto">
          اشتراک‌گذاری
        </span>
        {typeof navigator !== 'undefined' && !!navigator.share && (
          <button className={SHARE_BTN} onClick={handleNativeShare} aria-label="اشتراک‌گذاری">
            <Icon name="share" size={13} />
          </button>
        )}
        <button className={SHARE_BTN} onClick={handleTelegram} aria-label="تلگرام">
          <IconTelegram size={13} />
        </button>
        <button className={SHARE_BTN} onClick={handleWhatsApp} aria-label="واتساپ">
          <IconWhatsApp size={13} />
        </button>
        <button className={SHARE_BTN} onClick={handleCopyLink} aria-label="کپی لینک">
          <Icon name="link" size={13} />
        </button>
      </div>

      {toastVisible && (
        <div
          className="fixed bottom-7 left-1/2 -translate-x-1/2 bg-ink text-bg font-body text-[13px] px-[22px] py-2.5 z-[300] pointer-events-none animate-[luxera-rise_220ms_cubic-bezier(.2,.7,.2,1)_both] rounded-[4px]"
          role="status"
          aria-live="polite"
        >
          ✓ لینک کپی شد
        </div>
      )}
    </>
  )
}
