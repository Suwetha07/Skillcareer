import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import AuthLayout from '../components/AuthLayout';
import api from '../api';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Student');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const { notify } = useNotifications();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/user/register', { name, email, phone, password, role });
      login(data);
      notify({ title: 'User registered successfully', message: 'Complete your profile to continue.', type: 'success' });
      navigate('/profile');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Signup failed';
      setError(message);
      notify({ title: 'Signup failed', message, type: 'error' });
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Set your profile once and get personalized recommendations."
      sideTitle="Build a learning strategy that fits you"
      sideText="From targeted skill analysis to practical assignments, everything starts with your profile."
      footer={<span>Already have an account? <Link className="font-semibold text-fuchsia-300" to="/login">Login</Link></span>}
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
          <label>
            <span className="field-label">Phone</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              className="field-input"
              required
              placeholder="Enter phone number"
            />
          </label>
          <label>
            <span className="field-label">Role</span>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="field-select">
              <option value="Student">Student</option>
              <option value="Fresher">Fresher</option>
              <option value="Experienced">Experienced</option>
              <option value="Job Seeker">Job Seeker</option>
            </select>
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

        {error ? <p className="rounded-2xl border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{error}</p> : null}

        <button className="btn-primary w-full" type="submit">Create Account</button>
      </form>
    </AuthLayout>
  );
}
