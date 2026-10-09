import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  CalendarDays,
  ClipboardList,
  FileText,
  FolderOpen,
  Globe,
  LayoutDashboard,
  Mail,
  MessageCircle,
  MessagesSquare,
  StickyNote,
} from 'lucide-react';
import { Reveal, SectionHeading } from './shared.jsx';

const scatteredTools = [
  { icon: MessageCircle, label: 'WhatsApp groups', className: 'sm:-rotate-3' },
  { icon: Globe, label: 'College portal', className: 'sm:translate-x-6 sm:rotate-2' },
  { icon: StickyNote, label: 'Notice boards', className: 'sm:-translate-x-2 sm:rotate-1' },
  { icon: FileText, label: 'Assignment docs', className: 'sm:translate-x-3 sm:-rotate-2' },
  { icon: Mail, label: 'Email threads', className: 'sm:-translate-x-4 sm:rotate-3' },
  { icon: CalendarDays, label: 'Event posters', className: 'sm:translate-x-5 sm:-rotate-1' },
  { icon: FolderOpen, label: 'Shared drives', className: 'sm:rotate-2' },
];

const connected = [
  { icon: LayoutDashboard, label: 'Your dashboard' },
  { icon: BookOpen, label: 'Subjects & materials' },
  { icon: ClipboardList, label: 'Assignments' },
  { icon: MessagesSquare, label: 'Conversations' },
];

function ProblemSection() {
  return (
    <section id="about" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="The problem"
            title="College life shouldn't feel this scattered."
            description="Deadlines live in one chat, notes in another drive, notices on a board you walked past last week. Students spend more time finding information than using it."
          />
        </Reveal>

        <div className="mt-16 grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_auto_1fr] lg:gap-10">
          <Reveal className="rounded-xl border border-dashed border-white/10 bg-white/[0.015] p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Scattered tools</p>
            <ul className="mt-6 flex flex-wrap justify-center gap-3">
              {scatteredTools.map(({ icon: Icon, label, className }) => (
                <li
                  key={label}
                  className={`flex items-center gap-2 rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-400 shadow-sm ${className}`}
                >
                  <Icon className="size-4 text-slate-500" aria-hidden="true" />
                  {label}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={150} className="flex justify-center" aria-hidden="true">
            <span className="inline-flex size-12 items-center justify-center rounded-full border border-indigo-400/30 bg-indigo-500/10 text-indigo-300 shadow-lg shadow-indigo-500/20">
              <ArrowDown className="size-5 lg:hidden" />
              <ArrowRight className="hidden size-5 lg:block" />
            </span>
          </Reveal>

          <Reveal
            delay={300}
            className="relative overflow-hidden rounded-xl border border-indigo-400/25 bg-gradient-to-b from-indigo-500/15 to-indigo-500/[0.03] p-6 shadow-2xl shadow-indigo-950/50 sm:p-8"
          >
            <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-indigo-500/20 blur-3xl" aria-hidden="true" />
            <p className="relative text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">CampusConnect</p>
            <h3 className="relative mt-3 text-2xl font-semibold tracking-tight text-white">
              One connected campus experience.
            </h3>
            <p className="relative mt-2 text-sm text-slate-400">One organized platform, one place to check.</p>
            <ul className="relative mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {connected.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-slate-950/50 px-3 py-2.5 text-sm text-slate-200"
                >
                  <Icon className="size-4 text-indigo-300" aria-hidden="true" />
                  {label}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export default ProblemSection;
