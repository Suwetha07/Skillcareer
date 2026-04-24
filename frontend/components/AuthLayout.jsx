import React from 'react';
import { Link } from 'react-router-dom';

export default function AuthLayout({ title, subtitle, sideTitle, sideText, footer, children }) {
  return (
    <div className="min-h-screen">
      <div className="grid min-h-screen w-full overflow-hidden bg-white/90 backdrop-blur lg:grid-cols-2">
        <section className="relative overflow-hidden bg-gradient-to-br from-teal-800 via-cyan-700 to-emerald-700 p-8 text-white md:p-10">
          <div className="absolute -right-20 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <div className="relative z-10 flex h-full flex-col justify-between gap-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100">Career Intelligence Suite</p>
              <h1 className="mt-3 text-4xl font-extrabold leading-tight">{sideTitle}</h1>
              <p className="mt-4 max-w-md text-cyan-50/90">{sideText}</p>
            </div>
            <div className="flex flex-wrap gap-2 text-sm font-semibold">
              <span className="rounded-full border border-white/30 px-3 py-1">Skill Gap Analysis</span>
              <span className="rounded-full border border-white/30 px-3 py-1">Roadmap Planning</span>
              <span className="rounded-full border border-white/30 px-3 py-1">Progress Insights</span>
            </div>
          </div>
        </section>

        <section className="p-6 md:p-10">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-6">
              <Link to="/" className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">Growth Console</Link>
              <h2 className="mt-2 text-3xl font-extrabold text-slate-900">{title}</h2>
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            </div>

            {children}

            {footer ? <div className="mt-5 text-sm text-slate-600">{footer}</div> : null}
          </div>
        </section>
      </div>
    </div>
  );
}
