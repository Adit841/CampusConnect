import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { Reveal, authLinks, primaryButton, secondaryButton } from './shared.jsx';

function CTASection() {
  return (
    <section className="px-4 pb-24 pt-4 sm:px-6 sm:pb-32 sm:pt-8">
      <Reveal className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl border border-indigo-400/20 bg-gradient-to-b from-indigo-950/80 to-slate-950 px-6 py-16 text-center shadow-2xl shadow-indigo-950/50 sm:px-12 sm:py-24">
        <div className="landing-grid pointer-events-none absolute inset-0" aria-hidden="true" />
        <div
          className="landing-drift pointer-events-none absolute -top-32 left-1/2 h-80 w-[40rem] -translate-x-1/2 rounded-full bg-indigo-500/30 blur-[100px]"
          aria-hidden="true"
        />
        <div className="relative">
          <h2 className="text-4xl font-semibold tracking-tight text-balance text-white sm:text-5xl">
            Make campus life simpler.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-slate-300">
            Everything your campus needs, connected in one place.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to={authLinks.getStarted} className={primaryButton}>
              Get Started
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
            <a href="#features" className={secondaryButton}>
              Explore Features
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export default CTASection;
