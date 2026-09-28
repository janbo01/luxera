import { useState, useEffect, useTransition, useMemo, useRef, type FC } from 'react'
import { usePageMeta } from '../hooks/usePageMeta'
import type { ServerInitialData } from '../context/initialData'
import { getBlogPostBySlug, getBlogPosts, type ApiBlogPost } from '../api/blog'
import Icon from '../components/icons/Icon'
import { BTN_CLS } from '../components/ui/Button'
import { imgSet } from '../utils/cdnImage'

declare global {
  interface Window {
    __BLOG_POST_INITIAL__?: ApiBlogPost
  }
}

function getInitialPost(
  slug: string | undefined,
  serverPost: ApiBlogPost | undefined,
): ApiBlogPost | null {
  if (!slug) return null
  if (serverPost?.slug === slug) return serverPost
  if (typeof window !== 'undefined' && window.__BLOG_POST_INITIAL__?.slug === slug) {
    return window.__BLOG_POST_INITIAL__
  }
  return null
}

function buildJsonLd(post: ApiBlogPost): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.seo_title || post.title,
    description: post.seo_description || post.excerpt,
    image: post.featured_image_url ?? undefined,
    datePublished: post.published_at ?? post.created_at,
    dateModified: post.updated_at,
    author: { '@type': 'Person', name: 'تیم لوکسرا', url: 'https://luxera.ir/about' },
    publisher: { '@type': 'Organization', name: 'لوکسرا', url: 'https://luxera.ir' },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://luxera.ir/blog/${post.slug}`,
    },
  }
}

interface BlogDetailPageProps {
  slug: string
  initialData?: ServerInitialData
}

