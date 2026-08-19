import React, { useEffect, useState } from 'react';
import { useAppContext } from '../store';
import { v4 as uuidv4 } from 'uuid';
import type { Task } from '../types';
import { X, CheckCircle, ExternalLink, Plus, Trash2, MessageSquare, ListChecks, History } from 'lucide-react';

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid var(--border-color)',
  backgroundColor: 'var(--bg-color-secondary)',
  color: 'var(--text-primary)',
  fontSize: '0.9rem',
  outline: 'none'
};

const timeAgo = (iso: string) => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export const TaskDetailModal: React.FC<{ task: Task | null, onClose: () => void }> = ({ task, onClose }) => {
  const { updateTaskStatus, updateTask, currentUserRole, currentActorName } = useAppContext();
  const isReadOnly = currentUserRole !== 'admin';
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [newComment, setNewComment] = useState('');

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (task) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [task]);

  useEffect(() => {
    setNewChecklistItem('');
    setNewComment('');
  }, [task?.id]);

  if (!task) return null;

  const checklist = task.checklist || [];
  const comments = task.comments || [];
  const activity = task.activity || [];

  const toggleChecklistItem = (itemId: string) => {
    updateTask(task.id, { checklist: checklist.map(c => (c.id === itemId ? { ...c, done: !c.done } : c)) });
  };

  const addChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    updateTask(task.id, { checklist: [...checklist, { id: uuidv4(), text: newChecklistItem.trim(), done: false }] });
    setNewChecklistItem('');
  };

  const removeChecklistItem = (itemId: string) => {
    updateTask(task.id, { checklist: checklist.filter(c => c.id !== itemId) });
  };

  const addComment = () => {
    if (!newComment.trim()) return;
    const commentEntry = { id: uuidv4(), authorName: currentActorName, text: newComment.trim(), createdAt: new Date().toISOString() };
    const activityEntry = { id: uuidv4(), message: 'Added a comment', actor: currentActorName, createdAt: new Date().toISOString() };
    updateTask(task.id, { comments: [...comments, commentEntry], activity: [...activity, activityEntry] });
    setNewComment('');
  };

  return (
    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '750px', padding: '40px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ position: 'absolute', top: '24px', right: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => { window.open('#task-' + task.id, '_blank'); onClose(); }} style={{ background: 'transparent', color: 'var(--text-secondary)' }} title="Open in new window">
            <ExternalLink size={22} />
          </button>
          <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text-secondary)' }} title="Close">
            <X size={24} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <h2 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--text-primary)' }}>{task.title}</h2>
          <span style={{ fontSize: '0.85rem', padding: '6px 14px', borderRadius: '20px', backgroundColor: 'var(--subtle-fill)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', fontWeight: 600, textTransform: 'uppercase' }}>
            {task.status}
          </span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div>
            <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-secondary)', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</h4>
            <p style={{ margin: 0, color: 'var(--text-primary)', lineHeight: 1.6, fontSize: '1.05rem', whiteSpace: 'pre-wrap' }}>
              {task.description || "No description provided."}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '32px', backgroundColor: 'var(--subtle-fill)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '140px' }}>
              <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Dates</h4>
              <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem' }}><strong>Start:</strong> {task.startDate ? new Date(task.startDate).toLocaleDateString() : 'N/A'}</p>
              <p style={{ margin: 0, fontSize: '0.9rem' }}><strong>Due:</strong> {task.deliveryDate ? new Date(task.deliveryDate).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div style={{ flex: 1, minWidth: '140px' }}>
              <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Assignee</h4>
              <p style={{ margin: 0, fontWeight: 500 }}>{task.assignee ? task.assignee.name : 'Unassigned'}</p>
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Engineer Details</h4>
              <p style={{ margin: 0, fontWeight: 500 }}>{task.engineerName || 'N/A'}</p>
            </div>
            <div style={{ flex: 1, minWidth: '120px' }}>
              <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Urgency</h4>
              <p style={{ margin: 0, fontWeight: 600, color: task.urgency === 'critical' ? 'var(--danger-color)' : task.urgency === 'high' ? 'var(--warning-color)' : 'var(--text-primary)', textTransform: 'capitalize' }}>
                {task.urgency || 'medium'}
              </p>
            </div>
            <div style={{ flex: 1 }}>
               <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Tags</h4>
               <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                 {task.tags && task.tags.map((tag, idx) => (
                   <span key={idx} style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', backgroundColor: 'var(--chip-bg)', color: 'var(--chip-text)', border: '1px solid var(--chip-border)' }}>
                     #{tag}
                   </span>
                 ))}
               </div>
            </div>
          </div>

          <div>
             <h4 style={{ margin: '0 0 12px 0', color: 'var(--text-secondary)', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reference Documents</h4>
             {((task.referenceFiles && task.referenceFiles.length > 0) || (task.referenceFileNames && task.referenceFileNames.length > 0)) ? (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                 {task.referenceFiles && task.referenceFiles.map((file, i) => (
                   <div key={`file-${i}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: 'var(--subtle-fill)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                     <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-primary)' }}>{file.name}</span>
                     <button 
                       onClick={() => window.open(file.data, '_blank')}
                       style={{ padding: '6px 14px', backgroundColor: 'var(--accent-color)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                     >
                       Open / Download
                     </button>
                   </div>
                 ))}
                 {/* Fallback for legacy tasks */}
                 {(!task.referenceFiles || task.referenceFiles.length === 0) && task.referenceFileNames && task.referenceFileNames.map((name, i) => (
                   <div key={`name-${i}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: 'var(--subtle-fill)', borderRadius: '8px', border: '1px solid var(--border-color)', opacity: 0.7 }}>
                     <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>{name} (Link not available)</span>
                   </div>
                 ))}
               </div>
             ) : <p style={{ margin: 0, color: 'var(--text-secondary)' }}>No documents attached.</p>}
          </div>

          {task.images && task.images.length > 0 && (
            <div>
               <h4 style={{ margin: '0 0 16px 0', color: 'var(--text-secondary)', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Images</h4>
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
                 {task.images.map((src, i) => (
                   <div key={i} style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column' }}>
                     <img src={src} alt={`attachment-${i + 1}`} style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block' }} />
                     <button
                       onClick={() => window.open(src, '_blank')}
                       style={{ width: '100%', padding: '8px', background: 'var(--bg-color-secondary)', border: 'none', borderTop: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: 'var(--brand-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                     >
                       🔍 View Full Image
                     </button>
                   </div>
                 ))}
               </div>
            </div>
          )}

          <div>
            <h4 style={{ margin: '0 0 12px 0', color: 'var(--text-secondary)', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ListChecks size={16} /> Checklist {checklist.length > 0 && `(${checklist.filter(c => c.done).length}/${checklist.length})`}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
              {checklist.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '8px', backgroundColor: 'var(--subtle-fill)' }}>
                  <input type="checkbox" checked={item.done} onChange={() => toggleChecklistItem(item.id)} />
                  <span style={{ flex: 1, fontSize: '0.9rem', textDecoration: item.done ? 'line-through' : 'none', color: item.done ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{item.text}</span>
                  {!isReadOnly && (
                    <button type="button" onClick={() => removeChecklistItem(item.id)} style={{ background: 'transparent', color: 'var(--text-secondary)', padding: '2px' }} title="Remove">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))}
              {checklist.length === 0 && <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No checklist items yet.</p>}
            </div>
            {!isReadOnly && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" value={newChecklistItem} onChange={e => setNewChecklistItem(e.target.value)} onKeyDown={e => e.key === 'Enter' && addChecklistItem()} placeholder="Add a checklist item..." style={inputStyle} />
                <button type="button" className="btn-secondary" onClick={addChecklistItem} style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}><Plus size={16} /> Add</button>
              </div>
            )}
          </div>

          <div>
            <h4 style={{ margin: '0 0 12px 0', color: 'var(--text-secondary)', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={16} /> Comments {comments.length > 0 && `(${comments.length})`}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '10px' }}>
              {comments.map(c => (
                <div key={c.id} style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: 'var(--subtle-fill)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{c.authorName}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{timeAgo(c.createdAt)}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{c.text}</p>
                </div>
              ))}
              {comments.length === 0 && <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No comments yet.</p>}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="text" value={newComment} onChange={e => setNewComment(e.target.value)} onKeyDown={e => e.key === 'Enter' && addComment()} placeholder="Write a comment..." style={inputStyle} />
              <button type="button" className="btn-secondary" onClick={addComment} style={{ flexShrink: 0 }}>Post</button>
            </div>
          </div>

          {activity.length > 0 && (
            <div>
              <h4 style={{ margin: '0 0 12px 0', color: 'var(--text-secondary)', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History size={16} /> Activity
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[...activity].reverse().map(entry => (
                  <div key={entry.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span><strong style={{ color: 'var(--text-primary)' }}>{entry.actor}</strong> {entry.message}</span>
                    <span>{timeAgo(entry.createdAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: '8px', paddingTop: '24px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
             <button
               className="btn-primary"
               style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: 'var(--success-color)' }}
               onClick={() => {
                 updateTaskStatus(task.id, 'done');
                 onClose();
               }}>
               <CheckCircle size={20} /> Mark Complete
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
