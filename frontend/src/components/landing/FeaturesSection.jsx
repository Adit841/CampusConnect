import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  Megaphone,
  MessagesSquare,
  Upload,
  UserRound,
} from 'lucide-react';
import { Reveal, SectionHeading } from './shared.jsx';

const features = [
  {
    icon: BookOpen,
    title: 'Academics',
    description: 'Every subject you take, with faculty, credits and course materials organized in one place.',
  },
  {
    icon: ClipboardList,
    title: 'Assignments',
    description: "See what's pending, submitted or overdue — without scrolling back through chat groups.",
  },
  {
    icon: Upload,
    title: 'Submissions',
    description: 'Upload your work in the accepted format straight from the assignment, before the deadline.',
  },
  {
    icon: MessagesSquare,
    title: 'Campus chat',
    description: 'Direct and group conversations with classmates and faculty, delivered in real time.',
  },
  {
    icon: LayoutDashboard,
    title: 'Role-based dashboards',
    description: 'Students, teachers and admins each get a home screen built around what they need next.',
  },
  {
    icon: UserRound,
    title: 'Profiles',
    description: 'Department, course and year for students; designation and office details for faculty.',
  },
  {
    icon: Megaphone,
    title: 'Announcements',
    description: 'Campus and department notices delivered where students already are.',
    comingSoon: true,
  },
  {
    icon: CalendarDays,
    title: 'Clubs & events',
    description: "Discover student clubs and what's happening around campus this week.",
    comingSoon: true,
  },
];

function FeatureCard({ icon: Icon, title, description, comingSoon }) {
  return (
    <article
      className={`group relative h-full overflow-hidden rounded-xl border p-6 transition-all duration-300 hover:-translate-y-1 ${
        comingSoon
          ? 'border-dashed border-white/10 bg-transparent hover:border-white/20'
          : 'border-white/10 bg-white/[0.03] hover:border-indigo-400/30 hover:bg-white/[0.05] hover:shadow-xl hover:shadow-indigo-950/40'
      }`}
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-indigo-500/0 blur-2xl transition-colors duration-300 group-hover:bg-indigo-500/15"
        aria-hidden="true"
      />
      <div className="relative flex items-start justify-between gap-3">
        <span
          className={`inline-flex size-10 items-center justify-center rounded-lg ${
            comingSoon ? 'bg-white/5 text-slate-400' : 'bg-indigo-500/15 text-indigo-300'
          }`}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
        {comingSoon && (
          <span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] font-medium text-slate-400">
            Coming soon
          </span>
        )}
      </div>
      <h3 className={`relative mt-5 text-base font-semibold ${comingSoon ? 'text-slate-300' : 'text-white'}`}>{title}</h3>
      <p className="relative mt-2 text-sm leading-relaxed text-slate-400">{description}</p>
    </article>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="Features"
            title="Everything you need for campus life."
            description="The essentials of college life, designed to work together instead of living in separate apps."
          />
        </Reveal>

        <ul className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Reveal as="li" key={feature.title} delay={(index % 4) * 80}>
              <FeatureCard {...feature} />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default FeaturesSection;
