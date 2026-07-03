import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import Section from '../components/layout/Section.jsx';
import Hero from '../components/sections/Hero.jsx';
import ProjectCard from '../components/sections/ProjectCard.jsx';
import NewsCard from '../components/sections/NewsCard.jsx';
import { Spinner, EmptyState } from '../components/ui/Card.jsx';
import { useProjects } from '../hooks/useProjects.js';
import { useNews } from '../hooks/useNews.js';
import { ShieldCheck, HardHat, Compass } from 'lucide-react';
import { COMPANY_NAME, MAX_FEATURED_PROJECTS } from '../utils/constants.js';

/**
 * Home.jsx
 * ----------------------------------------------------------------------
 * The public homepage: Hero → Identity → Featured Projects → News &
 * Media. Careers and Contact are NOT included here — Careers has been
 * removed from the app entirely, and Contact is a standalone page
 * reachable via the navbar.
 *
 * Featured Projects shows ONLY Ongoing projects (Completed no longer
 * appears on the homepage at all), capped at MAX_FEATURED_PROJECTS (8),
 * 4 per row on desktop. The full archive — both Ongoing and Completed,
 * uncapped — lives on the dedicated /projects page (AllProjects.jsx),
 * linked via "View All Projects" below and via the navbar's "Projects" link.
 * ----------------------------------------------------------------------
 */
export default function Home() {
  const { projects, isLoading: projectsLoading, error: projectsError } = useProjects();
  const { posts, isLoading: newsLoading, error: newsError } = useNews();

  // Featured projects — admin-selected via the "Feature on homepage" checkbox
  // in the admin form. Can be from either Ongoing OR Completed projects.
  // Capped at MAX_FEATURED_PROJECTS (8) in case more than 8 are marked featured.
  const featuredProjects = projects
    .filter((p) => p.is_featured)
    .slice(0, MAX_FEATURED_PROJECTS);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />

      {/* --- Corporate Identity: Mission / Vision --- */}
      <Section
        id="about"
        eyebrow="Who We Are"
        title="Built on three commitments"
        subtitle={`Every project ${COMPANY_NAME} takes on is measured against the same standard, regardless of size or sector.`}
      >
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          {[
            {
              icon: HardHat,
              title: 'Craftsmanship',
              copy: 'Every detail is executed to spec, inspected, and signed off — no shortcuts that show up later.',
            },
            {
              icon: ShieldCheck,
              title: 'Safety First',
              copy: 'Rigorous site protocols and training keep every crew, client, and site visitor safe.',
            },
            {
              icon: Compass,
              title: 'On-Schedule Delivery',
              copy: 'Transparent project management means clients always know exactly where their build stands.',
            },
          ].map(({ icon: Icon, title, copy }) => (
            <div key={title} className="flex flex-col gap-3">
              <Icon className="h-7 w-7 text-brand" strokeWidth={1.5} />
              <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
              <p className="text-sm leading-relaxed text-ink-soft">{copy}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* --- Featured Projects (Ongoing only, max 8, 4 per row) --- */}
      <Section
        id="projects"
        tinted
        eyebrow="Our Work"
        title="Featured Projects"
        subtitle="A look at the work currently underway."
      >
        {projectsLoading && <Spinner label="Loading projects…" />}

        {!projectsLoading && projectsError && (
          <EmptyState
            tone="error"
            title="Couldn't load projects right now."
            description="Please refresh the page. If this keeps happening, the team has been notified."
          />
        )}

        {!projectsLoading && !projectsError && featuredProjects.length === 0 && (
          <EmptyState
            title="No featured projects yet."
            description="Mark projects as featured in the admin panel to show them here."
          />
        )}

        {!projectsLoading && !projectsError && featuredProjects.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand-dark transition-colors"
          >
            View All Projects
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Section>

      {/* --- News & Media --- */}
      <Section
        id="news"
        eyebrow="Latest Updates"
        title="News & Media"
        subtitle="Announcements, milestones, and updates from our team."
      >
        {newsLoading && <Spinner label="Loading news…" />}

        {!newsLoading && newsError && (
          <EmptyState tone="error" title="Couldn't load news right now." description="Please refresh the page." />
        )}

        {!newsLoading && !newsError && posts.length === 0 && (
          <EmptyState title="No news posted yet." description="Check back soon for updates." />
        )}

        {!newsLoading && !newsError && posts.length > 0 && (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <NewsCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </Section>

      <Footer />
    </div>
  );
}