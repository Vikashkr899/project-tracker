import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

export default function Dashboard({ onOpenProject }) {
  const [stats, setStats] = useState(null);
  const [recentProjects, setRecentProjects] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([api.getDashboard(), api.listProjects()])
      .then(([dashboard, projects]) => {
        if (cancelled) return;
        setStats(dashboard);
        setRecentProjects(projects.slice(0, 5));
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p className="error-text">Error: {error}</p>;

  return (
    <div>
      <h2>Dashboard</h2>
      <div className="stat-grid">
        <StatCard label="Total Projects" value={stats.projects.total} />
        <StatCard label="Active Projects" value={stats.projects.active} />
        <StatCard label="Completed Projects" value={stats.projects.completed} />
        <StatCard label="Blocked Projects" value={stats.projects.blocked} />
        <StatCard label="Total Tasks" value={stats.tasks.total} />
        <StatCard label="Completed Tasks" value={stats.tasks.completed} />
        <StatCard label="Blocked Tasks" value={stats.tasks.blocked} />
      </div>

      <h3>Recent Projects</h3>
      <ul className="project-list">
        {recentProjects.map((p) => (
          <li key={p.id} className="project-list-item" onClick={() => onOpenProject(p.id)}>
            <span className="project-name">{p.name}</span>
            <span className={`status-badge status-${p.status.replace(/\s/g, '-').toLowerCase()}`}>{p.status}</span>
            <span className="project-progress">{p.taskStats.completionPercentage}% complete</span>
          </li>
        ))}
        {recentProjects.length === 0 && <p>No projects yet. Create one from the Projects tab.</p>}
      </ul>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
