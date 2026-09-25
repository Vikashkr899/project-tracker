import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import TaskCard from '../components/TaskCard.jsx';
import TaskModal from '../components/TaskModal.jsx';
import BlockerModal from '../components/BlockerModal.jsx';
import ProjectModal from '../components/ProjectModal.jsx';

const TASK_STATUSES = ['To Do', 'In Progress', 'Blocked', 'Done'];

export default function ProjectDetail({ projectId, onBack }) {
  const [project, setProject] = useState(null);
  const [users, setUsers] = useState([]);
  const [activity, setActivity] = useState([]);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [pendingBlockTask, setPendingBlockTask] = useState(null);
  const [showActivity, setShowActivity] = useState(false);

  async function loadProject() {
    try {
      const data = await api.getProject(projectId);
      setProject(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadActivity() {
    const logs = await api.listActivity({ projectId });
    setActivity(logs);
  }

  useEffect(() => {
    loadProject();
    api.listUsers().then(setUsers).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    if (showActivity) loadActivity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showActivity, projectId]);

  if (error) return <p className="error-text">Error: {error}</p>;
  if (!project) return <p>Loading project...</p>;

  const filteredTasks = (project.tasks || []).filter((t) => {
    if (statusFilter && t.status !== statusFilter) return false;
    if (assigneeFilter && String(t.assigneeId) !== String(assigneeFilter)) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  async function handleCreateTask(data) {
    await api.createTask(projectId, data);
    await loadProject();
  }

  async function handleEditTask(data) {
    await api.updateTask(editingTask.id, data);
    await loadProject();
  }

  async function handleDeleteTask(task) {
    if (!window.confirm(`Delete task "${task.title}"?`)) return;
    await api.deleteTask(task.id);
    await loadProject();
  }

  async function handleStatusChange(task, newStatus) {
    if (newStatus === 'Blocked') {
      setPendingBlockTask({ task, newStatus });
      return;
    }
    await performStatusChange(task, newStatus, {});
  }

  async function performStatusChange(task, newStatus, extra) {
    try {
      await api.updateTaskStatus(task.id, { status: newStatus, version: task.version, actor: 'current-user', ...extra });
      await loadProject();
    } catch (err) {
      if (err.status === 409) {
        alert('This task was changed by someone else in the meantime. Reloading the latest version.');
        await loadProject();
      } else {
        alert(err.message);
      }
    }
  }

  return (
    <div>
      <button className="link-button" onClick={onBack}>
        ← Back to Projects
      </button>

      <div className="page-header-row">
        <div>
          <h2>{project.name}</h2>
          <p className="project-description">{project.description}</p>
        </div>
        <div className="header-actions">
          <span className={`status-badge status-${project.status.replace(/\s/g, '-').toLowerCase()}`}>
            {project.status}
          </span>
          <button onClick={() => setShowProjectModal(true)}>Edit Project</button>
        </div>
      </div>

      <div className="progress-bar">
        <div className="progress-bar-fill" style={{ width: `${project.taskStats.completionPercentage}%` }} />
      </div>
      <p className="task-stats-summary">
        {project.taskStats.completed}/{project.taskStats.total} tasks done ({project.taskStats.completionPercentage}%)
        · {project.taskStats.pending} pending · {project.taskStats.blocked} blocked
      </p>

      <div className="page-header-row">
        <h3>Tasks</h3>
        <button className="primary" onClick={() => setShowTaskModal(true)}>
          + New Task
        </button>
      </div>

      <div className="filters-row">
        <input placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {TASK_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)}>
          <option value="">All assignees</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </div>

      <div className="task-grid">
        {filteredTasks.map((t) => (
          <TaskCard
            key={t.id}
            task={t}
            onStatusChange={handleStatusChange}
            onEdit={(task) => {
              setEditingTask(task);
              setShowTaskModal(true);
            }}
            onDelete={handleDeleteTask}
          />
        ))}
        {filteredTasks.length === 0 && <p>No tasks match your filters.</p>}
      </div>

      <button className="link-button" onClick={() => setShowActivity((v) => !v)}>
        {showActivity ? 'Hide' : 'Show'} activity history
      </button>

      {showActivity && (
        <ul className="activity-list">
          {activity.map((log) => (
            <li key={log.id}>
              <span className="activity-time">{new Date(log.createdAt).toLocaleString()}</span>{' '}
              <strong>{log.actor}</strong> — {describeActivity(log)}
            </li>
          ))}
          {activity.length === 0 && <li>No activity recorded yet.</li>}
        </ul>
      )}

      {showTaskModal && (
        <TaskModal
          initial={editingTask}
          users={users}
          onSave={editingTask ? handleEditTask : handleCreateTask}
          onClose={() => {
            setShowTaskModal(false);
            setEditingTask(null);
          }}
        />
      )}

      {showProjectModal && (
        <ProjectModal
          initial={project}
          onSave={async (data) => {
            await api.updateProject(project.id, data);
            await loadProject();
          }}
          onClose={() => setShowProjectModal(false)}
        />
      )}

      {pendingBlockTask && (
        <BlockerModal
          onConfirm={(extra) => performStatusChange(pendingBlockTask.task, pendingBlockTask.newStatus, extra)}
          onClose={() => setPendingBlockTask(null)}
        />
      )}
    </div>
  );
}

function describeActivity(log) {
  if (log.action === 'status_change') return `changed status ${log.previousStatus} → ${log.newStatus}`;
  if (log.action === 'task_created') return `created task "${log.task?.title || ''}"`;
  if (log.action === 'task_updated') return 'updated task details';
  if (log.action === 'project_created') return 'created the project';
  if (log.action === 'project_status_change') return `changed project status ${log.previousStatus} → ${log.newStatus}`;
  return log.action;
}
