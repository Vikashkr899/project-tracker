const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  let body = null;
  const text = await res.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!res.ok) {
    const error = new Error((body && body.message) || `Request failed with status ${res.status}`);
    error.status = res.status;
    error.body = body;
    throw error;
  }

  return body;
}

export const api = {
  // Dashboard
  getDashboard: () => request('/dashboard'),

  // Projects
  listProjects: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/projects${qs ? `?${qs}` : ''}`);
  },
  getProject: (id) => request(`/projects/${id}`),
  createProject: (data) => request('/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateProject: (id, data) => request(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteProject: (id) => request(`/projects/${id}`, { method: 'DELETE' }),

  // Tasks
  listTasks: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/tasks${qs ? `?${qs}` : ''}`);
  },
  createTask: (projectId, data) => request(`/projects/${projectId}/tasks`, { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id, data) => request(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  updateTaskStatus: (id, data) => request(`/tasks/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),

  // Users
  listUsers: () => request('/users'),
  createUser: (data) => request('/users', { method: 'POST', body: JSON.stringify(data) }),

  // Employees
  listEmployees: () => request('/employees'),
  getEmployee: (id) => request(`/employees/${id}`),
  createEmployee: (data) => request('/employees', { method: 'POST', body: JSON.stringify(data) }),
  updateEmployee: (id, data) => request(`/employees/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteEmployee: (id) => request(`/employees/${id}`, { method: 'DELETE' }),
  
  // Project-Developer assignments
  assignEmployeeToProject: (projectId, employeeId, role = 'Developer') =>
    request('/employees/assign', { method: 'POST', body: JSON.stringify({ projectId, employeeId, role }) }),
  removeEmployeeFromProject: (projectId, employeeId) =>
    request('/employees/remove', { method: 'POST', body: JSON.stringify({ projectId, employeeId }) }),
  getProjectDevelopers: (projectId) => request(`/employees/project/${projectId}/developers`),

  // Activity
  listActivity: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/activity${qs ? `?${qs}` : ''}`);
  },
};
