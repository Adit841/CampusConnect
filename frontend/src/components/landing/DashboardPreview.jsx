import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  Clock,
  GraduationCap,
  Megaphone,
  Search,
} from 'lucide-react';
import { getNavSectionsForRole } from '../../config/navigation.js';
import { MockWindow, Reveal, SampleDataNote, SectionHeading } from './shared.jsx';

const sidebarSections = getNavSectionsForRole('STUDENT');

const stats = [
  { label: 'Pending assignments', value: 3, icon: ClipboardList, tone: 'text-indigo-300 bg-indigo-400/10' },
  { label: 'Due this week', value: 2, icon: Clock, tone: 'text-amber-300 bg-amber-400/10' },
  { label: 'Recent announcements', value: 3, icon: Megaphone, tone: 'text-sky-300 bg-sky-400/10' },
  { label: 'Upcoming events', value: 3, icon: CalendarDays, tone: 'text-emerald-300 bg-emerald-400/10' },
];

const deadlines = [
  { title: 'JDBC CRUD mini-project', subject: 'Advanced Java', due: 'Tomorrow', urgent: true },
  { title: 'Normalization worksheet', subject: 'Database Systems', due: 'Thu, 11:59 PM' },
  { title: 'Process scheduling report', subject: 'Operating Systems', due: 'Next Mon' },
];

const events = [
  { day: '14', month: 'Oct', title: 'Hackathon kickoff', place: 'Innovation Lab' },
  { day: '17', month: 'Oct', title: 'Debate prelims', place: 'Auditorium' },
];

const announcements = [
  { title: 'Mid-semester examination timetable published', source: 'Examination Cell', when: 'Yesterday' },
  { title: 'Library open until 10 PM during exam weeks', source: 'Central Library', when: '2 days ago' },
  { title: 'Guest lecture on Spring Boot microservices', source: 'Dept. of Computer Engineering', when: '4 days ago' },
];

const subjects = [
  { name: 'Advanced Java', faculty: 'Prof. Iyer', progress: 80 },
  { name: 'Database Systems', faculty: 'Dr. Joshi', progress: 50 },
  { name: 'Operating Systems', faculty: 'Prof. Kulkarni', progress: 34 },
  { name: 'Software Engineering', faculty: 'Prof. Iyer', progress: 60 },
];

