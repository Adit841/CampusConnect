import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useDismiss } from '../../hooks/useDismiss.js';
import { BrandMark, authLinks, landingFocusRing } from './shared.jsx';

export const landingNavLinks = [
  { href: '#features', label: 'Features' },
  { href: '#academics', label: 'Academics' },
  { href: '#community', label: 'Community' },
  { href: '#about', label: 'About' },
];

function LandingNavbar() {
  const { status } = useAuth();
  const signedIn = status === 'authenticated' || status === 'demo';
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  useDismiss(menuRef, closeMenu, menuOpen);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1024px)');
    const onChange = (event) => event.matches && setMenuOpen(false);
    desktop.addEventListener('change', onChange);
    return () => desktop.removeEventListener('change', onChange);
  }, []);

  const elevated = scrolled || menuOpen;

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 sm:px-4">
      <div
        ref={menuRef}
        className={`mx-auto max-w-6xl border transition-all duration-300 ${
          elevated
            ? `mt-3 rounded-xl border-white/10 shadow-xl shadow-black/30 backdrop-blur-xl ${menuOpen ? 'bg-slate-950/95' : 'bg-slate-950/75'}`
            : 'mt-0 rounded-none border-transparent bg-transparent'
        }`}
      >
        <div
          className={`flex items-center justify-between gap-4 px-3 transition-all duration-300 sm:px-4 ${
            elevated ? 'py-2.5' : 'py-5'
          }`}
        >
          <BrandMark />

          <nav aria-label="Landing" className="hidden items-center gap-1 lg:flex">
            {landingNavLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className={`rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white ${landingFocusRing}`}
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {signedIn ? (
              <Link
                to="/dashboard"
                className={`hidden items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-indigo-50 sm:inline-flex ${landingFocusRing}`}
              >
                Open dashboard
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            ) : (
              <>
                <Link
                  to={authLinks.login}
                  className={`hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-white sm:inline-flex ${landingFocusRing}`}
                >
                  Login
                </Link>
                <Link
                  to={authLinks.getStarted}
                  className={`hidden items-center rounded-lg bg-white px-4 py-2 text-sm font-semibold whitespace-nowrap text-slate-900 transition-all hover:-translate-y-px hover:bg-indigo-50 sm:inline-flex ${landingFocusRing}`}
                >
                  Get Started
                </Link>
              </>
            )}

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="landing-mobile-menu"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className={`inline-flex size-9 items-center justify-center rounded-lg text-slate-300 hover:bg-white/10 hover:text-white lg:hidden ${landingFocusRing}`}
            >
              {menuOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div id="landing-mobile-menu" className="border-t border-white/10 px-3 pb-4 pt-2 lg:hidden">
            <nav aria-label="Landing mobile" className="flex flex-col">
              {landingNavLinks.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  onClick={closeMenu}
                  className={`rounded-lg px-3 py-3 text-base font-medium text-slate-300 hover:bg-white/5 hover:text-white ${landingFocusRing}`}
                >
                  {label}
                </a>
              ))}
            </nav>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:hidden">
              {signedIn ? (
                <Link
                  to="/dashboard"
                  className="col-span-2 rounded-lg bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-900"
                >
                  Open dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to={authLinks.login}
                    className="rounded-lg border border-white/15 px-4 py-2.5 text-center text-sm font-semibold text-slate-200"
                  >
                    Login
                  </Link>
                  <Link
                    to={authLinks.getStarted}
                    className="rounded-lg bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-900"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default LandingNavbar;
