import { usePageMeta } from '../../hooks/usePageMeta'
import { useState, memo, type FC } from 'react'
import { Link } from 'react-router-dom'
import { BTN_CLS } from '../../components/ui/Button'

interface FaqItem {
  q: string
  a: string
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
        a: 'ارسال برای سفارش‌های بالای ۲٫۵ میلیون تومان رایگان است. برای سفارش‌های کمتر، هزینه‌ی ارسال جداگانه محاسبه می‌شود.',
      },
      {
        q: 'چقدر طول می‌کشد تا سفارشم برسد؟',
        a: 'تهران: ۲۴ ساعت با پیک ویژه‌ی لوکسرا. کلان‌شهرها: ۲ روز کاری. سراسر ایران: ۲ تا ۴ روز با پست پیشتاز. تمام محموله‌ها بیمه دارند و کد رهگیری ارسال می‌شود.',
      },
      {
        q: 'آیا به شهرستان‌ها هم ارسال می‌کنید؟',
        a: 'بله. به تمام نقاط ایران که پست پیشتاز پوشش می‌دهد ارسال می‌کنیم.',
      },
      {
        q: 'بسته‌بندی چگونه است؟',
        a: 'هر قطعه در جعبه‌ی مخصوص لوکسرا با کیف پارچه‌ای بسته‌بندی می‌شود. بسته‌بندی هدیه‌ای استاندارد است و نیازی به درخواست اضافی ندارد.',
      },
    ],
  },
  {
    title: 'کیفیت و ضمانت',
    items: [
      {
        q: 'ضمانت کیفیت به چه معناست؟',
        a: 'اگر رنگ قطعه در سال اول تغییر کرد یا افت کیفیت محسوسی داشت، بدون سوال و بدون هزینه قطعه را تعویض می‌کنیم. فقط کافی است با پشتیبانی تماس بگیرید.',
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

const AccordionItem = memo<{ q: string; a: string }>(({ q, a }) => {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-rule">
      <button
        className={`w-full flex items-center justify-between gap-4 py-[18px] font-body text-[15px] text-right transition-colors ${open ? 'text-plum' : 'text-ink hover:text-plum'}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>{q}</span>
        <span
          className="shrink-0 font-mono text-[18px] text-muted w-5 text-center"
          aria-hidden="true"
        >
          {open ? '−' : '+'}
        </span>
      </button>
      {open && (
        <div className="text-sm leading-[1.9] text-ink-2 pb-5 animate-[luxera-rise_250ms_cubic-bezier(.2,.7,.2,1)_both]">
          {a}
        </div>
      )}
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
      {/* Hero */}
      <div className="pt-[72px] pb-14 border-b border-rule mb-16 max-[640px]:pt-12 max-[640px]:pb-10 max-[640px]:mb-10">
        <span className="font-body text-[11px] tracking-[.2em] text-muted uppercase mb-3.5 block">
          FAQ
        </span>
        <h1 className="font-heading font-bold text-[clamp(40px,5vw,72px)] leading-[1.05] mt-3 mb-5 text-ink">
          سوالات
          <em className="font-heading not-italic text-plum font-normal"> متداول</em>
        </h1>
        <p className="max-w-[52ch] text-ink-2 text-[15px] leading-[1.85] m-0">
          پاسخ اکثر سوال‌ها اینجاست. اگر پیدا نکردید با ما تماس بگیرید.
        </p>
      </div>

      {/* FAQ body */}
      <div className="flex flex-col gap-14 mb-16">
        {SECTIONS.map((sec) => (
          <section key={sec.title}>
            <h2 className="font-body font-light text-[22px] m-0 mb-5 text-ink pb-3 border-b border-rule">
              {sec.title}
            </h2>
            <div className="flex flex-col">
              {sec.items.map((item) => (
                <AccordionItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* CTA band */}
      <div className="text-center bg-plate py-14 px-[clamp(20px,4vw,56px)] -mx-[clamp(20px,4vw,56px)] -mb-[100px] mt-16 max-[640px]:py-11">
        <h2 className="font-heading font-bold text-[clamp(28px,3vw,44px)] m-0 mb-3 text-ink">
          جواب سوالتان را پیدا نکردید؟
        </h2>
        <p className="text-muted text-sm m-0 mb-7">تیم پشتیبانی ما در واتس‌اپ و تلگرام پاسخگوست.</p>
        <Link to="/contact" className={BTN_CLS}>
          تماس با ما <span className="arr">←</span>
        </Link>
      </div>
    </div>
  )
}

export default FaqPage
