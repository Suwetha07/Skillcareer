import React from 'react';
import { Link } from 'react-router-dom';

export default function AuthLayout({ title, subtitle, sideTitle, sideText, footer, children }) {
  return (
    <div className="auth-template min-h-screen overflow-hidden text-white">
      <div className="auth-grid-lines absolute inset-0 opacity-60" />
      <div className="auth-radial-glow absolute inset-x-0 top-0 h-[28rem]" />

      <header className="relative z-10 border-b border-white/8 bg-[#090313]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-10">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-[linear-gradient(135deg,#ff00b8,#ff916d)] text-lg font-extrabold text-white shadow-[0_0_30px_rgba(255,0,184,0.25)]">
              S
            </span>
            <div>
              <p className="text-xl font-extrabold tracking-tight text-white">SkillReach</p>
              <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">Career Intelligence</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-semibold text-white/70 lg:flex">
            <span className="transition hover:text-white">Home</span>
            <span className="transition hover:text-white">Services</span>
            <span className="transition hover:text-white">Pricing</span>
            <span className="text-fuchsia-400">Account</span>
            <span className="transition hover:text-white">Contact</span>
          </nav>

          <a
            href="#auth-form"
            className="rounded-full bg-[linear-gradient(135deg,#ff00b8,#ff916d)] px-6 py-3 text-sm font-extrabold uppercase tracking-[0.2em] text-white shadow-[0_18px_40px_rgba(255,0,184,0.22)]"
          >
            Sign Up
          </a>
        </div>
      </header>

      <main className="relative z-10">
        <section className="border-b border-white/8 px-6 pb-20 pt-20 md:px-10 md:pb-28">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex rounded-full border border-[#f0a56b]/45 px-5 py-2 text-xs font-bold uppercase tracking-[0.22em] text-[#ffc79e]">
              Your Story
            </span>
            <h1 className="mt-7 text-5xl font-extrabold tracking-tight text-white md:text-7xl">{title}</h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/68 md:text-xl">{subtitle}</p>
            <p className="mt-8 text-sm font-semibold text-white/45">
              <span className="text-fuchsia-400">Home</span> {'>>'} Account
            </p>
          </div>
        </section>

        <section className="px-6 py-14 md:px-10 md:py-20">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(380px,0.9fr)] lg:items-start">
            <div className="space-y-8">
              <div className="space-y-6">
                <span className="inline-flex rounded-full border border-[#f0a56b]/45 px-5 py-2 text-xs font-bold uppercase tracking-[0.22em] text-[#ffc79e]">
                  Why Us?
                </span>
                <div className="max-w-2xl">
                  <h2 className="text-4xl font-extrabold leading-tight text-white md:text-6xl">
                    Unveiling The Success Of Our
                    <span className="block bg-[linear-gradient(135deg,#ff00b8,#ff916d)] bg-clip-text text-transparent">
                      Achievements
                    </span>
                  </h2>
                </div>
                <p className="max-w-xl text-lg leading-8 text-white/58">{sideText}</p>
              </div>

              <div className="grid gap-5 sm:grid-cols-3">
                <div className="rounded-[2rem] border border-white/10 bg-white/4 p-5 backdrop-blur">
                  <p className="text-3xl font-extrabold text-white">24K</p>
                  <p className="mt-2 text-xs font-bold uppercase tracking-[0.24em] text-white/45">Skill Audits</p>
                </div>
                <div className="rounded-[2rem] border border-white/10 bg-white/4 p-5 backdrop-blur">
                  <p className="text-3xl font-extrabold text-white">18K</p>
                  <p className="mt-2 text-xs font-bold uppercase tracking-[0.24em] text-white/45">Roadmaps Built</p>
                </div>
                <div className="rounded-[2rem] border border-white/10 bg-white/4 p-5 backdrop-blur">
                  <p className="text-3xl font-extrabold text-white">4.9</p>
                  <p className="mt-2 text-xs font-bold uppercase tracking-[0.24em] text-white/45">Learner Rating</p>
                </div>
              </div>
            </div>

            <section id="auth-form" className="auth-form-shell rounded-[2rem] border border-white/10 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)] md:p-8">
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-fuchsia-300">Growth Console</p>
                <h2 className="mt-3 text-3xl font-extrabold text-white">{sideTitle}</h2>
                <p className="mt-3 text-sm leading-7 text-white/65">{subtitle}</p>
              </div>

              {children}

              {footer ? <div className="mt-6 text-sm text-white/65">{footer}</div> : null}
            </section>
          </div>
        </section>

        <section className="px-6 pb-14 md:px-10 md:pb-20">
          <div className="mx-auto grid max-w-7xl gap-px overflow-hidden rounded-[1.75rem] bg-[linear-gradient(135deg,#ff00b8,#ff916d)] p-[1px] shadow-[0_24px_60px_rgba(255,90,122,0.3)] md:grid-cols-4">
            {[
              ['24K', 'Completed Project'],
              ['18K', 'Happy Client'],
              ['22+', 'Years Of Experience'],
              ['4.9', 'Client Ratings'],
            ].map(([value, label]) => (
              <div
                key={label}
                className="bg-[linear-gradient(135deg,rgba(255,0,184,0.9),rgba(255,145,109,0.9))] px-8 py-8 text-center"
              >
                <p className="text-4xl font-extrabold text-white">{value}</p>
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.24em] text-white/80">{label}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
