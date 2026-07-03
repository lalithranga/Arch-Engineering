import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import Section from '../components/layout/Section.jsx';
import ContactForm from '../components/forms/ContactForm.jsx';
import { Phone, Mail, MapPin } from 'lucide-react';
import { COMPANY_NAME, COMPANY_ADDRESS, COMPANY_PHONE, COMPANY_EMAIL } from '../utils/constants.js';

// ============================================================================
// GOOGLE MAPS EMBED — no API key required
// ============================================================================
// Google's "maps/embed" endpoint accepts a plain search query in an
// iframe src and returns a working interactive map with no key, no
// billing account, no setup — this is the same mechanism Google itself
// recommends for exactly this "show our office on a map" use case.
//
// EDIT THIS if you'd rather pin an exact lat/lng instead of a text
// address (more accurate if the address alone doesn't geocode well):
//   `https://maps.google.com/maps?q=LAT,LNG&z=15&output=embed`
// ----------------------------------------------------------------------
const MAP_EMBED_SRC = `https://maps.google.com/maps?q=${encodeURIComponent(COMPANY_ADDRESS)}&z=15&output=embed`;

/**
 * Contact.jsx
 * ----------------------------------------------------------------------
 * Standalone Contact page (not on the homepage) — reachable only via the
 * "Contact" nav link. Mirrors the structure of a typical corporate
 * contact page: embedded map, a "Contact Info" block with Head Office
 * details, and the contact form for visitors to send a message directly.
 * ----------------------------------------------------------------------
 */
export default function Contact() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <Section eyebrow="Get In Touch" title="Contact Us" subtitle={`Reach out to ${COMPANY_NAME} directly, or send us a message below.`}>
        {/* --- Map --- */}
        <div className="overflow-hidden rounded-sm border border-slate-200">
          <iframe
            title={`${COMPANY_NAME} location`}
            src={MAP_EMBED_SRC}
            width="100%"
            height="380"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {/* --- Contact info + form, side by side on larger screens --- */}
        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div>
            <h3 className="font-display text-lg font-semibold text-ink">Contact Info</h3>

            <div className="mt-4 border-t border-slate-100 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Head Office</p>
              <p className="mt-2 text-sm font-medium text-ink">{COMPANY_NAME}</p>

              <div className="mt-3 flex flex-col gap-2.5 text-sm text-ink-soft">
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-brand" strokeWidth={1.75} />
                  <span>{COMPANY_ADDRESS}</span>
                </div>
                <a href={`tel:${COMPANY_PHONE.replace(/\s/g, '')}`} className="flex items-center gap-2.5 hover:text-brand transition-colors">
                  <Phone className="h-4 w-4 shrink-0 text-brand" strokeWidth={1.75} />
                  {COMPANY_PHONE}
                </a>
                <a href={`mailto:${COMPANY_EMAIL}`} className="flex items-center gap-2.5 hover:text-brand transition-colors">
                  <Mail className="h-4 w-4 shrink-0 text-brand" strokeWidth={1.75} />
                  {COMPANY_EMAIL}
                </a>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-display text-lg font-semibold text-ink">Send a Message</h3>
            <div className="mt-4">
              <ContactForm />
            </div>
          </div>
        </div>
      </Section>

      <Footer />
    </div>
  );
}
