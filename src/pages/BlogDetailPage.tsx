import { useState, useEffect, useTransition, useMemo, type FC } from 'react'
import { useParams, Link } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'
import { useInitialData } from '../context/initialData'
import { getBlogPostBySlug, type ApiBlogPost } from '../api/blog'

declare global {
  interface Window {
    __BLOG_POST_INITIAL__?: ApiBlogPost
  }
}

function getInitialPost(slug: string | undefined, serverPost: ApiBlogPost | undefined): ApiBlogPost | null {
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
    publisher: {
      '@type': 'Organization',
      name: 'لوکسرا',
      url: 'https://luxera.ir',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://luxera.ir/blog/${post.slug}`,
    },
  }
}

const BlogDetailPage: FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const { blogPost: serverPost } = useInitialData()

  const [post, setPost] = useState<ApiBlogPost | null>(() => getInitialPost(slug, serverPost))
  const [notFound, setNotFound] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [progress, setProgress] = useState(0)

  const jsonLd = useMemo(() => (post ? buildJsonLd(post) : undefined), [post])
  const date = useMemo(
    () =>
      post?.published_at
        ? new Date(post.published_at).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })
        : null,
    [post],
  )

  usePageMeta({
    title: post ? post.seo_title || post.title : 'در حال بارگذاری...',
    description: post?.seo_description || post?.excerpt,
    keywords: post?.seo_keywords,
    canonical: slug ? `/blog/${slug}` : undefined,
    ogImage: post?.featured_image_url ?? undefined,
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

  // Reading progress bar
  useEffect(() => {
    if (!post) return
    const update = () => {
      const el = document.documentElement
      const h = el.scrollHeight - el.clientHeight
      setProgress(h > 0 ? (window.scrollY / h) * 100 : 0)
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
          <div key={i} className="h-4 bg-plate rounded mb-3" style={{ width: i === 7 ? '55%' : '100%' }} />
        ))}
      </div>
    )
  }

  if (notFound || !post) {
    return (
      <div className="max-w-[780px] mx-auto px-[clamp(20px,4vw,56px)] pb-[100px] pt-20 text-center">
        <p
          className="font-display font-bold leading-none mb-6 select-none"
          style={{ fontSize: 'clamp(80px, 14vw, 140px)', color: 'var(--color-plum)', opacity: 0.12 }}
          aria-hidden="true"
        >
          404
        </p>
        <h1 className="font-heading font-bold text-[clamp(22px,3vw,32px)] text-ink mb-4">مقاله یافت نشد</h1>
        <p className="text-ink-2 mb-10 text-[15px] leading-[1.8]">مقاله‌ای با این آدرس منتشر نشده یا حذف شده است.</p>
        <Link
          to="/blog"
          className="inline-flex items-center gap-2.5 text-sm text-plum border-b border-plum/25 hover:border-plum transition-colors pb-0.5"
        >
          <span aria-hidden="true">→</span>
          بازگشت به بلاگ
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* Reading progress bar — anchored right in RTL, grows leftward */}
      <div
        aria-hidden="true"
        className="fixed top-0 right-0 h-[2px] bg-plum z-50 pointer-events-none"
        style={{ width: `${progress}%`, transition: 'width 80ms linear' }}
      />

      <div className="max-w-[780px] mx-auto px-[clamp(20px,4vw,56px)] pb-[100px]">

        {/* Breadcrumb */}
        <nav className="py-6 flex items-center gap-2 text-[12px] text-muted" aria-label="مسیر ناوبری">
          <Link to="/" className="hover:text-ink transition-colors">خانه</Link>
          <span aria-hidden="true" className="opacity-35">/</span>
          <Link to="/blog" className="hover:text-ink transition-colors">بلاگ</Link>
          <span aria-hidden="true" className="opacity-35">/</span>
          <span className="text-ink-2 line-clamp-1 max-w-[28ch]">{post.title}</span>
        </nav>

        {/* Article header */}
        <header className="mb-10 pb-10 border-b border-rule">
          {date !== null && (
            <div className="flex items-center gap-3 mb-6">
              <span aria-hidden="true" className="block w-8 h-px bg-plum" />
              <time className="label-mono tracking-[.16em] text-plum">{date}</time>
            </div>
          )}
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
          <figure className="mb-12 overflow-hidden" style={{ boxShadow: '0 24px 60px -20px rgba(27, 15, 29, 0.22)' }}>
            <img
              src={post.featured_image_url}
              alt={post.title}
              className="w-full object-cover"
              fetchPriority="high"
            />
          </figure>
        )}

        {/* Article body */}
        <article
          className="prose-blog"
          dangerouslySetInnerHTML={{ __html: post.body }}
        />

        {/* Back to blog */}
        <div className="mt-16 pt-8 border-t border-rule">
          <Link
            to="/blog"
            className="group inline-flex items-center gap-3 text-[13px] text-muted hover:text-ink transition-colors"
          >
            <span
              aria-hidden="true"
              className="block h-px bg-current transition-all duration-300 w-6 group-hover:w-12"
            />
            بازگشت به بلاگ
          </Link>
        </div>
      </div>
    </>
  )
}

export default BlogDetailPage
