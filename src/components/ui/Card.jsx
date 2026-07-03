/**
 * Card.jsx — generic content container used for project cards, news
 * listings, and admin dashboard panels. Keeping shadow/border/radius
 * rules in one place keeps every "card-like" surface visually consistent.
 */
export function Card({ children, className = '', hoverable = false }) {
  return (
    <div
      className={`
        bg-white border border-slate-100 rounded-sm shadow-card
        ${hoverable ? 'transition-shadow duration-300 ease-smooth hover:shadow-card-hover' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

/** Small pill label — e.g. project category ("Commercial") or job type ("Full Time"). */
export function Badge({ children, tone = 'brand' }) {
  const TONE_STYLES = {
    brand: 'bg-brand-light text-brand-dark',
    sage: 'bg-sage-light text-ink-soft',
    neutral: 'bg-surface-subtle text-ink-soft border border-slate-200',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${TONE_STYLES[tone]}`}
    >
      {children}
    </span>
  );
}

/** Centered loading spinner — used by every hook-driven section while data loads. */
export function Spinner({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink-faint">
      <svg className="animate-spin h-7 w-7 text-brand" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
        <path
          className="opacity-90"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      <p className="text-sm">{label}</p>
    </div>
  );
}

/**
 * Empty/error state — shown when a hook returns zero rows or an error.
 * Per the design-system writing rules: explain what happened, in plain
 * terms, without apologizing.
 */
export function EmptyState({ title, description, tone = 'neutral' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <p className={`text-sm font-medium ${tone === 'error' ? 'text-red-600' : 'text-ink-soft'}`}>
        {title}
      </p>
      {description && <p className="text-sm text-ink-faint max-w-sm">{description}</p>}
    </div>
  );
}
