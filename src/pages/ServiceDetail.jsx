import { useParams, Navigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import Section from '../components/layout/Section.jsx';
import { SERVICES } from '../utils/constants.js';

/**
 * ServiceDetail.jsx
 * ----------------------------------------------------------------------
 * One template, four pages — one per entry in SERVICES (see
 * utils/constants.js and the route registered in App.jsx as
 * /services/:slug). Adding a 5th service later means adding one entry
 * to SERVICES — this file never changes.
 *
 * If the slug in the URL doesn't match any known service (typo, stale
 * link), redirects to the first service rather than showing a dead end.
 * ----------------------------------------------------------------------
 */
export default function ServiceDetail() {
  const { slug } = useParams();
  const service = SERVICES.find((s) => s.slug === slug);

  if (!service) {
    return <Navigate to={`/services/${SERVICES[0].slug}`} replace />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <Section eyebrow="Our Services" title={service.title} subtitle={service.summary}>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-3xl">
          {service.details.map((detail) => (
            <li key={detail} className="flex items-start gap-2.5 text-base text-ink-soft">
              <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0 text-brand" strokeWidth={1.75} />
              <span>{detail}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Footer />
    </div>
  );
}
