import type { FC } from 'react'

const PageLoader: FC = () => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: '60vh',
  }}>
    <span className="spinner" aria-label="در حال بارگذاری" />
  </div>
)

export default PageLoader
