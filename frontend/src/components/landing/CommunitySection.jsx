import { CalendarDays, Megaphone, MessagesSquare, Send, Users } from 'lucide-react';
import { MockWindow, Reveal, SampleDataNote, SectionHeading } from './shared.jsx';

const pillars = [
  {
    icon: MessagesSquare,
    title: 'Real-time conversations',
    description: 'Message classmates and faculty directly, with new messages arriving instantly.',
  },
  {
    icon: Users,
    title: 'Group discussions',
    description: 'Create groups for a class, a project team or a study circle and keep the discussion together.',
  },
  {
    icon: Megaphone,
    title: 'Campus announcements',
    description: 'Official notices from departments and the exam cell, in the same place as everything else.',
    comingSoon: true,
  },
  {
    icon: CalendarDays,
    title: 'Clubs & events',
    description: 'Find out what clubs are running and what is happening on campus this week.',
    comingSoon: true,
  },
];

const conversations = [
  { initials: 'AJ', name: 'Advanced Java · TE-A', preview: 'Lab moved to B-204', active: true, unread: 3 },
  { initials: 'PT', name: 'Project team', preview: 'Pushed the API routes' },
  { initials: 'KN', name: 'Kavya Nair', preview: 'Thanks for the notes!' },
];

const messages = [
  { author: 'Prof. Vikram Iyer', initials: 'VI', text: "Tomorrow's lab is moved to B-204. Bring your JDBC project.", time: '10:42' },
  { author: 'Rahul Menon', initials: 'RM', text: 'Is the deadline still Friday night?', time: '10:44' },
  { own: true, text: 'Yes — it says 11:59 PM on the assignment page.', time: '10:45' },
];

function CommunityMockup() {
  return (
    <div className="relative">
      <MockWindow label="campusconnect.app/chat">
        <div className="grid grid-cols-1 sm:grid-cols-[12.5rem_minmax(0,1fr)]">
          <ul className="hidden border-r border-white/5 p-2 sm:block">
            {conversations.map((chat) => (
              <li
                key={chat.name}
                className={`flex items-center gap-2 rounded-lg px-2 py-2 ${chat.active ? 'bg-indigo-500/10' : ''}`}
              >
                <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-semibold text-slate-200">
                  {chat.initials}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block truncate text-xs font-medium ${chat.active ? 'text-indigo-100' : 'text-slate-300'}`}>
                    {chat.name}
                  </span>
                  <span className="block truncate text-[10px] text-slate-500">{chat.preview}</span>
                </span>
                {chat.unread && (
                  <span className="rounded-full bg-indigo-500 px-1.5 text-[10px] font-semibold text-white">{chat.unread}</span>
                )}
              </li>
            ))}
          </ul>

          <div className="flex flex-col">
            <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-white">Advanced Java · TE-A</p>
                <p className="text-[11px] text-slate-500">Group · 62 members</p>
              </div>
              <span className="flex items-center gap-1.5 text-[11px] text-emerald-300">
                <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                Live
              </span>
            </div>

            <ul className="flex-1 space-y-3 p-4">
              {messages.map((message) =>
                message.own ? (
                  <li key={message.text} className="flex justify-end">
                    <span className="max-w-[80%] rounded-xl rounded-br-sm bg-indigo-500 px-3 py-2 text-xs text-white">
                      {message.text}
                      <span className="mt-1 block text-right text-[10px] text-indigo-200">{message.time}</span>
                    </span>
                  </li>
                ) : (
                  <li key={message.text} className="flex items-end gap-2">
                    <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-[9px] font-semibold text-slate-300">
                      {message.initials}
                    </span>
                    <span className="max-w-[80%] rounded-xl rounded-bl-sm bg-white/[0.06] px-3 py-2 text-xs text-slate-200">
                      <span className="mb-0.5 block text-[10px] font-semibold text-indigo-300">{message.author}</span>
                      {message.text}
                      <span className="mt-1 block text-[10px] text-slate-500">{message.time}</span>
                    </span>
                  </li>
                ),
              )}
            </ul>

            <div className="m-3 mt-0 flex items-center gap-2 rounded-lg border border-white/5 bg-slate-950/60 px-3 py-2">
              <span className="flex-1 text-xs text-slate-500">Message the group…</span>
              <span className="inline-flex size-6 items-center justify-center rounded-md bg-indigo-500 text-white">
                <Send className="size-3" aria-hidden="true" />
              </span>
            </div>
          </div>
        </div>
      </MockWindow>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:pl-8">
        <div className="landing-float flex gap-3 rounded-xl border border-white/10 bg-slate-900/95 p-3.5 shadow-xl shadow-black/40 backdrop-blur-xl">
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-sky-400/15 text-sky-300">
            <Megaphone className="size-4" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block text-[11px] text-slate-500">Announcement · Exam Cell</span>
            <span className="block truncate text-xs font-medium text-slate-200">Mid-sem timetable published</span>
          </span>
        </div>
        <div
          className="landing-float flex gap-3 rounded-xl border border-white/10 bg-slate-900/95 p-3.5 shadow-xl shadow-black/40 backdrop-blur-xl"
          style={{ animationDelay: '2s' }}
        >
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-400/15 text-indigo-300">
            <CalendarDays className="size-4" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block text-[11px] text-slate-500">Event · Coding Club</span>
            <span className="block truncate text-xs font-medium text-slate-200">Hackathon kickoff · Oct 14</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function CommunitySection() {
  return (
    <section id="community" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
        <Reveal className="lg:order-2">
          <SectionHeading
            align="left"
            eyebrow="Community"
            title="Your campus is more than classrooms."
            description="The conversations, notices and activities that make up campus life belong in the same place as your coursework."
          />
          <ul className="mt-9 grid gap-5 sm:grid-cols-2">
            {pillars.map(({ icon: Icon, title, description, comingSoon }) => (
              <li key={title}>
                <div className="flex items-center gap-2">
                  <Icon className={`size-4 ${comingSoon ? 'text-slate-500' : 'text-indigo-300'}`} aria-hidden="true" />
                  <h3 className="text-sm font-semibold text-white">{title}</h3>
                  {comingSoon && (
                    <span className="rounded-full border border-white/10 px-1.5 text-[10px] text-slate-400">Soon</span>
                  )}
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{description}</p>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={150} className="lg:order-1">
          <CommunityMockup />
          <SampleDataNote className="mt-4" />
        </Reveal>
      </div>
    </section>
  );
}

export default CommunitySection;