const BlogDetailPage: FC<BlogDetailPageProps> = ({ slug, initialData }) => {
  const { blogPost: serverPost } = initialData ?? {}

  const [post, setPost] = useState<ApiBlogPost | null>(() => getInitialPost(slug, serverPost))
  const [notFound, setNotFound] = useState(false)
  const [isPending, startTransition] = useTransition()
  const progressBarRef = useRef<HTMLDivElement>(null)

  const jsonLd = useMemo(() => (post ? buildJsonLd(post) : undefined), [post])
  // ~200 Persian words per minute; strip tags so markup doesn't count.
  const readMinutes = useMemo(() => {
    if (!post?.body) return 0
    const words = post.body
      .replace(/<[^>]+>/g, ' ')
      .split(/\s+/)
      .filter(Boolean).length
    return Math.max(1, Math.round(words / 200))
  }, [post])

  const [morePosts, setMorePosts] = useState<ApiBlogPost[]>([])
  useEffect(() => {
    const currentSlug = post?.slug
    if (!currentSlug) return
    let cancelled = false
    getBlogPosts(1, 4)
      .then((res) => {
        if (!cancelled) setMorePosts(res.posts.filter((p) => p.slug !== currentSlug).slice(0, 3))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [post?.slug])

  const date = useMemo(
    () =>
      post?.published_at
        ? new Date(post.published_at).toLocaleDateString('fa-IR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : null,
    [post],
  )

  usePageMeta({
    title: post ? post.seo_title || post.title : 'در حال بارگذاری...',
    description: post?.seo_description || post?.excerpt,
    keywords: post?.seo_keywords,
    canonical: slug ? `/blog/${slug}` : undefined,
    ogImage: post?.featured_image_url ?? undefined,
    ogType: 'article',
    jsonLd,
  })

  useEffect(() => {
    if (post?.slug === slug || !slug) return
    startTransition(async () => {
      setPost(null)
      setNotFound(false)
      try {
        const data = await getBlogPostBySlug(slug)
        setPost(data)
      } catch {
        setNotFound(true)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]) // post?.slug intentionally excluded — checked as early-exit guard only

  // Reading progress bar — updates DOM directly to avoid re-renders on scroll
  useEffect(() => {
    if (!post) return
    const update = () => {
      const el = document.documentElement
      const h = el.scrollHeight - el.clientHeight
      const p = h > 0 ? (window.scrollY / h) * 100 : 0
      if (progressBarRef.current) progressBarRef.current.style.width = `${p}%`
    }
    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  }, [post])

  const loading = isPending && !post

  if (loading) {
    return (
      <div className="max-w-[780px] mx-auto px-[clamp(20px,4vw,56px)] pb-[100px] pt-16 animate-pulse">
        <div className="h-3 bg-plate w-40 rounded mb-8" />
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px w-8 bg-plate" />
          <div className="h-3 bg-plate w-28 rounded" />
        </div>
        <div className="h-11 bg-plate w-5/6 rounded mb-3" />
        <div className="h-11 bg-plate w-2/3 rounded mb-8" />
        <div className="h-4 bg-plate w-full rounded mb-2" />
        <div className="h-4 bg-plate w-11/12 rounded mb-12" />
        <div className="aspect-[16/9] bg-plate mb-12" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-4 bg-plate rounded mb-3"
            style={{ width: i === 7 ? '55%' : '100%' }}
          />
        ))}
      </div>
    )
  }

  if (notFound || !post) {
    return (
      <div className="max-w-[780px] mx-auto px-[clamp(20px,4vw,56px)] pb-[100px] pt-20 text-center">
        <p
          className="font-display font-bold leading-none mb-6 select-none"
          style={{
            fontSize: 'clamp(80px, 14vw, 140px)',
            color: 'var(--color-plum)',
            opacity: 0.12,
          }}
          aria-hidden="true"
        >
          404
        </p>
        <h1 className="font-heading font-bold text-[clamp(22px,3vw,32px)] text-ink mb-4">
          مقاله یافت نشد
        </h1>
        <p className="text-ink-2 mb-10 text-[15px] leading-[1.8]">
          مقاله‌ای با این آدرس منتشر نشده یا حذف شده است.
        </p>
        <a
          href="/blog"
          className="inline-flex items-center gap-2.5 text-sm text-plum border-b border-plum/25 hover:border-plum transition-colors pb-0.5"
        >
          <span aria-hidden="true">→</span>
          بازگشت به بلاگ
        </a>
      </div>
    )
  }

  return (
    <>
      {/* Reading progress bar — anchored right in RTL, grows leftward */}
      <div
        ref={progressBarRef}
        aria-hidden="true"
        className="fixed top-0 right-0 h-[2px] bg-plum z-50 pointer-events-none"
        style={{ width: '0%', transition: 'width 80ms linear' }}
      />

      <div className="max-w-[780px] mx-auto px-[clamp(20px,4vw,56px)] pb-[100px]">
        {/* Breadcrumb */}
        <nav
          className="py-6 flex items-center gap-2 text-[12px] text-muted"
          aria-label="مسیر ناوبری"
        >
          <a href="/" className="hover:text-ink transition-colors">
            خانه
          </a>
          <span aria-hidden="true" className="opacity-35">
            /
          </span>
          <a href="/blog" className="hover:text-ink transition-colors">
            بلاگ
          </a>
          <span aria-hidden="true" className="opacity-35">
            /
          </span>
          <span className="text-ink-2 line-clamp-1 max-w-[28ch]">{post.title}</span>
        </nav>

        {/* Article header */}
        <header className="mb-10 pb-10 border-b border-rule">
          <div className="flex items-center flex-wrap gap-x-3 gap-y-2 mb-6 text-[12.5px] text-muted">
            <span className="kicker">Journal</span>
            {date !== null && <time className="text-ink-2">{date}</time>}
            {readMinutes > 0 && (
              <>
                <span aria-hidden="true" className="opacity-40">
                  ·
                </span>
                <span>{readMinutes.toLocaleString('fa-IR')} دقیقه مطالعه</span>
              </>
            )}
          </div>
          <h1 className="font-heading font-bold text-[clamp(28px,4.5vw,52px)] leading-[1.18] text-ink mb-5">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="text-[16px] leading-[1.95] text-ink-2 font-light max-w-[58ch]">
              {post.excerpt}
            </p>
          )}
        </header>

        {/* Featured image */}
        {post.featured_image_url && (
          <figure className="mb-12 overflow-hidden rounded-[var(--radius-lg)] ring-1 ring-rule shadow-[var(--shadow-lift)] md:-mx-[min(8vw,120px)]">
            <img
              {...imgSet(post.featured_image_url, {
                widths: [640, 960, 1280],
                sizes: '(max-width: 900px) 100vw, 820px',
              })}
              alt={post.title}
              className="w-full object-cover"
              fetchPriority="high"
              decoding="async"
            />
          </figure>
        )}

        {/* Article body */}
        <article className="prose-blog" dangerouslySetInnerHTML={{ __html: post.body }} />

        {/* Shop the story */}
        <aside className="mt-16 rounded-[var(--radius-lg)] bg-surface ring-1 ring-inset ring-rule p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <span className="kicker mb-2">Shop the story</span>
            <p className="font-heading font-bold text-[20px] leading-snug text-ink m-0">
              استایل این مقاله را از لوکسرا بخرید
            </p>
            <p className="text-[13.5px] text-ink-2 m-0 mt-1.5">
              جدیدترین جواهرات فانتزی با ارسال یک‌روزه در تهران.
            </p>
          </div>
          <a href="/category/new" className={`${BTN_CLS} shrink-0 justify-center`}>
            مشاهده‌ی محصولات
            <span className="arr">
              <Icon name="arrow-left" size={16} />
            </span>
          </a>
        </aside>

        <div className="mt-10">
          <a href="/blog" className="link-draw group">
            <Icon
              name="arrow-right"
              size={15}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
            بازگشت به بلاگ
          </a>
        </div>
      </div>

      {/* More articles */}
      {morePosts.length > 0 && (
        <section className="section-band">
          <div className="page-section">
            <div className="flex items-end justify-between gap-4 mb-8 pb-5 border-b border-rule">
              <div>
                <span className="kicker mb-3">Keep reading</span>
                <h2 className="font-heading font-bold text-[clamp(24px,3vw,36px)] leading-tight m-0 text-ink">
                  مقالات بیشتر
                </h2>
              </div>
              <a href="/blog" className="link-draw group whitespace-nowrap">
                همه مقالات
                <Icon
                  name="arrow-left"
                  size={15}
                  className="transition-transform duration-300 group-hover:-translate-x-1"
                />
              </a>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
              {morePosts.map((p) => (
                <a key={p.id} href={`/blog/${p.slug}`} className="group flex flex-col">
                  <div className="aspect-[3/2] overflow-hidden bg-plate rounded-[var(--radius)] ring-1 ring-inset ring-rule transition-shadow duration-300 group-hover:shadow-[var(--shadow-lift)]">
                    {p.featured_image_url ? (
                      <img
                        {...imgSet(p.featured_image_url, {
                          widths: [320, 480, 640],
                          ratio: 3 / 2,
                          sizes: '(max-width: 720px) 100vw, 33vw',
                        })}
                        alt={p.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-700 ease-[var(--ease-lux)] group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="w-full h-full blog-placeholder-art" />
                    )}
                  </div>
                  <h3 className="font-heading font-bold text-[17px] leading-[1.45] m-0 mt-4 text-ink group-hover:text-plum transition-colors">
                    {p.title}
                  </h3>
                  {p.excerpt && (
                    <p className="text-[13px] leading-[1.8] text-ink-2 line-clamp-2 m-0 mt-2">
                      {p.excerpt}
                    </p>
                  )}
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}

export default BlogDetailPage
