import { HardHat, Phone, Mail } from 'lucide-react';
import { COMPANY_NAME, COMPANY_ADDRESS, COMPANY_PHONE, COMPANY_EMAIL, FOOTER_LINKS } from '../../utils/constants.js';
import SmartLink from './SmartLink.jsx';

/**
 * Footer.jsx
 * ----------------------------------------------------------------------
 * Deliberately simple, per spec: company name + address + contact
 * details, and just three links (Contact Us / News & Media / Projects)
 * rather than mirroring the full site nav. No decorative gradients —
 * flat color, clean rules.
 * ----------------------------------------------------------------------
 */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink text-white">
      <div className="max-w-content mx-auto px-6 py-12 md:px-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 font-display text-lg font-semibold">
              <HardHat className="h-5 w-5 text-brand-light" strokeWidth={1.75} />
              {COMPANY_NAME}
            </div>
            <p className="mt-2 max-w-sm text-sm text-slate-400">{COMPANY_ADDRESS}</p>
            <div className="mt-3 flex flex-col gap-1.5 text-sm text-slate-400">
              <a href={`tel:${COMPANY_PHONE.replace(/\s/g, '')}`} className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="h-3.5 w-3.5" strokeWidth={1.75} />
                {COMPANY_PHONE}
              </a>
              <a href={`mailto:${COMPANY_EMAIL}`} className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="h-3.5 w-3.5" strokeWidth={1.75} />
                {COMPANY_EMAIL}
              </a>
            </div>
          </div>

          <ul className="flex gap-6">
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <SmartLink href={link.href} className="text-sm text-slate-300 hover:text-white transition-colors">
                  {link.label}
                </SmartLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 border-t border-slate-700 pt-6 text-xs text-slate-500">
          © {year} {COMPANY_NAME} All rights reserved.
        </div>
      </div>
    </footer>
  );
}
