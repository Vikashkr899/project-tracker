import { useState } from 'react';

const DEMO_CREDENTIALS = {
  email: 'admin@projecttracker.com',
  password: 'admin123'
};

export default function Login({ onLogin, error }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:4000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (response.ok) {
        onLogin(data);
      } else {
        console.error('Login failed:', data.message || 'Unknown error');
      }
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  }

  function useDemoCredentials() {
    setFormData(DEMO_CREDENTIALS);
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-form-panel">
          <div className="auth-header">
            <h1>Project Tracker</h1>
            <p>Manage your projects efficiently</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" className="auth-btn" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="demo-credentials">
            <p className="demo-title">Demo Credentials:</p>
            <div className="demo-info">
              <div><strong>Email:</strong> {DEMO_CREDENTIALS.email}</div>
              <div><strong>Password:</strong> {DEMO_CREDENTIALS.password}</div>
            </div>
            <button type="button" className="demo-btn" onClick={useDemoCredentials}>
              Use Demo Credentials
            </button>
          </div>
        </div>

        <div className="auth-visual-panel">
          <svg viewBox="0 0 200 200" className="auth-illustration">
            <circle cx="100" cy="60" r="35" fill="#7c3aed" opacity="0.1"/>
            <path d="M 70 100 L 100 120 L 130 100" stroke="#7c3aed" strokeWidth="2" fill="none" opacity="0.3"/>
            <rect x="60" y="130" width="80" height="3" fill="#7c3aed" opacity="0.2"/>
            <circle cx="100" cy="100" r="50" fill="none" stroke="#7c3aed" strokeWidth="1" opacity="0.2"/>
          </svg>
          <div className="visual-text">
            <h2>Welcome Back</h2>
            <p>Track your projects and manage your team</p>
          </div>
        </div>
      </div>
    </div>
  );
}
