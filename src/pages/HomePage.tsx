import { usePageMeta } from '../hooks/usePageMeta'
import type { FC } from 'react'
import Hero from '../components/home/Hero'
import CategoriesSection from '../components/home/CategoriesSection'
import ProductsSection from '../components/home/ProductsSection'
import Feature from '../components/home/Feature'
import Story from '../components/home/Story'
import Newsletter from '../components/home/Newsletter'

const HomePage: FC = () => {
  usePageMeta({ title: 'خانه' })
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
