import { useEffect, useState, useMemo, memo, type FC } from 'react'

import { getBlogPosts, type ApiBlogPost } from '../../api/blog'
import SectionHeader from '../shared/SectionHeader'
import CarouselArrows from '../shared/CarouselArrows'
import { useCarousel } from '../../hooks'
import { useHydrated } from '../../hooks/useHydrated'
import { BTN_GHOST_CLS } from '../ui/Button'
import Icon from '../icons/Icon'
import { readHomeInitial } from './homeInitial'

const VISIBLE = 3

const BlogCard = memo(function BlogCard({ post }: { post: ApiBlogPost }) {
  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <a
      href={`/blog/${post.slug}`}
      className="group flex-shrink-0 w-[clamp(260px,30vw,360px)] flex flex-col border border-rule hover:border-plum rounded-[var(--radius)] overflow-hidden card-lift animate-rise bg-surface"
    >
      <div className="aspect-[3/2] overflow-hidden bg-plate flex-shrink-0">
        {post.featured_image_url ? (
          <img
            src={post.featured_image_url}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full blog-placeholder-art" />
        )}
      </div>
      <div className="p-5 flex flex-col gap-2 flex-1">
        {date && (
          <span className="font-mono text-[10px] tracking-[0.15em] text-muted uppercase">
            {date}
          </span>
        )}
        <h3 className="font-heading font-bold text-[clamp(14px,1.6vw,17px)] leading-[1.35] text-ink group-hover:text-plum transition-colors duration-200 flex-1 line-clamp-2">
          {post.title}
        </h3>
        {post.excerpt ? (
          <p className="text-[12px] leading-[1.8] text-ink-2 line-clamp-2">{post.excerpt}</p>
        ) : null}
        <span className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-plum font-medium">
          ادامه مطلب
          <span
            aria-hidden="true"
            className="transition-transform duration-300 group-hover:-translate-x-1"
          >
            ←
          </span>
        </span>
      </div>
    </a>
  )
})

const SkeletonCard = () => (
  <div className="animate-pulse flex-shrink-0 w-[clamp(260px,30vw,360px)] border border-rule rounded-[var(--radius)] overflow-hidden bg-surface">
    <div className="aspect-[3/2] bg-plate" />
    <div className="p-5 flex flex-col gap-3">
      <div className="h-2.5 bg-plate w-20 rounded" />
      <div className="h-4 bg-plate w-5/6 rounded" />
      <div className="h-3 bg-plate w-full rounded" />
      <div className="h-3 bg-plate w-4/5 rounded" />
    </div>
  </div>
)

const SKELETONS = Array.from({ length: VISIBLE }, (_, i) => <SkeletonCard key={i} />)

const BlogCarousel: FC = () => {
  const hydrated = useHydrated()
  // Client-fetched fallback, used only when SSR didn't inject blog posts.
  const [fetchedPosts, setFetchedPosts] = useState<ApiBlogPost[] | null>(null)
  const [fetching, setFetching] = useState(true)

  // Gated on `hydrated` so the first client render matches SSR (no window there),
  // avoiding a hydration mismatch (React #418).
  const injected = hydrated ? readHomeInitial()?.blog : undefined

  const posts = useMemo<ApiBlogPost[]>(() => {
    if (fetchedPosts) return fetchedPosts
    if (injected?.posts?.length) return injected.posts as ApiBlogPost[]
    return []
  }, [fetchedPosts, injected])

  const loading = !hydrated || (!injected?.posts?.length && fetching)
  const { trackRef, canPrev, canNext, scroll } = useCarousel(posts.length)

  useEffect(() => {
    if (readHomeInitial()?.blog?.posts?.length) return
    getBlogPosts(1, 8)
      .then((res) => setFetchedPosts(res.posts))
      .catch(() => {})
      .finally(() => setFetching(false))
  }, [])

  const showSkeletons = loading
  const showEmpty = !loading && posts.length === 0

  return (
    <section className="page-section" id="blog">
      <SectionHeader
        kicker="BLOG · مقالات"
        title={
          <>
            آخرین <em>مقالات</em>
          </>
        }
        aside={
          <div className="flex items-center gap-3 self-start sm:self-end">
            <CarouselArrows
              canPrev={canPrev}
              canNext={canNext}
              onScroll={scroll}
              prevLabel="مقاله قبلی"
              nextLabel="مقاله بعدی"
            />
            <a href="/blog" className={BTN_GHOST_CLS}>
              همه مقالات
              <span className="arr">
                <Icon name="arrow-left" size={16} />
              </span>
            </a>
          </div>
        }
      />

      {showEmpty ? (
        <p className="text-muted text-sm text-center py-12">هنوز مقاله‌ای منتشر نشده است.</p>
      ) : (
        <div
          ref={trackRef}
          className="flex gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-2 [direction:rtl]"
        >
          {showSkeletons
            ? SKELETONS
            : posts.map((post) => (
                <div key={post.id} className="snap-start">
                  <BlogCard post={post} />
                </div>
              ))}
        </div>
      )}
    </section>
  )
}

export default memo(BlogCarousel)
