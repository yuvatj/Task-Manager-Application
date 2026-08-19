import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../store';
import { v4 as uuidv4 } from 'uuid';
import { X, Plus, Trash2, Flag, BarChart3 } from 'lucide-react';
import type { Project, Task, ChecklistItem, Milestone } from '../types';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '10px',
  border: '1px solid var(--border-color)',
  backgroundColor: 'var(--bg-color-secondary)',
  color: 'var(--text-primary)',
  fontSize: '0.9rem',
  outline: 'none',
  boxSizing: 'border-box'
};

const sectionHeadingStyle: React.CSSProperties = {
  fontSize: '1.1rem', margin: '0 0 12px 0', color: 'var(--text-primary)',
  display: 'flex', alignItems: 'center', gap: '8px'
};

const URGENCY_COLOR: Record<string, string> = {
  critical: 'var(--danger-color)',
  high: 'var(--warning-color)',
  medium: 'var(--brand-color)',
  low: 'var(--text-secondary)',
};

const Timeline: React.FC<{ tasks: Task[]; milestones: Milestone[] }> = ({ tasks, milestones }) => {
  const dated = tasks.filter(t => t.startDate && t.deliveryDate);
  const allDates: number[] = [];
  dated.forEach(t => { allDates.push(new Date(t.startDate).getTime(), new Date(t.deliveryDate).getTime()); });
  milestones.forEach(m => { if (m.date) allDates.push(new Date(m.date).getTime()); });

  if (allDates.length === 0) {
    return <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>No dated tasks or milestones yet — add dates to see the timeline.</p>;
  }

  const min = Math.min(...allDates);
  const max = Math.max(...allDates);
  const span = Math.max(max - min, 86400000);
  const pad = span * 0.05;
  const rangeMin = min - pad;
  const rangeMax = max + pad;
  const rangeSpan = rangeMax - rangeMin;
  const pct = (t: number) => ((t - rangeMin) / rangeSpan) * 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {milestones.length > 0 && (
        <div style={{ position: 'relative', height: '24px', marginBottom: '4px' }}>
          {milestones.filter(m => m.date).map(m => (
            <div
              key={m.id}
              title={`${m.title} — ${new Date(m.date).toLocaleDateString()}`}
              style={{ position: 'absolute', left: `${pct(new Date(m.date).getTime())}%`, top: 0, transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}
            >
              <Flag size={14} color={m.completed ? 'var(--success-color)' : 'var(--brand-color)'} />
            </div>
          ))}
        </div>
      )}

      {dated.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.85rem' }}>No tasks with both a start and delivery date yet.</p>
      ) : dated.map(task => {
        const left = pct(new Date(task.startDate).getTime());
        const right = pct(new Date(task.deliveryDate).getTime());
        const width = Math.max(right - left, 1.5);
        return (
          <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ width: '160px', flexShrink: 0, fontSize: '0.8rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={task.title}>
              {task.title}
            </span>
            <div style={{ position: 'relative', flex: 1, height: '10px', backgroundColor: 'var(--subtle-fill)', borderRadius: '6px' }}>
              <div
                style={{
                  position: 'absolute', left: `${left}%`, width: `${width}%`, top: 0, bottom: 0,
                  borderRadius: '6px', backgroundColor: URGENCY_COLOR[task.urgency] || 'var(--brand-color)',
                  opacity: task.status === 'done' ? 0.5 : 1
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const ProjectInsights: React.FC<{ project: Project | null; tasks: Task[]; onClose: () => void }> = ({ project, tasks, onClose }) => {
  const { updateProject, currentUserRole } = useAppContext();
  const isReadOnly = currentUserRole !== 'admin';

  const [scope, setScope] = useState('');
  const [deliverables, setDeliverables] = useState<ChecklistItem[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [newDeliverable, setNewDeliverable] = useState('');
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('');
  const [saving, setSaving] = useState(false);

  const skipNextScopeSave = useRef(true);

  useEffect(() => {
    if (project) {
      skipNextScopeSave.current = true;
      setScope(project.scope || '');
      setDeliverables(project.deliverables || []);
      setMilestones(project.milestones || []);
    }
  }, [project]);

  useEffect(() => {
    document.body.style.overflow = project ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [project]);

  // Auto-save the scope text a moment after typing stops, instead of relying
  // only on blur — otherwise closing the modal via Escape (which doesn't blur
  // the textarea first) would silently drop the edit.
  useEffect(() => {
    if (skipNextScopeSave.current) { skipNextScopeSave.current = false; return; }
    if (!project) return;
    const timer = setTimeout(() => {
      setSaving(true);
      updateProject(project.id, { scope }).finally(() => setSaving(false));
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope]);

  if (!project) return null;

  const persist = (updates: Partial<Project>) => {
    setSaving(true);
    updateProject(project.id, updates).finally(() => setSaving(false));
  };

  const addDeliverable = () => {
    if (!newDeliverable.trim()) return;
    const next = [...deliverables, { id: uuidv4(), text: newDeliverable.trim(), done: false }];
    setDeliverables(next);
    setNewDeliverable('');
    persist({ deliverables: next });
  };

  const toggleDeliverable = (id: string) => {
    const next = deliverables.map(d => (d.id === id ? { ...d, done: !d.done } : d));
    setDeliverables(next);
    persist({ deliverables: next });
  };

  const removeDeliverable = (id: string) => {
    const next = deliverables.filter(d => d.id !== id);
    setDeliverables(next);
    persist({ deliverables: next });
  };

  const addMilestone = () => {
    if (!newMilestoneTitle.trim() || !newMilestoneDate) return;
    const next = [...milestones, { id: uuidv4(), title: newMilestoneTitle.trim(), date: newMilestoneDate, completed: false }]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setMilestones(next);
    setNewMilestoneTitle('');
    setNewMilestoneDate('');
    persist({ milestones: next });
  };

  const toggleMilestone = (id: string) => {
    const next = milestones.map(m => (m.id === id ? { ...m, completed: !m.completed } : m));
    setMilestones(next);
    persist({ milestones: next });
  };

  const removeMilestone = (id: string) => {
    const next = milestones.filter(m => m.id !== id);
    setMilestones(next);
    persist({ milestones: next });
  };

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)'
      }}
    >
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '820px', maxHeight: '85vh', margin: '0 24px', overflowY: 'auto', position: 'relative' }}>
        <div style={{ position: 'sticky', top: 0, backgroundColor: 'var(--bg-color-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '32px 32px 20px 32px', borderBottom: '1px solid var(--border-color)', zIndex: 1 }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{project.name} — Insights</h1>
            <p style={{ color: 'var(--text-secondary)', margin: '6px 0 0 0', fontSize: '0.95rem' }}>Scope, deliverables, milestones, and timeline for this project.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close insights"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'transparent', color: 'var(--text-secondary)', flexShrink: 0 }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '28px 32px 32px 32px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div>
            <h2 style={sectionHeadingStyle}><BarChart3 size={18} /> Timeline</h2>
            <Timeline tasks={tasks} milestones={milestones} />
          </div>

          <div>
            <h2 style={sectionHeadingStyle}>Scope</h2>
            <textarea
              value={scope}
              onChange={e => setScope(e.target.value)}
              disabled={isReadOnly}
              rows={4}
              placeholder="Describe what this project covers, and what's explicitly out of scope..."
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          <div>
            <h2 style={sectionHeadingStyle}>Deliverables</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
              {deliverables.map(d => (
                <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '8px', backgroundColor: 'var(--subtle-fill)' }}>
                  <input type="checkbox" checked={d.done} disabled={isReadOnly} onChange={() => toggleDeliverable(d.id)} />
                  <span style={{ flex: 1, fontSize: '0.9rem', textDecoration: d.done ? 'line-through' : 'none', color: d.done ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{d.text}</span>
                  {!isReadOnly && (
                    <button type="button" onClick={() => removeDeliverable(d.id)} style={{ background: 'transparent', color: 'var(--text-secondary)', padding: '2px' }} title="Remove">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))}
              {deliverables.length === 0 && <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No deliverables added yet.</p>}
            </div>
            {!isReadOnly && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" value={newDeliverable} onChange={e => setNewDeliverable(e.target.value)} onKeyDown={e => e.key === 'Enter' && addDeliverable()} placeholder="Add a deliverable..." style={inputStyle} />
                <button type="button" className="btn-secondary" onClick={addDeliverable} style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}><Plus size={16} /> Add</button>
              </div>
            )}
          </div>

          <div>
            <h2 style={sectionHeadingStyle}><Flag size={18} /> Milestones</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
              {milestones.map(m => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '8px', backgroundColor: 'var(--subtle-fill)' }}>
                  <input type="checkbox" checked={m.completed} disabled={isReadOnly} onChange={() => toggleMilestone(m.id)} />
                  <span style={{ flex: 1, fontSize: '0.9rem', textDecoration: m.completed ? 'line-through' : 'none', color: m.completed ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{m.title}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{m.date ? new Date(m.date).toLocaleDateString() : ''}</span>
                  {!isReadOnly && (
                    <button type="button" onClick={() => removeMilestone(m.id)} style={{ background: 'transparent', color: 'var(--text-secondary)', padding: '2px' }} title="Remove">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))}
              {milestones.length === 0 && <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No milestones added yet.</p>}
            </div>
            {!isReadOnly && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" value={newMilestoneTitle} onChange={e => setNewMilestoneTitle(e.target.value)} placeholder="Milestone title..." style={{ ...inputStyle, flex: 2 }} />
                <input type="date" value={newMilestoneDate} onChange={e => setNewMilestoneDate(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                <button type="button" className="btn-secondary" onClick={addMilestone} style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}><Plus size={16} /> Add</button>
              </div>
            )}
          </div>

          {saving && <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Saving…</p>}
        </div>
      </div>
    </div>
  );
};
