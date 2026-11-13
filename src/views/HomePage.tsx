import { type FC } from 'react'
import type { ApiBanner } from '../api/store'
import { usePageMeta } from '../hooks/usePageMeta'
import Hero from '../components/home/Hero'
import CategoriesSection from '../components/home/CategoriesSection'
import ProductCarousel from '../components/home/ProductCarousel'
import TrustStrip from '../components/home/TrustStrip'
import CollectionSpotlight from '../components/home/CollectionSpotlight'
import CategoryTabs from '../components/home/CategoryTabs'
import GiftBanner from '../components/home/GiftBanner'
import RecentlyViewed from '../components/product/RecentlyViewed'

// Structured data for the home page is rendered once, on the server, in pages/index.astro.
const HomePage: FC<{ banners?: ApiBanner[] }> = ({ banners }) => {
  usePageMeta({ title: 'فروشگاه جواهرات فانتزی دست‌ساز' })
  return (
    <>
      <Hero banners={banners} />
      <TrustStrip />
      {/* Products first: the newest pieces sit right under the hero, then the categories. */}
      <ProductCarousel
        sectionId="new"
        band
        kicker="تازه‌های لوکسرا"
        title={
          <>
            جدیدترین <em>محصولات</em>
          </>
        }
        link="/category/new"
      />
      <CategoriesSection />
      {/* Returning visitors pick up where they left off, right after what's new. */}
      <RecentlyViewed min={3} />
      <CollectionSpotlight />
      <CategoryTabs />
      <GiftBanner />
    </>
  )
}

export default HomePage
