import type { FC } from 'react'

const PageLoader: FC = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <span
      className="inline-block w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-[spin_0.7s_linear_infinite]"
      aria-label="در حال بارگذاری"
    />
  </div>
)

export default PageLoader
