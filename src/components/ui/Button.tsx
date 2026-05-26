import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'ghost' | 'link' | 'icon' | 'small'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  children: ReactNode
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: 'btn',
  ghost: 'btn btn--ghost',
  link: 'btn--link',
  icon: 'btn--icon',
  small: 'btn btn--small',
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
