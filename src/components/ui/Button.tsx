import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  fullWidth?: boolean
  icon?: ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-500 text-charcoal hover:bg-brand-400 active:bg-brand-600 disabled:bg-brand-500/30 disabled:text-charcoal/60',
  secondary:
    'border border-line bg-slate text-ink hover:border-brand-500/60 hover:bg-white/[0.04] active:bg-white/[0.08] disabled:border-line disabled:bg-slate disabled:text-muted/50',
  ghost:
    'bg-transparent text-muted hover:bg-white/[0.05] hover:text-ink active:bg-white/[0.09] disabled:text-muted/40',
  danger:
    'border border-danger/35 bg-danger/10 text-danger-soft hover:bg-danger/20 active:bg-danger/25 disabled:border-danger/20 disabled:text-danger-soft/40',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-11 px-3 text-label',
  md: 'h-12 px-4 text-label',
  lg: 'h-14 px-6 text-body',
  icon: 'h-12 w-12',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    icon,
    children,
    disabled,
    type = 'button',
    ...props
  },
  ref,
) {
  const isDisabled = disabled || loading

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold transition-colors duration-150',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        loading && 'cursor-wait',
        className,
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        icon
      )}
      {children}
    </button>
  )
})
