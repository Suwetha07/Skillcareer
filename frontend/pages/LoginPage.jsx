import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import AuthLayout from '../components/AuthLayout';
import api from '../api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const { notify } = useNotifications();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/user/login', { email, password });
      login(data);
      notify({ title: 'Logged in successfully', message: 'Your dashboard is ready.', type: 'success' });
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Login failed';
      setError(message);
      notify({ title: 'Login failed', message, type: 'error' });
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue your learning and career journey."
      sideTitle="Launch your next growth sprint"
      sideText="Track progress, close skill gaps, and build a roadmap with confidence."
      footer={<span>New here? <Link className="font-semibold text-fuchsia-300" to="/signup">Create account</Link></span>}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <label>
          <span className="field-label">Email</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field-input"
            type="email"
            required
            placeholder="you@company.com"
          />
        </label>
        <label>
          <span className="field-label">Password</span>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field-input"
            type="password"
            required
            placeholder="Enter your password"
          />
        </label>
        {error ? <p className="rounded-2xl border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{error}</p> : null}
        <button className="btn-primary w-full" type="submit">Sign In</button>
      </form>
    </AuthLayout>
  );
}
