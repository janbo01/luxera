import type { FC } from 'react'

const STORY_COLS = [
  {
    num: '۰۱ / ضمانت کیفیت',
    heading: 'هر قطعه با ضمانت یک ساله‌ی تعویض یا بازگشت وجه همراه است.',
    body: 'اگر رنگ روکش در سال اول تغییر کرد یا با مشکل کیفی روبرو شدید، بدون سؤال تعویض می‌کنیم. رضایت شما خط قرمز ماست.',
  },
  {
    num: '۰۲ / ارسال و بسته‌بندی',
    heading: 'ارسال امن سراسری در جعبه‌ی هدیه‌ی اختصاصی لوکسرا.',
    body: 'سفارش‌های بالای ۵۰۰٫۰۰۰ تومان با ارسال رایگان. تحویل در ۲۴ ساعت در تهران و ۲ تا ۴ روز در سراسر ایران.',
  },
  {
    num: '۰۳ / اقساط بدون بهره',
    heading: 'پرداخت تا ۶ ماه از طریق درگاه ایمن لوکسرا.',
    body: 'خرید آسان، بدون پیش‌پرداخت سنگین. از طریق کارت‌های بانکی عضو شتاب، با تأیید فوری.',
  },
]

const Story: FC = () => (
  <section className="grid grid-cols-3 max-md:grid-cols-1 border-t border-b border-rule">
    {STORY_COLS.map(({ num, heading, body }, i) => (
      <div key={num} className={`py-14 px-10 max-md:py-8 max-md:px-[var(--pad)] ${i < STORY_COLS.length - 1 ? 'border-s border-rule max-md:border-s-0 max-md:border-b' : ''}`}>
        <span className="font-mono text-[11px] text-plum tracking-[0.16em] mb-6 block">{num}</span>
        <h4 className="font-body font-light text-[22px] leading-[1.3] m-0 mb-3.5">{heading}</h4>
        <p className="text-[13px] text-muted leading-[1.85] m-0">{body}</p>
      </div>
    ))}
  </section>
)

export default Story
