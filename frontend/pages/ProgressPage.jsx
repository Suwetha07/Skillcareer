import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AppShell from '../components/AppShell';
import api, { authConfig } from '../api';

export default function ProgressPage() {
  const { token, user } = useAuth();
  const [progress, setProgress] = useState(null);
  const userId = user?.id || user?.userId || 'sample-user';

  useEffect(() => {
    if (!token || !userId) return;
    api.get(`/progress/${userId}`, authConfig(token))
      .then((res) => setProgress(res.data))
      .catch(() => setProgress(null));
  }, [token, userId]);

  return (
    <AppShell
      title="Progress Dashboard"
      subtitle="Monitor completion rates, skill outcomes, and assignment scores."
    >
      {!progress ? (
        <div className="card p-6">
          <p className="text-sm text-slate-600">
            No progress records found yet. Complete milestones and assignments to start tracking insights.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <article className="card p-5 md:col-span-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Overall Progress</p>
              <p className="mt-2 text-4xl font-extrabold text-teal-800">{progress.progressPercentage}%</p>
            </article>
            <article className="card p-5 md:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Completed Skills</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {progress.completedSkills?.map((skill) => <span key={skill} className="chip chip-active">{skill}</span>)}
                {!progress.completedSkills?.length ? <span className="muted">No completed skills yet.</span> : null}
              </div>
            </article>
          </div>

          <article className="card p-5">
            <h3 className="text-base font-extrabold text-slate-900">Assignment Scores</h3>
            <div className="mt-3 grid gap-2">
              {progress.assignmentScores?.map((item) => (
                <div
                  key={`${item.skill}-${item.milestoneId}`}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                >
                  <span className="text-sm font-semibold text-slate-700">{item.skill}</span>
                  <span className="chip">Score: {item.score}</span>
                </div>
              ))}
              {!progress.assignmentScores?.length ? <p className="muted">No assignment scores yet.</p> : null}
            </div>
          </article>
        </>
      )}
    </AppShell>
  );
}
