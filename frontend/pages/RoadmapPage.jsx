import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AppShell from '../components/AppShell';
import api, { authConfig } from '../api';

export default function RoadmapPage() {
  const { token } = useAuth();
  const [level, setLevel] = useState('beginner');
  const [dailyStudyTime, setDailyStudyTime] = useState(2);
  const [completionTarget, setCompletionTarget] = useState(80);
  const [roadmap, setRoadmap] = useState(null);
  const [missingSkills] = useState(['Node.js', 'Docker', 'REST APIs']);

  const handleGenerate = async () => {
    const { data } = await api.post('/roadmap/generate', {
        role: 'Student',
        interests: ['Cloud', 'DevOps'],
        missingSkills,
        level,
        dailyStudyTime,
        completionTarget,
      }, authConfig(token));
    setRoadmap(data);
  };

  const handleSchedule = async () => {
    const { data } = await api.post('/roadmap/schedule', { roadmapId: roadmap._id, startDate: new Date().toISOString().split('T')[0] }, authConfig(token));
    setRoadmap(data);
  };

  return (
    <AppShell
      title="Roadmap Builder"
      subtitle="Generate a realistic, milestone-based study plan aligned with your goals."
    >
      <div className="card p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <label>
            <span className="field-label">Skill Level</span>
            <select value={level} onChange={(e) => setLevel(e.target.value)} className="field-select">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </label>
          <label>
            <span className="field-label">Daily Study Time (hrs)</span>
            <input
              type="number"
              min="1"
              value={dailyStudyTime}
              onChange={(e) => setDailyStudyTime(Number(e.target.value))}
              className="field-input"
            />
          </label>
          <label>
            <span className="field-label">Completion Target (%)</span>
            <input
              type="number"
              min="50"
              max="100"
              value={completionTarget}
              onChange={(e) => setCompletionTarget(Number(e.target.value))}
              className="field-input"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button onClick={handleGenerate} className="btn-primary">Generate Roadmap</button>
          {roadmap ? <button onClick={handleSchedule} className="btn-secondary">Create Study Schedule</button> : null}
        </div>
      </div>

      {roadmap ? (
        <article className="card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-extrabold">Roadmap Overview</h3>
            <span className="chip chip-active">Total Days: {roadmap.totalDays}</span>
          </div>
          <div className="mt-4 grid gap-3">
            {roadmap.structured?.map((item) => (
              <div key={item.skill} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-extrabold text-slate-900">{item.order}. {item.skill}</p>
                  <span className="chip">{item.phase}</span>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {item.durationDays} days planned | {item.sessions} sessions
                </p>
              </div>
            ))}
          </div>
        </article>
      ) : null}
    </AppShell>
  );
}
