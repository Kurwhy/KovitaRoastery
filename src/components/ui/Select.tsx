import { forwardRef, useId, type SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/cn'

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  error?: string
  helper?: string
  containerClassName?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    id,
    label,
    error,
    helper,
    className,
    containerClassName,
    required,
    children,
    ...props
  },
  ref,
) {
  const generatedId = useId()
  const selectId = id ?? generatedId
  const descriptionId = `${selectId}-description`
  const describedBy = error || helper ? descriptionId : undefined

  return (
    <div className={cn('w-full', containerClassName)}>
      <label
        htmlFor={selectId}
        className="mb-2 block text-label font-medium text-ink"
      >
        {label}
        {required && <span className="ml-1 text-brand-400">*</span>}
      </label>
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={cn(
            'h-12 w-full appearance-none rounded-lg border bg-charcoal px-4 pr-10 text-body text-ink outline-none transition-colors duration-150',
            'hover:border-muted/50 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
            'disabled:cursor-not-allowed disabled:text-muted',
            error ? 'border-danger' : 'border-line',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
      </div>
      {error ? (
        <p id={descriptionId} className="mt-2 text-label text-danger-soft" role="alert">
          {error}
        </p>
      ) : helper ? (
        <p id={descriptionId} className="mt-2 text-label text-muted">
          {helper}
        </p>
      ) : null}
    </div>
  )
})
