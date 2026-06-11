import { memo, type FC } from 'react'
import ProductCarousel from './ProductCarousel'

const ProductsSection: FC = () => (
  <ProductCarousel
    sectionId="new"
    kicker="NEW ARRIVALS · تازه‌ترین‌ها"
    title={
      <>
        جدیدترین <em>محصولات</em>
      </>
    }
    link="/category/new"
  />
)

export default memo(ProductsSection)
