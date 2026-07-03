import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { Card, Badge } from '../ui/Card.jsx';
import ImageCarousel from '../ui/ImageCarousel.jsx';
import { truncateText } from '../../utils/formatters.js';

/**
 * ProjectCard.jsx
 * ----------------------------------------------------------------------
 * Pure presentational component — receives a project object that ALREADY
 * has a resolved `imageUrls` array (signed URLs, cover image first, then
 * gallery images) produced upstream by useProjects. This component never
 * talks to Supabase directly, which is what keeps it reusable in any
 * context (the public grid here, or later an admin preview) without
 * duplicating the signing logic.
 *
 * The whole card links to /projects/:id (see ProjectDetail.jsx + the
 * route registered in App.jsx) for the full Client/Date/Manager/gallery
 * view — clicking anywhere on the card except the carousel's own arrow
 * buttons navigates there (the carousel's buttons call stopPropagation
 * internally so dragging through photos doesn't accidentally navigate).
 * ----------------------------------------------------------------------
 */
export default function ProjectCard({ project }) {
  const { id, title, category, location, status, description, imageUrls } = project;

  return (
    <Link to={`/projects/${id}`} className="group block">
      <Card hoverable className="overflow-hidden flex flex-col h-full">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-subtle">
          <ImageCarousel images={imageUrls ?? []} alt={title} />
          <div className="absolute left-3 top-3 z-10 flex gap-2">
            <Badge tone="brand">{category}</Badge>
            {status === 'ongoing' && <Badge tone="sage">Ongoing</Badge>}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2 p-6">
          <h3 className="font-display text-lg font-semibold text-ink group-hover:text-brand-dark transition-colors">
            {title}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-ink-faint">
            <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} />
            {location}
          </div>

          <p className="mt-1 text-sm leading-relaxed text-ink-soft">
            {truncateText(description, 120)}
          </p>
        </div>
      </Card>
    </Link>
  );
}
