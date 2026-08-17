import React from 'react';
import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

export const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div style={{ 
      display: 'flex', 
      width: '100%', 
      minHeight: '100vh', 
      padding: '24px', 
      gap: '24px', 
      backgroundColor: 'var(--bg-color)' 
    }}>
      <Sidebar />
      <div className="glass" style={{ flex: 1, padding: '32px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
};
