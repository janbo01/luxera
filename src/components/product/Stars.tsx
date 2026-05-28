import { memo, type FC, type CSSProperties } from 'react'
import { Star } from 'lucide-react'

const WRAP_STYLE: CSSProperties = { display: 'inline-flex', gap: 1 }

interface StarsProps {
  value?: number
  size?: number
}

const Stars: FC<StarsProps> = ({ value = 5, size = 14 }) => {
  const full = Math.floor(value)
  const half = value - full >= 0.4 && value - full < 0.85

  return (
    <span className="stars" role="img" aria-label={`${value} از ۵`} style={WRAP_STYLE}>
      {Array.from({ length: 5 }).map((_, i) => {
        const isFull = i < full
        const isHalf = !isFull && i === full && half
        return (
          <span
            key={i}
            style={{ position: 'relative', display: 'inline-flex', width: size, height: size }}
          >
            <Star size={size} strokeWidth={1.2} fill="none" />
            {(isFull || isHalf) && (
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  overflow: 'hidden',
                  width: isFull ? '100%' : '50%',
                  display: 'inline-flex',
                }}
              >
                <Star size={size} strokeWidth={0} fill="currentColor" />
              </span>
            )}
          </span>
        )
      })}
    </span>
  )
}

export default memo(Stars)
