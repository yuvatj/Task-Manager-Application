import React, { useState } from 'react';
import { useAppContext } from '../store';
import { FolderKanban, Plus } from 'lucide-react';
import { ProjectModal } from './ProjectModal';

export const Sidebar: React.FC = () => {
  const { projects, activeProjectFilter, setActiveProjectFilter, currentUserRole } = useAppContext();
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  return (
    <div className="glass-panel" style={{ width: '250px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-color)', fontWeight: '700', fontSize: '1.4rem' }}>
        <FolderKanban size={28} />
        <span>TaskMgr</span>
      </div>
      
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Projects</h3>
          {currentUserRole === 'admin' && (
            <button onClick={() => setIsProjectModalOpen(true)} className="btn-secondary" style={{ padding: '4px', borderRadius: '50%', border: 'none', cursor: 'pointer' }} title="New Project">
              <Plus size={16} color="var(--text-secondary)" />
            </button>
          )}
        </div>
        
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li 
             onClick={() => setActiveProjectFilter(null)} 
             style={{ padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s', backgroundColor: activeProjectFilter === null ? 'var(--bg-color)' : 'transparent', fontWeight: activeProjectFilter === null ? 600 : 500 }}
          >
             <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--text-secondary)' }} />
             <span style={{ color: 'var(--text-primary)' }}>All Projects</span>
          </li>
          {projects.map(p => (
            <li 
               key={p.id} 
               onClick={() => setActiveProjectFilter(p.id)}
               style={{ padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s', backgroundColor: activeProjectFilter === p.id ? 'var(--bg-color)' : 'transparent', fontWeight: activeProjectFilter === p.id ? 600 : 500 }}
             >
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--brand-color)' }} />
              <span style={{ color: 'var(--text-primary)' }}>{p.name}</span>
            </li>
          ))}
        </ul>
      </div>
      <ProjectModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} />
    </div>
  );
};
