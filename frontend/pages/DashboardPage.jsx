import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppShell from '../components/AppShell';

const modules = [
  { to: '/career', label: 'Career Catalog', description: 'Explore paths and skill clusters tailored to your profile.' },
  { to: '/skill-analysis', label: 'Skill Analysis', description: 'Measure strengths, identify gaps, and prioritize effort.' },
  { to: '/roadmap', label: 'Roadmap Builder', description: 'Generate a structured plan with realistic timelines.' },
  { to: '/lms', label: 'Learning Hub', description: 'Study milestones, resources, and assignment briefs.' },
  { to: '/assignment', label: 'Assignments', description: 'Submit work and get evaluation feedback quickly.' },
  { to: '/progress', label: 'Progress Board', description: 'Track completion and assignment performance metrics.' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const interests = user?.interests?.length ? user.interests.join(', ') : 'No interests selected yet';

  return (
    <AppShell
      title={`Welcome back, ${user?.name || 'Learner'}`}
      subtitle="Your personalized growth cockpit is ready."
      actions={<Link to="/profile" className="btn-secondary">Edit Profile</Link>}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <article className="card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Current Role</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{user?.role || 'Unassigned'}</p>
          <p className="muted mt-2">Role-aligned recommendations are active.</p>
        </article>
        <article className="card p-5 md:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Focus Areas</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{interests}</p>
          <p className="muted mt-2">These preferences shape your roadmap and content suggestions.</p>
        </article>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((item) => (
          <Link key={item.to} to={item.to} className="card card-hover p-5">
            <h3 className="text-lg font-extrabold text-slate-900">{item.label}</h3>
            <p className="mt-2 text-sm text-slate-600">{item.description}</p>
            <p className="mt-4 text-sm font-semibold text-teal-700">Open module</p>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
