import { useEffect, useRef, useState, useCallback, memo, type FC } from 'react'
import { Link } from 'react-router-dom'
import { getBlogPosts, type ApiBlogPost } from '../../api/blog'
import SectionHeader from '../shared/SectionHeader'
import { BTN_GHOST_CLS } from '../ui/Button'
import Icon from '../icons/Icon'

const VISIBLE = 3

const BlogCard = memo(function BlogCard({ post }: { post: ApiBlogPost }) {
  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group flex-shrink-0 w-[clamp(260px,30vw,360px)] flex flex-col border border-rule hover:border-plum overflow-hidden card-lift animate-rise bg-surface"
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
          <span className="font-mono text-[10px] tracking-[0.15em] text-muted uppercase">{date}</span>
        )}
        <h3 className="font-heading font-bold text-[clamp(14px,1.6vw,17px)] leading-[1.35] text-ink group-hover:text-plum transition-colors duration-200 flex-1 line-clamp-2">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-[12px] leading-[1.8] text-ink-2 line-clamp-2">{post.excerpt}</p>
        )}
        <span className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-plum font-medium">
          ادامه مطلب
          <span aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-x-1">←</span>
        </span>
      </div>
    </Link>
  )
})

const SkeletonCard = () => (
  <div className="animate-pulse flex-shrink-0 w-[clamp(260px,30vw,360px)] border border-rule overflow-hidden bg-surface">
    <div className="aspect-[3/2] bg-plate" />
    <div className="p-5 flex flex-col gap-3">
      <div className="h-2.5 bg-plate w-20 rounded" />
      <div className="h-4 bg-plate w-5/6 rounded" />
      <div className="h-3 bg-plate w-full rounded" />
      <div className="h-3 bg-plate w-4/5 rounded" />
    </div>
  </div>
)

const BlogCarousel: FC = () => {
  const [posts, setPosts] = useState<ApiBlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getBlogPosts(1, 8)
      .then((res) => setPosts(res.posts))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const syncArrows = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setCanPrev(el.scrollLeft < -2)
    setCanNext(el.scrollLeft > -(el.scrollWidth - el.clientWidth - 2))
  }, [])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    syncArrows()
    el.addEventListener('scroll', syncArrows, { passive: true })
    const ro = new ResizeObserver(syncArrows)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', syncArrows)
      ro.disconnect()
    }
  }, [posts, syncArrows])

  const scroll = (dir: 'prev' | 'next') => {
    const el = trackRef.current
    if (!el) return
    const cardW = el.querySelector('a')?.offsetWidth ?? 340
    const gap = 24
    const step = (cardW + gap) * Math.max(1, Math.floor(el.clientWidth / (cardW + gap)))
    el.scrollBy({ left: dir === 'prev' ? step : -step, behavior: 'smooth' })
  }

  const showSkeletons = loading
  const showEmpty = !loading && posts.length === 0

  return (
    <section className="page-section" id="blog">
      <SectionHeader
        kicker="BLOG · مقالات"
        title={<>آخرین <em>مقالات</em></>}
        aside={
          <div className="flex items-center gap-3 self-end">
            <button
              onClick={() => scroll('prev')}
              disabled={!canPrev}
              aria-label="مقاله قبلی"
              className="w-10 h-10 flex items-center justify-center border border-rule text-ink-2 hover:border-plum hover:text-plum transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
            >
              <Icon name="chevron-right" size={16} />
            </button>
            <button
              onClick={() => scroll('next')}
              disabled={!canNext}
              aria-label="مقاله بعدی"
              className="w-10 h-10 flex items-center justify-center border border-rule text-ink-2 hover:border-plum hover:text-plum transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
            >
              <Icon name="chevron-left" size={16} />
            </button>
            <Link to="/blog" className={`${BTN_GHOST_CLS}`}>
              همه مقالات
              <span className="arr"><Icon name="arrow-left" size={16} /></span>
            </Link>
          </div>
        }
      />

      {showEmpty ? (
        <p className="text-muted text-sm text-center py-12">هنوز مقاله‌ای منتشر نشده است.</p>
      ) : (
        <div
          ref={trackRef}
          className="flex gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-2 [direction:rtl]"
          style={{ scrollbarWidth: 'none' }}
        >
          {showSkeletons
            ? Array.from({ length: VISIBLE }).map((_, i) => <SkeletonCard key={i} />)
            : posts.map((post) => (
                <div key={post.id} className="snap-start [direction:ltr]">
                  <BlogCard post={post} />
                </div>
              ))
          }
        </div>
      )}
    </section>
  )
}

export default memo(BlogCarousel)
