import { Routes, Route } from 'react-router';
import MainLayout from './layouts/MainLayout.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import { ProtectedRoute, RequireRole } from './components/routing/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import DashboardPage from './pages/dashboard/DashboardPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import ModulePlaceholder from './pages/ModulePlaceholder.jsx';

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          {/* Placeholders: replace with each module's real page when it is merged. */}
          <Route element={<RequireRole roles={['STUDENT', 'TEACHER']} />}>
            <Route path="/academics" element={<ModulePlaceholder module="academics" />} />
          </Route>
          <Route path="/announcements" element={<ModulePlaceholder module="announcements" />} />
          <Route path="/clubs" element={<ModulePlaceholder module="clubs" />} />
          <Route path="/chat" element={<ModulePlaceholder module="chat" />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
