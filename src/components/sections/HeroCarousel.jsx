import { useEffect, useState } from 'react';

const AUTO_ROTATE_INTERVAL_MS = 5000;

/**
 * HeroCarousel.jsx
 * ----------------------------------------------------------------------
 * Full-bleed background image rotator for the Hero section ONLY. This is
 * intentionally a separate, simpler component from
 * components/ui/ImageCarousel.jsx (which is used for project cards and
 * has arrows + dot indicators + pause-on-hover) — a hero background
 * should never be manually navigable or pause when a visitor's cursor
 * happens to be over the page, it should just quietly rotate forever.
 *
 * HOW TO CHANGE THE PHOTOS:
 *   Edit the `images` array passed in from Hero.jsx (see that file) —
 *   this component itself never needs to change for a new photo set.
 * ----------------------------------------------------------------------
 */
export default function HeroCarousel({ images = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, AUTO_ROTATE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {images.map((src, index) => (
        <img
          key={src}
          src={src}
          alt="" // decorative background — the real content is the heading/text on top
          aria-hidden="true"
          loading={index === 0 ? 'eager' : 'lazy'}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-smooth ${
            index === activeIndex ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}

      {/* Dark overlay so white heading text stays readable against any photo.
          A flat semi-transparent slate tone, not a gradient — matches the
          "no cheap gradients" rule from the design spec. */}
      <div className="absolute inset-0 bg-ink/65" />
    </div>
  );
}
