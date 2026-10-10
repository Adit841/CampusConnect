import { Calendar, MapPin, Video, Users, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { Badge } from '../ui/Badge.jsx';
import { focusRing } from '../ui/Card.jsx';

const CATEGORY_COLORS = {
  TECHNICAL: 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/30',
  CULTURAL: 'bg-purple-50 text-purple-700 ring-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:ring-purple-500/30',
  SPORTS: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30',
  ACADEMIC: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30',
  SOCIAL: 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/30',
};

export default function EventCard({
  event,
  onOpenDetail,
  onRegister,
  onCancel,
  registeringId,
  showCancel = false,
}) {
  if (!event) return null;

  const startDate = new Date(event.startDateTime);
  const monthStr = startDate.toLocaleDateString(undefined, { month: 'short' }).toUpperCase();
  const dayStr = startDate.getDate();
  const timeStr = startDate.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

  const isFull = event.capacity != null && event.registeredCount >= event.capacity;
  const isRegistering = registeringId === event.id;
  const capacityPercent = event.capacity
    ? Math.min(100, Math.round((event.registeredCount / event.capacity) * 100))
    : null;

  const categoryColor = CATEGORY_COLORS[event.category] || CATEGORY_COLORS.TECHNICAL;

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
      <div>
        {/* Header row: Date badge, category badge & sample tag */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50 px-2.5 py-1.5 text-center dark:border-slate-800 dark:bg-slate-800/80">
              <span className="text-[10px] font-bold tracking-wider text-indigo-600 dark:text-indigo-400">
                {monthStr}
              </span>
              <span className="text-base font-extrabold text-slate-900 dark:text-slate-100 leading-none">
                {dayStr}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${categoryColor}`}
                >
                  {event.category?.replace('_', ' ')}
                </span>
                {event.sampleData && (
                  <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30">
                    Sample
                  </span>
                )}
                {event.status === 'CANCELLED' && (
                  <Badge tone="danger">Cancelled</Badge>
                )}
                {event.status === 'COMPLETED' && (
                  <Badge tone="neutral">Ended</Badge>
                )}
              </div>
              {event.clubName && (
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                  {event.clubName}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Title */}
        <h3
          onClick={() => onOpenDetail && onOpenDetail(event)}
          className="mt-3.5 cursor-pointer text-base font-bold text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400 line-clamp-2"
        >
          {event.title}
        </h3>

        {/* Short description */}
        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {event.description}
        </p>

        {/* Metadata info */}
        <div className="mt-3 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Calendar className="size-3.5 shrink-0 text-slate-400 dark:text-slate-500" />
            <span className="truncate">{timeStr}</span>
          </div>

          <div className="flex items-center gap-2">
            {event.online ? (
              <>
                <Video className="size-3.5 shrink-0 text-emerald-500" />
                <span className="truncate">Online Meeting</span>
              </>
            ) : (
              <>
                <MapPin className="size-3.5 shrink-0 text-amber-500" />
                <span className="truncate">{event.venue || 'Campus Venue'}</span>
              </>
            )}
          </div>

          {event.capacity != null && (
            <div className="pt-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1">
                  <Users className="size-3 text-slate-400" />
                  <span>Capacity</span>
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {event.registeredCount} / {event.capacity}
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className={`h-full transition-all ${
                    capacityPercent >= 90
                      ? 'bg-rose-500'
                      : capacityPercent >= 70
                      ? 'bg-amber-500'
                      : 'bg-indigo-500'
                  }`}
                  style={{ width: `${capacityPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-5 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800/80">
        <button
          type="button"
          onClick={() => onOpenDetail && onOpenDetail(event)}
          className={`text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 ${focusRing}`}
        >
          View Details
        </button>

        <div className="flex items-center gap-2">
          {event.userRegistered ? (
            showCancel && onCancel ? (
              <button
                type="button"
                onClick={() => onCancel(event.id)}
                className={`inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-500/10 dark:text-rose-300 ${focusRing}`}
              >
                Cancel Registration
              </button>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30">
                <CheckCircle2 className="size-3" />
                Registered
              </span>
            )
          ) : event.status === 'CANCELLED' || event.status === 'COMPLETED' ? null : isFull ? (
            <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              Full
            </span>
          ) : onRegister ? (
            <button
              type="button"
              onClick={() => onRegister(event.id)}
              disabled={isRegistering}
              className={`inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-indigo-500 active:scale-98 disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-400 ${focusRing}`}
            >
              <span>{isRegistering ? 'Registering…' : 'Register'}</span>
              <ArrowRight className="size-3" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
