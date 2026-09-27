import { memo, type FC } from 'react'
import Icon from '../icons/Icon'

interface CarouselArrowsProps {
  canPrev: boolean
  canNext: boolean
  onScroll: (dir: 'prev' | 'next') => void
  prevLabel: string
  nextLabel: string
}

const ARROW_CLS =
  'w-11 h-11 rounded-full flex items-center justify-center border border-rule bg-surface text-ink-2 transition-colors duration-200 hover:border-ink hover:bg-ink hover:text-bg disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-surface disabled:hover:text-ink-2 disabled:hover:border-rule'

const CarouselArrows: FC<CarouselArrowsProps> = ({
  canPrev,
  canNext,
  onScroll,
  prevLabel,
  nextLabel,
}) => (
  <div className="hidden md:flex items-center gap-2">
    <button
      onClick={() => onScroll('prev')}
      disabled={!canPrev}
      aria-label={prevLabel}
      className={ARROW_CLS}
    >
      <Icon name="chevron-right" size={16} />
    </button>
    <button
      onClick={() => onScroll('next')}
      disabled={!canNext}
      aria-label={nextLabel}
      className={ARROW_CLS}
    >
      <Icon name="chevron-left" size={16} />
    </button>
  </div>
)

export default memo(CarouselArrows)
