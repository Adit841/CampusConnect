import { Check, X } from 'lucide-react';
import { Reveal, SectionHeading } from './shared.jsx';

const without = [
  'Information scattered across multiple places',
  'Important assignments buried in chats',
  'Hard to keep track of campus activities',
  'Too many disconnected tools',
];

const withCampusConnect = [
  'One organized campus platform',
  'Academic information in one place',
  'Easier assignment tracking',
  'Better campus communication',
  'A connected student experience',
];

function WhyCampusConnect() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading eyebrow="Why CampusConnect" title="Less switching. More doing." />
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-2">
          <Reveal className="rounded-xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Without CampusConnect</h3>
            <ul className="mt-6 space-y-4">
              {without.map((item) => (
                <li key={item} className="flex gap-3 text-sm text-slate-400 sm:text-base">
                  <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-white/5 text-slate-500">
                    <X className="size-3" aria-hidden="true" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal
            delay={120}
            className="relative overflow-hidden rounded-xl border border-indigo-400/30 bg-gradient-to-br from-indigo-500/15 via-indigo-500/[0.06] to-transparent p-6 shadow-2xl shadow-indigo-950/40 sm:p-8"
          >
            <div className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-indigo-500/20 blur-3xl" aria-hidden="true" />
            <h3 className="relative text-sm font-semibold uppercase tracking-[0.14em] text-indigo-300">With CampusConnect</h3>
            <ul className="relative mt-6 space-y-4">
              {withCampusConnect.map((item) => (
                <li key={item} className="flex gap-3 text-sm text-slate-100 sm:text-base">
                  <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white">
                    <Check className="size-3" aria-hidden="true" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export default WhyCampusConnect;
