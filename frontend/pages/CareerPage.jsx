import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppShell from '../components/AppShell';
import api, { authConfig } from '../api';
import { setSelection } from '../learningFlow';

export default function CareerPage() {
  const { token, user } = useAuth();
  const [catalog, setCatalog] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Programming Languages');
  const [selectedTechnology, setSelectedTechnology] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    api.get('/career/catalog', authConfig(token))
      .then((res) => {
        setCatalog(res.data);
        const firstCategory = res.data.find((item) => item.name === 'Programming Languages') || res.data[0];
        setSelectedCategory(firstCategory?.name || '');
        setSelectedTechnology(firstCategory?.technologies?.[0] || null);
      })
      .catch(() => setCatalog([]));
  }, [token, navigate]);

  const activeCategory = useMemo(
    () => catalog.find((item) => item.name === selectedCategory) || null,
    [catalog, selectedCategory],
  );

  useEffect(() => {
    if (!activeCategory) return;
    setSelectedTechnology(activeCategory.technologies?.[0] || null);
  }, [activeCategory]);

  const handleAnalyze = () => {
    if (!selectedTechnology) return;
    setSelection({
      category: selectedCategory,
      technology: selectedTechnology.name,
      stack: selectedTechnology.stack,
      targetSkills: selectedTechnology.skills,
      roles: selectedTechnology.roles,
      companies: selectedTechnology.companies,
    });
    navigate('/skill-analysis');
  };

  return (
    <AppShell
      title="Career Catalogue"
      subtitle="Choose a technology track, see in-demand companies and roles, then move into skill analysis."
      actions={<span className="chip chip-active">Role: {user?.role || 'N/A'}</span>}
    >
      <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <section className="card p-4">
          <h3 className="text-base font-extrabold text-white">Categories</h3>
          <div className="mt-3 space-y-2">
            {catalog.map((category) => {
              const active = selectedCategory === category.name;
              return (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                    active
                      ? 'border-[#ff916d]/50 bg-[linear-gradient(135deg,rgba(255,0,184,0.18),rgba(255,145,109,0.18))] text-white'
                      : 'border-white/10 bg-white/10 text-white hover:bg-white/15'
                  }`}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        </section>

        <section className="card p-5">
          <div className="mb-4">
            <h3 className="text-lg font-extrabold text-white">Course Catalogue for {selectedCategory}</h3>
            <p className="mt-2 text-sm text-white/78">Pick one technology to view relevant skills, hiring companies, and matching job roles.</p>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {activeCategory?.technologies?.map((technology) => {
              const active = selectedTechnology?.name === technology.name;
              return (
                <button
                  key={technology.name}
                  type="button"
                  onClick={() => setSelectedTechnology(technology)}
                  className={`card p-5 text-left transition ${
                    active ? 'border-[#ff916d]/40 shadow-[0_24px_48px_rgba(255,0,184,0.14)]' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-xl font-extrabold text-white">{technology.name}</h4>
                      <p className="mt-2 text-sm text-white/76">{technology.stack}</p>
                    </div>
                    <span className={`chip ${active ? 'chip-active' : ''}`}>{technology.skills.length} skills</span>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#ffd5b8]">Relevant Skills</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {technology.skills.map((skill) => <span key={skill} className="chip">{skill}</span>)}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="surface-panel">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">Companies</p>
                      <p className="mt-2 text-sm text-white/88">{technology.companies.join(', ')}</p>
                    </div>
                    <div className="surface-panel">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">Roles</p>
                      <p className="mt-2 text-sm text-white/88">{technology.roles.join(', ')}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedTechnology ? (
            <div className="mt-6 flex justify-center">
              <button onClick={handleAnalyze} className="btn-primary min-w-[260px] justify-center">
                Analyze Match for {selectedTechnology.name}
              </button>
            </div>
          ) : null}
        </section>
      </div>
    </AppShell>
  );
}
