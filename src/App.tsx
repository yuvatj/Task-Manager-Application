import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { TaskCard } from './components/TaskCard';
import { TaskModal } from './components/TaskModal';
import { TaskDetailModal } from './components/TaskDetailModal';
import { TaskEditor } from './components/TaskEditor';
import { Login } from './components/Login';
import { useAppContext } from './store';
import { Plus, Search, LogOut } from 'lucide-react';
import type { Task } from './types';

export function DashboardContent() {
  const { tasks, activeProjectFilter, projects, currentUserRole } = useAppContext();
  const handleLogout = () => {
    localStorage.removeItem('taskmgr_role');
    window.location.href = window.location.origin + window.location.pathname;
  };
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'inprogress' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'urgency'>('date');

  let displayTasks = tasks.filter(t => t.title.toLowerCase().includes(search.toLowerCase()) || (t.tags && t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))));
  if (activeProjectFilter) {
    displayTasks = displayTasks.filter(t => t.projectId === activeProjectFilter);
  }

  // Filter by Status
  if (statusFilter === 'inprogress') {
    displayTasks = displayTasks.filter(t => t.status !== 'done');
  } else if (statusFilter === 'completed') {
    displayTasks = displayTasks.filter(t => t.status === 'done');
  }

  // Sort by Delivery Date or Urgency
  if (sortBy === 'date') {
    displayTasks.sort((a, b) => {
      if (!a.deliveryDate) return 1;
      if (!b.deliveryDate) return -1;
      return new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime();
    });
  } else if (sortBy === 'urgency') {
    const urgencyWeight = { critical: 4, high: 3, medium: 2, low: 1 };
    displayTasks.sort((a, b) => {
      const weightA = urgencyWeight[a.urgency || 'medium'];
      const weightB = urgencyWeight[b.urgency || 'medium'];
      return weightB - weightA;
    });
  }

  const activeProjectName = activeProjectFilter ? projects.find(p => p.id === activeProjectFilter)?.name : 'Dashboard';

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div className="animate-fade-in">
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            {activeProjectName || 'Dashboard'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '8px 0 0 0', fontSize: '1.1rem' }}>Manage your tasks and projects efficiently.</p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          {currentUserRole === 'admin' && (
            <button onClick={() => setIsTaskModalOpen(true)} className="btn-primary animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '1rem' }}>
              <Plus size={20} /> Create Task
            </button>
          )}
          <button onClick={handleLogout} className="btn-secondary animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '1rem' }}>
            <LogOut size={20} /> Logout
          </button>
        </div>
      </div>

      <div className="animate-fade-in" style={{ display: 'flex', gap: '16px', marginBottom: '40px', alignItems: 'center', justifyContent: 'flex-end', animationDelay: '0.1s', animationFillMode: 'both', flexWrap: 'wrap' }}>
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'inprogress' | 'completed')}
          style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color-secondary)', outline: 'none', cursor: 'pointer', fontSize: '0.95rem' }}
        >
          <option value="all">Status: All</option>
          <option value="inprogress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value as 'date' | 'urgency')}
          style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color-secondary)', outline: 'none', cursor: 'pointer', fontSize: '0.95rem' }}
        >
          <option value="date">Sort By: Delivery Date</option>
          <option value="urgency">Sort By: Urgency</option>
        </select>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '12px 16px 12px 48px', fontSize: '0.95rem', borderRadius: '12px', backgroundColor: 'var(--bg-color-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', transition: 'all 0.3s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '28px' }}>
        {displayTasks.length > 0 ? displayTasks.map((task, index) => (
          <div key={task.id} className="animate-fade-in" style={{ animationDelay: `${0.1 + (index * 0.05)}s`, animationFillMode: 'both', height: '100%', opacity: task.status === 'done' ? 0.75 : 1 }}>
             <TaskCard task={task} onClick={() => setSelectedTask(task)} />
          </div>
        )) : (
          <div className="glass-panel animate-fade-in" style={{ gridColumn: '1 / -1', padding: '80px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Search size={32} color="var(--accent-color)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', margin: '0 0 8px 0' }}>No tasks found</h3>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Try adjusting your filters or create a new task.</p>
            </div>
          </div>
        )}
      </div>
      <TaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} />
      <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />
    </Layout>
  )
}

function App() {
  const { currentUserRole } = useAppContext();
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (!currentUserRole) return <Login />;

  if (hash.startsWith('#task-')) {
    const taskId = hash.replace('#task-', '');
    return <TaskEditor taskId={taskId} />;
  }

  return <DashboardContent />;
}

export default App;
