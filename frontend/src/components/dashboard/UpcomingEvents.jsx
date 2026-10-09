import { MapPin } from 'lucide-react';

/** Items: { id, title, club, startsAt, location }. */
function UpcomingEvents({ items }) {
  return (
    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
      {items.map((event) => {
        const date = new Date(event.startsAt);
        return (
          <li key={event.id} className="flex items-center gap-3 px-5 py-3.5">
            <time
              dateTime={event.startsAt}
              className="flex w-12 shrink-0 flex-col items-center rounded-lg border border-slate-200 py-1 dark:border-slate-700"
            >
              <span className="text-[10px] font-semibold uppercase text-indigo-600 dark:text-indigo-400">
                {date.toLocaleDateString(undefined, { month: 'short' })}
              </span>
              <span className="text-lg font-semibold leading-tight text-slate-900 dark:text-slate-100">{date.getDate()}</span>
            </time>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{event.title}</p>
              <p className="flex items-center gap-1 truncate text-xs text-slate-500 dark:text-slate-400">
                {event.club} · {date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })} ·
                <MapPin className="size-3 shrink-0" aria-hidden="true" />
                {event.location}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default UpcomingEvents;
