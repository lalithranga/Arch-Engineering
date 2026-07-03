/**
 * formatters.js
 * Small, pure display-formatting helpers. Keeping these out of components
 * means the same date/text rules are applied consistently everywhere
 * (e.g. AdminDashboard's table and Home's project grid won't drift apart).
 */

/** "2026-03-01T00:00:00Z" -> "March 2026" (used on project cards) */
export function formatMonthYear(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/** "2026-03-01T00:00:00Z" -> "Mar 1, 2026" (used in admin tables — denser) */
export function formatShortDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Truncate long descriptions for card previews: "Lorem ipsum dolor..." */
export function truncateText(text, maxLength = 140) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}

/** Turns "full_time" -> "Full Time" for displaying employment_type nicely. */
export function formatEnumLabel(value) {
  if (!value) return '';
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
