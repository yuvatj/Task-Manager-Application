import React from 'react';
import type { Task } from '../types';
import { Paperclip, Image as ImageIcon, UserCircle } from 'lucide-react';

export const TaskCard: React.FC<{ task: Task, onClick?: () => void }> = ({ task, onClick }) => {
  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', transition: 'transform 0.2s', cursor: 'pointer', height: '100%', minHeight: '260px' }} 
         onClick={onClick}
         onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
         onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h4 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>{task.title}</h4>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: task.urgency === 'critical' ? 'var(--danger-color)' : task.urgency === 'high' ? 'var(--warning-color)' : 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {task.urgency || 'medium'} Urgency
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Due: {task.deliveryDate ? new Date(task.deliveryDate).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
        <span style={{ fontSize: '0.75rem', padding: '4px 12px', borderRadius: '20px', backgroundColor: 'var(--subtle-fill)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {task.status}
        </span>
      </div>

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.6' }}>
        {task.description}
      </p>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', minHeight: '28px' }}>
        {task.tags && task.tags.map((tag, idx) => (
          <span key={idx} style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '6px', backgroundColor: 'var(--chip-bg)', color: 'var(--chip-text)', fontWeight: 500, border: '1px solid var(--chip-border)' }}>
            #{tag}
          </span>
        ))}
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }} title="Attached Files">
            <Paperclip size={16} /> 
            <span>{task.workingFileNames.length + task.referenceFileNames.length}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }} title="Images">
            <ImageIcon size={16} /> 
            <span>{task.images.length}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }} title={`Engineer: ${task.engineerName}`}>
            {task.assignee ? task.assignee.name : 'Unassigned'}
          </div>
          {task.assignee?.avatarUrl ? (
            <img src={task.assignee.avatarUrl} alt={task.assignee.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <UserCircle size={32} color="var(--text-secondary)" />
          )}
        </div>
      </div>
    </div>
  );
};
