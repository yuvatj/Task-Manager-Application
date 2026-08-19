import React, { useState, useEffect } from 'react';
import { useAppContext } from '../store';
import type { TaskStatus, UrgencyLevel } from '../types';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

const STATUS_OPTIONS: { id: TaskStatus; label: string }[] = [
  { id: 'todo', label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'review', label: 'Review' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'done', label: 'Done' },
];

export const TaskEditor: React.FC<{ taskId: string }> = ({ taskId }) => {
  const { tasks, projects, users, members, updateTask, currentUserRole } = useAppContext();
  const isReadOnly = currentUserRole !== 'admin';
  const task = tasks.find(t => t.id === taskId);
  const assignableUsers = [...users, ...members.map(m => ({ id: m.id, name: m.name, role: 'Member' }))];

  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [projectId, setProjectId] = useState(task?.projectId || '');
  const [urgency, setUrgency] = useState<UrgencyLevel>(task?.urgency || 'medium');
  const [status, setStatus] = useState<TaskStatus>(task?.status || 'todo');
  const [startDate, setStartDate] = useState(task?.startDate || '');
  const [deliveryDate, setDeliveryDate] = useState(task?.deliveryDate || '');
  const [assigneeId, setAssigneeId] = useState(task?.assignee?.id || '');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setProjectId(task.projectId);
      setUrgency(task.urgency || 'medium');
      setStatus(task.status || 'todo');
      setStartDate(task.startDate || '');
      setDeliveryDate(task.deliveryDate || '');
      setAssigneeId(task.assignee?.id || '');
    }
  }, [task]);

  if (!task) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Task not found</h2>
        <button className="btn-primary" onClick={() => window.close()}>Close Window</button>
      </div>
    );
  }

  const handleSave = () => {
    updateTask(taskId, {
      title,
      description,
      projectId,
      urgency,
      status,
      startDate,
      deliveryDate,
      assignee: assignableUsers.find(u => u.id === assigneeId) || null
    });
    alert('Task saved successfully!');
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
         <button className="btn-secondary" onClick={() => { window.location.hash = ''; window.close(); }} style={{ padding: '8px', borderRadius: '50%', border: 'none' }} title="Go Back">
           <ArrowLeft size={20} />
         </button>
         <div>
           <h1 style={{ margin: 0, fontSize: '2rem' }}>Edit Task</h1>
           <p style={{ margin: 0, color: 'var(--text-secondary)' }}>ID: {task.id}</p>
         </div>
      </div>

      <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Task Title</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} disabled={isReadOnly} style={{ width: '100%', padding: '12px', fontSize: '1.1rem' }} />
        </div>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
           <div style={{ flex: 1, minWidth: '200px' }}>
             <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Project</label>
             <select value={projectId} onChange={e => setProjectId(e.target.value)} disabled={isReadOnly} style={{ width: '100%', padding: '12px' }}>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
             </select>
           </div>
           <div style={{ flex: 1, minWidth: '200px' }}>
             <label style={{ display: 'flex', marginBottom: '8px', fontWeight: 500, alignItems: 'center', gap: '6px' }}>
               <AlertCircle size={16} /> Urgency Level
             </label>
             <select value={urgency} onChange={e => setUrgency(e.target.value as UrgencyLevel)} disabled={isReadOnly} style={{ width: '100%', padding: '12px' }}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
             </select>
           </div>
           <div style={{ flex: 1, minWidth: '200px' }}>
             <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Assignee</label>
             <select value={assigneeId} onChange={e => setAssigneeId(e.target.value)} disabled={isReadOnly} style={{ width: '100%', padding: '12px' }}>
                <option value="">Unassigned</option>
                {assignableUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
             </select>
           </div>
           <div style={{ flex: 1, minWidth: '200px' }}>
             <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Status</label>
             <select value={status} onChange={e => setStatus(e.target.value as TaskStatus)} disabled={isReadOnly} style={{ width: '100%', padding: '12px' }}>
                {STATUS_OPTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
             </select>
           </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
           <div style={{ flex: 1, minWidth: '200px' }}>
             <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Start Date</label>
             <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} disabled={isReadOnly} style={{ width: '100%', padding: '12px' }} />
           </div>
           <div style={{ flex: 1, minWidth: '200px' }}>
             <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Delivery Date</label>
             <input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} disabled={isReadOnly} style={{ width: '100%', padding: '12px' }} />
           </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} disabled={isReadOnly} rows={8} style={{ width: '100%', padding: '12px', fontSize: '1rem', resize: 'vertical' }} />
        </div>

        {!isReadOnly && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
             <button className="btn-primary" onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}>
               <Save size={18} /> Save Changes
             </button>
          </div>
        )}
      </div>
    </div>
  );
};
