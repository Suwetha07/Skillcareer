import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppShell from '../components/AppShell';
import api, { authConfig } from '../api';

export default function CareerPage() {
  const { token, user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [skills, setSkills] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Programming Languages');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    api.get('/career/categories', authConfig(token))
      .then((res) => setCategories(res.data))
      .catch(() => setCategories([]));
  }, [token, navigate]);

  useEffect(() => {
    if (!selectedCategory) return;
    api.get(`/career/skills/${selectedCategory}`, authConfig(token))
      .then((res) => setSkills(res.data))
      .catch(() => setSkills([]));
  }, [selectedCategory, token]);

  return (
    <AppShell
      title="Career Path Catalog"
      subtitle="Browse categories and discover job-relevant skill stacks."
      actions={<span className="chip chip-active">Role: {user?.role || 'N/A'}</span>}
    >
      <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <section className="card p-4">
          <h3 className="text-base font-extrabold text-slate-900">Categories</h3>
          <div className="mt-3 space-y-2">
            {categories.map((category) => {
              const active = selectedCategory === category.name;
              return (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`w-full rounded-xl border px-3 py-2 text-left text-sm font-semibold transition ${
                    active
                      ? 'border-teal-200 bg-teal-50 text-teal-800'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        </section>

        <section className="card p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-lg font-extrabold text-slate-900">Skills for {selectedCategory}</h3>
            <button onClick={() => navigate('/skill-analysis')} className="btn-secondary">Analyze Match</button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {skills.map((skill) => (
              <div key={skill} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700">
                {skill}
              </div>
            ))}
            {!skills.length ? <p className="text-sm text-slate-500">No skills available for this category.</p> : null}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
