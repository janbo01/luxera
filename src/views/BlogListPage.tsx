import { useState, useEffect, useTransition, useRef, memo, type FC } from 'react'
import { usePageMeta } from '../hooks/usePageMeta'
import type { ServerInitialData } from '../context/initialData'
import { getBlogPosts, type ApiBlogPost, type ApiBlogPostList } from '../api/blog'
import PageIntro from '../components/shared/PageIntro'
import { imgSet } from '../utils/cdnImage'

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
      className="group flex flex-col-reverse md:grid md:grid-cols-[1fr_1.15fr] rounded-[var(--radius-lg)] ring-1 ring-inset ring-rule bg-surface overflow-hidden transition-shadow duration-300 hover:shadow-[var(--shadow-lift)] animate-rise mb-12 max-[640px]:mb-10"
    >
      {/* Text side — first in DOM = right side in RTL grid */}
      <div className="p-6 sm:p-10 lg:p-14 flex flex-col justify-center gap-8">
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-plum/10 text-plum text-[11.5px] font-medium leading-none">
              مقاله‌ی ویژه
            </span>
            {date && <span className="label-fa">{date}</span>}
          </div>
          <h2 className="font-heading font-bold text-[clamp(22px,3vw,40px)] leading-[1.25] m-0 text-ink group-hover:text-plum transition-colors duration-300 max-w-[22ch]">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="text-[14px] leading-[1.9] text-ink-2 line-clamp-3">{post.excerpt}</p>
          )}
        </div>
        <span className="inline-flex items-center gap-2.5 text-[13px] text-ink font-medium self-start group-hover:text-plum transition-colors">
          ادامه مطلب
          <span
            aria-hidden="true"
            className="transition-transform duration-300 group-hover:-translate-x-1.5"
          >
            ←
          </span>
          <span className="block h-px bg-current opacity-40 transition-all duration-500 w-5 group-hover:w-10" />
        </span>
      </div>

      {/* Image side — second in DOM = left side in RTL grid, top in mobile (flex-col-reverse) */}
      <div className="aspect-[4/3] md:aspect-auto md:min-h-[420px] relative overflow-hidden bg-plate flex-shrink-0">
        {post.featured_image_url ? (
          <img
            {...imgSet(post.featured_image_url, {
              widths: [480, 640, 960],
              ratio: 4 / 3,
              sizes: '(max-width: 768px) 100vw, 50vw',
            })}
            alt={post.title}
            width={960}
            height={720}
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-[var(--ease-lux)] group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 blog-placeholder-art" />
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
      className="group flex flex-col animate-rise"
      style={{ animationDelay: `${index * 65}ms` }}
    >
      <div className="aspect-[3/2] overflow-hidden bg-plate flex-shrink-0 rounded-[var(--radius)] ring-1 ring-inset ring-rule transition-shadow duration-300 group-hover:shadow-[var(--shadow-lift)]">
        {post.featured_image_url ? (
          <img
            {...imgSet(post.featured_image_url, {
              widths: [320, 480, 640],
              ratio: 3 / 2,
              sizes: '(max-width: 720px) 100vw, 33vw',
            })}
            alt={post.title}
            width={640}
            height={427}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-700 ease-[var(--ease-lux)] group-hover:scale-[1.04]"
          />
        ) : (
          <div className="w-full h-full blog-placeholder-art" />
        )}
      </div>

      <div className="pt-4 px-0.5 flex flex-col gap-2 flex-1">
        {date && <span className="label-fa">{date}</span>}
        <h3 className="font-heading font-bold text-[clamp(16px,1.8vw,19px)] leading-[1.45] m-0 text-ink group-hover:text-plum transition-colors duration-200">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-[13px] leading-[1.8] text-ink-2 line-clamp-2">{post.excerpt}</p>
        )}
        <span className="mt-auto pt-2 inline-flex items-center gap-2 text-[12.5px] text-ink-2 font-medium group-hover:text-plum transition-colors">
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
    <div className="max-w-[var(--maxw)] mx-auto px-[var(--pad)] pb-[clamp(56px,7vw,100px)]">
      <div className="pt-2 md:pt-3 mb-8 md:mb-12">
        <PageIntro
          kicker="Journal"
          title={
            <>
              مقالات <em>لوکسرا</em>
            </>
          }
          description="راهنماها، نکات مراقبتی و ترندهای جواهرات فانتزی — برای انتخاب آگاهانه‌تر."
          meta={data ? <span>{data.total.toLocaleString('fa-IR')} مقاله</span> : undefined}
        />
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10 md:gap-y-12">
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
                className="w-11 h-11 rounded-full flex items-center justify-center border border-rule bg-surface text-ink-2 hover:border-ink hover:bg-ink hover:text-bg transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-lg leading-none"
                aria-label="صفحه قبلی"
              >
                ›
              </button>

              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => goToPage(n)}
                  disabled={n === page || isPending}
                  aria-current={n === page ? 'page' : undefined}
                  className={`w-11 h-11 rounded-full flex items-center justify-center border text-sm transition-colors disabled:cursor-default ${
                    n === page
                      ? 'border-ink bg-ink text-bg font-medium'
                      : 'border-rule bg-surface text-ink-2 hover:border-ink'
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
                className="w-11 h-11 rounded-full flex items-center justify-center border border-rule bg-surface text-ink-2 hover:border-ink hover:bg-ink hover:text-bg transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-lg leading-none"
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
