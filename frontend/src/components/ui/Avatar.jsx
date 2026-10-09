import { useState } from 'react';
import { getInitials } from '../../utils/format.js';

const sizes = { sm: 'size-8 text-xs', md: 'size-10 text-sm', lg: 'size-16 text-xl' };

export function Avatar({ name, src, size = 'sm' }) {
  const [failed, setFailed] = useState(false);
  const classes = `${sizes[size]} shrink-0 rounded-full`;

  if (src && !failed) {
    return <img src={src} alt="" className={`${classes} object-cover`} onError={() => setFailed(true)} />;
  }
  return (
    <span
      aria-hidden="true"
      className={`${classes} inline-flex items-center justify-center bg-indigo-100 font-semibold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300`}
    >
      {getInitials(name) || '?'}
    </span>
  );
}
