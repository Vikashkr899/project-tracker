import { useState } from 'react';

export default function BlockerModal({ onConfirm, onClose }) {
  const [reason, setReason] = useState('');
  const [reportedBy, setReportedBy] = useState('');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!reason.trim() || !reportedBy.trim()) {
      setError('Both a reason and your name are required to mark a task Blocked.');
      return;
    }
    setSaving(true);
    try {
      await onConfirm({ blockerReason: reason, blockerReportedBy: reportedBy });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Report Blocker</h3>
        <form onSubmit={handleSubmit}>
          <label>
            Blocker reason
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} autoFocus />
          </label>
          <label>
            Reported by
            <input value={reportedBy} onChange={(e) => setReportedBy(e.target.value)} placeholder="Your name" />
          </label>
          {error && <p className="error-text">{error}</p>}
          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="primary" disabled={saving}>
              {saving ? 'Saving...' : 'Mark Blocked'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
