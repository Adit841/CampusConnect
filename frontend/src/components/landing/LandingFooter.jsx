import { Link } from 'react-router';
import { BrandMark, landingFocusRing } from './shared.jsx';

const linkClass = `rounded text-sm text-slate-400 transition-colors hover:text-white ${landingFocusRing}`;

const columns = [
  {
    title: 'Product',
    links: [
      { href: '#features', label: 'Features' },
      { href: '#academics', label: 'Academics' },
      { href: '#academics', label: 'Assignments' },
      { href: '#community', label: 'Community' },
    ],
  },
  {
    title: 'Platform',
    links: [
      { to: '/dashboard', label: 'Dashboard' },
      { to: '/academics', label: 'Academics' },
      { to: '/chat', label: 'Chat' },
    ],
  },
  {
    title: 'Company',
    links: [{ href: '#about', label: 'About' }],
  },
];

function LandingFooter() {
  return (
    <footer className="border-t border-white/5">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div className="col-span-2 sm:col-span-3 md:col-span-1">
            <BrandMark className="w-fit" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
              Academics, assignments and campus conversations, connected in one place.
            </p>
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">{column.title}</h2>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.to ? (
                      <Link to={link.to} className={linkClass}>
                        {link.label}
                      </Link>
                    ) : (
                      <a href={link.href} className={linkClass}>
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 border-t border-white/5 pt-6 text-sm text-slate-500">
          &copy; {new Date().getFullYear()} CampusConnect
        </div>
      </div>
    </footer>
  );
}

export default LandingFooter;
