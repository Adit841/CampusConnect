import { Calendar, MapPin, Video, Users, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { Badge } from '../ui/Badge.jsx';
import { focusRing } from '../ui/Card.jsx';

export default function FeaturedEventCard({ event, onOpenDetail, onRegister, registeringId }) {
  if (!event) return null;

  const startDate = new Date(event.startDateTime);
  const formattedDate = startDate.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = startDate.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });

  const isFull = event.capacity != null && event.registeredCount >= event.capacity;
  const isRegistering = registeringId === event.id;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-indigo-200/60 bg-gradient-to-br from-indigo-900/95 via-slate-900 to-slate-950 p-6 text-white shadow-md dark:border-indigo-500/20 sm:p-8">
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-indigo-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 size-72 rounded-full bg-purple-500/10 blur-3xl" />

      <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        <div className="max-w-2xl space-y-3.5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="accent" className="bg-indigo-500/20 text-indigo-200 ring-indigo-400/30">
              Featured Campus Event
            </Badge>
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-slate-300">
              {event.category?.replace('_', ' ')}
            </span>
            {event.clubName && (
              <span className="text-xs text-indigo-300">by {event.clubName}</span>
            )}
          </div>

          <h3
            onClick={() => onOpenDetail(event)}
            className="cursor-pointer text-xl font-bold tracking-tight text-white transition-colors hover:text-indigo-200 sm:text-2xl"
          >
            {event.title}
          </h3>

          <p className="line-clamp-2 text-sm leading-relaxed text-slate-300 sm:line-clamp-3">
            {event.description}
          </p>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 pt-1 text-xs text-slate-300">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-3.5 text-indigo-400" />
              <span>{formattedDate} at {formattedTime}</span>
            </span>

            <span className="inline-flex items-center gap-1.5">
              {event.online ? (
                <>
                  <Video className="size-3.5 text-emerald-400" />
                  <span>Online Session</span>
                </>
              ) : (
                <>
                  <MapPin className="size-3.5 text-amber-400" />
                  <span className="truncate max-w-[200px]">{event.venue}</span>
                </>
              )}
            </span>

            {event.capacity != null && (
              <span className="inline-flex items-center gap-1.5">
                <Users className="size-3.5 text-indigo-400" />
                <span>
                  {event.registeredCount} / {event.capacity} registered
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Action Column */}
        <div className="flex shrink-0 flex-col items-start gap-3 sm:flex-row lg:flex-col lg:items-end">
          {event.userRegistered ? (
            <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/20 px-4 py-2.5 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-500/30">
              <CheckCircle2 className="size-4" />
              <span>You are registered</span>
            </div>
          ) : isFull ? (
            <div className="rounded-xl bg-slate-800/80 px-4 py-2.5 text-xs font-medium text-slate-400 ring-1 ring-slate-700">
              Event Full (Capacity Reached)
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onRegister(event.id)}
              disabled={isRegistering}
              className={`inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-indigo-400 active:scale-98 disabled:opacity-60 ${focusRing}`}
            >
              <span>{isRegistering ? 'Registering…' : 'Register for Event'}</span>
              <ArrowRight className="size-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => onOpenDetail(event)}
            className="text-xs font-semibold text-indigo-300 underline-offset-4 hover:underline"
          >
            View Event Details →
          </button>
        </div>
      </div>
    </div>
  );
}
