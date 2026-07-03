/**
 * Section.jsx
 * ----------------------------------------------------------------------
 * Every public-page section (Hero excluded, since it has bespoke full-
 * bleed styling) wraps its content in this component. It is the ONE
 * place that owns:
 *   - vertical rhythm (py-16 / py-24, via the .section-padding class)
 *   - horizontal max-width + gutters
 *   - optional alternating background (white vs subtle off-white)
 *   - the eyebrow + heading + subheading pattern used across the page
 *
 * This is what makes the "modular, scalable, easy to convert into a
 * multi-page site" requirement real: turning the homepage into
 * `/projects`, `/about`, etc. later just means moving each <Section>
 * into its own page file — the section itself doesn't change.
 * ----------------------------------------------------------------------
 */
export default function Section({
  id,
  eyebrow,
  title,
  subtitle,
  tinted = false,
  children,
  className = '',
}) {
  return (
    <section
      id={id}
      className={`section-padding ${tinted ? 'bg-surface-subtle' : 'bg-white'} ${className}`}
    >
      <div className="max-w-content mx-auto px-6 md:px-10">
        {(eyebrow || title) && (
          <div className="mb-12 max-w-2xl">
            {eyebrow && (
              <p className="blueprint-mark mb-3 inline-block pl-3 text-xs font-semibold uppercase tracking-[0.15em] text-brand">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="text-3xl font-semibold leading-tight md:text-4xl">{title}</h2>
            )}
            {subtitle && <p className="mt-4 text-base leading-relaxed text-ink-soft">{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
