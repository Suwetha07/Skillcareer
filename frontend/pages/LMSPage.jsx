import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AppShell from '../components/AppShell';
import api, { authConfig } from '../api';

export default function LMSPage() {
  const [course, setCourse] = useState(null);
  const { token } = useAuth();
  const skill = 'Docker';

  useEffect(() => {
    if (!token) return;
    api.get(`/content/${skill}`, authConfig(token))
      .then((res) => setCourse(res.data))
      .catch(() => setCourse(null));
  }, [token]);

  return (
    <AppShell
      title="Learning Hub"
      subtitle="Structured milestones, resource links, and practical assignments."
      actions={<span className="chip">Skill Focus: {skill}</span>}
    >
      {!course ? (
        <div className="card p-6">
          <p className="text-sm text-slate-600">Loading course content...</p>
        </div>
      ) : (
        <>
          <section className="card p-5">
            <h3 className="text-xl font-extrabold text-slate-900">{course.skill} Learning Roadmap</h3>
            <p className="mt-2 text-sm text-slate-600">{course.description}</p>
          </section>

          <div className="grid gap-4">
            {course.milestones?.map((milestone) => (
              <article key={milestone._id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h4 className="text-lg font-extrabold text-slate-900">{milestone.title}</h4>
                    <p className="mt-1 text-sm text-slate-600">{milestone.description}</p>
                  </div>
                  <span className={`chip ${milestone.completed ? 'chip-active' : ''}`}>
                    {milestone.completed ? 'Completed' : 'Pending'}
                  </span>
                </div>

                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Resources</p>
                  <div className="mt-2 grid gap-2">
                    {milestone.resources?.map((resource) => (
                      <a
                        key={resource}
                        href={resource}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-teal-700 hover:bg-slate-100"
                      >
                        {resource}
                      </a>
                    ))}
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Assignment</p>
                  <p className="mt-1 text-sm text-slate-700">{milestone.assignment?.question}</p>
                  <p className="mt-2 text-xs font-semibold text-slate-500">Score: {milestone.assignment?.score}</p>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </AppShell>
  );
}
