import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import Section from '../components/layout/Section.jsx';
import ProjectCard from '../components/sections/ProjectCard.jsx';
import { Spinner, EmptyState } from '../components/ui/Card.jsx';
import { useProjects } from '../hooks/useProjects.js';

/**
 * AllProjects.jsx
 * ----------------------------------------------------------------------
 * The full project archive — reachable by clicking "Projects" in the
 * navbar. Unlike the homepage's featured grid (capped at
 * MAX_FEATURED_PROJECTS, Ongoing only), this page shows EVERY project,
 * split into two child sections: "Ongoing Projects" and "Completed
 * Projects" — no cap on either.
 * ----------------------------------------------------------------------
 */
export default function AllProjects() {
  const { projects, isLoading, error } = useProjects();

  const ongoingProjects = projects.filter((p) => p.status === 'ongoing');
  const completedProjects = projects.filter((p) => p.status !== 'ongoing');

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <Section eyebrow="Our Work" title="Projects" subtitle="A complete record of our ongoing and completed work.">
        {isLoading && <Spinner label="Loading projects…" />}

        {!isLoading && error && (
          <EmptyState
            tone="error"
            title="Couldn't load projects right now."
            description="Please refresh the page. If this keeps happening, the team has been notified."
          />
        )}

        {!isLoading && !error && (
          <div className="flex flex-col gap-16">
            {/* --- Child heading: Ongoing Projects --- */}
            <div>
              <h3 className="mb-6 font-display text-xl font-semibold text-ink border-b border-slate-100 pb-3">
                Ongoing Projects
              </h3>
              <ProjectGrid projects={ongoingProjects} emptyLabel="No ongoing projects right now." />
            </div>

            {/* --- Child heading: Completed Projects --- */}
            <div>
              <h3 className="mb-6 font-display text-xl font-semibold text-ink border-b border-slate-100 pb-3">
                Completed Projects
              </h3>
              <ProjectGrid projects={completedProjects} emptyLabel="No completed projects published yet." />
            </div>
          </div>
        )}
      </Section>

      <Footer />
    </div>
  );
}

function ProjectGrid({ projects, emptyLabel }) {
  if (projects.length === 0) {
    return <EmptyState title={emptyLabel} description="Check back soon — new work is added regularly." />;
  }

  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
