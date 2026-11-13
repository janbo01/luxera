import { usePageMeta } from '../../hooks/usePageMeta'
import { useEffect, useState, memo, type FC } from 'react'
import { BTN_CLS } from '../../components/ui/Button'
import PageHeader from '../../components/shared/PageHeader'

interface FaqItem {
  q: string
  a: string
  /** Anchor for deep links (/faq#size) from the footer, product tabs and contact page. */
  id?: string
}

interface FaqSection {
  title: string
  items: FaqItem[]
}

const SECTIONS: FaqSection[] = [
  {
    title: 'خرید و سفارش',
    items: [
      {
        q: 'آیا محصولات لوکسرا اصل هستند؟',
        a: 'بله. تمام محصولات از برندهای اصلی تأمین می‌شوند. لوکسرا یک فروشگاه معتبر است که مستقیماً با تأمین‌کنندگان برندهای معتبر جواهرات فانتزی کار می‌کند.',
      },
      {
        q: 'جنس محصولات از چیست؟',
        a: 'تمام محصولات لوکسرا جواهرات فانتزی (Fashion Jewelry) هستند — آلیاژ بدون نیکل با روکش رنگی با کیفیت. ما هرگز ادعای فروش فلزات قیمتی یا سنگ‌های قیمتی واقعی نمی‌کنیم.',
      },
      {
        id: 'size',
        q: 'چطور مطمئن شوم سایز درست انتخاب کرده‌ام؟',
        a: 'در صفحه‌ی هر محصول دکمه‌ی «راهنمای سایز» وجود دارد. برای گردنبند: با متر نواری اندازه‌ی گردن را بگیرید. اگر شک داشتید ۴۵ سانت برای اکثر افراد مناسب است. همچنین تا ۴ روز امکان تعویض وجود دارد.',
      },
      {
        q: 'آیا می‌توانم قبل از خرید سوال بپرسم؟',
        a: 'بله. می‌توانید از طریق واتس‌اپ یا فرم تماس با تیم ما در ارتباط باشید و راهنمایی لازم را دریافت کنید.',
      },
    ],
  },
  {
    title: 'ارسال و تحویل',
    items: [
      {
        q: 'هزینه‌ی ارسال چقدر است؟',
        a: 'ارسال برای سفارش‌های بالای ۲٫۵ میلیون تومان رایگان است. برای سفارش‌های کمتر: پست پیشتاز ۱۲۰ هزار، تیپاکس ۱۸۰ هزار و اسنپ‌باکس (فقط تهران) ۲۸۰ هزار تومان.',
      },
      {
        id: 'delivery',
        q: 'چقدر طول می‌کشد تا سفارشم برسد؟',
        a: 'تهران: با اسنپ‌باکس همان روز یا روز بعد، در بازه‌ی زمانی که خودتان انتخاب می‌کنید. سایر شهرها: تیپاکس ۲ تا ۳ روز کاری و پست پیشتاز ۳ تا ۵ روز کاری. برای ارسال‌های تیپاکس و پست کد رهگیری فرستاده می‌شود.',
      },
      {
        q: 'آیا به شهرستان‌ها هم ارسال می‌کنید؟',
        a: 'بله. با تیپاکس یا پست پیشتاز به همه‌ی شهرهای ایران ارسال می‌کنیم.',
      },
      {
        q: 'بسته‌بندی چگونه است؟',
        a: 'هر قطعه در جعبه‌ی مخصوص لوکسرا با کیف پارچه‌ای ارسال می‌شود. برای هدیه، در مرحله‌ی ارسال «بسته‌بندی هدیه» را انتخاب کنید: جعبه‌ی مخمل و کارت دست‌نویس با متن شما (۱۵ هزار تومان).',
      },
    ],
  },
  {
    title: 'کیفیت و ضمانت',
    items: [
      {
        q: 'کیفیت محصولات چگونه تضمین می‌شود؟',
        a: 'همه قطعات از آلیاژ بدون نیکل با روکش مقاوم ساخته می‌شوند و پیش از ارسال آزمون کیفیت می‌شوند. در صورت مشاهده‌ی هرگونه مشکل، تا ۴ روز پس از دریافت امکان بازگشت رایگان وجود دارد.',
      },
      {
        q: 'آیا محصولات برای پوست حساس مناسبند؟',
        a: 'بله. تمام محصولات از آلیاژ بدون نیکل ساخته شده‌اند. نیکل شایع‌ترین عامل حساسیت پوستی در جواهرات است و ما به‌طور جدی این معیار را بررسی می‌کنیم.',
      },
      {
        q: 'چطور از جواهرم نگهداری کنم؟',
        a: 'قطعه را با پارچه‌ی نرم میکروفایبر پس از هر استفاده پاک کنید. از تماس با عطر، کرم و مواد شیمیایی قبل از پوشیدن خودداری کنید. در کیف پارچه‌ای جداگانه نگهداری کنید.',
      },
    ],
  },
  {
    title: 'بازگشت و تعویض',
    items: [
      {
        id: 'returns',
        q: 'آیا می‌توانم محصول را برگردانم؟',
        a: 'بله. تا ۴ روز پس از دریافت، اگر قطعه سالم باشد، پلاک داشته باشد و در بسته‌بندی اصلی باشد، می‌توانید آن را برگردانید. پس از ۴ روز امکان پذیرش مرجوعی وجود ندارد.',
      },
      {
        q: 'چه مواردی شامل بازگشت نمی‌شود؟',
        a: 'قطعاتی که استفاده شده‌اند (آثار سایش، عطر، یا آسیب فیزیکی)، محصولاتی که پلاک آن‌ها جدا شده، و قطعاتی که به‌درخواست مشتری سفارشی‌سازی شده‌اند.',
      },
      {
        q: 'مبلغ بازگشتی کی به حسابم برمی‌گردد؟',
        a: 'پس از تأیید وضعیت کالا توسط انبار، مبلغ ظرف ۳ تا ۵ روز کاری به روش اولیه‌ی پرداخت (کارت یا کیف پول) برگشت داده می‌شود.',
      },
    ],
  },
]

