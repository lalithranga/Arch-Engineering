import { Link, useLocation } from 'react-router-dom';

/**
 * SmartLink.jsx
 * ----------------------------------------------------------------------
 * Renders the right element for a given href, used anywhere a link might
 * be either a real route ("/services") or a same-page hash anchor
 * ("#projects") depending on which NAV_LINKS / FOOTER_LINKS entry it is
 * (see utils/constants.js). Shared by Navbar.jsx and Footer.jsx so this
 * logic lives in exactly one place.
 *
 *   - "/something"  → always a router <Link> (real route)
 *   - "#something"  → a router <Link to="/#something"> if we're NOT
 *                      already on the homepage (navigates there first,
 *                      then the browser's native hash-scroll takes over),
 *                      or a plain <a href="#something"> if we ARE on the
 *                      homepage already (just scrolls, no navigation)
 * ----------------------------------------------------------------------
 */
export default function SmartLink({ href, children, className, onClick }) {
  const location = useLocation();
  const isOnHomepage = location.pathname === '/';
  const isHashLink = href.startsWith('#');

  if (isHashLink && !isOnHomepage) {
    return (
      <Link to={`/${href}`} className={className} onClick={onClick}>
        {children}
      </Link>
    );
  }

  if (isHashLink) {
    return (
      <a href={href} className={className} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <Link to={href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}
