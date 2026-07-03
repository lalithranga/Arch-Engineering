/**
 * Button.jsx
 * ----------------------------------------------------------------------
 * The single Button implementation for the whole app. Every CTA — the
 * Hero "Get a Quote", the contact form submit, the admin "Save Project" —
 * should render through THIS component so a future brand tweak (e.g.
 * the green gets darker) is a one-file change.
 *
 * variant: 'primary' | 'secondary' | 'ghost' | 'danger'
 * size: 'sm' | 'md' | 'lg'
 * ----------------------------------------------------------------------
 */
const VARIANT_STYLES = {
  primary:
    'bg-brand text-white border border-brand hover:bg-brand-dark hover:border-brand-dark',
  secondary:
    'bg-white text-ink border border-slate-200 hover:border-brand hover:text-brand',
  ghost:
    'bg-transparent text-ink border border-transparent hover:bg-surface-subtle',
  danger:
    'bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300',
};

const SIZE_STYLES = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  isLoading = false,
  disabled = false,
  className = '',
  onClick,
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center gap-2 font-medium rounded-sm
        transition-colors duration-200 ease-smooth
        disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANT_STYLES[variant]} ${SIZE_STYLES[size]} ${className}
      `}
      {...rest}
    >
      {isLoading && (
        // Inline spinner — no separate import needed for a one-off SVG this small.
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
