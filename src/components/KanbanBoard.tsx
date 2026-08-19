import React, { useState } from 'react';
import { useAppContext } from '../store';
import { TaskCard } from './TaskCard';
import type { Task, TaskStatus } from '../types';

const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: 'todo', label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'review', label: 'Review' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'done', label: 'Done' },
];

export const KanbanBoard: React.FC<{ tasks: Task[]; onTaskClick: (task: Task) => void }> = ({ tasks, onTaskClick }) => {
  const { updateTaskStatus } = useAppContext();
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  const handleDrop = (status: TaskStatus, e: React.DragEvent) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) updateTaskStatus(taskId, status);
  };

  return (
    <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
      {COLUMNS.map(col => {
        const colTasks = tasks.filter(t => t.status === col.id);
        return (
          <div
            key={col.id}
            onDragOver={e => { e.preventDefault(); setDragOverColumn(col.id); }}
            onDragLeave={() => setDragOverColumn(prev => (prev === col.id ? null : prev))}
            onDrop={e => handleDrop(col.id, e)}
            style={{
              flex: '0 0 300px', display: 'flex', flexDirection: 'column', gap: '12px',
              backgroundColor: dragOverColumn === col.id ? 'var(--subtle-fill)' : 'transparent',
              borderRadius: '12px', padding: '8px', transition: 'background-color 0.15s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px' }}>
              <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{col.label}</h4>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', backgroundColor: 'var(--subtle-fill)', borderRadius: '20px', padding: '2px 10px' }}>
                {colTasks.length}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '80px' }}>
              {colTasks.map(task => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={e => e.dataTransfer.setData('text/plain', task.id)}
                  style={{ cursor: 'grab' }}
                >
                  <TaskCard task={task} onClick={() => onTaskClick(task)} />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
