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
  <section className="story">
    {STORY_COLS.map(({ num, heading, body }) => (
      <div key={num} className="story__col">
        <span className="story__col-num">{num}</span>
        <h4>{heading}</h4>
        <p>{body}</p>
      </div>
    ))}
  </section>
)

export default Story
