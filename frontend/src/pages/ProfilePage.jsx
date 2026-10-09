import { useAuth } from '../context/AuthContext.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Avatar } from '../components/ui/Avatar.jsx';
import { Badge, DataSourceBadge } from '../components/ui/Badge.jsx';
import { roleLabels } from '../utils/format.js';

function detailRows(user) {
  const rows = [
    ['Email', user.email],
    ['Role', roleLabels[user.role]],
    ['Department', user.department],
  ];
  const student = user.studentProfile;
  if (student) {
    rows.push(['Course', student.course], ['Year', student.year], ['Section', student.section], ['Roll no.', student.rollNo], ['Enrollment no.', student.enrollmentNo]);
  }
  const teacher = user.teacherProfile;
  if (teacher) {
    rows.push(['Designation', teacher.designation], ['Employee ID', teacher.employeeId], ['Office', teacher.officeRoom]);
  }
  return rows.filter(([, value]) => value !== null && value !== undefined && value !== '');
}

/** Read-only account summary. Editing profiles belongs to the Authentication & Profiles module. */
function ProfilePage() {
  const { user, isDemo } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Profile</h1>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center dark:border-slate-800">
          <Avatar name={user.name} src={user.profileImage} size="lg" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-lg font-semibold text-slate-900 dark:text-slate-100">{user.name}</h2>
              <Badge tone="accent">{roleLabels[user.role]}</Badge>
              <DataSourceBadge source={isDemo ? 'mock' : 'api'} />
            </div>
            <p className="truncate text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
          </div>
        </div>

        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 p-6 sm:grid-cols-2">
          {detailRows(user).map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</dt>
              <dd className="mt-1 break-words text-sm text-slate-900 dark:text-slate-100">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <p className="text-sm text-slate-500 dark:text-slate-400">
        Editing your profile will be available once the Authentication &amp; Profiles module adds its profile page.
      </p>
    </div>
  );
}

export default ProfilePage;
