import React from 'react';
import type { Task } from '../types';
import { AlertTriangle, Clock, CheckCircle2, ListChecks } from 'lucide-react';

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const StatsBar: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
  const today = startOfDay(new Date());
  const weekFromNow = new Date(today);
  weekFromNow.setDate(weekFromNow.getDate() + 7);

  const overdue = tasks.filter(t => t.status !== 'done' && t.deliveryDate && startOfDay(new Date(t.deliveryDate)) < today);
  const dueThisWeek = tasks.filter(t => {
    if (t.status === 'done' || !t.deliveryDate) return false;
    const d = startOfDay(new Date(t.deliveryDate));
    return d >= today && d <= weekFromNow;
  });
  const completed = tasks.filter(t => t.status === 'done');

  const tiles = [
    { label: 'Total Tasks', value: tasks.length, icon: <ListChecks size={20} />, color: 'var(--brand-color)' },
    { label: 'Overdue', value: overdue.length, icon: <AlertTriangle size={20} />, color: 'var(--danger-color)' },
    { label: 'Due This Week', value: dueThisWeek.length, icon: <Clock size={20} />, color: 'var(--warning-color)' },
    { label: 'Completed', value: completed.length, icon: <CheckCircle2 size={20} />, color: 'var(--success-color)' },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
      {tiles.map(tile => (
        <div key={tile.label} className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--subtle-fill)', color: tile.color, flexShrink: 0 }}>
            {tile.icon}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>{tile.value}</p>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{tile.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
