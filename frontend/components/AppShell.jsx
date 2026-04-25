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
  const currentSection = location.pathname.replace('/', '') || 'dashboard';

  return (
    <div className="app-template min-h-screen overflow-hidden">
      <div className="app-grid-lines absolute inset-0 opacity-60" />
      <div className="app-radial-glow absolute inset-x-0 top-0 h-[22rem]" />

      <div className="relative z-10 grid min-h-screen grid-cols-1 gap-0 lg:grid-cols-[288px_minmax(0,1fr)]">
        <aside className="border-r border-white/8 bg-[#090313]/88 backdrop-blur-2xl">
          <div className="border-b border-white/8 px-6 py-6 text-white">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[linear-gradient(135deg,#ff00b8,#ff916d)] text-base font-extrabold shadow-[0_0_28px_rgba(255,0,184,0.24)]">
                S
              </span>
              <div>
                <p className="text-lg font-extrabold tracking-tight">SkillReach</p>
                <p className="text-[11px] uppercase tracking-[0.28em] text-white/65">Career Intelligence</p>
              </div>
            </div>
          </div>

          <div className="space-y-8 p-5">
            <div>
              <p className="text-sm font-semibold text-white">{user?.name || 'Learner'}</p>
              <p className="text-xs uppercase tracking-[0.22em] text-white/68">{user?.role || 'Member'}</p>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `block rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      isActive
                        ? 'bg-[linear-gradient(135deg,rgba(255,0,184,0.2),rgba(255,145,109,0.24))] text-white shadow-[0_18px_36px_rgba(0,0,0,0.22)] border border-[#ff916d]/30'
                        : 'text-white hover:bg-white/10 hover:text-[#fff4ec] border border-transparent'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="rounded-[1.75rem] border border-[#ff916d]/20 bg-[linear-gradient(135deg,rgba(255,0,184,0.12),rgba(255,145,109,0.12))] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#ffd5b8]">Active Focus</p>
              <p className="mt-3 text-lg font-extrabold text-white">{currentSection}</p>
              <p className="mt-2 text-sm leading-6 text-white/95">Stay aligned with your roadmap, assignments, and weekly progress signals.</p>
            </div>

            <button onClick={logout} className="btn-secondary w-full">
              Sign Out
            </button>
          </div>
        </aside>

        <main className="space-y-8 px-4 py-5 md:px-6 lg:px-10 lg:py-8">
          <header className="app-hero rounded-[2rem] border border-white/8 p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#ffc79e]">{currentSection}</p>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white md:text-5xl">{title}</h2>
                {subtitle ? <p className="mt-4 max-w-2xl text-base leading-8 text-white/80">{subtitle}</p> : null}
              </div>
              <div className="flex flex-wrap items-center gap-2">{actions}</div>
            </div>
          </header>

          <section className="page-grid">{children}</section>

          <footer className="px-1 pb-4 text-xs text-white/48">
            <span>Built for focused, measurable upskilling.</span>
            <span className="ml-2 hidden md:inline">Need profile edits? </span>
            <Link className="text-fuchsia-300 hover:text-[#ffc79e]" to="/profile">
              Open profile
            </Link>
          </footer>
        </main>
      </div>
    </div>
  );
}
