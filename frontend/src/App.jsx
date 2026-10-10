import { Routes, Route } from 'react-router';
import MainLayout from './layouts/MainLayout.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import { ProtectedRoute, PublicOnlyRoute, RequireRole } from './components/routing/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import DashboardPage from './pages/dashboard/DashboardPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import ModulePlaceholder from './pages/ModulePlaceholder.jsx';
import ClubsEventsPage from './pages/ClubsEventsPage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import AcademicsPage from './pages/AcademicsPage.jsx';
import AnnouncementsPage from './pages/AnnouncementsPage.jsx';

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

          <Route element={<RequireRole roles={['STUDENT', 'TEACHER', 'ADMIN']} />}>
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
