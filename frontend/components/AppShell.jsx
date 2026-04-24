import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Overview' },
  { to: '/career', label: 'Career Catalog' },
  { to: '/skill-analysis', label: 'Skill Analysis' },
  { to: '/roadmap', label: 'Roadmap' },
  { to: '/lms', label: 'Learning Hub' },
  { to: '/assignment', label: 'Assignments' },
  { to: '/progress', label: 'Progress' },
];

export default function AppShell({ title, subtitle, actions, children }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen">
      <div className="grid min-h-screen grid-cols-1 gap-0 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="h-full overflow-hidden border-r border-slate-200 bg-white/90 backdrop-blur">
          <div className="border-b border-slate-200 bg-gradient-to-r from-teal-700 to-cyan-700 p-5 text-white">
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-100">Career & Skill Intelligence</p>
            <h1 className="mt-1 text-lg font-extrabold">Growth Console</h1>
          </div>
          <div className="space-y-6 p-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">{user?.name || 'Learner'}</p>
              <p className="text-xs text-slate-500">{user?.role || 'Member'}</p>
            </div>
            <nav className="space-y-1.5">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `block rounded-xl px-3 py-2 text-sm font-semibold transition ${
                      isActive
                        ? 'bg-teal-50 text-teal-800'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <button onClick={logout} className="btn-secondary w-full">
              Sign Out
            </button>
          </div>
        </aside>

        <main className="space-y-6 px-4 py-4 md:px-6 lg:px-8 lg:py-6">
          <header className="card p-4 md:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">{location.pathname.replace('/', '') || 'dashboard'}</p>
                <h2 className="text-2xl font-extrabold text-slate-900">{title}</h2>
                {subtitle ? <p className="muted mt-1">{subtitle}</p> : null}
              </div>
              <div className="flex flex-wrap items-center gap-2">{actions}</div>
            </div>
          </header>

          <section className="page-grid">{children}</section>

          <footer className="px-1 pb-4 text-xs text-slate-500">
            <span>Built for focused, measurable upskilling.</span>
            <span className="ml-2 hidden md:inline">Need profile edits? </span>
            <Link className="text-teal-700 hover:text-teal-900" to="/profile">
              Open profile
            </Link>
          </footer>
        </main>
      </div>
    </div>
  );
}
