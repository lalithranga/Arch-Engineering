import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, HardHat, ChevronDown } from 'lucide-react';
import { NAV_LINKS, COMPANY_NAME } from '../../utils/constants.js';
import SmartLink from './SmartLink.jsx';

/**
 * Navbar.jsx
 * ----------------------------------------------------------------------
 * Sticky top nav, shared across every page (Home, About, Projects,
 * Services, Contact, ProjectDetail). Two kinds of link, handled differently:
 *
 *   1. HASH ANCHORS (href starts with "#", e.g. "#projects", "#about")
 *      — these only make sense on the homepage, since that's the only
 *      page with those section ids. If we're already on "/", a plain
 *      <a href="#projects"> just scrolls. If we're on another page
 *      (e.g. "/contact"), clicking one of these needs to navigate BACK
 *      to "/" first and then scroll — so it's rendered as a router
 *      <Link to={`/${href}`}> instead of a plain anchor in that case.
 *
 *   2. REAL ROUTES (href starts with "/", e.g. "/services", "/contact")
 *      — always a router <Link>, full stop.
 *
 * This distinction lives in SmartLink.jsx (shared with Footer.jsx) so the
 * dropdown/mobile rendering code here doesn't need to duplicate the logic.
 *
 * Supports one level of dropdown (About Us, Services) via the optional
 * `children` array on a NAV_LINKS entry — see utils/constants.js.
 *
 * IMPORTANT — dropdown hover fix:
 * The trigger link and its dropdown menu have a visual gap between them
 * (the dropdown sits a few pixels below the trigger). If onMouseEnter/
 * onMouseLeave are attached only to the trigger <li>, moving the mouse
 * down into the dropdown crosses that gap and onMouseLeave fires before
 * the click registers — the dropdown closes right as you try to click
 * an item. The fix: the dropdown menu is rendered as a DIRECT SIBLING
 * inside the SAME hoverable wrapper, with NO margin-based gap between
 * trigger and menu (padding-top on the menu itself creates the visual
 * spacing instead) — so the mouse never actually leaves the hoverable
 * area while moving from the trigger into the menu.
 * ----------------------------------------------------------------------
 */
export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null); // desktop: which dropdown is open
  const [openMobileSubmenu, setOpenMobileSubmenu] = useState(null); // mobile: which submenu is expanded

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100">
      <nav className="max-w-content mx-auto flex items-center justify-between px-6 py-4 md:px-10">
    <Link to="/" className="flex items-center gap-2">
  <img
    src="/logo.jpg"
    alt="Arch Engineering"
    className="h-8 w-8 object-contain md:h-10 md:w-10"
  />
  <div className="flex flex-col leading-tight">
    <span className="font-display text-sm font-bold tracking-tight text-ink md:text-lg">
      ARCH
    </span>
    <span className="text-[10px] font-medium tracking-wider text-ink-soft uppercase md:text-xs md:tracking-widest">
      Engineering Pvt Ltd
    </span>
  </div>
</Link>

        {/* Desktop links — hidden below md, rigid mobile-first pattern */}
        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <li
              key={link.label}
              className="relative"
              onMouseEnter={() => link.children && setOpenDropdown(link.label)}
              onMouseLeave={() => link.children && setOpenDropdown(null)}
            >
              <SmartLink
                href={link.href}
                className="flex items-center gap-1 py-2 text-base font-medium text-ink-soft hover:text-brand transition-colors duration-200"
              >
                {link.label}
                {link.children && <ChevronDown className="h-4 w-4" strokeWidth={2} />}
              </SmartLink>

              {/*
                NO margin-top gap here (no "mt-2") — the dropdown sits
                flush against the trigger's hoverable area via "top-full"
                (positions it right after the trigger's own height) plus
                "pt-2" (padding, INSIDE the hoverable box, for visual
                spacing only). Because the gap is now padding rather than
                a margin, the mouse stays "inside" this <li>'s hover zone
                the entire time it travels from the trigger down into the
                menu — onMouseLeave never fires prematurely.
              */}
              {link.children && openDropdown === link.label && (
                <div className="absolute left-0 top-full w-64 pt-2">
                  <ul className="rounded-sm border border-slate-100 bg-white py-2 shadow-card-hover">
                    {link.children.map((child) => (
                      <li key={child.label}>
                        <SmartLink
                          href={child.href}
                          onClick={() => setOpenDropdown(null)}
                          className="block px-4 py-2.5 text-sm text-ink-soft hover:bg-surface-subtle hover:text-brand"
                        >
                          {child.label}
                        </SmartLink>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-ink"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
        </button>
      </nav>

      {/* Mobile dropdown panel — tap-to-expand, not hover-based, so the
          hover-gap issue above doesn't apply here at all. */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-6 py-4">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                {link.children ? (
                  <>
                    <button
                      onClick={() =>
                        setOpenMobileSubmenu((current) => (current === link.label ? null : link.label))
                      }
                      className="flex w-full items-center justify-between py-3 text-base font-medium text-ink-soft hover:text-brand"
                    >
                      {link.label}
                      <ChevronDown
                        className={`h-5 w-5 transition-transform ${openMobileSubmenu === link.label ? 'rotate-180' : ''}`}
                        strokeWidth={2}
                      />
                    </button>
                    {openMobileSubmenu === link.label && (
                      <ul className="ml-4 flex flex-col gap-1 border-l border-slate-100 pl-4">
                        {link.children.map((child) => (
                          <li key={child.label}>
                            <SmartLink
                              href={child.href}
                              onClick={() => {
                                setIsMobileMenuOpen(false);
                                setOpenMobileSubmenu(null);
                              }}
                              className="block py-2.5 text-sm text-ink-faint hover:text-brand"
                            >
                              {child.label}
                            </SmartLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <SmartLink
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-3 text-base font-medium text-ink-soft hover:text-brand"
                  >
                    {link.label}
                  </SmartLink>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
