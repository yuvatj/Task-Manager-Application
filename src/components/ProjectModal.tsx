import React, { useState } from 'react';
import { useAppContext } from '../store';
import { X } from 'lucide-react';

export const ProjectModal: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
  const { addProject } = useAppContext();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return alert('Name is required');

    addProject({
      name,
      description
    });
    
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '32px', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '24px', right: '24px', background: 'transparent', color: 'var(--text-secondary)' }}>
          <X size={24} />
        </button>
        <h2 style={{ marginTop: 0, marginBottom: '24px' }}>Create New Project</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Project Name *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%' }} placeholder="E.g., Website Redesign" />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} style={{ width: '100%', resize: 'vertical' }} placeholder="Optional description..."></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Create Project</button>
          </div>
        </form>
      </div>
    </div>
  );
};
