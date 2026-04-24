import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AppShell from '../components/AppShell';
import api, { authConfig } from '../api';
import { buildProgressPayload, getCurrentUserId, getProgressDraft } from '../learningFlow';

export default function ProgressPage() {
  const { token, user } = useAuth();
  const [progress, setProgress] = useState(null);
  const userId = getCurrentUserId(user);

  useEffect(() => {
    if (!token || !userId) return;
    api.get(`/progress/${userId}`, authConfig(token))
      .then((res) => setProgress(res.data))
      .catch(() => {
        const draft = getProgressDraft();
        const hasLocalProgress = (draft.toolProgress || []).length || (draft.assignmentScores || []).length || draft.testsAttended || draft.modulesCompleted;
        setProgress(hasLocalProgress ? { ...buildProgressPayload(userId, draft), progressPercentage: draft.toolProgress?.length ? Math.round(draft.toolProgress.reduce((sum, item) => sum + (item.completedPercentage || 0), 0) / draft.toolProgress.length) : 0 } : null);
      });
  }, [token, userId]);

  return (
    <AppShell
      title="Progress Dashboard"
      subtitle="Track live learning metrics, test outcomes, completed tools, and overall completion across your selected technology path."
    >
      {!progress ? (
        <div className="card p-6">
          <p className="text-sm soft-text">
            No progress records found yet. Save progress from the learning hub and submit assignments to populate the dashboard.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <article className="gradient-stat">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#ffc79e]">Overall Progress</p>
              <p className="mt-2 text-4xl font-extrabold">{progress.progressPercentage}%</p>
            </article>
            <article className="card p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">Hours Per Day</p>
              <p className="mt-2 text-3xl font-extrabold text-white">{progress.dailyHoursSpent || 0}</p>
            </article>
            <article className="card p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">Modules Completed</p>
              <p className="mt-2 text-3xl font-extrabold text-white">{progress.modulesCompleted || 0}</p>
            </article>
            <article className="card p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">Tests Attended</p>
              <p className="mt-2 text-3xl font-extrabold text-white">{progress.testsAttended || 0}</p>
            </article>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <article className="card p-5">
              <h3 className="text-base font-extrabold text-white">Test Outcomes</h3>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="surface-panel-strong">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#ffd5b8]">Passed</p>
                  <p className="mt-2 text-3xl font-extrabold text-white">{progress.testsPassed || 0}</p>
                </div>
                <div className="surface-panel">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">Failed</p>
                  <p className="mt-2 text-3xl font-extrabold text-white">{progress.testsFailed || 0}</p>
                </div>
              </div>
            </article>

            <article className="card p-5">
              <h3 className="text-base font-extrabold text-white">Completed Tools</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {progress.completedSkills?.map((skill) => <span key={skill} className="chip chip-active">{skill}</span>)}
                {!progress.completedSkills?.length ? <span className="muted">No completed tools yet.</span> : null}
              </div>
            </article>
          </div>

          <article className="card p-5">
            <h3 className="text-base font-extrabold text-white">Tool Progress List</h3>
            <div className="mt-3 grid gap-3">
              {progress.toolProgress?.map((item) => (
                <div key={item.skill} className="surface-panel flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{item.skill}</p>
                    <p className="mt-1 text-xs text-white/60">{item.status}</p>
                  </div>
                  <div className="min-w-[180px]">
                    <div className="h-3 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-[linear-gradient(135deg,#ff00b8,#ff916d)]"
                        style={{ width: `${item.completedPercentage || 0}%` }}
                      />
                    </div>
                    <p className="mt-2 text-right text-sm font-semibold text-white">{item.completedPercentage || 0}%</p>
                  </div>
                </div>
              ))}
              {!progress.toolProgress?.length ? <p className="muted">No tool progress saved yet.</p> : null}
            </div>
          </article>

          <article className="card p-5">
            <h3 className="text-base font-extrabold text-white">Assignment Score List</h3>
            <div className="mt-3 grid gap-2">
              {progress.assignmentScores?.map((item) => (
                <div key={`${item.skill}-${item.milestoneId}`} className="surface-panel flex items-center justify-between">
                  <span className="text-sm font-semibold text-white/88">{item.skill}</span>
                  <span className="chip">Score: {item.score}%</span>
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
