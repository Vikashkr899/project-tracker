import { useEffect, useState } from 'react';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Projects from './pages/Projects.jsx';
import ProjectDetail from './pages/ProjectDetail.jsx';

const SESSION_KEY = 'project-tracker-session';

export default function App() {
  const [view, setView] = useState({ page: 'dashboard' });
  const [session, setSession] = useState(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [session]);

  function handleLogin({ email, password }) {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setLoginError('Please enter both email and password.');
      return;
    }

    if (trimmedEmail === 'admin@projecttracker.com' && trimmedPassword === 'admin123') {
      setSession({
        name: 'Admin User',
        email: trimmedEmail,
        loggedInAt: new Date().toISOString(),
      });
      setLoginError('');
      setView({ page: 'dashboard' });
      return;
    }

    setLoginError('Invalid email or password. Use admin@projecttracker.com / admin123');
  }

  function handleLogout() {
    setSession(null);
    setView({ page: 'dashboard' });
    setLoginError('');
  }

  function goToProject(projectId) {
    setView({ page: 'project', projectId });
  }

  if (!session) {
    return <Login onLogin={handleLogin} loginError={loginError} />;
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1 onClick={() => setView({ page: 'dashboard' })} className="app-title">
          Project Delivery Tracker
        </h1>

        <div className="header-right">
          <nav className="app-nav">
            <button className={view.page === 'dashboard' ? 'active' : ''} onClick={() => setView({ page: 'dashboard' })}>
              Dashboard
            </button>
            <button className={view.page === 'projects' ? 'active' : ''} onClick={() => setView({ page: 'projects' })}>
              Projects
            </button>
          </nav>

          <div className="user-panel">
            <span className="user-name">{session.name}</span>
            <button className="link-button logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
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
