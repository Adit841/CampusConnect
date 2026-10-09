import { useAuth } from '../../context/AuthContext.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { ErrorState } from '../../components/ui/StateViews.jsx';
import StudentDashboard from './StudentDashboard.jsx';
import TeacherDashboard from './TeacherDashboard.jsx';
import AdminDashboard from './AdminDashboard.jsx';

const dashboardsByRole = {
  STUDENT: StudentDashboard,
  TEACHER: TeacherDashboard,
  ADMIN: AdminDashboard,
};

/** /dashboard — picks the dashboard from the signed-in user's role (never from the URL). */
function DashboardPage() {
  const { user } = useAuth();
  const Dashboard = dashboardsByRole[user?.role];

  if (!Dashboard) {
    return (
      <Card>
        <ErrorState
          title="No dashboard for this account"
          message="Your account does not have a recognised role. Please contact the college administrator."
        />
      </Card>
    );
  }
  // `key` resets dashboard state when the role changes (e.g. switching demo roles).
  return <Dashboard key={user.role} user={user} />;
}

export default DashboardPage;
