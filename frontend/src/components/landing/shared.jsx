import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { GraduationCap } from 'lucide-react';

/*
 * Login and registration pages belong to the authentication module, which isn't merged yet.
 * Point these at its routes (e.g. /login and /register) once they exist in App.jsx.
 */
export const authLinks = {
  login: '/dashboard',
  getStarted: '/dashboard',
};

export const landingFocusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400';

export const primaryButton = `group inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-400 hover:shadow-indigo-500/40 ${landingFocusRing}`;

export const secondaryButton = `inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/10 ${landingFocusRing}`;

export function BrandMark({ className = '' }) {
  return (
    <Link to="/" className={`flex items-center gap-2.5 rounded-lg ${landingFocusRing} ${className}`}>
      <span className="inline-flex size-8 items-center justify-center rounded-lg bg-indigo-500 text-white shadow-md shadow-indigo-500/30">
        <GraduationCap className="size-5" aria-hidden="true" />
      </span>
      <span className="text-base font-semibold tracking-tight text-white">CampusConnect</span>
    </Link>
  );
}

export function SectionHeading({ eyebrow, title, description, align = 'center' }) {
  const centered = align === 'center';
  return (
    <div className={centered ? 'mx-auto max-w-3xl text-center' : 'max-w-xl'}>
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-400">{eyebrow}</p>
      )}
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl">{title}</h2>
      {description && (
        <p
          className={`mt-4 text-base leading-relaxed text-pretty text-slate-400 sm:text-lg ${centered ? 'mx-auto max-w-2xl' : ''}`}
        >
          {description}
        </p>
      )}
    </div>
  );
}

/** App-window frame used around every product mockup on the landing page. */
export function MockWindow({ label = 'campusconnect.app', className = '', children }) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-white/10 bg-slate-900/80 shadow-2xl shadow-black/50 ring-1 ring-white/5 backdrop-blur-xl ${className}`}
    >
      <div className="flex items-center gap-2 border-b border-white/5 bg-white/[0.02] px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="size-2.5 rounded-full bg-white/15" />
        </span>
        <span className="mx-auto rounded-md bg-white/5 px-3 py-0.5 text-[11px] text-slate-500">{label}</span>
        <span className="w-10" aria-hidden="true" />
      </div>
      {children}
    </div>
  );
}

export function SampleDataNote({ className = '' }) {
  return (
    <p className={`text-center text-xs text-slate-500 ${className}`}>
      Product preview with sample data
    </p>
  );
}

/** Fades content in the first time it scrolls into view. */
export function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...props }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    if (!('IntersectionObserver' in window)) {
      setVisible(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}
