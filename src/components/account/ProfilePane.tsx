import { type FC, useState, useRef } from 'react'
import { useAuthStore } from '../../store/authStore'
import { toFa } from '../../utils/format'
import DatePickerImport from 'react-multi-date-picker'
import type { DateObject } from 'react-multi-date-picker'
import persian from 'react-date-object/calendars/persian'
import persian_fa from 'react-date-object/locales/persian_fa'
import {
  AVA_LG,
  BTN_MUTE,
  BTN_PRIMARY,
  BTN_SM,
  CARD,
  F_FIELD,
  F_LABEL,
  IC_SECT,
  INPUT_CLS,
  IcoBell,
  IcoCheck,
  IcoEmail,
  IcoPhone,
  IcoStar,
  IcoUser,
  IcoWhatsApp,
  SECTION_B,
  SECTION_H,
  SELECT_BG,
  SELECT_CLS,
  firstLetter,
} from './shared'

// react-multi-date-picker is CommonJS. Under Vite 8 the default import can arrive as the module
// object ({ default: Component }) instead of the component, which crashes the tab on render.
const DatePicker =
  (DatePickerImport as unknown as { default?: typeof DatePickerImport }).default ?? DatePickerImport

const GENDER_OPTIONS = [
  { value: 'female', label: 'زن' },
  { value: 'male', label: 'مرد' },
  { value: 'other', label: 'ترجیح می‌دهم نگویم' },
]

