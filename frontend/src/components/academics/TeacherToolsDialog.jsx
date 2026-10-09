import { ClipboardCheck, FilePlus, PencilLine } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import { Badge } from '../ui/Badge.jsx';
import { secondaryButton } from './buttonStyles.js';

const tools = [
  { icon: FilePlus, title: 'Create & publish assignments', detail: 'Title, instructions, deadline, accepted file types and target classes.' },
  { icon: PencilLine, title: 'Edit or close assignments', detail: 'Change deadlines or stop accepting submissions.' },
  { icon: ClipboardCheck, title: 'Review & grade submissions', detail: 'Download files, add feedback and record marks.' },
];

/** Explains the teacher tools that need a backend API, instead of offering a form that saves nothing. */
function TeacherToolsDialog({ onClose }) {
  return (
    <Modal
      open
      onClose={onClose}
      title="Assignment management"
      description="These tools need the Academics API, which hasn't been built yet."
      footer={
        <button type="button" onClick={onClose} className={secondaryButton}>
          Close
        </button>
      }
    >
      <ul className="space-y-3">
        {tools.map(({ icon: Icon, title, detail }) => (
          <li key={title} className="flex gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                {title}
                <Badge>Not available yet</Badge>
              </p>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </Modal>
  );
}

export default TeacherToolsDialog;
