import { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { Layout } from './components/Layout';
import { TaskCard } from './components/TaskCard';
import { TaskModal } from './components/TaskModal';
import { TaskDetailModal } from './components/TaskDetailModal';
import { TaskEditor } from './components/TaskEditor';
import { Login } from './components/Login';
import { Settings } from './components/Settings';
import { StatsBar } from './components/StatsBar';
import { KanbanBoard } from './components/KanbanBoard';
import { CalendarView } from './components/CalendarView';
import { ProjectInsights } from './components/ProjectInsights';
import { useAppContext } from './store';
import { Plus, Search, LogOut, LayoutGrid, Columns3, CalendarDays, BarChart3 } from 'lucide-react';
import type { Task } from './types';

type ViewMode = 'list' | 'board' | 'calendar';

export function DashboardContent() {
  const { tasks, activeProjectFilter, projects, currentUserRole } = useAppContext();
  const handleLogout = () => {
    localStorage.removeItem('taskmgr_role');
    localStorage.removeItem('taskmgr_admin');
    window.location.href = window.location.origin + window.location.pathname;
  };
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'inprogress' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'urgency'>('date');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcuts: "/" focus search, "n" new task, "Esc" close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if (e.key === 'Escape') {
        if (selectedTask) setSelectedTask(null);
        else if (isTaskModalOpen) setIsTaskModalOpen(false);
        else if (isInsightsOpen) setIsInsightsOpen(false);
        return;
      }

      if (isTyping) return;

      if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key.toLowerCase() === 'n' && currentUserRole === 'admin') {
        e.preventDefault();
        setIsTaskModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTask, isTaskModalOpen, isInsightsOpen, currentUserRole]);

  // Scoped by project + search only — used for stats, board, and calendar (status filter only applies to List view)
  let scopedTasks = tasks.filter(t => t.title.toLowerCase().includes(search.toLowerCase()) || (t.tags && t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))));
  if (activeProjectFilter) {
    scopedTasks = scopedTasks.filter(t => t.projectId === activeProjectFilter);
  }

  let displayTasks = scopedTasks;

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

  const activeProject = activeProjectFilter ? projects.find(p => p.id === activeProjectFilter) || null : null;
  const activeProjectName = activeProject ? activeProject.name : 'Dashboard';

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
          {activeProject && (
            <button onClick={() => setIsInsightsOpen(true)} className="btn-secondary animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '1rem' }}>
              <BarChart3 size={20} /> Insights
            </button>
          )}
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

      <StatsBar tasks={scopedTasks} />

      <div className="animate-fade-in" style={{ display: 'flex', gap: '16px', marginBottom: '40px', alignItems: 'center', justifyContent: 'space-between', animationDelay: '0.1s', animationFillMode: 'both', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--bg-color-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '4px' }}>
          {([
            { id: 'list', label: 'List', icon: <LayoutGrid size={16} /> },
            { id: 'board', label: 'Board', icon: <Columns3 size={16} /> },
            { id: 'calendar', label: 'Calendar', icon: <CalendarDays size={16} /> },
          ] as { id: ViewMode; label: string; icon: ReactNode }[]).map(v => (
            <button
              key={v.id}
              type="button"
              onClick={() => setViewMode(v.id)}
              className={viewMode === v.id ? 'btn-primary' : 'btn-secondary'}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '0.85rem', border: 'none', boxShadow: 'none' }}
            >
              {v.icon} {v.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          {viewMode === 'list' && (
            <>
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
            </>
          )}

          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search tasks... (press /)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '12px 16px 12px 48px', fontSize: '0.95rem', borderRadius: '12px', backgroundColor: 'var(--bg-color-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', transition: 'all 0.3s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
            />
          </div>
        </div>
      </div>

      {viewMode === 'board' && <KanbanBoard tasks={scopedTasks} onTaskClick={setSelectedTask} />}
      {viewMode === 'calendar' && <CalendarView tasks={scopedTasks} onTaskClick={setSelectedTask} />}
      {viewMode === 'list' && (
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
      )}
      <TaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} />
      <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />
      <ProjectInsights
        project={isInsightsOpen ? activeProject : null}
        tasks={activeProject ? tasks.filter(t => t.projectId === activeProject.id) : []}
        onClose={() => setIsInsightsOpen(false)}
      />
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

  return (
    <>
      <DashboardContent />
      <Settings isOpen={hash === '#settings'} onClose={() => { window.location.hash = ''; }} />
    </>
  );
}

export default App;
