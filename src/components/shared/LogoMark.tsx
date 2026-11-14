import { memo, type FC } from 'react'

/* The Luxera mark: the Persian ل drawn as one bent wire with a single stone at its tip,
   so it reads as both the initial of لوکسرا and an earring hook. Same path as
   public/icon-mono.svg; the viewBox is cropped to the mark so it sizes by its own height.
   Fills with currentColor, so the colour comes from the active theme's tokens. */
const LogoMark: FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="4.5 4.5 20 23"
    width="20"
    height="23"
    className={className}
    aria-hidden="true"
    focusable="false"
  >
    <path
      fill="currentColor"
      d="M22.5 5C23.33 5 24 5.67 24 6.5V19C24 24.3 20.3 27 14.5 27C8.8 27 5 24.3 5 20V17H8V20C8 22.6 10.4 24 14.5 24C18.7 24 21 22.3 21 19V6.5C21 5.67 21.67 5 22.5 5ZM11 17A3 3 0 1 1 5 17A3 3 0 1 1 11 17Z"
    />
  </svg>
)

export default memo(LogoMark)
