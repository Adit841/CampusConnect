import { Outlet } from 'react-router';

function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <span className="text-xl font-bold text-indigo-600">CampusConnect</span>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 text-sm text-slate-500">
          &copy; {new Date().getFullYear()} CampusConnect
        </div>
      </footer>
    </div>
  );
}

export default MainLayout;
