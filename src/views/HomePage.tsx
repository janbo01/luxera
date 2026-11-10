import { type FC } from 'react'
import { usePageMeta } from '../hooks/usePageMeta'
import Hero from '../components/home/Hero'
import CategoriesSection from '../components/home/CategoriesSection'
import ProductCarousel from '../components/home/ProductCarousel'
import TrustStrip from '../components/home/TrustStrip'
import CollectionSpotlight from '../components/home/CollectionSpotlight'
import CategoryTabs from '../components/home/CategoryTabs'
import GiftBanner from '../components/home/GiftBanner'
import RecentlyViewed from '../components/product/RecentlyViewed'

const HOME_JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      name: 'لوکسرا',
      url: 'https://luxera.ir',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://luxera.ir/search?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Organization',
      name: 'لوکسرا',
      url: 'https://luxera.ir',
      description: 'فروشگاه تخصصی جواهرات فانتزی ایران',
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+989128494308',
        contactType: 'customer service',
        availableLanguage: 'Persian',
      },
    },
  ],
}

const HomePage: FC = () => {
  usePageMeta({ title: 'فروشگاه جواهرات فانتزی دست‌ساز', jsonLd: HOME_JSON_LD })
  return (
    <>
      <Hero />
      <TrustStrip />
      <CategoriesSection />
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
      <CollectionSpotlight />
      <CategoryTabs />
      <GiftBanner />
      <RecentlyViewed min={3} />
    </>
  )
}

export default HomePage
