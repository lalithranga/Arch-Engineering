import { useParams, Navigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import Section from '../components/layout/Section.jsx';
import { ABOUT_PAGES } from '../utils/constants.js';

/**
 * AboutDetail.jsx
 * ----------------------------------------------------------------------
 * One template, three pages: /about/company-in-brief, /about/vision-mission,
 * /about/core-values (see ABOUT_PAGES in utils/constants.js and the route
 * registered in App.jsx as /about/:slug). Adding a 4th "About" page later
 * means adding one entry to ABOUT_PAGES — this file never changes.
 *
 * If the slug in the URL doesn't match any known page (typo, stale link),
 * redirects to the first About page rather than showing a dead end.
 * ----------------------------------------------------------------------
 */
export default function AboutDetail() {
  const { slug } = useParams();
  const page = ABOUT_PAGES.find((p) => p.slug === slug);

  if (!page) {
    return <Navigate to={`/about/${ABOUT_PAGES[0].slug}`} replace />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <Section eyebrow="About Us" title={page.title} subtitle={page.summary}>
        <div className="max-w-3xl flex flex-col gap-5">
          {page.body.map((paragraph, index) => (
            <p key={index} className="text-base leading-relaxed text-ink-soft whitespace-pre-line">
              {paragraph}
            </p>
          ))}
        </div>
      </Section>

      <Footer />
    </div>
  );
}
