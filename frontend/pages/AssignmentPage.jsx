import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AppShell from '../components/AppShell';
import api, { authConfig } from '../api';

export default function AssignmentPage() {
  const { token, user } = useAuth();
  const [course, setCourse] = useState(null);
  const [submission, setSubmission] = useState('');
  const [selectedMilestoneId, setSelectedMilestoneId] = useState('');
  const [result, setResult] = useState(null);
  const skill = 'Docker';

  useEffect(() => {
    if (!token) return;
    api.get(`/content/${skill}`, authConfig(token))
      .then((res) => {
        const data = res.data;
        setCourse(data);
        if (data.milestones?.length) setSelectedMilestoneId(data.milestones[0]._id);
      })
      .catch(() => setCourse(null));
  }, [token]);

  const handleSubmit = async () => {
    try {
      const { data } = await api.post('/content/assignment/submit', {
        skill,
        milestoneId: selectedMilestoneId,
        submission,
        userId: user?.id || user?.userId,
      }, authConfig(token));
      setResult(data);
    } catch (err) {
      setResult({ score: 'N/A', completed: false, message: err.response?.data?.message || err.message });
    }
  };

  return (
    <AppShell
      title="Assignment Center"
      subtitle="Submit milestone assignments and receive completion feedback."
      actions={<span className="chip">Skill: {skill}</span>}
    >
      {!course ? (
        <div className="card p-6">
          <p className="text-sm text-slate-600">Loading assignment data...</p>
        </div>
      ) : (
        <div className="card p-5">
          <div className="grid gap-4">
            <label>
              <span className="field-label">Choose Milestone</span>
              <select
                value={selectedMilestoneId}
                onChange={(e) => setSelectedMilestoneId(e.target.value)}
                className="field-select"
              >
                {course.milestones?.map((milestone) => (
                  <option key={milestone._id} value={milestone._id}>{milestone.title}</option>
                ))}
              </select>
            </label>

            <label>
              <span className="field-label">Your Submission</span>
              <textarea
                value={submission}
                onChange={(e) => setSubmission(e.target.value)}
                className="field-textarea"
                rows="7"
                placeholder="Explain your solution, approach, and outcomes."
              />
            </label>

            <div className="flex flex-wrap items-center gap-3">
              <button onClick={handleSubmit} className="btn-primary">Submit Assignment</button>
              {result ? (
                <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                  Score: {result.score} | Status: {result.completed ? 'Completed' : 'Pending'}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
