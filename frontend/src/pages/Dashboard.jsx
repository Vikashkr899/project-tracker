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

  if (loading) return <div className="dashboard-loading">Loading dashboard...</div>;
  if (error) return <p className="error-text">Error: {error}</p>;
  if (!stats) return null;

  const donutValues = [
    { label: 'Project Completed', value: stats.projects.completed, color: '#7c3aed' },
    { label: 'In Progress', value: stats.projects.active, color: '#a78bfa' },
    { label: 'Blocked', value: stats.projects.blocked, color: '#f59e0b' },
  ];

  const totalProjectValue = Math.max(stats.projects.total, 1);
  const completionPercent = Math.round((stats.projects.completed / totalProjectValue) * 100);

  return (
    <div className="dashboard-shell">
      <header className="dashboard-header">
        <div>
          <div className="dashboard-kicker">Overview</div>
          <h2>Project Tracker Dashboard</h2>
        </div>
        <button className="primary dashboard-btn">Export</button>
      </header>

      <div className="metrics-row">
        <MetricCard label="Total Projects" value={stats.projects.total} accent="purple" />
        <MetricCard label="Active" value={stats.projects.active} accent="blue" />
        <MetricCard label="Completed" value={stats.projects.completed} accent="green" />
        <MetricCard label="Blocked" value={stats.projects.blocked} accent="amber" />
      </div>

      <div className="dashboard-grid">
        <section className="panel panel-large">
          <div className="panel-top">
            <div>
              <p className="panel-label">Today’s Task</p>
              <h3>Project Health</h3>
            </div>
            <button className="panel-button">See All</button>
          </div>

          <div className="mini-card-row">
            <MiniTaskCard title="Research" count={stats.tasks.total || 0} tone="purple" />
            <MiniTaskCard title="Explore" count={stats.projects.active || 0} tone="blue" />
            <MiniTaskCard title="Competitive" count={stats.projects.blocked || 0} tone="amber" />
          </div>

          <div className="status-panel-row">
            <div className="ring-block">
              <div className="donut-chart" style={{ '--p': `${completionPercent}%`, '--c': '#7c3aed' }}>
                <div className="donut-center">
                  <strong>{completionPercent}%</strong>
                  <span>Complete</span>
                </div>
              </div>
            </div>

            <div className="legend-list">
              {donutValues.map((item) => (
                <div key={item.label} className="legend-item">
                  <span className="legend-dot" style={{ background: item.color }} />
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="panel panel-side">
          <div className="panel-top">
            <div>
              <p className="panel-label">Recent Projects</p>
              <h3>Latest Work</h3>
            </div>
          </div>

          <div className="recent-project-list">
            {recentProjects.map((project) => (
              <button
                key={project.id}
                type="button"
                className="recent-item"
                onClick={() => onOpenProject(project.id)}
              >
                <div className="recent-left">
                  <span className="mini-avatar">{project.name[0]}</span>
                  <div>
                    <strong>{project.name}</strong>
                    <small>{project.taskStats?.completionPercentage ?? 0}% complete</small>
                  </div>
                </div>
                <span className={`status-pill status-${project.status.replace(/\s/g, '-').toLowerCase()}`}>
                  {project.status}
                </span>
              </button>
            ))}
            {recentProjects.length === 0 && <p className="empty-text">No projects yet.</p>}
          </div>
        </section>
      </div>

      <div className="bottom-grid">
        <section className="panel">
          <div className="panel-top">
            <div>
              <p className="panel-label">Performance</p>
              <h3>Task Progress</h3>
            </div>
          </div>

          <div className="bar-chart">
            {[55, 68, 72, 82, 60, 90].map((value, index) => (
              <div key={index} className="bar-group">
                <div className="bar-rail">
                  <span className="bar-fill" style={{ height: `${value}%` }} />
                </div>
                <small>{['M', 'T', 'W', 'T', 'F', 'S'][index]}</small>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-top">
            <div>
              <p className="panel-label">Task Stats</p>
              <h3>Completion</h3>
            </div>
          </div>

          <div className="task-stats-list">
            <div className="task-stat-item">
              <span>Total Tasks</span>
              <strong>{stats.tasks.total}</strong>
            </div>
            <div className="task-stat-item">
              <span>Completed</span>
              <strong>{stats.tasks.completed}</strong>
            </div>
            <div className="task-stat-item">
              <span>Blocked</span>
              <strong>{stats.tasks.blocked}</strong>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function MetricCard({ label, value, accent }) {
  return (
    <div className={`metric-card accent-${accent}`}>
      <div className="metric-icon" />
      <div className="metric-copy">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function MiniTaskCard({ title, count, tone }) {
  return (
    <div className={`mini-task-card tone-${tone}`}>
      <div className="mini-task-top">
        <span>{title}</span>
        <small>{count}</small>
      </div>
      <div className="mini-task-progress">
        <span style={{ width: `${Math.min(count * 15, 100)}%` }} />
      </div>
    </div>
  );
}
