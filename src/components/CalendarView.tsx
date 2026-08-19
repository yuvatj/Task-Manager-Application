import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Task } from '../types';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const URGENCY_COLOR: Record<string, string> = {
  critical: 'var(--danger-color)',
  high: 'var(--warning-color)',
  medium: 'var(--brand-color)',
  low: 'var(--text-secondary)',
};

const toDateKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

export const CalendarView: React.FC<{ tasks: Task[]; onTaskClick: (task: Task) => void }> = ({ tasks, onTaskClick }) => {
  const [cursor, setCursor] = useState(() => new Date());

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const tasksByDay = new Map<string, Task[]>();
  tasks.forEach(t => {
    if (!t.deliveryDate) return;
    const key = toDateKey(new Date(t.deliveryDate));
    if (!tasksByDay.has(key)) tasksByDay.set(key, []);
    tasksByDay.get(key)!.push(t);
  });

  const cells: (number | null)[] = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const today = new Date();
  const isToday = (day: number) => day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
          {firstOfMonth.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" className="btn-secondary" style={{ padding: '8px', borderRadius: '8px' }} onClick={() => setCursor(new Date(year, month - 1, 1))} title="Previous month">
            <ChevronLeft size={18} />
          </button>
          <button type="button" className="btn-secondary" style={{ padding: '8px 14px', borderRadius: '8px', fontSize: '0.85rem' }} onClick={() => setCursor(new Date())}>
            Today
          </button>
          <button type="button" className="btn-secondary" style={{ padding: '8px', borderRadius: '8px' }} onClick={() => setCursor(new Date(year, month + 1, 1))} title="Next month">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '8px' }}>
        {WEEKDAYS.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{d}</div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />;
          const key = toDateKey(new Date(year, month, day));
          const dayTasks = tasksByDay.get(key) || [];
          return (
            <div
              key={i}
              style={{
                minHeight: '100px', borderRadius: '10px', padding: '8px',
                border: isToday(day) ? '1px solid var(--brand-color)' : '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-color)', display: 'flex', flexDirection: 'column', gap: '4px'
              }}
            >
              <span style={{ fontSize: '0.8rem', fontWeight: isToday(day) ? 700 : 500, color: isToday(day) ? 'var(--brand-color)' : 'var(--text-secondary)' }}>{day}</span>
              {dayTasks.slice(0, 3).map(task => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => onTaskClick(task)}
                  title={task.title}
                  style={{
                    textAlign: 'left', fontSize: '0.75rem', padding: '3px 6px', borderRadius: '6px',
                    backgroundColor: 'var(--subtle-fill)', color: 'var(--text-primary)',
                    borderLeft: `3px solid ${URGENCY_COLOR[task.urgency] || 'var(--text-secondary)'}`,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    opacity: task.status === 'done' ? 0.6 : 1
                  }}
                >
                  {task.title}
                </button>
              ))}
              {dayTasks.length > 3 && (
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', padding: '0 6px' }}>+{dayTasks.length - 3} more</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
