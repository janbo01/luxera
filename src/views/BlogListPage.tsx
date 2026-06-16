import { useState, useEffect, useTransition, useRef, memo, type FC } from 'react'
import { usePageMeta } from '../hooks/usePageMeta'
import type { ServerInitialData } from '../context/initialData'
import { getBlogPosts, type ApiBlogPost, type ApiBlogPostList } from '../api/blog'

declare global {
  interface Window {
    __BLOG_LIST_INITIAL__?: ApiBlogPostList
  }
}

function getInitialList(serverList: ApiBlogPostList | undefined): ApiBlogPostList | null {
  if (serverList) return serverList
  if (typeof window !== 'undefined' && window.__BLOG_LIST_INITIAL__) {
    return window.__BLOG_LIST_INITIAL__
  }
  return null
}

const PAGE_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: 'بلاگ لوکسرا',
  url: 'https://luxera.ir/blog',
  description: 'مقالات و راهنماهای لوکسرا درباره جواهرات فانتزی، مراقبت از زیورآلات و ترندهای مد',
}

/* ─── Featured hero card (first post on each page) ─────────── */
const FeaturedPostCard = memo(function FeaturedPostCard({ post }: { post: ApiBlogPost }) {
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
      className="group flex flex-col-reverse md:grid md:grid-cols-2 border border-rule hover:border-plum overflow-hidden card-lift animate-rise mb-14 max-[640px]:mb-10"
    >
      {/* Text side — first in DOM = right side in RTL grid */}
      <div className="p-8 sm:p-10 flex flex-col justify-between gap-8 bg-surface">
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-2.5 py-[3px] bg-plum text-bg font-body text-[10px] tracking-[.14em] uppercase leading-none">
              ویژه
            </span>
            {date && <span className="label-mono">{date}</span>}
          </div>
          <h2 className="font-heading font-bold text-[clamp(20px,3vw,36px)] leading-[1.22] text-ink group-hover:text-plum transition-colors duration-300 max-w-[24ch]">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="text-[14px] leading-[1.9] text-ink-2 line-clamp-3">{post.excerpt}</p>
          )}
        </div>
        <span className="inline-flex items-center gap-2.5 text-[12px] text-plum font-medium self-start">
          ادامه مطلب
          <span
            aria-hidden="true"
            className="transition-transform duration-300 group-hover:-translate-x-1.5"
          >
            ←
          </span>
          <span className="block h-px bg-plum/40 transition-all duration-400 w-5 group-hover:w-10" />
        </span>
      </div>

      {/* Image side — second in DOM = left side in RTL grid, top in mobile (flex-col-reverse) */}
      <div className="aspect-[4/3] overflow-hidden bg-plate flex-shrink-0">
        {post.featured_image_url ? (
          <img
            src={post.featured_image_url}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="w-full h-full blog-placeholder-art" />
        )}
      </div>
    </a>
  )
})

/* ─── Standard grid card ────────────────────────────────────── */
const PostCard = memo(function PostCard({ post, index }: { post: ApiBlogPost; index: number }) {
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
      className="group flex flex-col border border-rule hover:border-plum overflow-hidden card-lift animate-rise"
      style={{ animationDelay: `${index * 65}ms` }}
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

      <div className="p-5 sm:p-6 flex flex-col gap-2.5 flex-1 bg-surface">
        {date && <span className="label-mono">{date}</span>}
        <h3 className="font-heading font-bold text-[clamp(15px,1.8vw,18px)] leading-[1.35] text-ink group-hover:text-plum transition-colors duration-200 flex-1">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-[13px] leading-[1.8] text-ink-2 line-clamp-2">{post.excerpt}</p>
        )}
        <span className="mt-3 inline-flex items-center gap-2 text-[12px] text-plum font-medium">
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

/* ─── Page ──────────────────────────────────────────────────── */
interface BlogListPageProps {
  initialData?: ServerInitialData
}

