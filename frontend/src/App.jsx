import { lazy } from 'react';
import { Routes, Route } from 'react-router';
import MainLayout from './layouts/MainLayout.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import { ProtectedRoute, PublicOnlyRoute, RequireRole } from './components/routing/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';

// Signed-in pages are split into separate chunks; DashboardLayout provides the Suspense fallback.
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage.jsx'));
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx'));
const ClubsEventsPage = lazy(() => import('./pages/ClubsEventsPage.jsx'));
const ChatPage = lazy(() => import('./pages/ChatPage.jsx'));
const AcademicsPage = lazy(() => import('./pages/AcademicsPage.jsx'));
const AnnouncementsPage = lazy(() => import('./pages/AnnouncementsPage.jsx'));

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
      </Route>

      {/* Public auth routes: redirects authenticated users to /dashboard */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          <Route element={<RequireRole roles={['STUDENT', 'TEACHER']} />}>
            <Route path="/academics" element={<AcademicsPage />} />
          </Route>

          <Route path="/announcements" element={<AnnouncementsPage />} />
          <Route path="/clubs" element={<ClubsEventsPage />} />

          <Route path="/chat" element={<ChatPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
