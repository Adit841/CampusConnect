import { Activity, CalendarDays, GraduationCap, Megaphone, School, Trophy, Users } from 'lucide-react';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { getAdminDashboard } from '../../services/dashboardService.js';
import WelcomeSection from '../../components/dashboard/WelcomeSection.jsx';
import StatCard, { StatGrid } from '../../components/dashboard/StatCard.jsx';
import DataSection from '../../components/dashboard/DataSection.jsx';
import RecentActivity from '../../components/dashboard/RecentActivity.jsx';
import AnnouncementList from '../../components/dashboard/AnnouncementList.jsx';
import UpcomingEvents from '../../components/dashboard/UpcomingEvents.jsx';
import QuickActions from '../../components/dashboard/QuickActions.jsx';
import DashboardError from './DashboardError.jsx';

function AdminDashboard({ user }) {
  const { data, status, error, reload } = useAsyncData(getAdminDashboard);
  const loading = status === 'loading';
  const stats = data?.stats;
  const source = data?.source;

  return (
    <div className="space-y-8">
      <WelcomeSection user={user} message="Platform-wide overview of users, activity and campus updates." />

      {status === 'error' ? (
        <DashboardError error={error} onRetry={reload} />
      ) : (
        <>
          <StatGrid>
            <StatCard label="Total users" value={stats?.total} icon={Users} loading={loading} />
            <StatCard label="Students" value={stats?.students} icon={GraduationCap} tone="sky" loading={loading} />
            <StatCard label="Teachers" value={stats?.teachers} icon={School} tone="emerald" loading={loading} />
            <StatCard label="Active clubs" value={stats?.activeClubs} icon={Trophy} tone="amber" loading={loading} />
          </StatGrid>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <DataSection
              className="xl:col-span-2"
              title="Recent platform activity"
              icon={Activity}
              loading={loading}
              source={source}
              items={data?.activity}
              emptyTitle="No recent activity"
            >
              {(items) => <RecentActivity items={items} />}
            </DataSection>

            <DataSection
              title="Upcoming events"
              icon={CalendarDays}
              viewAllTo="/clubs"
              loading={loading}
              source={source}
              items={data?.events}
              emptyTitle="No upcoming events"
            >
              {(items) => <UpcomingEvents items={items} />}
            </DataSection>

            <DataSection
              className="xl:col-span-3"
              title="Recent announcements"
              icon={Megaphone}
              viewAllTo="/announcements"
              loading={loading}
              source={source}
              items={data?.announcements}
              emptyTitle="No announcements yet"
            >
              {(items) => <AnnouncementList items={items} />}
            </DataSection>
          </div>
        </>
      )}

      <QuickActions role="ADMIN" />
    </div>
  );
}

export default AdminDashboard;