function Panel({ title, icon: Icon, className = '', children }) {
  return (
    <div className={`rounded-lg border border-white/5 bg-white/[0.025] ${className}`}>
      <p className="flex items-center gap-2 border-b border-white/5 px-4 py-3 text-xs font-semibold text-slate-200">
        <Icon className="size-3.5 text-slate-500" aria-hidden="true" />
        {title}
      </p>
      <div className="p-4">{children}</div>
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="hidden w-52 shrink-0 border-r border-white/5 bg-slate-950/40 p-4 md:block">
      <div className="flex items-center gap-2">
        <span className="inline-flex size-7 items-center justify-center rounded-md bg-indigo-500 text-white">
          <GraduationCap className="size-4" aria-hidden="true" />
        </span>
        <span className="text-sm font-semibold text-white">CampusConnect</span>
      </div>
      <div className="mt-6 space-y-5">
        {sidebarSections.map((section) => (
          <div key={section.label}>
            <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-600">{section.label}</p>
            <ul className="mt-1.5 space-y-0.5">
              {section.items.map(({ to, label, icon: Icon }) => {
                const active = to === '/dashboard';
                return (
                  <li
                    key={to}
                    className={`flex items-center gap-2.5 rounded-md px-2 py-1.5 text-xs ${
                      active ? 'bg-indigo-500/15 font-medium text-indigo-200' : 'text-slate-400'
                    }`}
                  >
                    <Icon className={`size-3.5 ${active ? 'text-indigo-300' : 'text-slate-500'}`} aria-hidden="true" />
                    {label}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}

function DashboardMockup() {
  return (
    <MockWindow label="campusconnect.app/dashboard">
      <div className="flex">
        <Sidebar />

        <div className="min-w-0 flex-1 space-y-4 p-4 sm:space-y-5 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs text-slate-500">Friday, 9 October</p>
              <p className="mt-0.5 text-lg font-semibold text-white sm:text-xl">Welcome back, Ananya</p>
              <p className="text-xs text-slate-400">Here&apos;s what&apos;s happening on campus this week.</p>
            </div>
            <span className="hidden items-center gap-2 rounded-lg border border-white/5 bg-slate-950/60 px-3 py-1.5 text-xs text-slate-500 sm:flex">
              <Search className="size-3.5" aria-hidden="true" />
              Search CampusConnect
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {stats.map(({ label, value, icon: Icon, tone }) => (
              <div key={label} className="rounded-lg border border-white/5 bg-white/[0.025] p-3.5">
                <span className={`inline-flex size-7 items-center justify-center rounded-md ${tone}`}>
                  <Icon className="size-3.5" aria-hidden="true" />
                </span>
                <p className="mt-3 text-2xl font-semibold tabular-nums text-white">{value}</p>
                <p className="text-[11px] leading-tight text-slate-500">{label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Panel title="Upcoming deadlines" icon={ClipboardList} className="lg:col-span-2">
              <ul className="space-y-3">
                {deadlines.map((item) => (
                  <li key={item.title} className="flex items-center justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-slate-200">{item.title}</span>
                      <span className="block text-[11px] text-slate-500">{item.subject}</span>
                    </span>
                    <span
                      className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium ${
                        item.urgent ? 'bg-amber-400/10 text-amber-300' : 'bg-white/5 text-slate-400'
                      }`}
                    >
                      {item.due}
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Upcoming events" icon={CalendarDays}>
              <ul className="space-y-3">
                {events.map((event) => (
                  <li key={event.title} className="flex items-center gap-3">
                    <span className="flex size-10 shrink-0 flex-col items-center justify-center rounded-lg bg-indigo-500/10 leading-none">
                      <span className="text-[9px] font-semibold uppercase text-indigo-300">{event.month}</span>
                      <span className="text-sm font-bold text-white">{event.day}</span>
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-slate-200">{event.title}</span>
                      <span className="block truncate text-[11px] text-slate-500">{event.place}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Announcements" icon={Megaphone} className="lg:col-span-2">
              <ul className="divide-y divide-white/5">
                {announcements.map((item) => (
                  <li key={item.title} className="flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                    <span className="min-w-0">
                      <span className="block text-sm text-slate-200">{item.title}</span>
                      <span className="block text-[11px] text-slate-500">{item.source}</span>
                    </span>
                    <span className="hidden shrink-0 text-[11px] text-slate-500 sm:block">{item.when}</span>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Academic overview" icon={BookOpen}>
              <ul className="space-y-3">
                {subjects.map((subject) => (
                  <li key={subject.name}>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-xs text-slate-200">{subject.name}</span>
                      <span className="shrink-0 text-[10px] text-slate-500">{subject.faculty}</span>
                    </div>
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/5">
                      <div className="h-full rounded-full bg-indigo-400" style={{ width: `${subject.progress}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        </div>
      </div>
    </MockWindow>
  );
}

function DashboardPreview() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div
        className="landing-drift pointer-events-none absolute left-1/2 top-1/2 h-[40rem] w-[70rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/15 blur-[140px]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="Product"
            title="One dashboard. Your entire campus experience."
            description="Open CampusConnect and see what's due, what's new and what's coming up — before you even think to ask."
          />
        </Reveal>

        <Reveal delay={150} className="mt-14">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-1.5 sm:p-2.5">
            <DashboardMockup />
          </div>
          <SampleDataNote className="mt-5" />
        </Reveal>
      </div>
    </section>
  );
}

export default DashboardPreview;
