import { type FC, useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { BTN_MUTE, BTN_SM, CARD, IC_SECT, IcoLock, IcoLogout, SECTION_B, SECTION_H } from './shared'

const SecurityPane: FC = () => {
  const { logout } = useAuthStore()
  const [sec, setSec] = useState({ twofa: true, biometric: false, alerts: true })

  return (
    <div className="flex flex-col gap-[18px]">
      <div className={CARD}>
        <div className={SECTION_H}>
          <h2 className="font-heading text-[18px] font-semibold m-0 flex items-center gap-3">
            <span className={IC_SECT}>
              <IcoLock />
            </span>{' '}
            امنیت و رمز
          </h2>
          <p className="m-0 mt-1.5 text-[13px] text-muted mr-11">
            تنظیمات امنیتی و رمزِ ورودِ حساب خود را مدیریت کنید.
          </p>
        </div>
        <div className={SECTION_B}>
          {(
            [
              {
                key: 'twofa',
                title: 'تأییدِ دو مرحله‌ای',
                desc: 'ارسالِ کدِ تأیید به موبایل هنگامِ ورود',
              },
              {
                key: 'biometric',
                title: 'ورود بیومتریک',
                desc: 'استفاده از اثرِ انگشت یا تشخیصِ چهره',
              },
              {
                key: 'alerts',
                title: 'اعلانِ ورود جدید',
                desc: 'اطلاع‌رسانی از هر ورودِ جدید به حساب',
              },
            ] as const
          ).map(({ key, title, desc }) => (
            <div
              key={key}
              className="flex items-start gap-3.5 py-3.5 border-t border-rule first:border-t-0 first:pt-0"
            >
              <span className="w-[34px] h-[34px] rounded-full bg-bg-2 grid place-items-center text-copper shrink-0 [&_svg]:w-[15px] [&_svg]:h-[15px]">
                <IcoLock />
              </span>
              <div className="flex-1">
                <h3 className="font-heading text-[13px] font-semibold m-0">{title}</h3>
                <p className="m-0 mt-0.5 text-[13px] text-muted">{desc}</p>
              </div>
              <label className="relative w-9 h-5 shrink-0 cursor-pointer mt-0.5">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={sec[key]}
                  onChange={(e) => setSec((s) => ({ ...s, [key]: e.target.checked }))}
                />
                <span className="absolute inset-0 bg-bg-2 rounded-full transition-colors peer-checked:bg-ink after:content-[''] after:absolute after:top-0.5 after:right-0.5 after:w-4 after:h-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:-translate-x-4" />
              </label>
            </div>
          ))}
        </div>
        <div className="px-7 py-[18px] bg-surface-2 border-t border-rule flex justify-between items-center gap-3">
          <span className="text-[13px] text-muted">آخرین ورود: امروز · ۱۰:۴۵</span>
          <button className={`${BTN_MUTE} ${BTN_SM}`}>تغییرِ رمزِ ورود</button>
        </div>
      </div>

      <div className={CARD}>
        <div className={SECTION_H}>
          <h2 className="font-heading text-[18px] font-semibold m-0 flex items-center gap-3">
            <span className={`${IC_SECT} text-sale`}>
              <IcoLogout />
            </span>{' '}
            خروج از حساب
          </h2>
          <p className="m-0 mt-1.5 text-[13px] text-muted mr-11">از تمامِ دستگاه‌ها خارج شوید.</p>
        </div>
        <div className={SECTION_B}>
          <button
            className={`${BTN_MUTE} ${BTN_SM} text-sale [&_svg]:w-[14px] [&_svg]:h-[14px]`}
            onClick={() => logout()}
          >
            <IcoLogout /> خروج از همه‌ی دستگاه‌ها
          </button>
        </div>
      </div>
    </div>
  )
}

export default SecurityPane