const BlogListPage: FC<BlogListPageProps> = ({ initialData }) => {
  const { blogList: serverList } = initialData ?? {}
  const [data, setData] = useState<ApiBlogPostList | null>(() => getInitialList(serverList))
  const [error, setError] = useState(false)
  const [page, setPage] = useState(1)
  const [isPending, startTransition] = useTransition()

  const hadInitialData = useRef(!!getInitialList(serverList))

  usePageMeta({
    title: 'بلاگ جواهرات فانتزی و راهنمای مد',
    description: 'مقالات و راهنماهای لوکسرا درباره جواهرات فانتزی، مراقبت از زیورآلات و ترندهای مد',
    canonical: '/blog',
    jsonLd: PAGE_JSON_LD,
  })

  useEffect(() => {
    if (hadInitialData.current) return
    startTransition(async () => {
      try {
        const list = await getBlogPosts(1)
        setData(list)
      } catch {
        setError(true)
      }
    })
  }, [])

  function goToPage(next: number) {
    setError(false)
    startTransition(async () => {
      try {
        const list = await getBlogPosts(next)
        setData(list)
        setPage(next)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } catch {
        setError(true)
      }
    })
  }

  const totalPages = data ? Math.ceil(data.total / data.page_size) : 1
  const isInitialLoading = isPending && !data

  return (
    <div className="max-w-[1480px] mx-auto px-[clamp(20px,4vw,56px)] pb-[100px]">
      {/* ── Page header ── */}
      <div className="pt-[72px] pb-14 mb-14 relative max-[640px]:pt-12 max-[640px]:pb-10 max-[640px]:mb-10">
        <span className="label-mono mb-4 block">BLOG</span>
        <h1 className="font-heading font-bold text-[clamp(40px,5vw,72px)] leading-[1.05] mt-3 mb-5 text-ink">
          مقالات
          <em className="font-heading not-italic text-plum font-normal"> لوکسرا</em>
        </h1>
        <p className="max-w-[52ch] text-ink-2 text-[15px] leading-[1.85]">
          راهنماها، نکات مراقبتی و ترندهای جواهرات فانتزی
        </p>
        {/* Decorative rule with plum accent */}
        <div className="absolute bottom-0 inset-x-0 h-px bg-rule" />
        <div className="absolute bottom-[-2px] right-0 w-20 h-[3px] bg-plum" />
      </div>

      {/* ── Loading skeleton ── */}
      {isInitialLoading ? (
        <>
          {/* Featured skeleton */}
          <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 border border-rule overflow-hidden mb-14">
            <div className="p-10 flex flex-col gap-5 bg-surface">
              <div className="flex gap-3 items-center">
                <div className="h-5 w-14 bg-plate" />
                <div className="h-3 w-24 bg-plate rounded" />
              </div>
              <div className="h-8 bg-plate w-4/5 rounded" />
              <div className="h-4 bg-plate w-full rounded" />
              <div className="h-4 bg-plate w-5/6 rounded" />
            </div>
            <div className="aspect-[4/3] bg-plate" />
          </div>
          {/* Grid skeletons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse border border-rule overflow-hidden">
                <div className="aspect-[3/2] bg-plate" />
                <div className="p-5 flex flex-col gap-3 bg-surface">
                  <div className="h-3 bg-plate w-20 rounded" />
                  <div className="h-5 bg-plate w-5/6 rounded" />
                  <div className="h-3 bg-plate w-full rounded" />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : error ? (
        <div className="py-24 text-center">
          <p className="text-muted">خطا در بارگذاری مقاله‌ها.</p>
          <button
            onClick={() => goToPage(page)}
            className="mt-6 text-sm text-plum border-b border-plum/30 hover:border-plum transition-colors pb-0.5"
          >
            تلاش مجدد
          </button>
        </div>
      ) : data?.posts.length === 0 ? (
        <p className="text-center text-muted py-24">هنوز مقاله‌ای منتشر نشده است.</p>
      ) : data ? (
        <div
          className={
            isPending ? 'opacity-50 pointer-events-none transition-opacity duration-200' : undefined
          }
        >
          {/* Featured card */}
          <FeaturedPostCard post={data.posts[0]} />

          {/* Remaining posts grid */}
          {data.posts.length > 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
              {data.posts.slice(1).map((post, i) => (
                <PostCard key={post.id} post={post} index={i} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-16 flex items-center justify-center gap-1.5">
              <button
                onClick={() => goToPage(Math.max(1, page - 1))}
                disabled={page === 1 || isPending}
                className="w-10 h-10 flex items-center justify-center border border-rule text-ink-2 hover:border-plum hover:text-plum transition-colors disabled:opacity-25 disabled:cursor-not-allowed text-lg leading-none"
                aria-label="صفحه قبلی"
              >
                ›
              </button>

              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => goToPage(n)}
                  disabled={n === page || isPending}
                  className={`w-10 h-10 flex items-center justify-center border text-sm transition-colors disabled:cursor-default ${
                    n === page
                      ? 'border-plum bg-plum text-bg font-medium'
                      : 'border-rule text-ink-2 hover:border-plum hover:text-plum'
                  }`}
                >
                  {n}
                </button>
              ))}

              {totalPages > 7 && page < totalPages - 3 && (
                <span className="w-10 h-10 flex items-center justify-center text-muted text-sm">
                  …
                </span>
              )}

              <button
                onClick={() => goToPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages || isPending}
                className="w-10 h-10 flex items-center justify-center border border-rule text-ink-2 hover:border-plum hover:text-plum transition-colors disabled:opacity-25 disabled:cursor-not-allowed text-lg leading-none"
                aria-label="صفحه بعدی"
              >
                ‹
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

export default BlogListPage
