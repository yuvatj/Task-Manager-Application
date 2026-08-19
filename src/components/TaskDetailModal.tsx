import React, { useEffect } from 'react';
import { useAppContext } from '../store';
import type { Task } from '../types';
import { X, CheckCircle, ExternalLink } from 'lucide-react';

export const TaskDetailModal: React.FC<{ task: Task | null, onClose: () => void }> = ({ task, onClose }) => {
  const { updateTaskStatus } = useAppContext();

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (task) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [task]);

  if (!task) return null;

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

          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
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
