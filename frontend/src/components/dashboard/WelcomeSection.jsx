import { Avatar } from '../ui/Avatar.jsx';
import { getFirstName, getGreeting, roleLabels } from '../../utils/format.js';

function describeUser(user) {
  const student = user.studentProfile;
  const teacher = user.teacherProfile;
  const parts = [];
  if (student) {
    if (student.course) parts.push(student.course);
    if (student.year) parts.push(`Year ${student.year}`);
    if (student.section) parts.push(`Section ${student.section}`);
  }
  if (teacher?.designation) parts.push(teacher.designation);
  if (user.department) parts.push(user.department);
  return parts.length ? parts.join(' · ') : roleLabels[user.role];
}

function WelcomeSection({ user, message }) {
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <Avatar name={user.name} src={user.profileImage} size="lg" />
        <div className="min-w-0">
          <p className="text-sm text-slate-500 dark:text-slate-400">{today}</p>
          <h1 className="truncate text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            {getGreeting()}, {getFirstName(user.name)}
          </h1>
          <p className="mt-0.5 text-sm text-slate-600 sm:truncate dark:text-slate-400">{describeUser(user)}</p>
        </div>
      </div>
      {message && <p className="max-w-sm text-sm text-slate-600 sm:text-right dark:text-slate-400">{message}</p>}
    </section>
  );
}

export default WelcomeSection;