const AccordionItem = memo<{ q: string; a: string; id?: string }>(({ q, a, id }) => {
  const [open, setOpen] = useState(false)
  // A deep link (/faq#delivery) opens its answer, on load and when the hash changes.
  useEffect(() => {
    if (!id) return
    const sync = () => {
      if (window.location.hash !== `#${id}`) return
      setOpen(true)
      // The browser's own jump ran before the page settled; land on the answer again.
      requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: 'start' }))
    }
    sync()
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [id])
  return (
    <div id={id} className="border-b border-rule scroll-mt-28">
      <button
        className={`w-full flex items-center justify-between gap-4 py-[18px] font-body text-[15px] text-right transition-colors ${open ? 'text-plum' : 'text-ink hover:text-plum'}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>{q}</span>
        <span className="shrink-0 text-[18px] text-muted w-5 text-center" aria-hidden="true">
          {open ? '−' : '+'}
        </span>
      </button>
      {/*
        Answer stays in the DOM always (collapsed via grid-rows) so it is present
        in the server-rendered HTML for crawlers and screen readers, not mounted
        only on click.
      */}
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
          <div className="text-sm leading-[1.9] text-ink-2 pb-5">{a}</div>
        </div>
      </div>
    </div>
  )
})

const FAQ_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: SECTIONS.flatMap((s) => s.items).map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
}

const FaqPage: FC = () => {
  usePageMeta({
    title: 'پرسش‌های متداول',
    description:
      'پاسخ سوالات رایج درباره خرید، ارسال، کیفیت محصولات و شرایط بازگشت در فروشگاه لوکسرا.',
    jsonLd: FAQ_JSON_LD,
  })
  return (
    <div className="max-w-[1480px] mx-auto px-[clamp(20px,4vw,56px)] pb-[100px]">
      <div className="-mx-[clamp(20px,4vw,56px)] mb-10 border-b border-rule">
        <PageHeader
          crumbs={[{ label: 'پرسش‌های متداول' }]}
          title="پرسش‌های متداول"
          description="پاسخ اکثر سوال‌ها اینجاست. اگر پیدا نکردید با ما تماس بگیرید."
        />
      </div>

      {/* FAQ body */}
      <div className="flex flex-col gap-14 mb-16">
        {SECTIONS.map((sec) => (
          <section key={sec.title}>
            <h2 className="font-heading font-bold text-[21px] m-0 mb-5 text-ink pb-3 border-b border-rule">
              {sec.title}
            </h2>
            <div className="flex flex-col">
              {sec.items.map((item) => (
                <AccordionItem key={item.q} q={item.q} a={item.a} id={item.id} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* CTA band */}
      <div className="text-center bg-plate py-14 px-[clamp(20px,4vw,56px)] -mx-[clamp(20px,4vw,56px)] -mb-[100px] mt-16 max-[640px]:py-11">
        <p className="font-heading font-bold text-[clamp(28px,3vw,44px)] m-0 mb-3 text-ink">
          جواب سوالتان را پیدا نکردید؟
        </p>
        <p className="text-ink-2 text-[15px] m-0 mb-7">
          تیم پشتیبانی ما در واتس‌اپ و تلگرام پاسخگوست.
        </p>
        <a href="/contact" className={BTN_CLS}>
          تماس با ما <span className="arr">←</span>
        </a>
      </div>
    </div>
  )
}

export default FaqPage
