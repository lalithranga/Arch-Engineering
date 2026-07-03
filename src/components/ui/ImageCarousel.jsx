import { useEffect, useState, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';

const AUTO_ROTATE_INTERVAL_MS = 4500;

/**
 * ImageCarousel.jsx
 * ----------------------------------------------------------------------
 * Generic image carousel: auto-rotates on a timer AND supports manual
 * arrow navigation + dot indicators. Used inside ProjectCard for the
 * multi-image gallery, but deliberately has no knowledge of "projects"
 * or Supabase — it just takes a plain array of image URLs, which keeps
 * it reusable anywhere else a rotating image set is needed later.
 *
 * Behavior:
 *   - Auto-advances every 4.5s
 *   - Pauses auto-advance while the user is hovering/interacting
 *   - Manual prev/next arrows always available (appear on hover on desktop,
 *     always visible on touch devices since there's no hover state)
 *   - Dot indicators show position and are clickable to jump to a slide
 *   - Falls back to a quiet placeholder if the array is empty
 * ----------------------------------------------------------------------
 */
export default function ImageCarousel({ images = [], alt = '' }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const goToNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goToPrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Auto-rotation timer — restarts whenever activeIndex changes (so a
  // manual click resets the countdown rather than fighting the timer)
  // and pauses entirely while isPaused is true.
  useEffect(() => {
    if (images.length <= 1 || isPaused) return;

    timerRef.current = setTimeout(goToNext, AUTO_ROTATE_INTERVAL_MS);
    return () => clearTimeout(timerRef.current);
  }, [activeIndex, isPaused, images.length, goToNext]);

  if (images.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-ink-faint">
        <ImageOff className="h-6 w-6" strokeWidth={1.5} />
        <span className="text-xs">Image unavailable</span>
      </div>
    );
  }

  // Single image: skip all carousel chrome (arrows/dots) but still use
  // absolute positioning so it fills the container correctly — the same
  // technique the multi-image path uses. The old "h-full w-full" approach
  // only works when every parent element in the chain has an explicit
  // height, which isn't always guaranteed; "absolute inset-0" always works.
  if (images.length === 1) {
    return (
      <div className="relative h-full w-full overflow-hidden">
        <img
          src={images[0]}
          alt={alt}
          loading="eager"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className="group relative h-full w-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides — all rendered, opacity-crossfaded, so there's no layout
          shift or flash-of-broken-image while the next slide loads. */}
      {images.map((url, index) => (
        <img
          key={url}
          src={url}
          alt={`${alt} — photo ${index + 1} of ${images.length}`}
          loading={index === 0 ? 'eager' : 'lazy'}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-smooth ${
            index === activeIndex ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}

      {/* Manual arrows — visible on hover (desktop) or always (touch has no hover) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          goToPrev();
        }}
        aria-label="Previous photo"
        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5
          text-ink opacity-0 transition-opacity duration-200 ease-smooth
          group-hover:opacity-100 focus-visible:opacity-100 sm:opacity-0"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={2} />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          goToNext();
        }}
        aria-label="Next photo"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5
          text-ink opacity-0 transition-opacity duration-200 ease-smooth
          group-hover:opacity-100 focus-visible:opacity-100 sm:opacity-0"
      >
        <ChevronRight className="h-4 w-4" strokeWidth={2} />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
        {images.map((url, index) => (
          <button
            key={url}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveIndex(index);
            }}
            aria-label={`Go to photo ${index + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ease-smooth ${
              index === activeIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
}