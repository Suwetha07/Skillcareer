import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppShell from '../components/AppShell';
import api, { authConfig } from '../api';

export default function SkillAnalysisPage() {
  const { token, user } = useAuth();
  const [careerSkills] = useState(['JavaScript', 'React', 'Node.js', 'MongoDB']);
  const [userSkills, setUserSkills] = useState(user?.skills || []);
  const [result, setResult] = useState(null);
  const [skillInput, setSkillInput] = useState('');
  const navigate = useNavigate();

  const addSkill = () => {
    if (!skillInput.trim()) return;
    setUserSkills((prev) => Array.from(new Set([...prev, skillInput.trim()])));
    setSkillInput('');
  };

  const handleAnalyze = async () => {
    try {
      const { data } = await api.post('/skill/analyze', { userSkills, careerSkills }, authConfig(token));
      setResult(data);
    } catch (err) {
      setResult({ score: 0, matched: [], missing: [], message: err.response?.data?.message || err.message });
    }
  };

  return (
    <AppShell
      title="Skill Analysis"
      subtitle="Compare your current capabilities against the target stack."
      actions={<button onClick={() => navigate('/roadmap')} className="btn-secondary">Go To Roadmap</button>}
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <article className="card p-5">
          <h3 className="text-base font-extrabold">Your Skills</h3>
          <p className="muted mt-1">Add your core tools and technologies.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {userSkills.map((skill) => <span key={skill} className="chip chip-active">{skill}</span>)}
            {!userSkills.length ? <span className="muted">No skills added yet.</span> : null}
          </div>
          <div className="mt-4 flex gap-2">
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              className="field-input"
              placeholder="Add a skill"
            />
            <button type="button" onClick={addSkill} className="btn-primary">Add</button>
          </div>
        </article>

        <article className="card p-5">
          <h3 className="text-base font-extrabold">Target Career Skills</h3>
          <p className="muted mt-1">Benchmark list used for the match score.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {careerSkills.map((skill) => <span key={skill} className="chip">{skill}</span>)}
          </div>
        </article>
      </div>

      <div className="flex flex-wrap gap-3">
        <button onClick={handleAnalyze} className="btn-primary">Analyze Skill Match</button>
        <button onClick={() => navigate('/roadmap')} className="btn-secondary">Build Learning Plan</button>
      </div>

      {result ? (
        <article className="card p-5">
          <h3 className="text-lg font-extrabold">Analysis Result</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-teal-200 bg-teal-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">Match Score</p>
              <p className="mt-1 text-3xl font-extrabold text-teal-900">{result.score}%</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 md:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Matched Skills</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{result.matched?.join(', ') || 'None'}</p>
            </div>
          </div>
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">Missing Skills</p>
            <p className="mt-1 text-sm font-semibold text-amber-900">{result.missing?.join(', ') || 'None'}</p>
          </div>
        </article>
      ) : null}
    </AppShell>
  );
}
