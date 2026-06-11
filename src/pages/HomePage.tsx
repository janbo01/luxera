import { lazy, Suspense, type FC } from 'react'
import { usePageMeta } from '../hooks/usePageMeta'
import Hero from '../components/home/Hero'
import CategoriesSection from '../components/home/CategoriesSection'
import ProductsSection from '../components/home/ProductsSection'
import ProductCarousel from '../components/home/ProductCarousel'

const Feature = lazy(() => import('../components/home/Feature'))
const Story = lazy(() => import('../components/home/Story'))
const BlogCarousel = lazy(() => import('../components/home/BlogCarousel'))

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
      <CategoriesSection />
      <ProductsSection />
      <ProductCarousel
        sectionId="necklaces"
        kicker="NECKLACES · گردنبند"
        title={
          <>
            کلکسیون <em>گردنبند</em>
          </>
        }
        link="/category/necklaces"
        catSlug="necklaces"
      />
      <ProductCarousel
        sectionId="rings"
        kicker="RINGS · انگشتر"
        title={
          <>
            کلکسیون <em>انگشتر</em>
          </>
        }
        link="/category/rings"
        catSlug="rings"
      />
      <ProductCarousel
        sectionId="earrings"
        kicker="EARRINGS · گوشواره"
        title={
          <>
            کلکسیون <em>گوشواره</em>
          </>
        }
        link="/category/earrings"
        catSlug="earrings"
      />
      <ProductCarousel
        sectionId="bracelets"
        kicker="BRACELETS · دستبند"
        title={
          <>
            کلکسیون <em>دستبند</em>
          </>
        }
        link="/category/bracelets"
        catSlug="bracelets"
      />
      <Suspense>
        <Feature />
      </Suspense>
      <Suspense>
        <Story />
      </Suspense>
      <Suspense>
        <BlogCarousel />
      </Suspense>
    </>
  )
}

export default HomePage
