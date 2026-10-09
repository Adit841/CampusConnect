import { formatRelative } from '../../utils/format.js';

/** Items: { id, title, author, postedAt, audience }. */
function AnnouncementList({ items }) {
  return (
    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
      {items.map((item) => (
        <li key={item.id} className="px-5 py-3.5">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{item.title}</p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {item.author} · {item.audience} · <time dateTime={item.postedAt}>{formatRelative(item.postedAt)}</time>
          </p>
        </li>
      ))}
    </ul>
  );
}

export default AnnouncementList;
