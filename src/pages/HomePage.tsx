import { usePageMeta } from '../hooks/usePageMeta'
import type { FC } from 'react'
import Hero from '../components/home/Hero'
import CategoriesSection from '../components/home/CategoriesSection'
import ProductsSection from '../components/home/ProductsSection'
import Feature from '../components/home/Feature'
import Story from '../components/home/Story'
import Newsletter from '../components/home/Newsletter'

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
  usePageMeta({ jsonLd: HOME_JSON_LD })
  return (
  <>
    <Hero />
    <CategoriesSection />
    <ProductsSection />
    <Feature />
    <Story />
    <Newsletter />
  </>
)
}

export default HomePage
