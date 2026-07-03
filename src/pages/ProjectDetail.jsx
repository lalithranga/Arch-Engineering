import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import ImageCarousel from '../components/ui/ImageCarousel.jsx';
import { Badge, Spinner, EmptyState } from '../components/ui/Card.jsx';
import { useProject } from '../hooks/useProject.js';
import { formatMonthYear } from '../utils/formatters.js';

/**
 * ProjectDetail.jsx
 * ----------------------------------------------------------------------
 * Dedicated page for a single project, in the style of a corporate
 * portfolio site: hero gallery, then a 4-box fact grid (Client /
 * Completion Date / Location / Project Manager), then the full
 * description, then a photo gallery grid below.
 *
 * Route: /projects/:id  (registered in App.jsx)
 *
 * All four fact-grid fields are OPTIONAL on the projects table — a box
 * is simply skipped if that field is empty, rather than showing "N/A",
 * since not every project will have a named client or PM on record.
 * ----------------------------------------------------------------------
 */
export default function ProjectDetail() {
  const { id } = useParams();
  const { project, isLoading, error } = useProject(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <Spinner label="Loading project…" />
        <Footer />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <EmptyState
          tone="error"
          title="Couldn't find this project."
          description="It may have been removed, or the link is incorrect."
        />
        <Footer />
      </div>
    );
  }

  const { title, category, location, status, description, client, completion_date, project_manager, imageUrls, created_at } = project;

  // Only render fact-grid boxes that actually have data — see file header note.
  const factBoxes = [
    client && { label: 'Client', value: client },
    completion_date && { label: 'Completion Date', value: completion_date },
    { label: 'Location', value: location }, // always present, required field
    project_manager && { label: 'Project Manager', value: project_manager },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* --- Hero gallery --- */}
      {/* Hero image — fixed height, never fills the whole screen */}
      <div className="relative w-full overflow-hidden bg-surface-subtle" style={{ height: '420px' }}>
        <ImageCarousel images={imageUrls ?? []} alt={title} />
      </div>

      <div className="max-w-content mx-auto px-6 py-12 md:px-10 md:py-16">
        <Link
          to="/projects"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-brand transition-colors"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          Back to Projects
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <Badge tone="brand">{category}</Badge>
          {status === 'ongoing' && <Badge tone="sage">Ongoing</Badge>}
        </div>

        <h1 className="mt-4 font-display text-3xl font-semibold text-ink md:text-4xl">{title}</h1>

        <div className="mt-2 flex items-center gap-1.5 text-sm text-ink-faint">
          <MapPin className="h-4 w-4" strokeWidth={1.75} />
          {location} <span aria-hidden="true">·</span> Added {formatMonthYear(created_at)}
        </div>

        {/* --- Fact grid (Client / Completion Date / Location / Project Manager) --- */}
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {factBoxes.map((box) => (
            <div key={box.label} className="rounded-sm border border-slate-200 bg-surface-subtle p-5">
              <dt className="text-xs font-semibold uppercase tracking-wide text-ink-faint">{box.label}</dt>
              <dd className="mt-1.5 text-sm font-medium text-ink">{box.value}</dd>
            </div>
          ))}
        </div>

        {/* --- Description --- */}
        <div className="mt-10 max-w-3xl">
          <p className="text-base leading-relaxed text-ink-soft whitespace-pre-line">{description}</p>
        </div>

        {/* --- Gallery grid (below the hero carousel — same images, grid layout) --- */}
        {imageUrls && imageUrls.length > 1 && (
          <div className="mt-12">
            <h2 className="mb-4 font-display text-xl font-semibold text-ink">Gallery</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {imageUrls.map((url, index) => (
                <div key={url} className="aspect-square overflow-hidden rounded-sm bg-surface-subtle">
                  <img
                    src={url}
                    alt={`${title} — photo ${index + 1}`}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 ease-smooth hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}