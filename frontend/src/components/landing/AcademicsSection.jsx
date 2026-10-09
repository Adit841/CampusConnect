import { Link } from 'react-router';
import { ArrowRight, BookOpen, Check, ClipboardList, FileText, LayoutGrid, Search } from 'lucide-react';
import { MockWindow, Reveal, SampleDataNote, SectionHeading, secondaryButton } from './shared.jsx';

const points = [
  'Subjects with faculty, credits and course materials',
  'Assignments grouped by pending, submitted and overdue',
  'Clear deadlines and accepted file types for every submission',
  'A teacher view to follow submissions across classes',
];

const stats = [
  { label: 'Pending', value: 3, className: 'text-indigo-300' },
  { label: 'Submitted', value: 5, className: 'text-emerald-300' },
  { label: 'Overdue', value: 1, className: 'text-rose-300' },
];

const statusStyles = {
  Pending: 'bg-indigo-400/10 text-indigo-300 ring-indigo-400/20',
  Submitted: 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/20',
  Overdue: 'bg-rose-400/10 text-rose-300 ring-rose-400/20',
};

const assignments = [
  { title: 'JDBC CRUD mini-project', subject: 'Advanced Java', due: 'Due tomorrow, 11:59 PM', status: 'Pending', files: 'ZIP · 20 MB' },
  { title: 'Normalization worksheet', subject: 'Database Systems', due: 'Due in 4 days', status: 'Pending', files: 'PDF · 5 MB' },
  { title: 'Hibernate mapping lab', subject: 'Advanced Java', due: 'Submitted 2 days ago', status: 'Submitted', files: 'ZIP · 20 MB' },
  { title: 'Deadlock case study', subject: 'Operating Systems', due: 'Was due yesterday', status: 'Overdue', files: 'PDF · 5 MB' },
];

const subjectProgress = [
  { name: 'Advanced Java', done: 4, total: 5 },
  { name: 'Database Systems', done: 2, total: 4 },
  { name: 'Operating Systems', done: 1, total: 3 },
];

function AcademicsMockup() {
  return (
    <MockWindow label="campusconnect.app/academics">
      <div className="flex gap-1 overflow-hidden border-b border-white/5 px-3 text-xs font-medium sm:px-5">
        {[
          { icon: LayoutGrid, label: 'Overview' },
          { icon: BookOpen, label: 'Subjects', count: 4 },
          { icon: ClipboardList, label: 'Assignments', count: 9, active: true },
        ].map(({ icon: Icon, label, count, active }) => (
          <span
            key={label}
            className={`-mb-px flex shrink-0 items-center gap-1.5 border-b-2 px-2.5 py-3 ${
              active ? 'border-indigo-400 text-indigo-200' : 'border-transparent text-slate-500'
            }`}
          >
            <Icon className="hidden size-3.5 sm:block" aria-hidden="true" />
            {label}
            {count != null && <span className="rounded-full bg-white/5 px-1.5 text-[10px] text-slate-400">{count}</span>}
          </span>
        ))}
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        <div className="grid grid-cols-3 gap-2.5">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5">
              <p className={`text-xl font-semibold tabular-nums ${stat.className}`}>{stat.value}</p>
              <p className="text-[11px] text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-slate-950/60 px-3 py-2 text-xs text-slate-500">
          <Search className="size-3.5" aria-hidden="true" />
          Search assignments
        </div>

        <ul className="divide-y divide-white/5 rounded-lg border border-white/5 bg-white/[0.02]">
          {assignments.map((item) => (
            <li key={item.title} className="flex items-center gap-3 px-3 py-3">
              <span className="hidden size-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-slate-400 sm:inline-flex">
                <FileText className="size-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-slate-200">{item.title}</span>
                <span className="block truncate text-[11px] text-slate-500">
                  {item.subject} · {item.due}
                  <span className="hidden sm:inline"> · {item.files}</span>
                </span>
              </span>
              <span className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${statusStyles[item.status]}`}>
                {item.status}
              </span>
            </li>
          ))}
        </ul>

        <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Submitted this semester</p>
          <ul className="mt-3 space-y-2.5">
            {subjectProgress.map((subject) => (
              <li key={subject.name}>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">{subject.name}</span>
                  <span className="tabular-nums text-slate-500">
                    {subject.done}/{subject.total}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-300"
                    style={{ width: `${(subject.done / subject.total) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </MockWindow>
  );
}

function AcademicsSection() {
  return (
    <section id="academics" className="relative scroll-mt-24 overflow-hidden py-24 sm:py-32">
      <div
        className="pointer-events-none absolute right-0 top-1/3 h-96 w-96 rounded-full bg-indigo-600/10 blur-[100px]"
        aria-hidden="true"
      />
      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <SectionHeading
            align="left"
            eyebrow="Academics & assignments"
            title="Stay ahead of your academics."
            description="From keeping track of coursework to knowing what's due next, CampusConnect keeps your academic life organized."
          />
          <ul className="mt-8 space-y-3.5">
            {points.map((point) => (
              <li key={point} className="flex gap-3 text-sm text-slate-300 sm:text-base">
                <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-indigo-300">
                  <Check className="size-3" aria-hidden="true" />
                </span>
                {point}
              </li>
            ))}
          </ul>
          <Link to="/academics" className={`${secondaryButton} group mt-9`}>
            Open Academics
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </Reveal>

        <Reveal delay={150}>
          <AcademicsMockup />
          <SampleDataNote className="mt-4" />
        </Reveal>
      </div>
    </section>
  );
}

export default AcademicsSection;
