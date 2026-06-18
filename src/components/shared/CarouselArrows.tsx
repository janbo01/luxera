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
  'w-10 h-10 rounded-full flex items-center justify-center border border-rule text-ink-2 hover:border-plum hover:text-plum transition-colors disabled:opacity-25 disabled:cursor-not-allowed'

const CarouselArrows: FC<CarouselArrowsProps> = ({
  canPrev,
  canNext,
  onScroll,
  prevLabel,
  nextLabel,
}) => (
  <>
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
  </>
)

export default memo(CarouselArrows)
