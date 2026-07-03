import { Calendar, ImageOff } from 'lucide-react';
import { Card } from '../ui/Card.jsx';
import { formatMonthYear, truncateText } from '../../utils/formatters.js';

/**
 * NewsCard.jsx
 * ----------------------------------------------------------------------
 * Presentational card for one News & Media post. Handles the text-only
 * case gracefully (no image_path) by simply not rendering an image
 * region at all, rather than showing an empty/broken placeholder —
 * unlike ProjectCard, where every project is expected to have a cover
 * photo, a news post legitimately may not have one.
 * ----------------------------------------------------------------------
 */
export default function NewsCard({ post }) {
  const { title, summary, imageUrl, image_path, published_at } = post;
  const hasImage = Boolean(image_path);

  return (
    <Card hoverable className="overflow-hidden flex flex-col h-full">
      {hasImage && (
        <div className="aspect-[16/9] w-full overflow-hidden bg-surface-subtle">
          {imageUrl ? (
            <img src={imageUrl} alt={title} loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-ink-faint">
              <ImageOff className="h-6 w-6" strokeWidth={1.5} />
            </div>
          )}
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2 p-6">
        <div className="flex items-center gap-1.5 text-xs text-ink-faint">
          <Calendar className="h-3.5 w-3.5" strokeWidth={1.75} />
          {formatMonthYear(published_at)}
        </div>
        <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
        <p className="text-sm leading-relaxed text-ink-soft">{truncateText(summary, 140)}</p>
      </div>
    </Card>
  );
}
