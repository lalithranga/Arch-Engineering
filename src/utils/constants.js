/**
 * constants.js
 * App-wide static values. Centralized so e.g. adding a new project
 * category updates the filter UI, the admin form dropdown, AND any
 * validation in one edit instead of three.
 */

// ============================================================================
// COMPANY INFO — Arch Engineering Pvt Ltd (sourced from their public
// Facebook Page). EDIT THESE if any detail changes.
// ============================================================================
export const COMPANY_NAME = 'Arch Engineering Pvt Ltd';
export const COMPANY_TAGLINE = 'Over 15 years of experience in the construction industry.';
export const COMPANY_ADDRESS = 'No 6/8/17, Samadhi Mawatha, Kalagedihena, 11875, Sri Lanka';
export const COMPANY_PHONE = '+94 77 119 0460';
export const COMPANY_EMAIL = 'archengineering20@gmail.com';

// ============================================================================
// ABOUT US — each entry becomes its OWN page at /about/:slug (see
// pages/AboutDetail.jsx + the route registered in App.jsx). The Navbar's
// "About Us" dropdown is generated FROM this array, so adding a 4th
// "About" page later is a one-item addition here, nothing else.
// ============================================================================
export const ABOUT_PAGES = [
  {
    slug: 'company-in-brief',
    title: 'Company in Brief',
    summary: `${COMPANY_NAME} has over 15 years of experience in the construction industry, delivering building, residential, and infrastructure projects with a focus on quality and reliability.`,
    body: [
      `${COMPANY_NAME} is a Sri Lanka-based construction company with more than 15 years of experience delivering projects across the building, residential, and infrastructure sectors.`,
      'Our team combines hands-on site experience with structured project management, allowing us to take on work ranging from individual residential builds to larger commercial and civil engineering contracts.',
      'Over the years, we have built a reputation for consistency — delivering what we commit to, on the timelines we agree to, without compromising on workmanship.',
    ],
  },
  {
    slug: 'vision-mission',
    title: 'Vision & Mission',
    summary: 'Our vision and mission guide how we plan, build, and grow as a company.',
    body: [
      'Vision: To be a trusted name in Sri Lankan construction, recognized for the quality and durability of the structures we build.',
      'Mission: To deliver every project — regardless of scale — with technical precision, transparent communication, and a commitment to safety, while continuing to grow our team\u2019s expertise across construction, design, and engineering disciplines.',
    ],
  },
  {
    slug: 'core-values',
    title: 'Core Values',
    summary: 'The principles that shape how we work, every day, on every site.',
    body: [
      'Quality: We hold every stage of construction to a consistent standard, from foundation to finishing.',
      'Safety: Every site we operate on follows strict health and safety protocols to protect our workforce and the public.',
      'Integrity: We are transparent with clients about costs, timelines, and any challenges that arise during a project.',
      'Accountability: We take ownership of our work and stand behind it after handover.',
    ],
  },
];

// ============================================================================
// SERVICES — each entry becomes its OWN page at /services/:slug (see
// pages/ServiceDetail.jsx). The Navbar's "Services" dropdown is generated
// FROM this array, same pattern as ABOUT_PAGES above.
// ============================================================================
export const SERVICES = [
  {
    slug: 'construction-project-execution',
    title: 'Construction & Project Execution',
    summary:
      'Full-scope contracting for building, civil, and infrastructure works — from site mobilization through to handover.',
    details: [
      'Site mobilization, temporary works, and construction sequencing',
      'Structural and finishing works for residential, commercial, and industrial buildings',
      'Quality control and HSE (Health, Safety & Environment) compliance throughout execution',
      'Subcontractor coordination and progress reporting against the master programme',
    ],
  },
  {
    slug: 'architectural-structural-design',
    title: 'Architectural & Structural Design',
    summary:
      'Concept-to-construction design services, balancing architectural intent with structural feasibility and buildability.',
    details: [
      'Architectural concept design, space planning, and elevations',
      'Structural design and analysis (RC, steel, and composite systems)',
      'Working drawings and construction documentation',
      'Design coordination with MEP (Mechanical, Electrical & Plumbing) services',
    ],
  },
  {
    slug: 'consultancy-services',
    title: 'Consultancy Services',
    summary:
      'Independent engineering and project advisory support for clients at any stage of the project lifecycle.',
    details: [
      'Feasibility studies and constructability reviews',
      'Project planning, scheduling, and risk assessment',
      'Site supervision and contract administration',
      'Technical due diligence for property and investment decisions',
    ],
  },
  {
    slug: 'quantity-surveying-cost-estimation',
    title: 'Quantity Surveying & Cost Estimation',
    summary:
      'Accurate quantity take-off and cost control services to keep projects financially on track from tender to completion.',
    details: [
      'Bill of Quantities (BOQ) preparation and tender documentation',
      'Detailed quantity take-off and material measurement',
      'Cost estimation, budgeting, and value engineering',
      'Interim valuations, variation assessment, and final account preparation',
    ],
  },
];

// ============================================================================
// PUBLIC NAV — order matters: Home, About Us, Projects, Services,
// News & Media, Contact. "About Us" and "Services" are dropdowns built
// FROM the ABOUT_PAGES / SERVICES arrays above, each child linking to
// its own real route (/about/:slug, /services/:slug) rather than an
// anchor — so adding/removing a page there automatically updates the
// dropdown here too.
// ============================================================================
export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  {
    label: 'About Us',
    href: `/about/${ABOUT_PAGES[0].slug}`,
    children: ABOUT_PAGES.map((page) => ({ label: page.title, href: `/about/${page.slug}` })),
  },
  { label: 'Projects', href: '/projects' },
  {
    label: 'Services',
    href: `/services/${SERVICES[0].slug}`,
    children: SERVICES.map((service) => ({ label: service.title, href: `/services/${service.slug}` })),
  },
  { label: 'News & Media', href: '#news' },
  { label: 'Contact', href: '/contact' },
];

// Footer keeps a SHORT, separate link list (just these three, plus the
// address) rather than mirroring the full nav.
export const FOOTER_LINKS = [
  { label: 'Contact Us', href: '/contact' },
  { label: 'News & Media', href: '#news' },
  { label: 'Projects', href: '/projects' },
];

// Used by: the project filter pills on Home.jsx AND the "Category" select
// in the admin "Add/Edit Project" form — keep this list as the one source.
export const PROJECT_CATEGORIES = [
  'Buildings',
  'Residential',
  'Commercial',
  'Roads & Highways',
  'Bridges',
  'Water Supply & Irrigation',
];

// Drives the Ongoing/Completed split on the public Projects pages and
// the status dropdown in the admin Project form.
export const PROJECT_STATUSES = [
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
];

// Homepage shows ONLY Ongoing projects (per spec — Completed no longer
// appears on the homepage at all), capped at this count, 4 per row.
// The full archive — BOTH Ongoing and Completed, uncapped — lives on the
// dedicated /projects page (see pages/AllProjects.jsx).
export const MAX_FEATURED_PROJECTS = 8;

export const EMPLOYMENT_TYPES = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'apprenticeship', label: 'Apprenticeship' },
];

// Admin dashboard left-nav panel identifiers — see pages/AdminDashboard.jsx
// NOTE: Careers has been removed entirely (no admin panel, no public page).
export const ADMIN_PANELS = {
  PROJECTS: 'projects',
  NEWS: 'news',
};
