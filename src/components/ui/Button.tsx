import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'ghost' | 'link' | 'icon' | 'small'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  children: ReactNode
}

const BASE = 'inline-flex items-center gap-2.5 font-medium tracking-[0.01em] border rounded-full transition-all duration-200 cursor-pointer [&>svg]:w-3.5 [&>svg]:h-3.5 [&>svg]:shrink-0 [&_.arr]:inline-block [&_.arr]:w-4 [&_.arr]:h-4 [&_.arr]:transition-transform [&:hover_.arr]:-translate-x-[3px]'

export const BTN_CLS       = `${BASE} px-6 py-3.5 text-sm border-ink bg-ink text-bg hover:bg-plum hover:border-plum hover:-translate-y-px`
export const BTN_GHOST_CLS = `${BASE} px-6 py-3.5 text-sm border-ink bg-transparent text-ink hover:bg-ink hover:text-bg hover:-translate-y-px`

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: BTN_CLS,
  ghost:   BTN_GHOST_CLS,
  link:    'inline-flex items-center gap-2.5 pb-1 border-b border-ink bg-transparent text-ink text-[13px] tracking-[0.04em] rounded-none transition-all duration-200 cursor-pointer hover:text-plum hover:border-plum',
  icon:    'w-10 h-10 rounded-full grid place-items-center bg-bg-2 text-ink border-none transition-colors duration-200 cursor-pointer hover:bg-plate shrink-0',
  small:   `${BASE} px-[18px] py-2.5 text-xs border-ink bg-ink text-bg hover:bg-plum hover:border-plum hover:-translate-y-px`,
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', className = '', children, ...rest }, ref) => {
    const base = VARIANT_CLASS[variant]
    return (
      <button ref={ref} className={`${base}${className ? ` ${className}` : ''}`} {...rest}>
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'
