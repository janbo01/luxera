import { usePageMeta } from '../../hooks/usePageMeta'
import type { FC } from 'react'

const SECTION = 'mb-11 pb-11 border-b border-rule last:border-b-0 last:mb-0'
const H2 = 'font-body font-normal text-[18px] text-ink m-0 mb-3.5'
const P = 'text-sm leading-[1.95] text-ink-2 m-0 mb-3 last:mb-0'
const LI = 'text-sm leading-[1.7] text-ink-2'

const PrivacyPage: FC = () => {
  usePageMeta({
    title: 'حریم خصوصی و سیاست داده‌های لوکسرا',
    description: 'سیاست حفظ حریم خصوصی لوکسرا — نحوه جمع‌آوری، استفاده و حفاظت از اطلاعات شما.',
  })
  return (
    <div className="max-w-[1480px] mx-auto px-[clamp(20px,4vw,56px)] pb-[100px]">
      {/* Hero */}
      <div className="pt-[72px] pb-14 border-b border-rule mb-16 max-[640px]:pt-12 max-[640px]:pb-10 max-[640px]:mb-10">
        <span className="font-body text-[11px] tracking-[.2em] text-muted uppercase mb-3.5 block">
          PRIVACY · حریم خصوصی
        </span>
        <h1 className="font-heading font-bold text-[clamp(40px,5vw,72px)] leading-[1.05] mt-3 mb-5 text-ink">
          سیاست
          <em className="font-heading not-italic text-plum font-normal"> حریم خصوصی</em>
        </h1>
        <p className="max-w-[52ch] text-ink-2 text-[15px] leading-[1.85] m-0">
          آخرین به‌روزرسانی: اردیبهشت ۱۴۰۵
        </p>
      </div>

      <div className="max-w-[760px] mb-16">
        <section className={SECTION}>
          <h2 className={H2}>۱. اطلاعاتی که جمع‌آوری می‌کنیم</h2>
          <p className={P}>هنگام خرید یا ثبت‌نام، اطلاعات زیر را دریافت می‌کنیم:</p>
          <ul className="pr-5 my-2.5 flex flex-col gap-2">
            <li className={LI}>نام، آدرس ایمیل، شماره تلفن</li>
            <li className={LI}>آدرس تحویل</li>
            <li className={LI}>
              اطلاعات پرداخت (پردازش توسط درگاه مجاز — ما اطلاعات کارت را ذخیره نمی‌کنیم)
            </li>
            <li className={LI}>تاریخچه‌ی سفارش‌ها</li>
          </ul>
          <p className={P}>
            همچنین به‌صورت خودکار اطلاعاتی مانند آدرس IP، نوع مرورگر، و صفحاتی که بازدید می‌کنید
            جمع‌آوری می‌شود — صرفاً برای بهبود تجربه‌ی کاربری.
          </p>
        </section>

        <section className={SECTION}>
          <h2 className={H2}>۲. چرا از اطلاعات شما استفاده می‌کنیم</h2>
          <ul className="pr-5 my-2.5 flex flex-col gap-2">
            <li className={LI}>پردازش و ارسال سفارش‌ها</li>
            <li className={LI}>ارسال تأیید سفارش و کد رهگیری</li>
            <li className={LI}>پاسخ به درخواست‌های پشتیبانی</li>
            <li className={LI}>بهبود محصولات و تجربه‌ی خرید</li>
            <li className={LI}>ارسال پیشنهادها و تخفیف‌ها — فقط اگر رضایت داده باشید</li>
          </ul>
        </section>

        <section className={SECTION}>
          <h2 className={H2}>۳. اشتراک‌گذاری اطلاعات</h2>
          <p className={P}>
            اطلاعات شخصی شما را به هیچ شخص ثالثی برای اهداف تبلیغاتی نمی‌فروشیم. اطلاعات تنها در
            موارد زیر به اشخاص ثالث منتقل می‌شود:
          </p>
          <ul className="pr-5 my-2.5 flex flex-col gap-2">
            <li className={LI}>شرکت‌های حمل‌ونقل (فقط آدرس تحویل)</li>
            <li className={LI}>درگاه پرداخت مجاز (برای پردازش تراکنش)</li>
            <li className={LI}>الزامات قانونی</li>
          </ul>
        </section>

        <section className={SECTION}>
          <h2 className={H2}>۴. امنیت اطلاعات</h2>
          <p className={P}>
            تمام تبادل داده‌ها از طریق پروتکل HTTPS رمزگذاری می‌شود. اطلاعات کارت بانکی هرگز روی
            سرورهای ما ذخیره نمی‌شود و پردازش آن کاملاً توسط درگاه پرداخت مجاز انجام می‌شود.
          </p>
        </section>

        <section className={SECTION}>
          <h2 className={H2}>۵. کوکی‌ها</h2>
          <p className={P}>
            از کوکی‌های ضروری برای عملکرد سبد خرید و احراز هویت استفاده می‌کنیم. کوکی‌های تبلیغاتی
            یا ردیابی شخص ثالث بدون رضایت صریح شما فعال نمی‌شوند.
          </p>
        </section>

        <section className={SECTION}>
          <h2 className={H2}>۶. حقوق شما</h2>
          <p className={P}>شما حق دارید:</p>
          <ul className="pr-5 my-2.5 flex flex-col gap-2">
            <li className={LI}>به اطلاعات ذخیره‌شده درباره‌ی خود دسترسی داشته باشید</li>
            <li className={LI}>درخواست اصلاح یا حذف اطلاعات بدهید</li>
            <li className={LI}>از دریافت ایمیل‌های بازاریابی انصراف بدهید</li>
            <li className={LI}>پورتابیلیتی داده را درخواست کنید</li>
          </ul>
          <p className={P}>
            برای هر یک از این درخواست‌ها از طریق صفحه‌ی تماس با ما در ارتباط باشید.
          </p>
        </section>

        <section className={SECTION}>
          <h2 className={H2}>۷. نگهداری اطلاعات</h2>
          <p className={P}>
            اطلاعات حساب کاربری تا زمانی که حساب فعال است نگهداری می‌شود. اطلاعات سفارش‌ها برای
            مقاصد حسابداری و قانونی حداقل ۵ سال نگهداری می‌شود.
          </p>
        </section>

        <section className={SECTION}>
          <h2 className={H2}>۸. تغییرات در این سیاست</h2>
          <p className={P}>
            در صورت تغییر عمده در این سیاست، از طریق ایمیل یا اطلاعیه در سایت به شما اطلاع داده
            می‌شود. ادامه‌ی استفاده از سایت پس از اطلاع‌رسانی به منزله‌ی پذیرش تغییرات است.
          </p>
        </section>

        <section className={SECTION}>
          <h2 className={H2}>۹. تماس</h2>
          <p className={P}>
            برای هرگونه سوال درباره‌ی حریم خصوصی یا درخواست دسترسی به اطلاعاتتان، از طریق فرم تماس
            یا آدرس ایمیل{' '}
            <span style={{ fontFamily: 'var(--mono)', direction: 'ltr', display: 'inline-block' }}>
              privacy@luxera.ir
            </span>{' '}
            با ما در ارتباط باشید.
          </p>
        </section>
      </div>
    </div>
  )
}

export default PrivacyPage
