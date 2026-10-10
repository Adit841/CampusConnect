import { focusRing } from '../ui/Card.jsx';

const base = `inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`;

export const primaryButton = `${base} bg-indigo-600 text-white hover:bg-indigo-500`;

export const secondaryButton = `${base} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700`;

export const dangerButton = `${base} bg-rose-600 text-white hover:bg-rose-500 dark:bg-rose-500 dark:hover:bg-rose-400`;

export const fieldClass = `h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 ${focusRing}`;

export const textareaClass = `w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 ${focusRing}`;

export const fileInputClass = `block w-full rounded-lg border border-slate-200 text-sm text-slate-600 file:mr-3 file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200 dark:border-slate-700 dark:text-slate-300 dark:file:bg-slate-800 dark:file:text-slate-200 ${focusRing}`;

export const labelClass = 'mb-1 block text-sm font-medium text-slate-800 dark:text-slate-200';
