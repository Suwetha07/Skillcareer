import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import api, { authConfig } from '../api';

const interestOptions = ['Frontend', 'Backend', 'Cloud', 'Data', 'DevOps', 'Security'];

export default function ProfilePage() {
  const { token, user, setUser } = useAuth();
  const [role, setRole] = useState(user?.role || 'Student');
  const [interests, setInterests] = useState(user?.interests || []);
  const [experience, setExperience] = useState(user?.experience || '');
  const [name, setName] = useState(user?.name || '');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) navigate('/login');
  }, [token, navigate]);

  const toggleInterest = (interest) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((item) => item !== interest) : [...prev, interest],
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const { data } = await api.put('/user/profile/update', { name, role, interests, experience }, authConfig(token));
      setUser(data);
      setMessage('Profile updated successfully.');
      navigate('/dashboard');
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || 'Update failed');
    }
  };

  return (
    <AppShell
      title="Profile Settings"
      subtitle="Keep your role, interests, and experience up to date for better recommendations."
    >
      <form onSubmit={handleSubmit} className="card p-5 md:p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label>
            <span className="field-label">Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className="field-input" required />
          </label>
          <label>
            <span className="field-label">Role</span>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="field-select">
              <option>Student</option>
              <option>Fresher</option>
              <option>Experienced</option>
              <option>Job Seeker</option>
            </select>
          </label>
        </div>

        <label className="mt-4 block">
          <span className="field-label">Experience Summary</span>
          <textarea
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="field-textarea"
            rows="4"
            placeholder="Tell us about your practical experience and projects."
          />
        </label>

        <div className="mt-4">
          <span className="field-label">Interests</span>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {interestOptions.map((interest) => {
              const active = interests.includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                    active
                      ? 'border-teal-200 bg-teal-50 text-teal-800'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {interest}
                </button>
              );
            })}
          </div>
        </div>

        {message ? <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">{message}</p> : null}

        <div className="mt-5 flex justify-end">
          <button className="btn-primary" type="submit">Save Profile</button>
        </div>
      </form>
    </AppShell>
  );
}
