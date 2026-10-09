import { Link } from 'react-router';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  Clock,
  Megaphone,
  MessagesSquare,
  Sparkles,
} from 'lucide-react';
import { MockWindow, authLinks, primaryButton, secondaryButton } from './shared.jsx';

const highlights = ['Academics & assignments', 'Real-time chat', 'Student & faculty dashboards'];

const dueSoon = [
  { title: 'JDBC CRUD mini-project', subject: 'Advanced Java', due: 'Tomorrow', tone: 'text-amber-300 bg-amber-400/10' },
  { title: 'Normalization worksheet', subject: 'Database Systems', due: 'In 4 days', tone: 'text-indigo-300 bg-indigo-400/10' },
];

const subjects = [
  { code: 'AJ301', name: 'Advanced Java' },
  { code: 'DB302', name: 'Database Systems' },
  { code: 'OS303', name: 'Operating Systems' },
];

function PreviewCard({ icon: Icon, title, children, className = '' }) {
  return (
    <div className={`rounded-lg border border-white/5 bg-white/[0.03] p-3.5 ${className}`}>
      <p className="mb-2.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        <Icon className="size-3.5" aria-hidden="true" />
        {title}
      </p>
      {children}
    </div>
  );
}

function FloatingChip({ icon: Icon, iconClass, title, detail, className, delay }) {
  return (
    <div
      className={`landing-float absolute z-10 hidden items-center gap-3 rounded-xl border border-white/10 bg-slate-900/90 py-2.5 pl-2.5 pr-4 shadow-xl shadow-black/40 backdrop-blur-xl sm:flex ${className}`}
      style={{ animationDelay: delay }}
      aria-hidden="true"
    >
      <span className={`inline-flex size-8 items-center justify-center rounded-lg ${iconClass}`}>
        <Icon className="size-4" />
      </span>
      <span>
        <span className="block text-xs font-semibold text-white">{title}</span>
        <span className="block text-[11px] text-slate-400">{detail}</span>
      </span>
    </div>
  );
}

function HeroPreview() {
  return (
    <div className="relative sm:px-6 sm:py-10">
      <div
        className="absolute inset-0 rounded-[2rem] bg-indigo-500/20 blur-3xl"
        aria-hidden="true"
      />

      <FloatingChip
        icon={Clock}
        iconClass="bg-amber-400/15 text-amber-300"
        title="Assignment due tomorrow"
        detail="JDBC CRUD mini-project"
        className="right-0 top-0"
        delay="0s"
      />
      <FloatingChip
        icon={MessagesSquare}
        iconClass="bg-indigo-400/15 text-indigo-300"
        title="New message"
        detail="Prof. Iyer · Lab moved to B-204"
        className="bottom-0 left-0"
        delay="2s"
      />

      <MockWindow className="relative">
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">Good morning, Ananya</p>
              <p className="text-xs text-slate-500">B.Tech · Computer Engineering · Year 3</p>
            </div>
            <span className="inline-flex size-8 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-semibold text-indigo-200">
              AR
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <PreviewCard icon={Clock} title="Due this week" className="sm:col-span-2">
              <ul className="space-y-2">
                {dueSoon.map((item) => (
                  <li key={item.title} className="flex items-center justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-slate-200">{item.title}</span>
                      <span className="block text-xs text-slate-500">{item.subject}</span>
                    </span>
                    <span className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium ${item.tone}`}>
                      {item.due}
                    </span>
                  </li>
                ))}
              </ul>
            </PreviewCard>

            <PreviewCard icon={BookOpen} title="Subjects">
              <ul className="space-y-1.5">
                {subjects.map((subject) => (
                  <li key={subject.code} className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
                      {subject.code}
                    </span>
                    <span className="truncate">{subject.name}</span>
                  </li>
                ))}
              </ul>
            </PreviewCard>

            <PreviewCard icon={CalendarDays} title="Upcoming events">
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 flex-col items-center justify-center rounded-lg bg-indigo-500/15 leading-none">
                  <span className="text-[9px] font-semibold uppercase text-indigo-300">Oct</span>
                  <span className="text-sm font-bold text-white">14</span>
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-medium text-slate-200">Hackathon kickoff</span>
                  <span className="block truncate text-[11px] text-slate-500">Coding Club · Innovation Lab</span>
                </span>
              </div>
            </PreviewCard>

            <PreviewCard icon={Megaphone} title="Announcements" className="hidden sm:col-span-2 sm:block">
              <div className="flex items-center justify-between gap-3">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-slate-200">
                    Mid-semester examination timetable published
                  </span>
                  <span className="block text-xs text-slate-500">Examination Cell · Yesterday</span>
                </span>
                <span className="size-2 shrink-0 rounded-full bg-indigo-400" aria-hidden="true" />
              </div>
            </PreviewCard>
          </div>
        </div>
      </MockWindow>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden pb-20 pt-32 sm:pb-28 sm:pt-40">
      <div className="landing-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <div
        className="landing-drift pointer-events-none absolute -top-40 left-1/2 h-[36rem] w-[56rem] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[120px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-12">
        <div className="text-center lg:text-left">
          <p className="landing-rise inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-200">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Built for students and faculty
          </p>

          <h1
            className="landing-rise mt-6 text-5xl font-semibold tracking-tight text-balance text-white sm:text-6xl lg:text-[4.25rem] lg:leading-[1.05]"
            style={{ animationDelay: '80ms' }}
          >
            Your campus.
            <span className="block bg-gradient-to-r from-indigo-300 via-indigo-200 to-white bg-clip-text text-transparent">
              Connected in one place.
            </span>
          </h1>

          <p
            className="landing-rise mx-auto mt-6 max-w-xl text-lg leading-relaxed text-pretty text-slate-400 lg:mx-0"
            style={{ animationDelay: '160ms' }}
          >
            CampusConnect brings your subjects, assignments, deadlines and conversations together in one
            simple platform — so you stop hunting through group chats and portals.
          </p>

          <div
            className="landing-rise mt-9 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start"
            style={{ animationDelay: '240ms' }}
          >
            <Link to={authLinks.getStarted} className={primaryButton}>
              Get Started
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
            <a href="#features" className={secondaryButton}>
              Explore CampusConnect
            </a>
          </div>

          <ul
            className="landing-rise mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-slate-400 lg:justify-start"
            style={{ animationDelay: '320ms' }}
          >
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <Check className="size-4 text-indigo-400" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="landing-rise mx-auto w-full max-w-xl lg:max-w-none" style={{ animationDelay: '300ms' }}>
          <HeroPreview />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
