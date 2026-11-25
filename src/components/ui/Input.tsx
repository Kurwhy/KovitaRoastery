import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react'
import { cn } from '../../lib/cn'

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> & {
  label: string
  error?: string
  helper?: string
  prefix?: ReactNode
  containerClassName?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    id,
    label,
    error,
    helper,
    prefix,
    className,
    containerClassName,
    required,
    ...props
  },
  ref,
) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const descriptionId = `${inputId}-description`
  const describedBy = error || helper ? descriptionId : undefined

  return (
    <div className={cn('w-full', containerClassName)}>
      <label
        htmlFor={inputId}
        className="mb-2 block text-label font-medium text-ink"
      >
        {label}
        {required && <span className="ml-1 text-brand-400">*</span>}
      </label>
      <div
        className={cn(
          'flex h-12 items-center rounded-lg border bg-charcoal transition-colors duration-150',
          'focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20',
          error ? 'border-danger' : 'border-line hover:border-muted/50',
        )}
      >
        {prefix && (
          <span className="shrink-0 pl-4 text-label text-muted">{prefix}</span>
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={cn(
            'h-full min-w-0 flex-1 rounded-lg bg-transparent px-4 text-body text-ink outline-none',
            'placeholder:text-muted/80 disabled:cursor-not-allowed disabled:text-muted',
            prefix ? 'pl-2' : undefined,
            className,
          )}
          {...props}
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
