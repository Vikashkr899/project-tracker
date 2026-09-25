import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import ProjectModal from '../components/ProjectModal.jsx';

const STATUSES = ['Planning', 'In Progress', 'Blocked', 'Completed'];

export default function Projects({ onOpenProject }) {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);

  async function load() {
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const data = await api.listProjects(params);
      setProjects(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter]);

  async function handleCreate(data) {
    await api.createProject(data);
    await load();
  }

  return (
    <div>
      <div className="page-header-row">
        <h2>Projects</h2>
        <button className="primary" onClick={() => setShowModal(true)}>
          + New Project
        </button>
      </div>

      <div className="filters-row">
        <input
          placeholder="Search projects by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="project-grid">
        {projects.map((p) => (
          <div key={p.id} className="project-card" onClick={() => onOpenProject(p.id)}>
            <div className="project-card-header">
              <span className="project-name">{p.name}</span>
              <span className={`status-badge status-${p.status.replace(/\s/g, '-').toLowerCase()}`}>{p.status}</span>
            </div>
            <p className="project-description">{p.description}</p>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${p.taskStats.completionPercentage}%` }} />
            </div>
            <div className="project-card-footer">
              <span>{p.taskStats.completionPercentage}% complete</span>
              <span>
                {p.taskStats.completed}/{p.taskStats.total} tasks
              </span>
              {p.taskStats.blocked > 0 && <span className="blocked-count">{p.taskStats.blocked} blocked</span>}
            </div>
          </div>
        ))}
        {projects.length === 0 && <p>No projects match your filters.</p>}
      </div>

      {showModal && <ProjectModal onSave={handleCreate} onClose={() => setShowModal(false)} />}
    </div>
  );
}
