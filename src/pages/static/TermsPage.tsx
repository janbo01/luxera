import { usePageMeta } from '../../hooks/usePageMeta'
import type { FC } from 'react'

const SECTION = 'mb-11 pb-11 border-b border-rule last:border-b-0 last:mb-0'
const H2 = 'font-body font-normal text-[18px] text-ink m-0 mb-3.5'
const P = 'text-sm leading-[1.95] text-ink-2 m-0 mb-3 last:mb-0'
const LI = 'text-sm leading-[1.7] text-ink-2'

const TermsPage: FC = () => {
  usePageMeta({ title: 'شرایط استفاده' })
  return (
  <div className="max-w-[1480px] mx-auto px-[clamp(20px,4vw,56px)] pb-[100px]">
    {/* Hero */}
    <div className="pt-[72px] pb-14 border-b border-rule mb-16 max-[640px]:pt-12 max-[640px]:pb-10 max-[640px]:mb-10">
      <span className="font-body text-[11px] tracking-[.2em] text-muted uppercase mb-3.5 block">TERMS &amp; CONDITIONS</span>
      <h1 className="font-heading font-bold text-[clamp(40px,5vw,72px)] leading-[1.05] mt-3 mb-5 text-ink">
        شرایط و
        <em className="font-heading not-italic text-plum font-normal"> ضوابط</em>
      </h1>
      <p className="max-w-[52ch] text-ink-2 text-[15px] leading-[1.85] m-0">
        آخرین به‌روزرسانی: اردیبهشت ۱۴۰۵
      </p>
    </div>

    <div className="max-w-[760px] mb-16">
      <section className={SECTION}>
        <h2 className={H2}>۱. پذیرش شرایط</h2>
        <p className={P}>با استفاده از وب‌سایت لوکسرا (luxera.ir) و انجام خرید، این شرایط و ضوابط را می‌پذیرید. اگر با هر بخشی موافق نیستید، از خرید خودداری کنید.</p>
      </section>

      <section className={SECTION}>
        <h2 className={H2}>۲. محصولات و قیمت‌ها</h2>
        <ul className="pr-5 my-2.5 flex flex-col gap-2">
          <li className={LI}>تمام محصولات لوکسرا جواهرات فانتزی (Fashion Jewelry) هستند و شامل فلزات قیمتی یا سنگ‌های قیمتی واقعی نمی‌شوند.</li>
          <li className={LI}>قیمت‌ها به تومان و شامل مالیات بر ارزش افزوده هستند.</li>
          <li className={LI}>لوکسرا حق تغییر قیمت را در هر زمان بدون اطلاع قبلی دارد، اما قیمت سفارش‌های ثبت‌شده تغییر نمی‌کند.</li>
          <li className={LI}>تصاویر محصولات نمایانگر ظاهر واقعی هستند اما ممکن است بسته به نور و صفحه‌نمایش تفاوت جزئی داشته باشد.</li>
        </ul>
      </section>

      <section className={SECTION}>
        <h2 className={H2}>۳. سفارش و پرداخت</h2>
        <ul className="pr-5 my-2.5 flex flex-col gap-2">
          <li className={LI}>ثبت سفارش به منزله‌ی قرارداد خرید است.</li>
          <li className={LI}>پرداخت از طریق درگاه‌های بانکی مجاز انجام می‌شود.</li>
          <li className={LI}>در صورت ناموفق بودن پرداخت، سفارش ثبت نمی‌شود.</li>
          <li className={LI}>لوکسرا حق لغو سفارش در شرایط استثنایی (اتمام موجودی، خطای قیمت) را دارد و مبلغ کامل استرداد می‌شود.</li>
        </ul>
      </section>

      <section className={SECTION}>
        <h2 className={H2}>۴. ارسال</h2>
        <p className={P}>شرایط کامل ارسال در <a href="/shipping" className="text-plum border-b border-plum/30 transition-[border-color] hover:border-plum">صفحه‌ی ارسال و بازگشت</a> توضیح داده شده است. مسئولیت آدرس اشتباه وارد شده توسط مشتری بر عهده‌ی خریدار است.</p>
      </section>

      <section className={SECTION}>
        <h2 className={H2}>۵. بازگشت و استرداد</h2>
        <p className={P}>شرایط کامل بازگشت در <a href="/shipping" className="text-plum border-b border-plum/30 transition-[border-color] hover:border-plum">صفحه‌ی ارسال و بازگشت</a> آمده است. موارد زیر مشمول ضمانت کیفیت یک‌ساله است: تغییر رنگ روکش در شرایط عادی استفاده. موارد زیر مشمول ضمانت نیست: آسیب فیزیکی، تماس با مواد شیمیایی تهاجمی.</p>
      </section>

      <section className={SECTION}>
        <h2 className={H2}>۶. حقوق مالکیت معنوی</h2>
        <p className={P}>تمام محتوای وب‌سایت لوکسرا شامل تصاویر، متن‌ها، لوگو و طراحی‌ها متعلق به لوکسرا یا تأمین‌کنندگان آن است. استفاده‌ی تجاری از محتوا بدون مجوز کتبی ممنوع است.</p>
      </section>

      <section className={SECTION}>
        <h2 className={H2}>۷. محدودیت مسئولیت</h2>
        <p className={P}>لوکسرا در قبال خسارات غیرمستقیم ناشی از استفاده یا عدم دسترسی به وب‌سایت مسئولیتی ندارد. حداکثر مسئولیت لوکسرا در هر حادثه برابر مبلغ سفارش مربوطه است.</p>
      </section>

      <section className={SECTION}>
        <h2 className={H2}>۸. تغییر در شرایط</h2>
        <p className={P}>لوکسرا حق تغییر این شرایط را دارد. تغییرات عمده از طریق ایمیل اطلاع‌رسانی می‌شود. ادامه‌ی استفاده پس از اطلاع‌رسانی به منزله‌ی پذیرش است.</p>
      </section>

      <section className={SECTION}>
        <h2 className={H2}>۹. قانون حاکم</h2>
        <p className={P}>این شرایط تابع قوانین جمهوری اسلامی ایران است. اختلافات ابتدا از طریق مذاکره و سپس در مراجع قضایی تهران حل‌وفصل می‌شوند.</p>
      </section>

      <section className={SECTION}>
        <h2 className={H2}>۱۰. تماس</h2>
        <p className={P}>برای سوال درباره‌ی این شرایط از طریق <a href="/contact" className="text-plum border-b border-plum/30 transition-[border-color] hover:border-plum">فرم تماس</a> یا آدرس ایمیل <span style={{ fontFamily: 'var(--mono)', direction: 'ltr', display: 'inline-block' }}>legal@luxera.ir</span> با ما در ارتباط باشید.</p>
      </section>
    </div>
  </div>
)
}

export default TermsPage
