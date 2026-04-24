import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import AppShell from '../components/AppShell';
import api, { authConfig } from '../api';
import { buildProgressPayload, getCurrentUserId, getProgressDraft, getResourceProgress, getRoadmap, getSelection, setProgressDraft, setResourceProgress } from '../learningFlow';

export default function LMSPage() {
  const { token, user } = useAuth();
  const roadmap = getRoadmap();
  const selection = getSelection();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [activeSkill, setActiveSkill] = useState('');
  const [toolProgress, setToolProgress] = useState(getProgressDraft().toolProgress || []);
  const [resourceProgress, setResourceProgressState] = useState(getResourceProgress());
  const [loadError, setLoadError] = useState('');
  const { notify } = useNotifications();

  useEffect(() => {
    if (!token) return;
    if (!roadmap?.missingSkills?.length) return;
    Promise.all(
      roadmap.missingSkills.map((skill) => api.get('/content/by-skill', { ...authConfig(token), params: { skill } }).then((res) => res.data)),
    )
      .then((data) => {
        setCourses(data);
        setActiveSkill(data[0]?.skill || '');
        setLoadError('');
      })
      .catch((err) => {
        setCourses([]);
        setLoadError(err.response?.data?.message || 'Unable to load learning content right now.');
      });
  }, [token, roadmap]);

  const activeCourse = useMemo(
    () => courses.find((course) => course.skill === activeSkill) || courses[0] || null,
    [courses, activeSkill],
  );

  const updateSkillProgress = (skill, completedPercentage) => {
    const next = [
      ...toolProgress.filter((item) => item.skill !== skill),
      { skill, completedPercentage, status: completedPercentage === 100 ? 'Completed' : 'In Progress' },
    ];
    setToolProgress(next);
    setProgressDraft({ ...getProgressDraft(), toolProgress: next });
  };

  const markResourceVisited = (skill, milestoneId, resource) => {
    const resourceKey = `${skill}:${milestoneId}`;
    const current = resourceProgress[resourceKey] || [];
    if (current.includes(resource)) return;
    const nextMap = {
      ...resourceProgress,
      [resourceKey]: [...current, resource],
    };
    setResourceProgressState(nextMap);
    setResourceProgress(nextMap);
    notify({ title: 'Resource completed', message: 'This learning link is now marked in green.', type: 'success', duration: 2200 });

    const milestone = courses
      .find((course) => course.skill === skill)
      ?.milestones?.find((item) => item._id === milestoneId);
    const allVisited = milestone?.resources?.every((item) => nextMap[resourceKey]?.includes(item));
    if (allVisited) {
      notify({ title: `${milestone.title} completed`, message: 'Level completed successfully.', type: 'success', duration: 3200 });
      const currentPercent = toolProgress.find((item) => item.skill === skill)?.completedPercentage || 0;
      updateSkillProgress(skill, Math.min(100, currentPercent + 34));
    }
  };

  const handleSaveProgress = async () => {
    const userId = getCurrentUserId(user);
    const draft = { ...getProgressDraft(), toolProgress };
    const payload = buildProgressPayload(userId, draft);

    await api.post('/progress/update', payload, authConfig(token));
    setProgressDraft({ ...draft, modulesCompleted: payload.modulesCompleted, completedSkills: payload.completedSkills });
    notify({ title: 'Progress saved', message: 'Your learning progress has been updated.', type: 'success' });
  };

  if (!roadmap?.missingSkills?.length) {
    return (
      <AppShell title="Learning Hub" subtitle="Generate a roadmap first to unlock learning content.">
        <div className="card p-6">
          <button onClick={() => navigate('/roadmap')} className="btn-primary">Open Roadmap</button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Learning Hub"
      subtitle="Follow guided course catalogues for each missing tool, track completion, and save progress before moving to assignments."
      actions={<span className="chip chip-active">{selection?.technology || 'Selected Technology'}</span>}
    >
      <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        <section className="card p-4">
          <h3 className="text-base font-extrabold text-white">Missing Tools</h3>
          <div className="mt-3 space-y-2">
            {courses.map((course) => (
              <button
                key={course.skill}
                onClick={() => setActiveSkill(course.skill)}
                className={`w-full rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                  activeSkill === course.skill
                    ? 'border-[#ff916d]/50 bg-[linear-gradient(135deg,rgba(255,0,184,0.18),rgba(255,145,109,0.18))] text-white'
                    : 'border-white/10 bg-white/10 text-white hover:bg-white/15'
                }`}
              >
                {course.skill}
              </button>
            ))}
          </div>
        </section>

        {loadError ? (
          <div className="card p-6">
            <p className="text-sm soft-text">{loadError}</p>
          </div>
        ) : !activeCourse ? (
          <div className="card p-6">
            <p className="text-sm soft-text">Loading course content...</p>
          </div>
        ) : (
          <div className="space-y-5">
            <section className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-extrabold text-white">{activeCourse.skill} Learning Roadmap</h3>
                  <p className="mt-2 text-sm soft-text">{activeCourse.description}</p>
                </div>
                <div className="gradient-stat min-w-[170px]">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#ffd5b8]">Completion</p>
                  <p className="mt-1 text-3xl font-extrabold">
                    {toolProgress.find((item) => item.skill === activeCourse.skill)?.completedPercentage || 0}%
                  </p>
                </div>
              </div>
            </section>

            <div className="grid gap-4">
              {activeCourse.milestones?.map((milestone, index) => (
                <article key={milestone._id} className="card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h4 className="text-lg font-extrabold text-white">{milestone.title}</h4>
                      <p className="mt-1 text-sm soft-text">{milestone.description}</p>
                    </div>
                    <span className="chip">{index === 0 ? 'Level 1' : index === 1 ? 'Level 2' : 'Level 3'}</span>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">YouTube and Learning Resources</p>
                    <div className="mt-2 grid gap-2">
                      {milestone.resources?.map((resource) => (
                        <a
                          key={resource}
                          href={resource}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => markResourceVisited(activeCourse.skill, milestone._id, resource)}
                          className={`surface-panel text-sm font-semibold hover:bg-white/10 ${
                            (resourceProgress[`${activeCourse.skill}:${milestone._id}`] || []).includes(resource)
                              ? 'border-emerald-400/35 bg-emerald-500/12 text-emerald-100'
                              : 'text-fuchsia-300'
                          }`}
                        >
                          <span className="inline-flex items-center gap-2">
                            {(resourceProgress[`${activeCourse.skill}:${milestone._id}`] || []).includes(resource) ? <span className="text-emerald-300">[Done]</span> : null}
                            <span>{resource}</span>
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => updateSkillProgress(activeCourse.skill, Math.min(100, (toolProgress.find((item) => item.skill === activeCourse.skill)?.completedPercentage || 0) + 34))}
                className="btn-secondary"
              >
                Mark Next Level Complete
              </button>
              <button onClick={handleSaveProgress} className="btn-primary">Save Progress</button>
              <button onClick={() => navigate('/assignment')} className="btn-secondary">Go to Assignment</button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
