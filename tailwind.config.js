/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // --- Design system: "Modern Construction" palette ---
        // Named tokens instead of raw hex scattered through components.
        // Swap these 6 values later and the whole site re-themes.
        brand: {
          DEFAULT: '#15803D', // primary deep emerald — CTAs, active states, links
          dark: '#166534',     // forest green — hover states, headers on dark sections
          light: '#DCFCE7',    // pale mint — subtle backgrounds, badges
        },
        sage: {
          DEFAULT: '#A8B5A2', // muted sage accent — dividers, secondary icons
          light: '#E8ECE5',
        },
        ink: {
          DEFAULT: '#1E293B', // slate-800 — primary body/heading text
          soft: '#475569',    // slate-600 — secondary text
          faint: '#94A3B8',   // slate-400 — captions, placeholders
        },
        surface: {
          DEFAULT: '#FFFFFF', // pure white — primary background
          subtle: '#F8FAFC',  // near-white — section alternation, cards
        },
      },
      fontFamily: {
        // Display: a confident, slightly architectural serif/sans for headings.
        // Body: a neutral, highly-legible sans for paragraphs and UI.
        display: ['"Fraunces"', '"Georgia"', 'serif'],
        body: ['"Inter"', '"Helvetica Neue"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      maxWidth: {
        content: '1280px',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(30 41 59 / 0.04), 0 4px 12px -2px rgb(30 41 59 / 0.06)',
        'card-hover': '0 4px 8px 0 rgb(30 41 59 / 0.06), 0 12px 24px -4px rgb(30 41 59 / 0.10)',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};
