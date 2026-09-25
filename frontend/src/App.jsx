import { useState } from 'react';
import Dashboard from './pages/Dashboard.jsx';
import Projects from './pages/Projects.jsx';
import ProjectDetail from './pages/ProjectDetail.jsx';

export default function App() {
  const [view, setView] = useState({ page: 'dashboard' });

  function goToProject(projectId) {
    setView({ page: 'project', projectId });
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1 onClick={() => setView({ page: 'dashboard' })} className="app-title">
          Project Delivery Tracker
        </h1>
        <nav className="app-nav">
          <button className={view.page === 'dashboard' ? 'active' : ''} onClick={() => setView({ page: 'dashboard' })}>
            Dashboard
          </button>
          <button className={view.page === 'projects' ? 'active' : ''} onClick={() => setView({ page: 'projects' })}>
            Projects
          </button>
        </nav>
      </header>

      <main className="app-main">
        {view.page === 'dashboard' && <Dashboard onOpenProject={goToProject} />}
        {view.page === 'projects' && <Projects onOpenProject={goToProject} />}
        {view.page === 'project' && (
          <ProjectDetail projectId={view.projectId} onBack={() => setView({ page: 'projects' })} />
        )}
      </main>
    </div>
  );
}
