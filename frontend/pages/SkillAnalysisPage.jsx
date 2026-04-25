import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import AppShell from '../components/AppShell';
import api, { authConfig } from '../api';
import { getSelection, setAnalysis } from '../learningFlow';

export default function SkillAnalysisPage() {
  const { token, user } = useAuth();
  const selection = getSelection();
  const [userSkills, setUserSkills] = useState(user?.skills || []);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [typedSkill, setTypedSkill] = useState('');
  const [result, setResult] = useState(null);
  const navigate = useNavigate();
  const { notify } = useNotifications();

  useEffect(() => {
    if (!selection) {
      navigate('/career');
    }
  }, [selection, navigate]);

  const availableSkills = useMemo(
    () => (selection?.targetSkills || []).filter((skill) => !userSkills.includes(skill)),
    [selection, userSkills],
  );

  const addSkill = (skill) => {
    if (!skill || userSkills.includes(skill)) return;
    setUserSkills((prev) => [...prev, skill]);
  };

  const handleAnalyze = async () => {
    if (!selection) return;
    try {
      const { data } = await api.post('/skill/analyze', {
        userSkills,
        careerSkills: selection.targetSkills,
        targetTechnology: selection.technology,
        targetCategory: selection.category,
        stack: selection.stack,
      }, authConfig(token));
      setResult(data);
      setAnalysis({
        ...data,
        userSkills,
        targetSkills: selection.targetSkills,
        technology: selection.technology,
        category: selection.category,
        stack: selection.stack,
      });
      notify({ title: 'Skill analysis completed', message: `Match score: ${data.score}%`, type: 'success' });
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      setResult({
        score: 0,
        level: 'beginner',
        matched: [],
        missing: selection?.targetSkills || [],
        message,
      });
      notify({ title: 'Skill analysis failed', message, type: 'error' });
    }
  };

  const handleCreateRoadmap = () => {
    if (!result) return;
    navigate('/roadmap');
  };

  if (!selection) return null;

  return (
    <AppShell
      title="Skill Analysis"
      subtitle="Add your existing skills, compare them against the selected technology stack, and generate the roadmap from the missing skills."
      actions={<span className="chip chip-active">{selection.technology}</span>}
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <article className="card p-5">
          <h3 className="text-base font-extrabold text-white">Your Skills</h3>
          <p className="muted mt-1">Use the dropdown for exact target skills, or type manually with the same case.</p>

          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="field-select"
            >
              <option value="">Choose target skill</option>
              {availableSkills.map((skill) => (
                <option key={skill} value={skill}>{skill}</option>
              ))}
            </select>
            <button type="button" onClick={() => { addSkill(selectedSkill); setSelectedSkill(''); }} className="btn-secondary">
              Add Target Skill
            </button>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]">
            <input
              value={typedSkill}
              onChange={(e) => setTypedSkill(e.target.value)}
              className="field-input"
              placeholder="Type skill exactly, for example Node.js"
            />
            <button type="button" onClick={() => { addSkill(typedSkill.trim()); setTypedSkill(''); }} className="btn-primary">
              Add Typed Skill
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {userSkills.map((skill) => <span key={skill} className="chip chip-active">{skill}</span>)}
            {!userSkills.length ? <span className="muted">No skills added yet.</span> : null}
          </div>
        </article>

        <article className="card p-5">
          <h3 className="text-base font-extrabold text-white">Target Technology</h3>
          <p className="mt-2 text-base font-bold text-white">{selection.technology}</p>
          <p className="mt-1 text-sm text-white/88">{selection.stack}</p>

          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#ffd5b8]">Target Stack Skills</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {selection.targetSkills.map((skill) => <span key={skill} className="chip">{skill}</span>)}
            </div>
          </div>
        </article>
      </div>

      <div className="flex justify-center">
        <button onClick={handleAnalyze} className="btn-primary min-w-[280px] justify-center">Analyze Skill Match</button>
      </div>

      {result ? (
        <article className="card p-5">
          <h3 className="text-lg font-extrabold text-white">Analysis Result</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <div className="gradient-stat">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#ffc79e]">Match Score</p>
              <p className="mt-1 text-3xl font-extrabold">{result.score}%</p>
              <p className="mt-2 text-sm text-white/80">Frozen level: {result.level}</p>
            </div>
            <div className="surface-panel md:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#ffd5b8]">Matched Skills</p>
              <p className="mt-2 text-sm text-white">{result.matched?.join(', ') || 'None yet'}</p>
            </div>
          </div>

          <div className="surface-panel-strong mt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#ffd5b8]">Missing Skills</p>
            <p className="mt-2 text-sm text-white">{result.missing?.join(', ') || 'No missing skills'}</p>
            {result.missing?.length ? (
              <div className="mt-4 flex justify-center">
                <button onClick={handleCreateRoadmap} className="btn-primary min-w-[240px] justify-center">
                  Create Roadmap
                </button>
              </div>
            ) : null}
          </div>
        </article>
      ) : null}
    </AppShell>
  );
}
