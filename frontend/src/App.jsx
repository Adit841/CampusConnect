import { Routes, Route } from 'react-router';
import MainLayout from './layouts/MainLayout.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import {
  ProtectedRoute,
  RequireRole,
} from './components/routing/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import DashboardPage from './pages/dashboard/DashboardPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import ModulePlaceholder from './pages/ModulePlaceholder.jsx';
import ChatPage from './pages/ChatPage.jsx';
import AcademicsPage from './pages/AcademicsPage.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />

            <Route element={<RequireRole roles={['STUDENT', 'TEACHER']} />}>
              <Route path="/academics" element={<AcademicsPage />} />
            </Route>

            <Route
              path="/announcements"
              element={<ModulePlaceholder module="announcements" />}
            />

            <Route
              path="/clubs"
              element={<ModulePlaceholder module="clubs" />}
            />

            {/* Real chat module replaces the placeholder. */}
            <Route path="/chat" element={<ChatPage />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;