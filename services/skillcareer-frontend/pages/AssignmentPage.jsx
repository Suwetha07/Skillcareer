import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import AppShell from '../components/AppShell';
import api, { authConfig } from '../api';
import { buildProgressPayload, getCurrentUserId, getProgressDraft, getRoadmap, setProgressDraft } from '../learningFlow';

export default function AssignmentPage() {
  const { token, user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedMilestoneId, setSelectedMilestoneId] = useState('');
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [loadError, setLoadError] = useState('');
  const roadmap = getRoadmap();
  const navigate = useNavigate();
  const { notify } = useNotifications();

  useEffect(() => {
    if (!token || !roadmap?.missingSkills?.length) return;
    Promise.all(
      roadmap.missingSkills.map((skill) => api.get('/content/by-skill', { ...authConfig(token), params: { skill } }).then((res) => res.data)),
    )
      .then((data) => {
        setCourses(data);
        const firstSkill = data[0]?.skill || '';
        const firstMilestone = data[0]?.milestones?.[0]?._id || '';
        setSelectedSkill(firstSkill);
        setSelectedMilestoneId(firstMilestone);
        setLoadError('');
      })
      .catch((err) => {
        setCourses([]);
        setLoadError(err.response?.data?.message || 'Unable to load assignment data right now.');
      });
  }, [token, roadmap]);

  const activeCourse = useMemo(
    () => courses.find((course) => course.skill === selectedSkill) || null,
    [courses, selectedSkill],
  );

  const activeMilestone = useMemo(
    () => activeCourse?.milestones?.find((milestone) => milestone._id === selectedMilestoneId) || null,
    [activeCourse, selectedMilestoneId],
  );

  const handleSubmit = async () => {
    if (!activeCourse || !activeMilestone) return;
    try {
      const { data } = await api.post('/content/assignment/submit', {
        skill: activeCourse.skill,
        milestoneId: activeMilestone._id,
        submission: 'MCQ evaluation submitted',
        answers,
        userId: getCurrentUserId(user),
      }, authConfig(token));
      setResult(data);

      const draft = getProgressDraft();
      const nextAssignmentScores = [
        ...(draft.assignmentScores || []).filter((item) => !(item.skill === activeCourse.skill && item.milestoneId === activeMilestone._id)),
        { skill: activeCourse.skill, milestoneId: activeMilestone._id, score: data.score },
      ];
      const nextDraft = {
        ...draft,
        assignmentScores: nextAssignmentScores,
        testsAttended: (draft.testsAttended || 0) + 1,
        testsPassed: (draft.testsPassed || 0) + (data.passed ? 1 : 0),
        testsFailed: (draft.testsFailed || 0) + (data.passed ? 0 : 1),
      };
      setProgressDraft(nextDraft);
      const userId = getCurrentUserId(user);
      if (userId) {
        await api.post('/progress/update', buildProgressPayload(userId, nextDraft), authConfig(token));
      }
      notify({
        title: data.passed ? 'Assignment passed' : 'Assignment failed',
        message: data.passed ? `You passed with ${data.score}%.` : `You scored ${data.score}%. Retest is available.`,
        type: data.passed ? 'success' : 'error',
      });
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      setResult({ score: 0, passed: false, completed: false, message });
      notify({ title: 'Assignment submission failed', message, type: 'error' });
    }
  };

  const handleRetest = () => {
    setAnswers([]);
    setResult(null);
    notify({ title: 'Retest enabled', message: 'You can attempt this milestone again.', type: 'info' });
  };

  if (!roadmap?.missingSkills?.length) {
    return (
      <AppShell title="Assignment Center" subtitle="Learning content must be available before assignments can be attempted.">
        <div className="card p-6">
          <button onClick={() => navigate('/lms')} className="btn-primary">Open Learning Hub</button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Assignment Center"
      subtitle="Choose a milestone, attempt the medium MCQ assessment, and pass with at least 60 percent."
      actions={<span className="chip chip-active">Pass Mark: 60%</span>}
    >
      {loadError ? (
        <div className="card p-6">
          <p className="text-sm soft-text">{loadError}</p>
        </div>
      ) : !activeCourse || !activeMilestone ? (
        <div className="card p-6">
          <p className="text-sm soft-text">Loading assignment data...</p>
        </div>
      ) : (
        <div className="card p-5">
          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <span className="field-label">Choose Tool</span>
                <select
                  value={selectedSkill}
                  onChange={(e) => {
                    const nextCourse = courses.find((course) => course.skill === e.target.value);
                    setSelectedSkill(e.target.value);
                    setSelectedMilestoneId(nextCourse?.milestones?.[0]?._id || '');
                    setAnswers([]);
                  }}
                  className="field-select"
                >
                  {courses.map((course) => (
                    <option key={course.skill} value={course.skill}>{course.skill}</option>
                  ))}
                </select>
              </label>

              <label>
                <span className="field-label">Choose Milestone</span>
                <select
                  value={selectedMilestoneId}
                  onChange={(e) => {
                    setSelectedMilestoneId(e.target.value);
                    setAnswers([]);
                  }}
                  className="field-select"
                >
                  {activeCourse.milestones?.map((milestone) => (
                    <option key={milestone._id} value={milestone._id}>{milestone.title}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="surface-panel-strong">
              <p className="text-sm font-semibold text-white">Difficulty: Medium</p>
              <p className="mt-1 text-sm text-white/84">{activeMilestone.assignment?.question}</p>
            </div>

            <div className="grid gap-4">
              {activeMilestone.assignment?.quiz?.map((question, index) => (
                <div key={question.prompt} className="surface-panel">
                  <p className="text-sm font-semibold text-white">{index + 1}. {question.prompt}</p>
                  <div className="mt-3 grid gap-2">
                    {question.options.map((option) => (
                      <label key={option} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white">
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value={option}
                          checked={answers[index] === option}
                          onChange={() => {
                            const next = [...answers];
                            next[index] = option;
                            setAnswers(next);
                          }}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button onClick={handleSubmit} className="btn-primary">Submit Assignment</button>
              {result && !result.passed ? <button onClick={handleRetest} className="btn-secondary">Retest</button> : null}
              {result ? (
                <p className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${result.passed ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100' : 'border-rose-400/25 bg-rose-400/10 text-rose-100'}`}>
                  Score: {result.score}% | Status: {result.passed ? 'Passed' : 'Failed'}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
