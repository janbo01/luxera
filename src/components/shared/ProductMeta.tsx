import type { FC } from 'react'

interface ProductMetaProps {
  items: string[]
  className: string
}

const ProductMeta: FC<ProductMetaProps> = ({ items, className }) => (
  <div className={className}>
    {items.map((m, i) => <span key={i}>{m}</span>)}
  </div>
)

export default ProductMeta
