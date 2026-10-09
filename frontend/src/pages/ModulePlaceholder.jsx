import { Link } from 'react-router';
import { Construction } from 'lucide-react';
import { Card, focusRing } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { modulePlaceholders } from '../config/navigation.js';

/**
 * Temporary page for a feature module owned by another team member.
 * Replace the matching route element in App.jsx with the real page once the module is merged.
 */
function ModulePlaceholder({ module }) {
  const { title, owner, description, icon: Icon } = modulePlaceholders[module];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">{title}</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{description}</p>
      </div>

      <Card className="flex flex-col items-center px-6 py-14 text-center">
        <span className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
          <Icon className="size-6" aria-hidden="true" />
        </span>
        <Badge tone="warning">
          <Construction className="size-3" aria-hidden="true" />
          In development
        </Badge>
        <h2 className="mt-3 text-base font-semibold text-slate-900 dark:text-slate-100">This module isn't connected yet</h2>
        <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
          {title} is being built as part of the {owner}. It will appear here once it is merged into the shared app.
        </p>
        <Link
          to="/dashboard"
          className={`mt-5 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 ${focusRing}`}
        >
          Back to dashboard
        </Link>
      </Card>
    </div>
  );
}

export default ModulePlaceholder;
