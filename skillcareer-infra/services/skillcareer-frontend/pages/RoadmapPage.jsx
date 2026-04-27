import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import AppShell from '../components/AppShell';
import api, { authConfig } from '../api';
import { getAnalysis, getSelection, setRoadmap } from '../learningFlow';

export default function RoadmapPage() {
  const { token, user } = useAuth();
  const analysis = getAnalysis();
  const selection = getSelection();
  const [dailyStudyTime, setDailyStudyTime] = useState(2);
  const [roadmap, setRoadmapState] = useState(null);
  const navigate = useNavigate();
  const { notify } = useNotifications();

  const handleGenerate = async () => {
    if (!analysis || !selection) return;
    const { data } = await api.post('/roadmap/generate', {
      role: user?.role || 'Student',
      interests: user?.interests || [],
      targetTechnology: selection.technology,
      targetCategory: selection.category,
      missingSkills: analysis.missing,
      score: analysis.score,
      dailyStudyTime,
      completionTarget: 100,
    }, authConfig(token));
    setRoadmapState(data);
    setRoadmap(data);
    notify({ title: 'Roadmap generated', message: `${data.structured?.length || 0} missing skill modules created.`, type: 'success' });
  };

  if (!analysis || !selection) {
    return (
      <AppShell title="Roadmap Builder" subtitle="Complete skill analysis first to generate the roadmap.">
        <div className="card p-6">
          <button onClick={() => navigate('/skill-analysis')} className="btn-primary">Go to Skill Analysis</button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Roadmap Builder"
      subtitle="The level is frozen from your match score, and the roadmap is generated only for the missing skills."
      actions={<span className="chip chip-active">{selection.technology}</span>}
    >
      <div className="card p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="surface-panel">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#ffd5b8]">Frozen Skill Level</p>
            <p className="mt-2 text-2xl font-extrabold text-white">{analysis.level}</p>
            <p className="mt-2 text-sm text-white/80">This level is locked based on your match score of {analysis.score}%.</p>
          </div>
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
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#ffd5b8]">Missing Skills for {selection.technology}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {analysis.missing.map((skill) => <span key={skill} className="chip chip-active">{skill}</span>)}
          </div>
        </div>

        <div className="mt-5 flex justify-center">
          <button onClick={handleGenerate} className="btn-primary min-w-[280px] justify-center">Generate Roadmap</button>
        </div>
      </div>

      {roadmap ? (
        <article className="card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-extrabold text-white">Roadmap Overview</h3>
            <span className="chip chip-active">Total Days: {roadmap.totalDays}</span>
          </div>
          <div className="mt-4 grid gap-3">
            {roadmap.structured?.map((item) => (
              <div key={item.skill} className="surface-panel">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-extrabold text-white">{item.order}. {item.skill}</p>
                  <span className="chip">{item.phase}</span>
                </div>
                <p className="mt-1 text-sm soft-text">
                  {item.durationDays} days planned | {item.sessions} sessions
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.subtopics?.map((topic) => <span key={topic} className="chip">{topic}</span>)}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-center">
            <button onClick={() => navigate('/lms')} className="btn-primary min-w-[320px] justify-center">
              Proceed to Learning Content
            </button>
          </div>
        </article>
      ) : null}
    </AppShell>
  );
}
