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
  const [selectedResources, setSelectedResources] = useState({});
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

  const getMilestoneResources = (milestone) => (
    milestone?.resources?.map((resource, index) => (
      typeof resource === 'string'
        ? { id: resource, label: `Resource ${index + 1}`, url: resource }
        : { id: resource.url || `${milestone._id}-${index}`, label: resource.label || `Resource ${index + 1}`, url: resource.url }
    )) || []
  );

  const getCompletedResourceIds = (skill, milestoneId) => resourceProgress[`${skill}:${milestoneId}`] || [];

  const getNextPendingResourceId = (skill, milestone) => {
    const resources = getMilestoneResources(milestone);
    const completed = getCompletedResourceIds(skill, milestone._id);
    const next = resources.find((resource) => !completed.includes(resource.id));
    return next?.id || null;
  };

  const getSelectedResourceId = (skill, milestone) => (
    selectedResources[`${skill}:${milestone._id}`] || null
  );

  const updateSkillProgress = (skill, completedPercentage) => {
    const next = [
      ...toolProgress.filter((item) => item.skill !== skill),
      { skill, completedPercentage, status: completedPercentage === 100 ? 'Completed' : 'In Progress' },
    ];
    setToolProgress(next);
    setProgressDraft({ ...getProgressDraft(), toolProgress: next });
    if (completedPercentage === 100) {
      const currentIndex = courses.findIndex((course) => course.skill === skill);
      const nextSkill = courses[currentIndex + 1]?.skill;
      if (nextSkill) {
        setActiveSkill(nextSkill);
      }
    }
  };

  const handleResourceSelect = (skill, milestone, resource) => {
    const nextPendingId = getNextPendingResourceId(skill, milestone);
    const completed = getCompletedResourceIds(skill, milestone._id).includes(resource.id);
    if (!completed && resource.id !== nextPendingId) {
      notify({ title: 'Finish current step first', message: 'Select and complete the current resource before moving to the next one.', type: 'info', duration: 2200 });
      return;
    }
    setSelectedResources((prev) => ({
      ...prev,
      [`${skill}:${milestone._id}`]: resource.id,
    }));
  };

  const markResourceVisited = (skill, milestone, resource) => {
    const milestoneId = milestone._id;
    const resourceKey = `${skill}:${milestoneId}`;
    const current = resourceProgress[resourceKey] || [];
    const nextPendingId = getNextPendingResourceId(skill, milestone);
    if (resource.id !== nextPendingId && !current.includes(resource.id)) {
      notify({ title: 'Finish current step first', message: 'Complete the current learning link before moving to the next one.', type: 'info', duration: 2500 });
      return;
    }
    if (current.includes(resource.id)) return;
    const nextMap = {
      ...resourceProgress,
      [resourceKey]: [...current, resource.id],
    };
    setResourceProgressState(nextMap);
    setResourceProgress(nextMap);
    const resources = getMilestoneResources(milestone);
    const nextResource = resources.find((item) => !nextMap[resourceKey]?.includes(item.id));
    setSelectedResources((prev) => ({
      ...prev,
      [resourceKey]: null,
    }));
    notify({ title: 'Resource completed', message: `${resource.label} is marked completed.`, type: 'success', duration: 2200 });

    const allVisited = resources.every((item) => nextMap[resourceKey]?.includes(item.id));
    if (allVisited) {
      notify({ title: `${milestone.title} completed`, message: 'Level completed successfully.', type: 'success', duration: 3200 });
      const currentPercent = toolProgress.find((item) => item.skill === skill)?.completedPercentage || 0;
      updateSkillProgress(skill, Math.min(100, currentPercent + 34));
    } else {
      if (nextResource) {
        notify({ title: 'Next resource unlocked', message: `${nextResource.label} is ready now.`, type: 'info', duration: 2400 });
      }
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
                      {getMilestoneResources(milestone).map((resource, resourceIndex) => {
                        const completedIds = getCompletedResourceIds(activeCourse.skill, milestone._id);
                        const completed = completedIds.includes(resource.id);
                        const current = getNextPendingResourceId(activeCourse.skill, milestone) === resource.id;
                        const locked = !completed && !current;
                        const selected = getSelectedResourceId(activeCourse.skill, milestone) === resource.id;
                        const status = completed ? 'Completed' : selected ? 'Selected' : 'Not Completed';
                        return (
                          <div
                            key={resource.id}
                            onClick={() => {
                              if (!completed) {
                                handleResourceSelect(activeCourse.skill, milestone, resource);
                              }
                            }}
                            className={`surface-panel text-sm font-semibold ${
                              completed
                                ? 'border-emerald-400/35 bg-emerald-500/12 text-emerald-100'
                                : selected
                                  ? 'border-[#ff916d]/55 bg-[linear-gradient(135deg,rgba(255,0,184,0.22),rgba(255,145,109,0.18))] text-white'
                                  : current
                                    ? 'border-[#ff916d]/30 bg-white/8 text-white hover:bg-white/10'
                                  : 'cursor-not-allowed border-white/8 bg-white/5 text-white/45'
                            }`}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <span className="inline-flex items-center gap-3">
                                <span className="chip">{resourceIndex + 1}</span>
                                <span>{resource.label}</span>
                              </span>
                              <span className={`text-xs font-bold uppercase tracking-[0.18em] ${
                                completed ? 'text-emerald-300' : selected ? 'text-[#ffd5b8]' : 'text-white/55'
                              }`}>
                                {status}
                              </span>
                            </div>
                            <div className="mt-3 flex flex-wrap items-center gap-3">
                              <a
                                href={locked || (!(selected || current) && !completed) ? undefined : resource.url}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  if (locked || (!(selected || current) && !completed)) {
                                    event.preventDefault();
                                    notify({ title: 'Select the resource first', message: 'Click the resource card first, then open it.', type: 'info', duration: 2200 });
                                    return;
                                  }
                                  if (!completed && !selected) {
                                    handleResourceSelect(activeCourse.skill, milestone, resource);
                                  }
                                }}
                                className={`text-sm font-semibold ${locked || (!(selected || current) && !completed) ? 'text-white/55 hover:text-white/75' : 'text-fuchsia-300 hover:text-[#ffd5b8]'}`}
                              >
                                Open Resource
                              </a>
                              {completed ? (
                                <span className="chip border-emerald-400/35 bg-emerald-500/12 text-emerald-200">
                                  Completed
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    if (locked || !(selected || current)) {
                                      notify({ title: 'Select the resource first', message: 'Click the resource card first, then mark it completed.', type: 'info', duration: 2200 });
                                      return;
                                    }
                                    if (!selected) {
                                      handleResourceSelect(activeCourse.skill, milestone, resource);
                                    }
                                    markResourceVisited(activeCourse.skill, milestone, resource);
                                  }}
                                  className={`btn-secondary ${locked || !(selected || current) ? 'opacity-70' : ''}`}
                                >
                                  Mark as Completed
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
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
