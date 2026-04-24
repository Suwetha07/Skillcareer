import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
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
  const { notify } = useNotifications();

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
      notify({ title: 'Profile updated successfully', message: 'Your recommendations are refreshed.', type: 'success' });
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Update failed';
      setMessage(errorMessage);
      notify({ title: 'Profile update failed', message: errorMessage, type: 'error' });
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
                  className={`rounded-2xl border px-3 py-2.5 text-sm font-semibold transition ${
                    active
                      ? 'border-[#ff916d]/50 bg-[linear-gradient(135deg,rgba(255,0,184,0.18),rgba(255,145,109,0.18))] text-white'
                      : 'border-white/10 bg-white/5 text-white/72 hover:bg-white/10'
                  }`}
                >
                  {interest}
                </button>
              );
            })}
          </div>
        </div>

        {message ? <p className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/84">{message}</p> : null}

        <div className="mt-5 flex justify-end">
          <button className="btn-primary" type="submit">Save Profile</button>
        </div>
      </form>
    </AppShell>
  );
}
