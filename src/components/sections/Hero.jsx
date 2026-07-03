import { ArrowRight } from 'lucide-react';
import Button from '../ui/Button.jsx';
import HeroCarousel from './HeroCarousel.jsx';
import { COMPANY_TAGLINE } from '../../utils/constants.js';

// ============================================================================
// HERO BACKGROUND PHOTOS — EDIT THIS ARRAY TO CHANGE THE CAROUSEL IMAGES
// ============================================================================
// Put exactly 5 image files in /public/hero/ (create that folder if it
// doesn't exist) and list their filenames here. Paths starting with "/"
// are served from the /public folder automatically by Vite — no import
// statement needed, no Supabase involved, since this is a static design
// asset rather than admin-editable content.
//
// Recommended: real landscape photos (construction sites, finished
// buildings, crews at work), each roughly 1920x1080 or larger, optimized
// to under ~300KB each so the hero loads fast.
// ----------------------------------------------------------------------
const HERO_IMAGES = [
  '/hero/hero-1.jpg',
  '/hero/hero-2.jpg',
  '/hero/hero-3.jpg',
  '/hero/hero-4.jpg',
  '/hero/hero-5.jpg',
];

/**
 * Hero.jsx
 * ----------------------------------------------------------------------
 * The page's thesis statement: a full-bleed rotating photo background
 * (see HERO_IMAGES above) with the heading, subtext, and stat row layered
 * on top in white/light text against a dark overlay for contrast.
 *
 * NOTE: "Request a Quote" CTA was intentionally removed per spec — the
 * only call-to-action here is "View Our Work", which scrolls to the
 * Projects section. The Contact section further down the page remains
 * the place visitors reach out, just without a hero-level sales push.
 * ----------------------------------------------------------------------
 */
export default function Hero() {
  return (
    <section id="top" className="relative isolate overflow-hidden bg-ink">
      <HeroCarousel images={HERO_IMAGES} />

      <div className="relative z-10 max-w-content mx-auto flex flex-col items-start gap-8 px-6 py-24 md:px-10 md:py-32">
        <p className="blueprint-mark inline-block pl-3 text-xs font-semibold uppercase tracking-[0.15em] text-brand-light">
          Construction Company
        </p>

        <h1 className="max-w-3xl font-display text-4xl font-semibold leading-[1.1] tracking-tight text-white md:text-6xl">
          Building structures that outlast the blueprint.
        </h1>

        <p className="max-w-xl text-lg leading-relaxed text-slate-200">{COMPANY_TAGLINE}</p>

        <Button size="lg" onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}>
          View Our Work
          <ArrowRight className="h-4 w-4" />
        </Button>

        {/* Quiet stat row — real numbers carry more weight than a slogan would here. */}
        <dl className="mt-6 grid grid-cols-2 gap-8 border-t border-white/20 pt-8 sm:grid-cols-3 sm:gap-16">
          <div>
            <dt className="text-sm text-slate-300">Years of Experience</dt>
            <dd className="font-display text-2xl font-semibold text-white">15+</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-300">Industry</dt>
            <dd className="font-display text-2xl font-semibold text-white">Construction</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