const ProfilePane: FC = () => {
  const profile = useAuthStore((s) => s.profile)
  const updateProfile = useAuthStore((s) => s.updateProfile)
  const uploadAvatar = useAuthStore((s) => s.uploadAvatar)
  const deleteAvatar = useAuthStore((s) => s.deleteAvatar)
  const [form, setForm] = useState({
    name: profile?.name?.split(' ')[0] ?? '',
    family: profile?.name?.split(' ').slice(1).join(' ') ?? '',
    email: profile?.email ?? '',
    phone: profile?.phone ?? '',
    birthdate: profile?.birthDate ?? '',
    gender: profile?.gender ?? '',
    nationalId: profile?.nationalId ?? '',
  })
  const [notifs, setNotifs] = useState({ email: true, sms: true, offers: false, whatsapp: true })
  const [saved, setSaved] = useState(false)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSave = () => {
    updateProfile({
      ...profile!,
      name: `${form.name} ${form.family}`.trim(),
      email: form.email,
      phone: form.phone,
      birthDate: form.birthdate,
      gender: form.gender,
      nationalId: form.nationalId,
    })
      .then(() => {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      })
      .catch(() => {})
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarLoading(true)
    uploadAvatar(file).finally(() => setAvatarLoading(false))
  }

  const handleDeleteAvatar = () => {
    setAvatarLoading(true)
    deleteAvatar().finally(() => setAvatarLoading(false))
  }

  return (
    <div className="flex flex-col gap-[18px]">
      {/* Personal info */}
      <div className={CARD}>
        <div className={SECTION_H}>
          <h2 className="font-heading text-[18px] font-semibold m-0 flex items-center gap-3">
            <span className={IC_SECT}>
              <IcoUser />
            </span>{' '}
            اطلاعاتِ شخصی
          </h2>
          <p className="m-0 mt-1.5 text-[13px] text-muted mr-11">
            این اطلاعات روی فاکتورها و رسیدِ تحویلِ سفارش استفاده می‌شود.
          </p>
        </div>
        <div className="flex items-center gap-[18px] px-7 py-5 bg-surface-2 border-b border-rule">
          {profile?.avatarUrl ? (
            <img src={profile.avatarUrl} alt="avatar" className={`${AVA_LG} object-cover`} />
          ) : (
            <span className={AVA_LG}>{firstLetter(profile?.name)}</span>
          )}
          <div className="flex-1">
            <h3 className="font-heading text-sm font-semibold m-0">عکسِ پروفایل</h3>
            <p className="m-0 mt-0.5 text-[13px] text-muted">
              JPG یا PNG · حداکثر ۲ مگابایت · ۴۰۰×۴۰۰ پیکسل
            </p>
          </div>
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <button
              className={`${BTN_MUTE} ${BTN_SM}`}
              disabled={avatarLoading}
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarLoading ? '...' : 'بارگذاریِ عکس'}
            </button>
            {profile?.avatarUrl && (
              <button
                className={`${BTN_MUTE} ${BTN_SM} text-sale`}
                disabled={avatarLoading}
                onClick={handleDeleteAvatar}
              >
                حذف
              </button>
            )}
          </div>
        </div>
        <div className={SECTION_B}>
          <div className="grid grid-cols-2 gap-[18px]">
            <div className={F_FIELD}>
              <label className={F_LABEL}>
                نام <span className="text-sale">*</span>
              </label>
              <input
                className={INPUT_CLS}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className={F_FIELD}>
              <label className={F_LABEL}>
                نامِ خانوادگی <span className="text-sale">*</span>
              </label>
              <input
                className={INPUT_CLS}
                value={form.family}
                onChange={(e) => setForm((f) => ({ ...f, family: e.target.value }))}
              />
            </div>
            <div className={F_FIELD}>
              <label className={F_LABEL}>
                ایمیل{' '}
                <span className="mr-auto inline-flex items-center gap-1 font-mono text-[12px] text-ok [&_svg]:w-[11px] [&_svg]:h-[11px]">
                  <IcoCheck />
                  تأیید شده
                </span>
              </label>
              <input
                className={INPUT_CLS}
                dir="ltr"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className={F_FIELD}>
              <label className={F_LABEL}>
                موبایل{' '}
                <span className="mr-auto inline-flex items-center gap-1 font-mono text-[12px] text-ok [&_svg]:w-[11px] [&_svg]:h-[11px]">
                  <IcoCheck />
                  تأیید شده
                </span>
              </label>
              <input className={INPUT_CLS} dir="ltr" value={toFa(form.phone)} disabled />
            </div>
            <div className={F_FIELD}>
              <label className={F_LABEL}>
                تاریخِ تولد{' '}
                <span className="mr-auto font-mono text-[12px] text-muted font-normal">
                  (اختیاری)
                </span>
              </label>
              <DatePicker
                calendar={persian}
                locale={persian_fa}
                value={
                  form.birthdate
                    ? (() => {
                        const d = new Date(form.birthdate)
                        return isNaN(d.getTime()) ? '' : d
                      })()
                    : ''
                }
                onChange={(date: DateObject | null) =>
                  setForm((f) => ({
                    ...f,
                    birthdate: date ? date.toDate().toISOString().split('T')[0] : '',
                  }))
                }
                inputClass={INPUT_CLS}
                containerStyle={{ width: '100%' }}
                maxDate={new Date()}
                format="YYYY/MM/DD"
                placeholder="انتخاب تاریخِ تولد"
                calendarPosition="bottom-right"
                arrow={false}
              />
            </div>
            <div className={F_FIELD}>
              <label className={F_LABEL}>
                جنسیت{' '}
                <span className="mr-auto font-mono text-[12px] text-muted font-normal">
                  (اختیاری)
                </span>
              </label>
              <select
                className={SELECT_CLS}
                style={{ backgroundImage: SELECT_BG }}
                value={form.gender}
                onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
              >
                <option value="">انتخاب کنید</option>
                {GENDER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className={`${F_FIELD} col-span-2`}>
              <label className={F_LABEL}>
                کدِ ملی{' '}
                <span className="mr-auto font-mono text-[12px] text-muted font-normal">
                  (برای صدورِ فاکتورِ رسمی)
                </span>
              </label>
              <input
                className={INPUT_CLS}
                placeholder="۰۰۸۷۶۵۴۳۲۱"
                value={form.nationalId}
                onChange={(e) => setForm((f) => ({ ...f, nationalId: e.target.value }))}
              />
            </div>
          </div>
        </div>
        <div className="px-7 py-[18px] bg-surface-2 border-t border-rule flex justify-between items-center gap-3">
          <span className="text-[13px] text-muted">
            آخرین تغییر:{' '}
            {profile?.updatedAt ? new Date(profile.updatedAt).toLocaleDateString('fa-IR') : '—'}
          </span>
          <div className="flex gap-2">
            <button className={`${BTN_MUTE} ${BTN_SM}`}>لغو</button>
            <button className={`${BTN_PRIMARY} ${BTN_SM}`} onClick={handleSave}>
              {saved ? '✓ ذخیره شد' : 'ذخیره‌ی تغییرات'}
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className={CARD}>
        <div className={SECTION_H}>
          <h2 className="font-heading text-[18px] font-semibold m-0 flex items-center gap-3">
            <span className={IC_SECT}>
              <IcoBell />
            </span>{' '}
            اعلان‌ها و ارتباطات
          </h2>
          <p className="m-0 mt-1.5 text-[13px] text-muted mr-11">
            کنترل کنید چه پیام‌هایی از ما دریافت کنید.
          </p>
        </div>
        <div className={SECTION_B}>
          {(
            [
              {
                key: 'email',
                icon: <IcoEmail />,
                title: 'خبرنامه‌ی ایمیلی',
                desc: 'هر دو هفته یک ایمیل با جدیدترین قطعات و پیشنهادها',
              },
              {
                key: 'sms',
                icon: <IcoPhone />,
                title: 'پیامکِ سفارش',
                desc: 'وضعیتِ ارسال و تحویل از طریقِ SMS',
              },
              {
                key: 'offers',
                icon: <IcoStar />,
                title: 'پیشنهادهای ویژه',
                desc: 'دسترسیِ زودهنگام و تخفیف‌های اعضای طلایی',
              },
              {
                key: 'whatsapp',
                icon: <IcoWhatsApp />,
                title: 'پیام‌رسانِ واتس‌اپ',
                desc: 'پشتیبانی و اطلاع‌رسانی از طریقِ واتس‌اپ',
              },
            ] as const
          ).map(({ key, icon, title, desc }) => (
            <div
              key={key}
              className="flex items-start gap-3.5 py-3.5 border-t border-rule first:border-t-0 first:pt-0"
            >
              <span className="w-[34px] h-[34px] rounded-full bg-bg-2 grid place-items-center text-copper shrink-0 [&_svg]:w-[15px] [&_svg]:h-[15px]">
                {icon}
              </span>
              <div className="flex-1">
                <h3 className="font-heading text-[13px] font-semibold m-0">{title}</h3>
                <p className="m-0 mt-0.5 text-[13px] text-muted">{desc}</p>
              </div>
              {/* Toggle switch using peer */}
              <label className="relative w-9 h-5 shrink-0 cursor-pointer mt-0.5">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={notifs[key]}
                  onChange={(e) => setNotifs((n) => ({ ...n, [key]: e.target.checked }))}
                />
                <span className="absolute inset-0 bg-bg-2 rounded-full transition-colors peer-checked:bg-ink after:content-[''] after:absolute after:top-0.5 after:right-0.5 after:w-4 after:h-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:-translate-x-4" />
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProfilePane
