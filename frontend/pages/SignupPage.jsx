import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import api from '../api';

const interestOptions = ['Frontend', 'Backend', 'Cloud', 'Data', 'DevOps', 'Security'];

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Student');
  const [interests, setInterests] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const toggleInterest = (interest) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((item) => item !== interest) : [...prev, interest],
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/user/register', { name, email, password, role, interests });
      login(data);
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Signup failed');
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Set your profile once and get personalized recommendations."
      sideTitle="Build a learning strategy that fits you"
      sideText="From targeted skill analysis to practical assignments, everything starts with your profile."
      footer={<span>Already have an account? <Link className="font-semibold text-teal-700" to="/login">Login</Link></span>}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className="field-label">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="field-input"
              required
              placeholder="Your full name"
            />
          </label>
          <label>
            <span className="field-label">Email</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="field-input"
              required
              placeholder="you@company.com"
            />
          </label>
        </div>

        <label>
          <span className="field-label">Password</span>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className="field-input"
            required
            placeholder="Create a secure password"
          />
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

        <div>
          <span className="field-label">Interests</span>
          <div className="grid grid-cols-2 gap-2">
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

        {error ? <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

        <button className="btn-primary w-full" type="submit">Create Account</button>
      </form>
    </AuthLayout>
  );
}
