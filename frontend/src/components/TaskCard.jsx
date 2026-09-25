import { useState } from 'react';

const STATUSES = ['To Do', 'In Progress', 'Blocked', 'Done'];

export default function TaskCard({ task, onStatusChange, onEdit, onDelete }) {
  const [changing, setChanging] = useState(false);

  async function handleStatusSelect(e) {
    const newStatus = e.target.value;
    if (newStatus === task.status) return;
    setChanging(true);
    try {
      await onStatusChange(task, newStatus);
    } finally {
      setChanging(false);
    }
  }

  return (
    <div className={`task-card priority-${task.priority.toLowerCase()}`}>
      <div className="task-card-top">
        <span className="task-title">{task.title}</span>
        <span className={`priority-badge priority-${task.priority.toLowerCase()}`}>{task.priority}</span>
      </div>
      {task.description && <p className="task-description">{task.description}</p>}
      <div className="task-meta">
        <span>{task.assignee ? task.assignee.name : 'Unassigned'}</span>
        {task.deadline && <span>Due {task.deadline}</span>}
      </div>

      {task.status === 'Blocked' && task.blockerReason && (
        <div className="blocker-box">
          <strong>Blocked:</strong> {task.blockerReason}
          <div className="blocker-meta">
            reported by {task.blockerReportedBy}
            {task.blockerReportedAt && ` · ${new Date(task.blockerReportedAt).toLocaleString()}`}
          </div>
        </div>
      )}

      <div className="task-card-actions">
        <select value={task.status} onChange={handleStatusSelect} disabled={changing}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button onClick={() => onEdit(task)}>Edit</button>
        <button onClick={() => onDelete(task)} className="danger">
          Delete
        </button>
      </div>
    </div>
  );
}
