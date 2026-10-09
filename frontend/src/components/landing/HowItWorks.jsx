import { LayoutDashboard, Link2, UserPlus } from 'lucide-react';
import { Reveal, SectionHeading } from './shared.jsx';

const steps = [
  {
    icon: UserPlus,
    title: 'Join',
    description: 'Create your CampusConnect account as a student or faculty member.',
  },
  {
    icon: Link2,
    title: 'Connect',
    description: 'Get the subjects, assignments and conversations that are relevant to you.',
  },
  {
    icon: LayoutDashboard,
    title: 'Stay connected',
    description: 'Manage your campus life from one dashboard instead of five different apps.',
  },
];

function HowItWorks() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading eyebrow="How it works" title="Up and running in three steps." />
        </Reveal>

        <div className="relative mt-16">
          <div
            className="pointer-events-none absolute left-[16.66%] right-[16.66%] top-7 hidden h-px bg-gradient-to-r from-indigo-500/0 via-indigo-400/40 to-indigo-500/0 md:block"
            aria-hidden="true"
          />
          <ol className="grid gap-10 md:grid-cols-3 md:gap-8">
            {steps.map(({ icon: Icon, title, description }, index) => (
              <Reveal as="li" key={title} delay={index * 120} className="relative flex flex-col items-center text-center">
                <span className="relative inline-flex size-14 items-center justify-center rounded-xl border border-indigo-400/30 bg-slate-950 text-indigo-300 shadow-lg shadow-indigo-500/10">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <p className="mt-6 font-mono text-xs font-semibold text-indigo-400">{String(index + 1).padStart(2, '0')}</p>
                <h3 className="mt-1 text-lg font-semibold text-white">{title}</h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-400">{description}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
