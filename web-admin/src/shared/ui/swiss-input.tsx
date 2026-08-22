import React from 'react'

export interface SwissInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode
  error?: string
  rightElement?: React.ReactNode
}

export const SwissInput = React.forwardRef<HTMLInputElement, SwissInputProps>(
  (
    {
      label,
      error,
      id,
      className = '',
      rightElement,
      ...props
    },
    ref,
  ) => {
    return (
      <div>
        <label
          htmlFor={id}
          className="label-swiss flex items-center gap-2"
        >
          {label}
        </label>

        <div className="relative">
          <input
            id={id}
            {...props}
            ref={ref}
            className={`w-full border bg-transparent px-4 py-3 text-uecg-text focus:outline-none transition-colors ${className} ${error
                ? 'border-red-500 focus:border-red-500'
                : 'border-uecg-line focus:border-uecg-blue'
              } ${rightElement ? 'pr-12' : ''}`}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${id}-error` : undefined}
          />
          {rightElement && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {rightElement}
            </div>
          )}
        </div>

        {error && (
          <p
            id={`${id}-error`}
            className="mt-2 text-xs font-bold uppercase tracking-widest text-red-500"
          >
            {error}
          </p>
        )}
      </div>
    )
  },
)

SwissInput.displayName = 'SwissInput'
