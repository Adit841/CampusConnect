import { Calendar, MapPin, Video, ArrowRight, CheckCircle2 } from 'lucide-react';
import { focusRing } from '../ui/Card.jsx';

function getDateGroupLabel(dateObj, now) {
  const eventDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffDays = Math.round((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays > 1 && diffDays <= 7) return 'Later This Week';
  return 'Coming Up';
}

export default function EventAgendaTimeline({
  events = [],
  onOpenDetail,
  onRegister,
  registeringId,
}) {
  if (!events || events.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center dark:border-slate-800">
        <Calendar className="mx-auto size-8 text-slate-400 dark:text-slate-600" />
        <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
          No campus activities scheduled this week
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Check back soon or explore student clubs to see upcoming workshops and meetups.
        </p>
      </div>
    );
  }

  const now = new Date();

  // Group events deterministically by chronological buckets
  const groups = {};
  events.slice(0, 8).forEach((ev) => {
    const label = getDateGroupLabel(new Date(ev.startDateTime), now);
    if (!groups[label]) groups[label] = [];
    groups[label].push(ev);
  });

  const groupKeys = ['Today', 'Tomorrow', 'Later This Week', 'Coming Up'].filter(
    (k) => groups[k] && groups[k].length > 0,
  );

  return (
    <div className="space-y-6">
      {groupKeys.map((groupLabel) => (
        <div key={groupLabel} className="space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              {groupLabel}
            </span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          </div>

          <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200/80 bg-white dark:divide-slate-800/80 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
            {groups[groupLabel].map((ev) => {
              const startDate = new Date(ev.startDateTime);
              const dayStr = startDate.toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              });
              const timeStr = startDate.toLocaleTimeString(undefined, {
                hour: 'numeric',
                minute: '2-digit',
              });

              const isRegistering = registeringId === ev.id;
              const isFull = ev.capacity != null && ev.registeredCount >= ev.capacity;

              return (
                <div
                  key={ev.id}
                  className="flex flex-col justify-between gap-3 p-4 transition-colors hover:bg-slate-50/70 sm:flex-row sm:items-center dark:hover:bg-slate-800/40"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    {/* Compact Date Box */}
                    <div className="flex shrink-0 flex-col items-center justify-center rounded-xl bg-slate-100 px-2 py-1 text-center dark:bg-slate-800 w-12">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                        {startDate.toLocaleDateString(undefined, { weekday: 'short' })}
                      </span>
                      <span className="text-sm font-black text-slate-800 dark:text-slate-100 leading-none">
                        {startDate.getDate()}
                      </span>
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                          {timeStr}
                        </span>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">•</span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {ev.category?.replace('_', ' ')}
                        </span>
                        {ev.clubName && (
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                            by {ev.clubName}
                          </span>
                        )}
                      </div>

                      <h4
                        onClick={() => onOpenDetail && onOpenDetail(ev)}
                        className="cursor-pointer text-sm font-bold text-slate-900 hover:text-indigo-600 dark:text-slate-100 dark:hover:text-indigo-400 truncate"
                      >
                        {ev.title}
                      </h4>

                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        {ev.online ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <Video className="size-3" />
                            Online Session
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="size-3 text-amber-500" />
                            <span className="truncate max-w-[200px]">{ev.venue}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Action */}
                  <div className="flex shrink-0 items-center justify-end gap-2 pt-2 sm:pt-0">
                    {ev.userRegistered ? (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30">
                        <CheckCircle2 className="size-3" />
                        Registered
                      </span>
                    ) : isFull ? (
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                        Full
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onRegister && onRegister(ev.id)}
                        disabled={isRegistering}
                        className={`inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1 text-xs font-semibold text-white transition-all hover:bg-indigo-600 disabled:opacity-60 dark:bg-slate-800 dark:hover:bg-indigo-500 ${focusRing}`}
                      >
                        <span>{isRegistering ? 'Registering…' : 'Register'}</span>
                        <ArrowRight className="size-3" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onOpenDetail && onOpenDetail(ev)}
                      className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      title="View details"
                    >
                      <ArrowRight className="size-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
