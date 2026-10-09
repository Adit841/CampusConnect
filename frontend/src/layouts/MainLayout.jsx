import { Outlet } from 'react-router';
import LandingNavbar from '../components/landing/LandingNavbar.jsx';
import LandingFooter from '../components/landing/LandingFooter.jsx';

/** Public marketing pages. Signed-in app pages use DashboardLayout instead. */
function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-slate-950 text-slate-200 antialiased selection:bg-indigo-500/40">
      <LandingNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <LandingFooter />
    </div>
  );
}

export default MainLayout;
